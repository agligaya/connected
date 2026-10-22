const REQUEST_TIMEOUT_MS = 15000;

function env(name) {
  return String(process.env[name] || '').trim();
}

/** MAIL_FROM, tolerating quote marks that some hosting dashboards keep literally. */
function mailFrom() {
  return env('MAIL_FROM').replace(/^["']+|["']+$/g, '').trim();
}

/** "ConnectED <no-reply@school.com>" -> { name, email } */
function parseFrom(from) {
  const match = String(from || '').match(/^\s*(.*?)\s*<([^>]+)>\s*$/);
  if (match) return { name: match[1].replace(/^["']+|["']+$/g, '').trim(), email: match[2].trim() };
  return { name: '', email: String(from || '').trim() };
}

/**
 * How mail is sent. Free Render services block SMTP, so an HTTPS provider is preferred there.
 * MAIL_PROVIDER = resend | brevo | smtp; if unset, the first provider with credentials is used.
 */
function mailProvider() {
  const explicit = env('MAIL_PROVIDER').toLowerCase();
  if (explicit === 'resend' || explicit === 'brevo' || explicit === 'smtp') return explicit;
  if (env('RESEND_API_KEY')) return 'resend';
  if (env('BREVO_API_KEY')) return 'brevo';
  return 'smtp';
}

function isMailConfigured() {
  const provider = mailProvider();
  if (!mailFrom()) return false;
  if (provider === 'resend') return Boolean(env('RESEND_API_KEY'));
  if (provider === 'brevo') return Boolean(env('BREVO_API_KEY'));
  return Boolean(env('SMTP_HOST'));
}

function roleLabel(role) {
  const value = String(role || '').toLowerCase();
  if (value === 'teacher') return 'Teacher';
  if (value === 'parent') return 'Parent';
  if (value === 'admin') return 'Administrator';
  if (value === 'student') return 'Student';
  return 'User';
}

function publicLoginUrl(req) {
  const configured = String(process.env.APP_PUBLIC_URL || '').trim().replace(/\/$/, '');
  if (configured) return `${configured}/login`;
  if (!req || typeof req.get !== 'function') return '';
  const host = String(req.get('x-forwarded-host') || req.get('host') || '').split(',')[0].trim();
  if (!host) return '';
  const proto = String(req.get('x-forwarded-proto') || req.protocol || 'https').split(',')[0].trim();
  return `${proto}://${host}/login`;
}

function accountEmailBody({ firstName, lastName, email, role, password, loginUrl, childName, username, expiresMinutes }) {
  const name = `${firstName || ''} ${lastName || ''}`.trim() || 'there';
  if (String(role || '').toLowerCase() === 'student') {
    const child = String(childName || '').trim() || 'your child';
    const signInName = username || email;
    const lines = [
      `Hello ${name},`,
      '',
      `A ConnectED account was created for your child ${child}.`,
      ''
    ];
    if (loginUrl) lines.push(`Sign in at: ${loginUrl}`);
    lines.push(
      `Username: ${signInName}`,
      `Temporary password: ${password}`,
      '',
      'Your child signs in with this username and temporary password, then sets their own password when prompted. The temporary password stops working after that change.',
      ...(expiresMinutes
        ? [`This temporary password expires ${expiresMinutes} minutes after this email is sent. If it expires, ask the admin for a new one.`]
        : []),
      'Do not share this password.',
      '',
      'ConnectED'
    );
    return lines.join('\n');
  }
  const lines = [
    `Hello ${name},`,
    '',
    'An administrator created your ConnectED account.',
    ''
  ];
  if (loginUrl) lines.push(`Sign in at: ${loginUrl}`);
  lines.push(
    `Name: ${name}`,
    `Role: ${roleLabel(role)}`,
    `Sign-in email: ${email}`,
    `Temporary password: ${password}`,
    '',
    'Sign in with this email and temporary password, then set your own password when prompted.',
    'Do not share this password.',
    '',
    'ConnectED'
  );
  return lines.join('\n');
}

async function postJson(url, headers, body) {
  let res;
  try {
    res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json', ...headers },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS)
    });
  } catch (error) {
    const timedOut = error.name === 'TimeoutError' || error.name === 'AbortError';
    const err = new Error(timedOut ? 'Request timed out' : error.message);
    err.code = timedOut ? 'ETIMEDOUT' : (error.cause?.code || error.code || 'ENETWORK');
    throw err;
  }
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    const err = new Error(`HTTP ${res.status}: ${text.slice(0, 300)}`);
    err.status = res.status;
    err.detail = text;
    throw err;
  }
  return res.json().catch(() => ({}));
}

async function sendViaResend({ from, to, subject, text }) {
  await postJson(
    'https://api.resend.com/emails',
    { Authorization: `Bearer ${env('RESEND_API_KEY')}` },
    { from, to: [to], subject, text }
  );
}

async function sendViaBrevo({ from, to, subject, text }) {
  const sender = parseFrom(from);
  await postJson(
    'https://api.brevo.com/v3/smtp/email',
    { 'api-key': env('BREVO_API_KEY') },
    {
      sender: sender.name ? { name: sender.name, email: sender.email } : { email: sender.email },
      to: [{ email: to }],
      subject,
      textContent: text
    }
  );
}

async function sendViaSmtp({ from, to, subject, text }) {
  const nodemailer = require('nodemailer');
  const port = Number(process.env.SMTP_PORT) || 587;
  const user = env('SMTP_USER');
  const pass = String(process.env.SMTP_PASS || '');
  const transporter = nodemailer.createTransport({
    host: env('SMTP_HOST'),
    port,
    secure: port === 465,
    auth: user ? { user, pass } : undefined,
    connectionTimeout: REQUEST_TIMEOUT_MS,
    greetingTimeout: REQUEST_TIMEOUT_MS,
    socketTimeout: REQUEST_TIMEOUT_MS
  });
  await transporter.sendMail({ from, to, subject, text });
}

/** A short, safe explanation for the admin; the full detail goes to the server log only. */
function friendlyReason(error) {
  const code = String(error.code || '').toUpperCase();
  const status = Number(error.status || error.responseCode || 0);
  const text = String(error.detail || error.message || '').toLowerCase();
  const unreachable = ['ETIMEDOUT', 'ECONNREFUSED', 'ECONNRESET', 'ENOTFOUND', 'EAI_AGAIN', 'ESOCKET', 'ECONNECTION', 'ENETWORK'];

  if (unreachable.includes(code)) {
    return 'The mail server could not be reached. The host may be blocking outbound email.';
  }
  const senderProblem = /domain|sender|from|verif|testing emails/.test(text);
  if ([400, 403, 422].includes(status) && senderProblem) {
    return 'The sender address was not accepted. Check MAIL_FROM and that its domain is verified with the mail provider.';
  }
  if (code === 'EAUTH' || status === 401 || status === 403) {
    return 'The mail service rejected the login or API key.';
  }
  if (status === 429) return 'The mail service limit was reached. Try again later.';
  if (status >= 500) return 'The mail service is having problems. Try again later.';
  return 'The mail provider did not accept the message.';
}

/** Sends one plain-text email. Never throws; returns { sent } or { sent: false, error }. */
async function sendMail({ to, subject, text }) {
  const recipient = String(to || '').trim();
  if (!recipient) return { sent: false, error: 'There is no email address to send to.' };
  if (!isMailConfigured()) return { sent: false, error: 'Mail is not configured.' };

  const provider = mailProvider();
  const message = { from: mailFrom(), to: recipient, subject, text };
  try {
    if (provider === 'resend') await sendViaResend(message);
    else if (provider === 'brevo') await sendViaBrevo(message);
    else await sendViaSmtp(message);
    return { sent: true, provider };
  } catch (error) {
    const detail = [error.code, error.status || error.responseCode, error.message].filter(Boolean).join(' | ');
    console.error(`[mail] provider=${provider} to=${recipient} failed: ${detail}`);
    return { sent: false, provider, error: friendlyReason(error) };
  }
}

async function sendAccountDetails({ firstName, lastName, email, role, password, loginUrl, childName, username, expiresMinutes }) {
  const to = String(email || '').trim();
  if (!to || !password) {
    return { sent: false, error: 'The account has no email or temporary password to send.' };
  }
  return sendMail({
    to,
    subject: String(role || '').toLowerCase() === 'student'
      ? "Your child's ConnectED account"
      : 'Your ConnectED account',
    text: accountEmailBody({ firstName, lastName, email: to, role, password, loginUrl, childName, username, expiresMinutes })
  });
}

/** Sends after the HTTP response, so creating an account does not wait on the mail provider. */
function sendAccountEmailLater(details) {
  const to = String(details?.email || '').trim();
  sendAccountDetails(details).then((mail) => {
    if (!mail.sent) console.error(`[mail] not sent to ${to || '(no address)'}: ${mail.error}`);
  }).catch((error) => {
    console.error('[mail] account email:', error.message);
  });
}

module.exports = {
  isMailConfigured,
  mailProvider,
  mailFrom,
  parseFrom,
  friendlyReason,
  publicLoginUrl,
  sendMail,
  sendAccountDetails,
  sendAccountEmailLater
};
