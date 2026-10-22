'use strict';

// Sends one test email using the same settings the app uses.
//   npm run mail:test -- someone@example.com
require('dotenv').config({ quiet: true });
const { mailProvider, mailFrom, isMailConfigured, sendMail } = require('../src/utils/mail');

(async () => {
  const to = String(process.argv[2] || '').trim();
  console.log(`Provider : ${mailProvider()}`);
  console.log(`From     : ${mailFrom() || '(MAIL_FROM is not set)'}`);
  console.log(`Ready    : ${isMailConfigured() ? 'yes' : 'no - check the provider settings in .env'}`);
  if (!to) {
    console.log('\nGive an address to send a test message:  npm run mail:test -- you@example.com');
    return;
  }
  const result = await sendMail({
    to,
    subject: 'ConnectED test email',
    text: 'If you can read this, ConnectED can send email from this server.'
  });
  console.log(result.sent ? `\nSent to ${to}.` : `\nFailed: ${result.error}`);
  process.exitCode = result.sent ? 0 : 1;
})();
