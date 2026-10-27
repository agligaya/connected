'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { sanitizeInsightBullets } = require('../../src/utils/parentInsights');

test('sanitizeInsightBullets keeps skill sentences and drops diagnoses', () => {
  const out = sanitizeInsightBullets([
    'They have difficulty understanding verbs in a sentence.',
    'They can already name common nouns.',
    'This may be dyslexia.',
    'short',
    'They have difficulty understanding verbs in a sentence.',
    12,
    null
  ]);
  assert.deepEqual(out, [
    'They have difficulty understanding verbs in a sentence.',
    'They can already name common nouns.'
  ]);
});

test('sanitizeInsightBullets trims length and caps the list', () => {
  const long = `They have difficulty with ${'addition '.repeat(40)}.`;
  const out = sanitizeInsightBullets([long, 'They are doing well with subtraction facts.'], { max: 1, maxLen: 40 });
  assert.equal(out.length, 1);
  assert.ok(out[0].endsWith('…'));
  assert.ok(out[0].length <= 40);
});
