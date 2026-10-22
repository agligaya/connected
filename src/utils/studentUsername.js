'use strict';

function lettersOnly(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z]/g, '');
}

/** First two letters of the first name plus the last name, lowercase. */
function studentUsernameBase(firstName, lastName) {
  const first = lettersOnly(firstName).slice(0, 2);
  const last = lettersOnly(lastName);
  return `${first}${last}`;
}

module.exports = { lettersOnly, studentUsernameBase };
