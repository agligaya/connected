const db = require('../../db');

let schemaPromise = null;
let workerStarted = false;

const ITEXMO_LEGACY_ERRORS = {
  '1': 'Invalid number',
  '2': 'Number prefix not supported',
  '3': 'Invalid ApiCode',
  '4': 'Maximum messages per day reached',
  '5': 'Maximum message characters reached',
  '6': 'iTexMo system offline',
  '7': 'Expired ApiCode',
  '8': 'iTexMo error — try again later',
  '9': 'Invalid function parameters',
  '10': 'Recipient blocked due to flooding',
  '11': 'Recipient temporarily blocked (hard send)',
  '12': 'Invalid request (priority on non-corporate code)',
  '13': 'Invalid or not registered custom sender ID'
};

async function ensureSmsSchema(conn = db) {
  if (schemaPromise) return schemaPromise;
  schemaPromise = (async () => {
    await conn.query(`
      CREATE TABLE IF NOT EXISTS sms_queue (
        id INT AUTO_INCREMENT PRIMARY KEY,
        parent_id INT NULL,
        student_id INT NULL,
        phone VARCHAR(20) NOT NULL,
        body VARCHAR(500) NOT NULL,
        status ENUM('pending','sent','failed') NOT NULL DEFAULT 'pending',
        attempts INT NOT NULL DEFAULT 0,
        last_error VARCHAR(500) NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        sent_at TIMESTAMP NULL,
        KEY idx_sms_status_created (status, created_at),
        KEY idx_sms_parent (parent_id),
        KEY idx_sms_student (student_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
  })().catch((e) => {
    schemaPromise = null;
    throw e;
  });
  return schemaPromise;
}

/** Normalize PH mobile to 09XXXXXXXXX or null if invalid. */
function normalizePhMobile(raw) {
  if (raw == null) return null;
  let digits = String(raw).replace(/\D/g, '');
  if (!digits) return null;
  if (digits.startsWith('63') && digits.length === 12) {
    digits = `0${digits.slice(2)}`;
  }
  if (digits.length === 10 && digits.startsWith('9')) {
    digits = `0${digits}`;
  }
  if (!/^09\d{9}$/.test(digits)) return null;
  return digits;
}

function isValidPhMobile(raw) {
  return !!normalizePhMobile(raw);
}

function getSmsProvider() {
  const p = String(process.env.SMS_PROVIDER || 'itexmo').trim().toLowerCase();
  if (p === 'semaphore') return 'semaphore';
  return 'itexmo';
}

function isSmsConfigured() {
  const key = String(process.env.SMS_API_KEY || '').trim();
  if (!key) return false;
  if (getSmsProvider() === 'itexmo') {
    const email = String(process.env.ITEXMO_EMAIL || '').trim();
    const password = String(process.env.ITEXMO_PASSWORD || '').trim();
    return !!(email && password);
  }
  return true;
}

function isSmsDryRun() {
  const v = String(process.env.SMS_DRY_RUN || '').toLowerCase();
  return v === '1' || v === 'true' || v === 'yes';
}

/**
 * Resolve best phone for a parent user row.
 * Prefers users.phone, then parent_profiles.emergency_contact.
 */
function pickParentPhone(userPhone, emergencyContact) {
  return normalizePhMobile(userPhone) || normalizePhMobile(emergencyContact);
}

async function enqueueSms({
  parentId = null,
  studentId = null,
  phone,
  body,
  conn = db
}) {
  await ensureSmsSchema(conn);
  const normalized = normalizePhMobile(phone);
  if (!normalized) {
    return { queued: false, reason: 'invalid_phone' };
  }
  const text = String(body || '').trim().slice(0, 480);
  if (!text) {
    return { queued: false, reason: 'empty_body' };
  }

  const [dup] = await conn.query(
    `SELECT id FROM sms_queue
     WHERE phone = ? AND student_id <=> ? AND body = ?
       AND status IN ('pending','sent')
       AND DATE(created_at) = CURDATE()
     LIMIT 1`,
    [normalized, studentId, text]
  );
  if (dup.length) {
    return { queued: false, reason: 'duplicate', id: dup[0].id };
  }

  const [result] = await conn.query(
    `INSERT INTO sms_queue (parent_id, student_id, phone, body, status)
     VALUES (?, ?, ?, ?, 'pending')`,
    [parentId, studentId, normalized, text]
  );
  return { queued: true, id: result.insertId };
}

async function sendViaSemaphore(phone, message) {
  const apikey = String(process.env.SMS_API_KEY || '').trim();
  if (!apikey) {
    const err = new Error('SMS_API_KEY is not configured');
    err.code = 'NO_API_KEY';
    throw err;
  }

  const sendername = String(process.env.SMS_SENDER || '').trim();
  const params = new URLSearchParams();
  params.set('apikey', apikey);
  params.set('number', phone);
  params.set('message', message);
  if (sendername) params.set('sendername', sendername);

  const res = await fetch('https://api.semaphore.co/api/v4/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString()
  });

  const raw = await res.text();
  let data;
  try {
    data = JSON.parse(raw);
  } catch {
    data = { raw };
  }

  if (!res.ok) {
    const msg =
      (Array.isArray(data) && data[0]?.message) ||
      data?.message ||
      data?.error ||
      raw ||
      `HTTP ${res.status}`;
    throw new Error(String(msg).slice(0, 400));
  }

  if (Array.isArray(data) && data[0]?.status === 'Failed') {
    throw new Error(data[0].message || 'Semaphore reported Failed');
  }

  return data;
}

/**
 * iTexMo API v5 (docs: POST https://api.itexmo.com/api/broadcast)
 * Body JSON: Email, Password, ApiCode, Recipients[], Message, optional SenderId
 * Also sends Basic Auth (email/password) as in their Postman examples.
 */
async function sendViaItexmo(phone, message) {
  const apicode = String(process.env.SMS_API_KEY || '').trim();
  const email = String(process.env.ITEXMO_EMAIL || '').trim();
  const password = String(process.env.ITEXMO_PASSWORD || '').trim();

  if (!apicode) {
    const err = new Error('SMS_API_KEY (iTexMo ApiCode) is not configured');
    err.code = 'NO_API_KEY';
    throw err;
  }
  if (!email || !password) {
    const err = new Error('ITEXMO_EMAIL and ITEXMO_PASSWORD are required for iTexMo API v5');
    err.code = 'NO_ITEXMO_AUTH';
    throw err;
  }

  const senderId = String(process.env.SMS_SENDER || '').trim();
  const payload = {
    Email: email,
    Password: password,
    ApiCode: apicode,
    Recipients: [phone],
    Message: message
  };
  if (senderId) payload.SenderId = senderId;

  const basic = Buffer.from(`${email}:${password}`).toString('base64');
  const res = await fetch('https://api.itexmo.com/api/broadcast', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Basic ${basic}`
    },
    body: JSON.stringify(payload)
  });

  const raw = await res.text();
  let data;
  try {
    data = JSON.parse(raw);
  } catch {
    data = { raw };
  }

  if (!res.ok) {
    const msg =
      data?.Message ||
      data?.message ||
      data?.error ||
      data?.Error ||
      (typeof data?.raw === 'string' ? data.raw : null) ||
      raw ||
      `HTTP ${res.status}`;
    throw new Error(String(msg).slice(0, 400));
  }

  // Some responses may still return legacy numeric codes in a field
  const code = data?.Code ?? data?.code ?? data?.Status ?? data?.status;
  if (code != null && String(code) !== '0' && String(code).toLowerCase() !== 'success' && String(code).toLowerCase() !== 'ok') {
    const c = String(code);
    if (/^\d+$/.test(c) && c !== '0') {
      throw new Error(`iTexMo ${c}: ${ITEXMO_LEGACY_ERRORS[c] || raw.slice(0, 200)}`);
    }
  }

  return { provider: 'itexmo', version: 'v5', data };
}

async function sendSms(phone, message) {
  const provider = getSmsProvider();
  if (provider === 'semaphore') {
    return sendViaSemaphore(phone, message);
  }
  return sendViaItexmo(phone, message);
}

async function processOneSms(row, conn = db) {
  const maxAttempts = Number(process.env.SMS_MAX_ATTEMPTS || 5);
  try {
    if (isSmsDryRun() || !isSmsConfigured()) {
      const note = isSmsDryRun()
        ? `DRY_RUN:${getSmsProvider()}`
        : 'NO_API_KEY_QUEUED_AS_SIMULATED';
      console.log(`[sms] ${note} → ${row.phone}: ${String(row.body).slice(0, 80)}`);
      await conn.query(
        `UPDATE sms_queue
         SET status = 'sent', attempts = attempts + 1, sent_at = NOW(), last_error = ?
         WHERE id = ?`,
        [note, row.id]
      );
      return { ok: true, simulated: true };
    }

    await sendSms(row.phone, row.body);
    await conn.query(
      `UPDATE sms_queue
       SET status = 'sent', attempts = attempts + 1, sent_at = NOW(), last_error = NULL
       WHERE id = ?`,
      [row.id]
    );
    return { ok: true };
  } catch (e) {
    const attempts = Number(row.attempts || 0) + 1;
    const failed = attempts >= maxAttempts;
    await conn.query(
      `UPDATE sms_queue
       SET status = ?, attempts = ?, last_error = ?
       WHERE id = ?`,
      [failed ? 'failed' : 'pending', attempts, String(e.message || e).slice(0, 480), row.id]
    );
    return { ok: false, error: e.message };
  }
}

async function processSmsQueue({ limit = 20 } = {}) {
  await ensureSmsSchema();
  const [rows] = await db.query(
    `SELECT id, parent_id, student_id, phone, body, status, attempts
     FROM sms_queue
     WHERE status = 'pending'
     ORDER BY created_at ASC
     LIMIT ?`,
    [limit]
  );

  let sent = 0;
  let failed = 0;
  for (const row of rows) {
    const result = await processOneSms(row);
    if (result.ok) sent += 1;
    else failed += 1;
  }
  return { processed: rows.length, sent, failed };
}

function startSmsWorker() {
  if (workerStarted) return;
  workerStarted = true;
  const intervalMs = Number(process.env.SMS_POLL_MS || 60000);
  const provider = getSmsProvider();

  const tick = async () => {
    try {
      const result = await processSmsQueue({ limit: 25 });
      if (result.processed > 0) {
        console.log(
          `[sms] queue processed=${result.processed} sent=${result.sent} failed=${result.failed}`
        );
      }
    } catch (e) {
      console.error('[sms] worker:', e.message);
    }
  };

  setTimeout(tick, 3000);
  setInterval(tick, intervalMs);
  console.log(
    `[sms] worker started provider=${provider} (every ${intervalMs}ms)` +
      (isSmsDryRun()
        ? ' DRY_RUN=on'
        : isSmsConfigured()
          ? ''
          : provider === 'itexmo'
            ? ' (need SMS_API_KEY + ITEXMO_EMAIL + ITEXMO_PASSWORD — simulated)'
            : ' (no SMS_API_KEY — simulated send)')
  );
}

module.exports = {
  ensureSmsSchema,
  normalizePhMobile,
  isValidPhMobile,
  getSmsProvider,
  isSmsConfigured,
  isSmsDryRun,
  pickParentPhone,
  enqueueSms,
  processSmsQueue,
  startSmsWorker
};
