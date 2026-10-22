'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const mail = require('../../src/utils/mail');

const KEYS = ['MAIL_PROVIDER', 'MAIL_FROM', 'RESEND_API_KEY', 'BREVO_API_KEY', 'SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS'];
const realFetch = global.fetch;
const savedEnv = {};

test.beforeEach(() => {
  for (const key of KEYS) {
    savedEnv[key] = process.env[key];
    delete process.env[key];
  }
});

test.afterEach(() => {
  for (const key of KEYS) {
    if (savedEnv[key] === undefined) delete process.env[key];
    else process.env[key] = savedEnv[key];
  }
  global.fetch = realFetch;
});

function stubFetch(handler) {
  const calls = [];
  global.fetch = async (url, options) => {
    calls.push({ url, options, body: JSON.parse(options.body) });
    return handler(url, options);
  };
  return calls;
}

const okResponse = () => ({ ok: true, status: 200, json: async () => ({ id: 'abc' }), text: async () => '' });
const errorResponse = (status, body) => ({ ok: false, status, json: async () => ({}), text: async () => JSON.stringify(body) });

test('provider is chosen from MAIL_PROVIDER, then from whichever API key is set', () => {
  assert.equal(mail.mailProvider(), 'smtp');
  process.env.BREVO_API_KEY = 'b';
  assert.equal(mail.mailProvider(), 'brevo');
  process.env.RESEND_API_KEY = 'r';
  assert.equal(mail.mailProvider(), 'resend');
  process.env.MAIL_PROVIDER = 'SMTP';
  assert.equal(mail.mailProvider(), 'smtp');
});

test('MAIL_FROM keeps working when a host dashboard stores the quote marks', () => {
  process.env.MAIL_FROM = '"ConnectED <no-reply@cini-connected.com>"';
  assert.equal(mail.mailFrom(), 'ConnectED <no-reply@cini-connected.com>');
  assert.deepEqual(mail.parseFrom(mail.mailFrom()), { name: 'ConnectED', email: 'no-reply@cini-connected.com' });
  assert.deepEqual(mail.parseFrom('plain@school.com'), { name: '', email: 'plain@school.com' });
});

test('mail counts as configured only when the chosen provider has what it needs', () => {
  assert.equal(mail.isMailConfigured(), false);
  process.env.RESEND_API_KEY = 'r';
  assert.equal(mail.isMailConfigured(), false); // no sender yet
  process.env.MAIL_FROM = 'ConnectED <no-reply@cini-connected.com>';
  assert.equal(mail.isMailConfigured(), true);
});

test('Resend: posts the message over HTTPS with the API key', async () => {
  process.env.RESEND_API_KEY = 're_test';
  process.env.MAIL_FROM = 'ConnectED <no-reply@cini-connected.com>';
  const calls = stubFetch(okResponse);

  const result = await mail.sendMail({ to: 'parent@example.com', subject: 'Hi', text: 'Body' });

  assert.equal(result.sent, true);
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, 'https://api.resend.com/emails');
  assert.equal(calls[0].options.headers.Authorization, 'Bearer re_test');
  assert.deepEqual(calls[0].body, {
    from: 'ConnectED <no-reply@cini-connected.com>',
    to: ['parent@example.com'],
    subject: 'Hi',
    text: 'Body'
  });
});

test('Brevo: splits the sender into name and email', async () => {
  process.env.MAIL_PROVIDER = 'brevo';
  process.env.BREVO_API_KEY = 'xkey';
  process.env.MAIL_FROM = 'ConnectED <no-reply@cini-connected.com>';
  const calls = stubFetch(okResponse);

  const result = await mail.sendMail({ to: 'parent@example.com', subject: 'Hi', text: 'Body' });

  assert.equal(result.sent, true);
  assert.equal(calls[0].url, 'https://api.brevo.com/v3/smtp/email');
  assert.equal(calls[0].options.headers['api-key'], 'xkey');
  assert.deepEqual(calls[0].body.sender, { name: 'ConnectED', email: 'no-reply@cini-connected.com' });
  assert.deepEqual(calls[0].body.to, [{ email: 'parent@example.com' }]);
  assert.equal(calls[0].body.textContent, 'Body');
});

test('account emails carry the student username, password and expiry through the provider', async () => {
  process.env.RESEND_API_KEY = 're_test';
  process.env.MAIL_FROM = 'ConnectED <no-reply@cini-connected.com>';
  const calls = stubFetch(okResponse);

  const result = await mail.sendAccountDetails({
    firstName: 'Ana', lastName: 'Cruz', email: 'parent@example.com', role: 'student',
    password: 'abcd2345', loginUrl: 'https://cini-connected.com/login',
    childName: 'Jo Manas', username: 'jomanas', expiresMinutes: 10
  });

  assert.equal(result.sent, true);
  assert.equal(calls[0].body.subject, "Your child's ConnectED account");
  assert.match(calls[0].body.text, /Username: jomanas/);
  assert.match(calls[0].body.text, /Temporary password: abcd2345/);
  assert.match(calls[0].body.text, /https:\/\/cini-connected\.com\/login/);
  assert.match(calls[0].body.text, /expires 10 minutes/);
});

test('failures become short, safe reasons and never throw', async () => {
  process.env.RESEND_API_KEY = 're_test';
  process.env.MAIL_FROM = 'ConnectED <no-reply@cini-connected.com>';
  const originalError = console.error;
  console.error = () => {};
  try {
    const cases = [
      [errorResponse(401, { message: 'API key is invalid' }), /login or API key/],
      [errorResponse(403, { message: 'The cini-connected.com domain is not verified' }), /sender address was not accepted/],
      [errorResponse(403, { message: 'You can only send testing emails to your own email address' }), /sender address was not accepted/],
      [errorResponse(429, { message: 'Too many requests' }), /limit was reached/],
      [errorResponse(503, { message: 'down' }), /having problems/]
    ];
    for (const [response, expected] of cases) {
      stubFetch(() => response);
      const result = await mail.sendMail({ to: 'p@example.com', subject: 's', text: 't' });
      assert.equal(result.sent, false);
      assert.match(result.error, expected);
      assert.doesNotMatch(result.error, /re_test/);
    }

    global.fetch = async () => { const e = new Error('timeout'); e.name = 'TimeoutError'; throw e; };
    const timedOut = await mail.sendMail({ to: 'p@example.com', subject: 's', text: 't' });
    assert.equal(timedOut.sent, false);
    assert.match(timedOut.error, /could not be reached/);
  } finally {
    console.error = originalError;
  }
});

test('missing address or missing setup gives a clear message instead of an attempt', async () => {
  const calls = stubFetch(okResponse);
  assert.match((await mail.sendMail({ to: '', subject: 's', text: 't' })).error, /no email address/);
  assert.match((await mail.sendMail({ to: 'p@example.com', subject: 's', text: 't' })).error, /not configured/);
  assert.equal(calls.length, 0);
});
