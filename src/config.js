const ttl = Number(process.env.STUDENT_TEMP_PASSWORD_MINUTES);

module.exports = {
  schoolYear: process.env.SCHOOL_YEAR || '2025-2026',
  currentQuarter: process.env.CURRENT_QUARTER || 'Q1',
  // How long a student's temporary password can be used to sign in for the first time.
  tempPasswordMinutes: Number.isFinite(ttl) && ttl > 0 ? Math.floor(ttl) : 10
};
