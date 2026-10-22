const nodemailer = require('nodemailer');

function mailFrom() {
  return String(process.env.MAIL_FROM || '').trim();
}

function isMailConfigured() {
  return Boolean(String(process.env.SMTP_HOST || '').trim() && mailFrom());
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

async function sendAccountDetails({ firstName, lastName, email, role, password, loginUrl, childName, username, expiresMinutes }) {
  const to = String(email || '').trim();
  if (!to || !password) {
    return { sent: false, error: 'The account has no email or temporary password to send.' };
  }
  if (!isMailConfigured()) {
    return { sent: false, error: 'Mail is not configured.' };
  }

  const port = Number(process.env.SMTP_PORT) || 587;
  const user = String(process.env.SMTP_USER || '').trim();
  const pass = String(process.env.SMTP_PASS || '');
  const transporter = nodemailer.createTransport({
    host: String(process.env.SMTP_HOST).trim(),
    port,
    secure: port === 465,
    auth: user ? { user, pass } : undefined
  });

  try {
    await transporter.sendMail({
      from: mailFrom(),
      to,
      subject: String(role || '').toLowerCase() === 'student'
        ? "Your child's ConnectED account"
        : 'Your ConnectED account',
      text: accountEmailBody({ firstName, lastName, email: to, role, password, loginUrl, childName, username, expiresMinutes })
    });
    return { sent: true };
  } catch (error) {
    console.error('[mail] account details:', error.message);
    return { sent: false, error: 'The mail provider did not accept the message.' };
  }
}

module.exports = {
  isMailConfigured,
  publicLoginUrl,
  sendAccountDetails
};
