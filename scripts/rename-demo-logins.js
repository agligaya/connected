/**
 * In-place rename of demo teacher/parent login emails.
 * Does NOT create users, change passwords, or touch admin / students / attendance.
 *
 * Teachers → {first2}{lastname}@usant.edu.ph (lowercase)
 * Parents  → {first2}{lastname}@gmail.com (lowercase)
 * Password remains Demo@1234
 *
 * Usage:
 *   node scripts/rename-demo-logins.js --confirm
 */
'use strict';

require('dotenv').config();
const db = require('../db');

const DEMO_EMAIL_SUFFIX = '@demo.connected.ph';
const TEACHER_EMAIL_SUFFIX = '@usant.edu.ph';
const PARENT_EMAIL_SUFFIX = '@gmail.com';

function demoLoginLocalPart(first, last) {
  const f = String(first || '')
    .replace(/[^a-zA-Z]/g, '')
    .slice(0, 2)
    .toLowerCase();
  const l = String(last || '')
    .replace(/[^a-zA-Z]/g, '')
    .toLowerCase();
  return `${f}${l}` || 'user';
}

function allocateDemoEmail(localPart, domain, taken) {
  const base = String(localPart || 'user').toLowerCase();
  const suffix = String(domain || '').startsWith('@') ? domain : `@${domain}`;
  for (let n = 0; n < 500; n += 1) {
    const local = n === 0 ? base : `${base}${n + 1}`;
    const email = `${local}${suffix}`;
    const key = email.toLowerCase();
    if (!taken.has(key)) {
      taken.add(key);
      return email;
    }
  }
  throw new Error(`Could not allocate email for ${base}${suffix}`);
}

async function main() {
  if (!process.argv.includes('--confirm')) {
    console.error('Refusing to run without --confirm');
    console.error('Usage: node scripts/rename-demo-logins.js --confirm');
    process.exit(1);
  }

  const conn = await db.getConnection();
  let ok = false;
  try {
    const [allEmails] = await conn.query(`SELECT LOWER(email) AS email FROM users`);
    const taken = new Set(
      allEmails.map((r) => String(r.email || '').toLowerCase()).filter(Boolean)
    );

    const [targets] = await conn.query(
      `SELECT id, first_name, last_name, email, role
       FROM users
       WHERE email LIKE ?
         AND role IN ('teacher', 'parent')
       ORDER BY role, id`,
      [`%${DEMO_EMAIL_SUFFIX}`]
    );

    console.log(`[rename] DB=${process.env.DB_NAME || 'connected_system'}`);
    console.log(`[rename] targets: ${targets.length} (teachers + parents with ${DEMO_EMAIL_SUFFIX})`);
    if (!targets.length) {
      console.log('[rename] Nothing to rename (already formal, or no demo users).');
      ok = true;
      return;
    }

    const mapping = [];
    await conn.beginTransaction();
    try {
      for (const u of targets) {
        const domain = u.role === 'teacher' ? TEACHER_EMAIL_SUFFIX : PARENT_EMAIL_SUFFIX;
        // Free the old address so the same person can reclaim a colliding local-part if needed.
        taken.delete(String(u.email || '').toLowerCase());
        const next = allocateDemoEmail(
          demoLoginLocalPart(u.first_name, u.last_name),
          domain,
          taken
        );
        if (next.toLowerCase() === String(u.email || '').toLowerCase()) {
          mapping.push({ id: u.id, role: u.role, from: u.email, to: next, skipped: true });
          continue;
        }
        await conn.query(`UPDATE users SET email = ? WHERE id = ? AND role = ?`, [
          next,
          u.id,
          u.role
        ]);
        mapping.push({ id: u.id, role: u.role, from: u.email, to: next, skipped: false });
      }
      await conn.commit();
    } catch (e) {
      await conn.rollback();
      throw e;
    }

    const teachers = mapping.filter((m) => m.role === 'teacher');
    const parents = mapping.filter((m) => m.role === 'parent');
    console.log(`[rename] updated teachers=${teachers.filter((m) => !m.skipped).length}, parents=${parents.filter((m) => !m.skipped).length}`);
    console.log('\n=== Sample teacher logins (password: Demo@1234) ===');
    for (const m of teachers.slice(0, 5)) {
      console.log(`  ${m.from}  →  ${m.to}`);
    }
    if (teachers.length > 5) console.log(`  … +${teachers.length - 5} more teachers`);
    console.log('\n=== Sample parent logins (password: Demo@1234) ===');
    for (const m of parents.slice(0, 5)) {
      console.log(`  ${m.from}  →  ${m.to}`);
    }
    if (parents.length > 5) console.log(`  … +${parents.length - 5} more parents`);

    const [[admin]] = await conn.query(
      `SELECT email FROM users WHERE email LIKE ? AND role = 'admin' LIMIT 1`,
      [`%${DEMO_EMAIL_SUFFIX}`]
    );
    console.log(`\n[rename] admin unchanged: ${admin ? admin.email : '(none)'}`);
    ok = true;
  } finally {
    try {
      conn.release();
    } catch (_) {
      /* ignore */
    }
  }
  try {
    await db.end();
  } catch (_) {
    /* ignore */
  }
  process.exit(ok ? 0 : 1);
}

main().catch(async (err) => {
  console.error('[rename] FAILED:', err.message);
  if (err.stack) console.error(err.stack);
  try {
    await db.end();
  } catch (_) {
    /* ignore */
  }
  process.exit(1);
});
