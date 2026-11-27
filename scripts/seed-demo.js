/**
 * ConnectED demo data seeder.
 *
 * Usage:
 *   node scripts/seed-demo.js --confirm [--set-quarter]
 *   node scripts/seed-demo.js --reset --confirm
 *   npm run seed:demo
 *   npm run seed:demo:reset
 *
 * Demo tags: admin *@demo.connected.ph; teachers *@usant.edu.ph on demo
 * sections; parents *@gmail.com linked to LRN 9000… students; LRNs 9000….
 * Password for all demo logins: Demo@1234
 */
'use strict';

require('dotenv').config();
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const db = require('../db');
const { studentUsernameBase } = require('../src/utils/studentUsername');
const { ensureStudentRoleSchema } = require('../src/utils/studentAccounts');
const { ensureSoftDeleteSchema } = require('../src/utils/softDeleteSchema');
const { ensureAttendanceSchema, manilaISODate } = require('../src/utils/attendanceSchema');
const { ensureQuizAttendanceSchema } = require('../src/utils/quizAttendance');
const { ensureQuizShareSchema } = require('../src/utils/quizShare');
const { ensureQuestionBankSchema } = require('../src/utils/questionBank');
const { ensureActivityGroupsSchema } = require('../src/utils/activityGroups');
const { ensureAiRecommendationsSchema } = require('../src/utils/aiRecommendations');
const { getCurrentQuarter } = require('../src/utils/schoolSettings');
const { ensureSmsSchema } = require('../src/utils/sms');
const { ensureTeachingModeEnum, ensureAssignmentSlots } = require('../src/utils/teachingMode');
const { ensureConcernRepliesSchema, ensureConcernReadsSchema } = require('../src/utils/concernReplies');
const { ensureInboxTrash } = require('../src/utils/inboxTrash');
const { ensureAnnouncementAudience } = require('../src/utils/announcements');

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const SCHOOL_YEAR = process.env.SCHOOL_YEAR || '2026-2027';
const DEMO_PASSWORD = 'Demo@1234';
const DEMO_EMAIL_SUFFIX = '@demo.connected.ph'; // admin (+ legacy tag)
const TEACHER_EMAIL_SUFFIX = '@usant.edu.ph';
const PARENT_EMAIL_SUFFIX = '@gmail.com';
const LRN_PREFIX = '9000';
const RNG_SEED = 20251125;
const BATCH = 800;
const ATTENDANCE_START = '2026-06-01';

/** Demo “today”: host Manila date, or fixed anchor if the clock is outside this SY. */
function resolveSeedToday() {
  const envDay = String(process.env.SEED_TODAY || '').trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(envDay)) return envDay;
  const today = manilaISODate();
  if (today >= ATTENDANCE_START && today <= '2027-05-31') return today;
  return '2026-11-26';
}
const SEED_TODAY = resolveSeedToday();

/** Quarter date ranges for SCHOOL_YEAR 2026-2027 (inclusive). */
const QUARTERS = {
  Q1: { start: '2026-06-01', end: '2026-08-31' },
  Q2: { start: '2026-09-01', end: '2026-11-30' },
  Q3: { start: '2026-12-01', end: '2027-03-31' }
};

/** PH holidays / non-school weekdays in the SY window (YYYY-MM-DD). */
const PH_HOLIDAYS = new Set([
  '2026-06-12', // Independence Day
  '2026-08-21', // Ninoy Aquino Day
  '2026-08-31', // National Heroes Day (last Monday of August 2026)
  '2026-11-01', // All Saints
  '2026-11-02', // All Souls (often non-class)
  '2026-11-30', // Bonifacio Day
  '2026-12-08', // Immaculate Conception
  '2026-12-24',
  '2026-12-25',
  '2026-12-30', // Rizal Day
  '2026-12-31',
  '2027-01-01',
  '2027-02-25', // EDSA
  '2027-04-01', // Maundy Thursday (approx)
  '2027-04-02'
]);

const SECTIONS = [
  { grade: 1, section: 'Sampaguita' },
  { grade: 1, section: 'Rosal' },
  { grade: 2, section: 'Gumamela' },
  { grade: 2, section: 'Santan' },
  { grade: 3, section: 'Orchid' },
  { grade: 3, section: 'Daisy' },
  { grade: 4, section: 'Jasmine' },
  { grade: 4, section: 'Lily' },
  { grade: 5, section: 'Tulip' },
  { grade: 5, section: 'Camia' },
  { grade: 6, section: 'Dahlia' },
  { grade: 6, section: 'Peony' }
];

const DEMO_SECTION_NAMES = SECTIONS.map((s) => s.section);

const SUBJECT_DEFS = [
  { name: 'English', code: 'DEMO_ENG', grades: '1-6' },
  { name: 'Math', code: 'DEMO_MATH', grades: '1-6' },
  { name: 'Science', code: 'DEMO_SCI', grades: '1-6' },
  { name: 'Filipino', code: 'DEMO_FIL', grades: '1-6' },
  { name: 'Makabansa', code: 'DEMO_MAK', grades: '1-6' },
  { name: 'GMRC', code: 'DEMO_GMRC', grades: '1-6' },
  { name: 'Religion', code: 'DEMO_REL', grades: '1-6' },
  { name: 'Geometry', code: 'DEMO_GEOM', grades: '1-6' },
  { name: 'Geography', code: 'DEMO_GEOG', grades: '1-6' },
  { name: 'Reading', code: 'DEMO_READ', grades: '1-6' },
  { name: 'Computer', code: 'DEMO_COMP', grades: '3-6' },
  { name: 'TLE', code: 'DEMO_TLE', grades: '3-6' }
];

const FIRST_NAMES_M = [
  'Juan', 'Miguel', 'Gabriel', 'Rafael', 'Andres', 'Luis', 'Carlo', 'Diego', 'Marco', 'Paolo',
  'Jose', 'Antonio', 'Francis', 'Daniel', 'Nathan', 'Ethan', 'Lorenzo', 'Mateo', 'Lucas', 'Samuel'
];
const FIRST_NAMES_F = [
  'Maria', 'Ana', 'Sofia', 'Isabella', 'Andrea', 'Camille', 'Angela', 'Patricia', 'Katrina', 'Bianca',
  'Julia', 'Nicole', 'Samantha', 'Chloe', 'Denise', 'Paula', 'Therese', 'Bea', 'Lian', 'Grace'
];
const MIDDLE_NAMES = [
  'Santos', 'Reyes', 'Cruz', 'Bautista', 'Garcia', 'Lopez', 'Torres', 'Flores', 'Ramos', 'Mendoza',
  'Aquino', 'Diaz', 'Navarro', 'Castillo', 'Rivera'
];
const LAST_NAMES = [
  'Dela Cruz', 'Santos', 'Reyes', 'Garcia', 'Mendoza', 'Villanueva', 'Fernandez', 'Gonzales',
  'Ramirez', 'Cabrera', 'Salazar', 'Domingo', 'Pascual', 'Mercado', 'Alonzo', 'Bautista',
  'Santiago', 'Ocampo', 'Perez', 'Hernandez', 'Aguilar', 'Tolentino', 'Valdez', 'Soriano'
];
const ADDRESSES = [
  'San Vicente, Nabua, Camarines Sur',
  'Iriga City, Camarines Sur',
  'Naga City, Camarines Sur',
  'Pili, Camarines Sur',
  'Baao, Camarines Sur',
  'Bula, Camarines Sur',
  'Buhi, Camarines Sur',
  'Goa, Camarines Sur'
];

const COUNT_TABLES = [
  'subjects',
  'users',
  'teacher_profiles',
  'teacher_assignments',
  'parent_profiles',
  'students',
  'parent_student_links',
  'lesson_plans',
  'assessments',
  'assessment_questions',
  'assessment_scores',
  'attendance',
  'quiz_submissions',
  'announcements',
  'announcement_reads',
  'concerns',
  'concern_replies',
  'messages',
  'app_settings'
];

// Edge-case keys printed in summary
const EDGE = {
  chronicAbsentee: null,
  failMathG5: null,
  failFilipinoG2: null,
  topStudent: null,
  lateHeavy: null,
  inactive: null,
  siblingOfThree: null
};

// ---------------------------------------------------------------------------
// CLI / safety
// ---------------------------------------------------------------------------
const argv = process.argv.slice(2);
const WANT_RESET = argv.includes('--reset');
const CONFIRM = argv.includes('--confirm');
const SET_QUARTER = argv.includes('--set-quarter');

function mulberry32(seed) {
  let a = seed >>> 0;
  return function rand() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rand = mulberry32(RNG_SEED);

function pick(arr) {
  return arr[Math.floor(rand() * arr.length)];
}

function shuffle(list) {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function assertSafeToRun() {
  if (String(process.env.NODE_ENV || '').toLowerCase() === 'production') {
    throw new Error('Refusing to run: NODE_ENV=production');
  }
  const name = String(process.env.DB_NAME || '');
  const looksDev = /dev|test|local|demo|staging|connected/i.test(name);
  if (!CONFIRM) {
    throw new Error(
      'Refusing to run without --confirm. Example: npm run seed:demo  (adds --confirm)'
    );
  }
  if (!looksDev) {
    throw new Error(
      `Refusing to run: DB_NAME "${name}" does not look like a dev/test database`
    );
  }
  console.log(`[seed] SCHOOL_YEAR=${SCHOOL_YEAR} — set SCHOOL_YEAR=2026-2027 in .env (and restart the server)`);
  console.log(`[seed] SEED_TODAY=${SEED_TODAY} (attendance through this date; no future rows)`);
  console.log(`[seed] DB_NAME=${name}`);
}

function subjectApplies(grade, gradesRange) {
  const m = String(gradesRange || '').match(/^(\d+)\s*-\s*(\d+)$/);
  if (!m) return true;
  const g = Number(grade);
  return g >= Number(m[1]) && g <= Number(m[2]);
}

function subjectsForGrade(grade, byName) {
  return SUBJECT_DEFS.filter((d) => subjectApplies(grade, d.grades)).map((d) => byName.get(d.name));
}

/** At least 4 realistic lesson titles per subject for G1–3 and G4–6. */
const LESSON_BANK = {
  English: {
    low: [
      'Naming Words Around Us',
      'Action Words in Sentences',
      'Describing People and Things',
      'Reading Short Stories',
      'Asking and Answering Questions'
    ],
    high: [
      'Nouns and Pronouns in Context',
      'Subject-Verb Agreement',
      'Writing Clear Paragraphs',
      'Figurative Language Basics',
      'Reading Informational Texts'
    ]
  },
  Math: {
    low: [
      'Counting and Place Value',
      'Addition Within 100',
      'Subtraction With Regrouping',
      'Shapes and Patterns',
      'Telling Time'
    ],
    high: [
      'Multi-digit Multiplication',
      'Division With Remainders',
      'Fractions on a Number Line',
      'Perimeter and Area',
      'Solving Word Problems'
    ]
  },
  Science: {
    low: [
      'Living and Non-living Things',
      'Parts of Plants',
      'Weather and Seasons',
      'The Five Senses',
      'Animals and Their Homes'
    ],
    high: [
      'Matter and Its Changes',
      'Simple Machines',
      'Earth and Space Systems',
      'Ecosystems and Food Chains',
      'Human Body Systems'
    ]
  },
  Filipino: {
    low: [
      'Pangalan at Pantangi',
      'Pandiwa sa Pangungusap',
      'Pagbasa ng Maikling Kwento',
      'Pagsulat ng Simpleng Pangungusap',
      'Pagkilala sa Baybayin Basics'
    ],
    high: [
      'Pang-uri at Pang-abay',
      'Pagsulat ng Talata',
      'Pagbasa ng Impormatibong Teksto',
      'Salitang Magkasingkahulugan',
      'Pakikipagtalastasan sa Klase'
    ]
  },
  Makabansa: {
    low: [
      'Aking Pamilya at Pamayanan',
      'Mga Simbolo ng Pilipinas',
      'Mga Tulong sa Komunidad',
      'Paggalang sa Kapwa',
      'Aking Bayan'
    ],
    high: [
      'Mga Rehiyon ng Pilipinas',
      'Mahahalagang Tao sa Kasaysayan',
      'Karapatan at Tungkulin',
      'Kultura at Tradisyon',
      'Pagiging Mabuting Mamamayan'
    ]
  },
  GMRC: {
    low: [
      'Pagiging Magalang',
      'Pagsasabi ng Katotohanan',
      'Pagbabahagi at Pagdamay',
      'Pag-aalaga sa Sarili',
      'Pagiging Responsable'
    ],
    high: [
      'Respect and Empathy',
      'Making Good Choices',
      'Digital Citizenship Basics',
      'Conflict Resolution',
      'Service to Others'
    ]
  },
  Religion: {
    low: [
      'God\'s Creation',
      'Prayer and Gratitude',
      'Bible Stories for Children',
      'Loving Our Neighbor',
      'Sunday Worship'
    ],
    high: [
      'Living the Beatitudes',
      'Faith in Daily Life',
      'Sacraments Overview',
      'Service and Charity',
      'Scripture Reflection'
    ]
  },
  Geometry: {
    low: [
      'Basic Shapes Around Us',
      'Sides and Corners',
      'Sorting Shapes',
      'Drawing Lines and Curves',
      'Patterns With Shapes'
    ],
    high: [
      'Angles and Triangles',
      'Quadrilaterals',
      'Symmetry and Transformations',
      'Circles and Radius',
      'Coordinate Plane Basics'
    ]
  },
  Geography: {
    low: [
      'Maps and Directions',
      'Land and Water',
      'Our Community Map',
      'Weather Across Places',
      'Homes Around the World'
    ],
    high: [
      'Continents and Oceans',
      'Climate Zones',
      'Natural Resources',
      'Philippine Archipelago',
      'Human and Physical Features'
    ]
  },
  Reading: {
    low: [
      'Letter Sounds and Blending',
      'Sight Words Practice',
      'Reading Fluency Aloud',
      'Story Elements',
      'Main Idea in Short Texts'
    ],
    high: [
      'Inferring From Context',
      'Comparing Two Texts',
      'Author\'s Purpose',
      'Summarizing Chapters',
      'Vocabulary in Context'
    ]
  },
  Computer: {
    low: [
      'Parts of a Computer',
      'Safe Clicking Online',
      'Typing Basics',
      'Files and Folders',
      'Drawing With a Mouse'
    ],
    high: [
      'Keyboard Shortcuts',
      'Word Processing Basics',
      'Spreadsheets for Class',
      'Internet Research Skills',
      'Online Safety and Privacy'
    ]
  },
  TLE: {
    low: [
      'Classroom Tools and Safety',
      'Simple Handicrafts',
      'Measuring Ingredients',
      'Keeping Things Clean',
      'Following Steps Carefully'
    ],
    high: [
      'Basic Home Economics',
      'Entrepreneurship Starters',
      'ICT for Productivity',
      'Agri-Fishery Awareness',
      'Industrial Arts Safety'
    ]
  }
};

function lessonTitlesFor(subjectName, grade) {
  const bank = LESSON_BANK[subjectName] || LESSON_BANK.English;
  const list = grade <= 3 ? bank.low : bank.high;
  return list && list.length ? list : ['Classroom Lesson', 'Practice Skills', 'Review and Apply', 'Unit Check'];
}

function pickLessonTitle(subjectName, grade, index) {
  const list = lessonTitlesFor(subjectName, grade);
  return list[Math.abs(Number(index) || 0) % list.length];
}

/** Whole-number score consistent with max_score (0 … max). */
function wholeScore(max, pct) {
  const m = Math.max(0, Number(max) || 0);
  const p = Math.max(0, Math.min(1, Number(pct) || 0));
  return Math.round(m * p);
}

function assessmentCreatedAt(quarter, salt) {
  const q = QUARTERS[quarter] || QUARTERS.Q1;
  const days = schoolDaysBetween(q.start, q.end);
  if (!days.length) return `${q.start} 09:00:00`;
  const idx = Math.abs(Number(salt) || 0) % days.length;
  const hh = 8 + ((Number(salt) || 0) % 6);
  return `${days[idx]} ${String(hh).padStart(2, '0')}:15:00`;
}

function parseYmd(ymd) {
  const [y, m, d] = ymd.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

function formatYmd(dt) {
  return dt.toISOString().slice(0, 10);
}

function schoolDaysBetween(startYmd, endYmd) {
  const out = [];
  let cur = parseYmd(startYmd);
  const end = parseYmd(endYmd);
  while (cur <= end) {
    const dow = cur.getUTCDay();
    const ymd = formatYmd(cur);
    if (dow >= 1 && dow <= 5 && !PH_HOLIDAYS.has(ymd)) out.push(ymd);
    cur = new Date(cur.getTime() + 86400000);
  }
  return out;
}

function allSchoolDays() {
  // Parent totalSchoolDays = COUNT(DISTINCT DATE) on attendance — seed every
  // Mon–Fri (minus holidays) from SY start through today only (no future dates).
  const end = SEED_TODAY < ATTENDANCE_START ? ATTENDANCE_START : SEED_TODAY;
  return schoolDaysBetween(ATTENDANCE_START, end);
}

function quarterOfDate(ymd) {
  if (ymd <= QUARTERS.Q1.end) return 'Q1';
  if (ymd <= QUARTERS.Q2.end) return 'Q2';
  return 'Q3';
}

function ageDob(grade) {
  // SY 2025-2026: approximate age = grade + 5.5 → birth year
  const baseYear = 2025 - (grade + 6);
  const month = 1 + Math.floor(rand() * 12);
  const day = 1 + Math.floor(rand() * 28);
  return `${baseYear}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function phoneFromIndex(i) {
  const n = 900000000 + (i % 100000000);
  return `09${String(n).padStart(9, '0')}`.slice(0, 11);
}

async function tableCounts(conn) {
  const out = {};
  for (const t of COUNT_TABLES) {
    try {
      const [rows] = await conn.query(`SELECT COUNT(*) AS c FROM \`${t}\``);
      out[t] = Number(rows[0].c) || 0;
    } catch {
      out[t] = null;
    }
  }
  return out;
}

function printCounts(label, counts) {
  console.log(`\n=== ${label} ===`);
  for (const t of COUNT_TABLES) {
    console.log(`  ${t.padEnd(24)} ${counts[t] == null ? 'n/a' : counts[t]}`);
  }
}

async function insertBatch(conn, sqlPrefix, rows, mapRow) {
  if (!rows.length) return;
  for (let i = 0; i < rows.length; i += BATCH) {
    const chunk = rows.slice(i, i + BATCH);
    const placeholders = [];
    const values = [];
    for (const row of chunk) {
      const mapped = mapRow(row);
      placeholders.push(`(${mapped.map(() => '?').join(',')})`);
      values.push(...mapped);
    }
    await conn.query(`${sqlPrefix} VALUES ${placeholders.join(',')}`, values);
  }
}

async function ensureAuthColumnsLocal(conn = db) {
  const ignore = (e) => {
    if (e && (e.code === 'ER_DUP_FIELDNAME' || e.errno === 1060)) return;
    throw e;
  };
  await conn.query(
    'ALTER TABLE users ADD COLUMN must_change_password TINYINT(1) NOT NULL DEFAULT 0'
  ).catch(ignore);
  await conn.query(
    'ALTER TABLE users ADD COLUMN token_version INT NOT NULL DEFAULT 0'
  ).catch(ignore);
  await conn.query(
    'ALTER TABLE users ADD COLUMN temp_password_expires_at DATETIME NULL'
  ).catch(ignore);
  // G4–6 adviser Records view only shows assessments with this flag set.
  await conn.query(
    'ALTER TABLE assessments ADD COLUMN shared_with_adviser TINYINT(1) NOT NULL DEFAULT 0'
  ).catch(ignore);
}

async function ensureRuntimeSchema() {
  console.log('[seed] Ensuring runtime schema…');
  await ensureAuthColumnsLocal();
  await ensureStudentRoleSchema();
  await ensureSoftDeleteSchema();
  await ensureTeachingModeEnum();
  await ensureAssignmentSlots();
  await ensureAttendanceSchema();
  await ensureQuizAttendanceSchema();
  await ensureQuestionBankSchema();
  await ensureQuizShareSchema();
  await ensureActivityGroupsSchema();
  await ensureAiRecommendationsSchema();
  await getCurrentQuarter(); // ensures app_settings exists
  await ensureSmsSchema();
  await ensureConcernRepliesSchema();
  await ensureConcernReadsSchema();
  await ensureInboxTrash();
  await ensureAnnouncementAudience();
}

/** Login local-part: first 2 letters of first name + last name, all lowercase. */
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

/** Allocate unique email; collisions get 2, 3, … before the domain. */
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

async function loadTakenEmails(conn) {
  const [rows] = await conn.query(`SELECT LOWER(email) AS email FROM users`);
  return new Set(rows.map((r) => String(r.email || '').toLowerCase()).filter(Boolean));
}

async function demoUserIds(conn) {
  const sectionPh = DEMO_SECTION_NAMES.map(() => '?').join(',');
  const [rows] = await conn.query(
    `SELECT id FROM users WHERE email LIKE ?
     UNION
     SELECT DISTINCT u.id
     FROM users u
     INNER JOIN teacher_assignments ta ON ta.teacher_id = u.id
     WHERE u.role = 'teacher'
       AND LOWER(u.email) LIKE ?
       AND TRIM(ta.section) IN (${sectionPh})
     UNION
     SELECT DISTINCT u.id
     FROM users u
     INNER JOIN parent_student_links psl ON psl.parent_id = u.id
     INNER JOIN students s ON s.id = psl.student_id
     WHERE u.role = 'parent'
       AND LOWER(u.email) LIKE ?
       AND s.lrn LIKE ?`,
    [
      `%${DEMO_EMAIL_SUFFIX}`,
      `%${TEACHER_EMAIL_SUFFIX}`,
      ...DEMO_SECTION_NAMES,
      `%${PARENT_EMAIL_SUFFIX}`,
      `${LRN_PREFIX}%`
    ]
  );
  return [...new Set(rows.map((r) => Number(r.id)))];
}

async function demoStudentIds(conn) {
  const [rows] = await conn.query(
    `SELECT id FROM students WHERE lrn LIKE ?`,
    [`${LRN_PREFIX}%`]
  );
  return rows.map((r) => Number(r.id));
}

async function checkSectionConflicts(conn) {
  const placeholders = DEMO_SECTION_NAMES.map(() => '?').join(',');
  const [stu] = await conn.query(
    `SELECT id, grade_level, section, lrn FROM students
     WHERE TRIM(section) IN (${placeholders})
       AND (lrn IS NULL OR lrn NOT LIKE ?)`,
    [...DEMO_SECTION_NAMES, `${LRN_PREFIX}%`]
  );
  const [ta] = await conn.query(
    `SELECT ta.id, ta.grade_level, ta.section, ta.teacher_id, u.email
     FROM teacher_assignments ta
     LEFT JOIN users u ON u.id = ta.teacher_id
     WHERE TRIM(ta.section) IN (${placeholders})
       AND (
         u.email IS NULL
         OR (
           u.email NOT LIKE ?
           AND LOWER(u.email) NOT LIKE ?
         )
       )`,
    [...DEMO_SECTION_NAMES, `%${DEMO_EMAIL_SUFFIX}`, `%${TEACHER_EMAIL_SUFFIX}`]
  );
  if (stu.length || ta.length) {
    console.error('[seed] CONFLICT: demo section names already used by non-demo data.');
    if (stu.length) {
      console.error(`  students (${stu.length}):`, stu.slice(0, 5));
    }
    if (ta.length) {
      console.error(`  teacher_assignments (${ta.length}):`, ta.slice(0, 5));
    }
    throw new Error('Aborting to avoid colliding with existing section data');
  }
}

async function alreadySeeded(conn) {
  const ids = await demoUserIds(conn);
  return ids.length > 0;
}

// ---------------------------------------------------------------------------
// Reset (demo rows only)
// ---------------------------------------------------------------------------
async function resetDemo(conn) {
  const userIds = await demoUserIds(conn);
  const studentIds = await demoStudentIds(conn);
  console.log(`[reset] demo users=${userIds.length}, demo students=${studentIds.length}`);

  if (!userIds.length && !studentIds.length) {
    console.log('[reset] Nothing to delete.');
    return;
  }

  const uPh = userIds.length ? userIds.map(() => '?').join(',') : null;
  const sPh = studentIds.length ? studentIds.map(() => '?').join(',') : null;

  // Assessments created by demo teachers OR tied to demo sections
  let assessmentIds = [];
  if (userIds.length || DEMO_SECTION_NAMES.length) {
    const [aRows] = await conn.query(
      `SELECT id FROM assessments
       WHERE (${userIds.length ? `created_by IN (${uPh})` : '0'} )
          OR TRIM(section) IN (${DEMO_SECTION_NAMES.map(() => '?').join(',')})`,
      [...userIds, ...DEMO_SECTION_NAMES]
    );
    assessmentIds = aRows.map((r) => Number(r.id));
  }
  const aPh = assessmentIds.length ? assessmentIds.map(() => '?').join(',') : null;

  async function del(sql, params) {
    if (!params || (Array.isArray(params[0]) && !params[0].length)) return;
    if (params.some((p) => Array.isArray(p) ? !p.length : false)) return;
    try {
      await conn.query(sql, params.flat ? params : params);
    } catch (e) {
      console.warn(`[reset] ${e.message}`);
    }
  }

  if (aPh) {
    await conn.query(`DELETE FROM quiz_focus_events WHERE assessment_id IN (${aPh})`, assessmentIds).catch(() => {});
    await conn.query(`DELETE FROM quiz_attempt_starts WHERE assessment_id IN (${aPh})`, assessmentIds).catch(() => {});
    await conn.query(`DELETE FROM quiz_submissions WHERE assessment_id IN (${aPh})`, assessmentIds);
    await conn.query(`DELETE FROM assessment_scores WHERE assessment_id IN (${aPh})`, assessmentIds);
    await conn.query(`DELETE FROM assessment_questions WHERE assessment_id IN (${aPh})`, assessmentIds);
    const [gRows] = await conn.query(`SELECT id FROM assessment_groups WHERE assessment_id IN (${aPh})`, assessmentIds).catch(() => [[]]);
    const gIds = (gRows || []).map((r) => Number(r.id));
    if (gIds.length) {
      await conn.query(`DELETE FROM assessment_group_members WHERE group_id IN (${gIds.map(() => '?').join(',')})`, gIds);
      await conn.query(`DELETE FROM assessment_groups WHERE id IN (${gIds.map(() => '?').join(',')})`, gIds);
    }
    await conn.query(`DELETE FROM activity_due_notices WHERE assessment_id IN (${aPh})`, assessmentIds).catch(() => {});
    await conn.query(`DELETE FROM assessments WHERE id IN (${aPh})`, assessmentIds);
  }

  if (sPh) {
    await conn.query(`DELETE FROM attendance WHERE student_id IN (${sPh})`, studentIds);
    await conn.query(`DELETE FROM assessment_scores WHERE student_id IN (${sPh})`, studentIds);
    await conn.query(`DELETE FROM quiz_submissions WHERE student_id IN (${sPh})`, studentIds);
    await conn.query(`DELETE FROM quiz_focus_events WHERE student_id IN (${sPh})`, studentIds).catch(() => {});
    await conn.query(`DELETE FROM quiz_attempt_starts WHERE student_id IN (${sPh})`, studentIds).catch(() => {});
    await conn.query(`DELETE FROM parent_student_links WHERE student_id IN (${sPh})`, studentIds);
    await conn.query(`DELETE FROM sms_queue WHERE student_id IN (${sPh})`, studentIds).catch(() => {});
    await conn.query(`DELETE FROM activity_due_notices WHERE student_id IN (${sPh})`, studentIds).catch(() => {});
    await conn.query(`DELETE FROM messages WHERE student_id IN (${sPh})`, studentIds);
    await conn.query(`DELETE FROM concerns WHERE student_id IN (${sPh})`, studentIds);
  }

  if (uPh) {
    await conn.query(
      `DELETE ar FROM announcement_reads ar
       INNER JOIN announcements a ON a.id = ar.announcement_id
       WHERE a.sender_id IN (${uPh}) OR ar.user_id IN (${uPh})`,
      [...userIds, ...userIds]
    ).catch(() => {});
    await conn.query(`DELETE FROM announcements WHERE sender_id IN (${uPh})`, userIds);
    const [cRows] = await conn.query(
      `SELECT id FROM concerns WHERE parent_id IN (${uPh}) OR teacher_id IN (${uPh})`,
      [...userIds, ...userIds]
    );
    const cIds = cRows.map((r) => Number(r.id));
    if (cIds.length) {
      await conn.query(`DELETE FROM concern_replies WHERE concern_id IN (${cIds.map(() => '?').join(',')})`, cIds);
      await conn.query(`DELETE FROM concern_reads WHERE concern_id IN (${cIds.map(() => '?').join(',')})`, cIds).catch(() => {});
      await conn.query(`DELETE FROM concerns WHERE id IN (${cIds.map(() => '?').join(',')})`, cIds);
    }
    await conn.query(
      `DELETE FROM messages WHERE sender_id IN (${uPh}) OR receiver_id IN (${uPh})`,
      [...userIds, ...userIds]
    );
    await conn.query(`DELETE FROM inbox_trash WHERE user_id IN (${uPh})`, userIds).catch(() => {});
    await conn.query(`DELETE FROM sms_queue WHERE parent_id IN (${uPh})`, userIds).catch(() => {});
    await conn.query(`DELETE FROM ai_recommendations WHERE teacher_id IN (${uPh})`, userIds).catch(() => {});
    await conn.query(`DELETE FROM question_bank WHERE teacher_id IN (${uPh})`, userIds).catch(() => {});
    await conn.query(`DELETE FROM quiz_sets WHERE teacher_id IN (${uPh})`, userIds).catch(() => {});
    await conn.query(`DELETE FROM lesson_plans WHERE uploaded_by IN (${uPh})`, userIds);
    await conn.query(`DELETE FROM teacher_assignments WHERE teacher_id IN (${uPh})`, userIds);
    await conn.query(`DELETE FROM teacher_profiles WHERE user_id IN (${uPh})`, userIds);
    await conn.query(`DELETE FROM parent_profiles WHERE user_id IN (${uPh})`, userIds);
    await conn.query(`DELETE FROM parent_student_links WHERE parent_id IN (${uPh})`, userIds);
    await conn.query(`DELETE FROM activity_log WHERE user_id IN (${uPh})`, userIds).catch(() => {});
    await conn.query(`DELETE FROM users WHERE id IN (${uPh})`, userIds);
  }

  if (sPh) {
    await conn.query(`DELETE FROM users WHERE student_id IN (${sPh}) AND role = 'student'`, studentIds);
    await conn.query(`DELETE FROM students WHERE id IN (${sPh})`, studentIds);
  }

  // Demo-only subjects (by CODE prefix) — only if unused
  await conn.query(
    `DELETE FROM subjects WHERE CODE LIKE 'DEMO_%' AND deleted_at IS NULL
     AND id NOT IN (SELECT subject_id FROM assessments WHERE subject_id IS NOT NULL)
     AND id NOT IN (SELECT subject_id FROM teacher_assignments WHERE subject_id IS NOT NULL)
     AND id NOT IN (SELECT subject_id FROM lesson_plans WHERE subject_id IS NOT NULL)`
  ).catch(() => {});

  console.log('[reset] Demo rows removed.');
}

// ---------------------------------------------------------------------------
// Seed builders
// ---------------------------------------------------------------------------
async function upsertSubjects(conn) {
  const byName = new Map();
  for (const def of SUBJECT_DEFS) {
    const [existing] = await conn.query(
      `SELECT id, CODE, NAME, applicable_grades FROM subjects
       WHERE NAME = ? AND deleted_at IS NULL LIMIT 1`,
      [def.name]
    );
    if (existing.length) {
      byName.set(def.name, existing[0]);
      if (!existing[0].applicable_grades || existing[0].applicable_grades !== def.grades) {
        await conn.query(`UPDATE subjects SET applicable_grades = ? WHERE id = ?`, [
          def.grades,
          existing[0].id
        ]);
        existing[0].applicable_grades = def.grades;
      }
      continue;
    }
    const [res] = await conn.query(
      `INSERT INTO subjects (CODE, NAME, description, applicable_grades)
       VALUES (?, ?, ?, ?)`,
      [def.code, def.name, `Demo subject ${def.name}`, def.grades]
    );
    byName.set(def.name, {
      id: res.insertId,
      CODE: def.code,
      NAME: def.name,
      applicable_grades: def.grades
    });
  }
  return byName;
}

function makeUsername(first, last, lrn, taken) {
  const base = studentUsernameBase(first, last);
  const suffix = String(lrn || '').replace(/\D/g, '').slice(-3);
  const candidates = [base];
  if (suffix) candidates.push(`${base}${suffix}`);
  for (let n = 2; n < 200; n += 1) {
    candidates.push(suffix ? `${base}${suffix}${n}` : `${base}${n}`);
  }
  for (const c of candidates) {
    if (!taken.has(c)) {
      taken.add(c);
      return c;
    }
  }
  throw new Error(`Could not allocate username for ${first} ${last}`);
}

async function seedCore(conn, passwordHash) {
  const subjectByName = await upsertSubjects(conn);
  const days = allSchoolDays();
  const daysByQuarter = { Q1: [], Q2: [], Q3: [] };
  for (const d of days) daysByQuarter[quarterOfDate(d)].push(d);

  // ---- Admin ----
  const [adminIns] = await conn.query(
    `INSERT INTO users (first_name, last_name, email, password_hash, phone, role, STATUS, must_change_password, token_version)
     VALUES (?, ?, ?, ?, ?, 'admin', 'active', 0, 0)`,
    ['Demo', 'Admin', `admin${DEMO_EMAIL_SUFFIX}`, passwordHash, '09170000001']
  );
  const adminId = adminIns.insertId;

  // ---- Teachers (24 = 12 advisers + 12 assistants) ----
  const takenEmails = await loadTakenEmails(conn);
  const teachers = []; // { userId, grade, section, role: adviser|assistant, email, first, last }
  let teacherPhone = 1;
  for (const { grade, section } of SECTIONS) {
    for (const homeRole of ['adviser', 'assistant']) {
      const first = homeRole === 'adviser' ? pick(FIRST_NAMES_F) : pick(FIRST_NAMES_M);
      const last = pick(LAST_NAMES);
      const email = allocateDemoEmail(
        demoLoginLocalPart(first, last),
        TEACHER_EMAIL_SUFFIX,
        takenEmails
      );
      const [ins] = await conn.query(
        `INSERT INTO users (first_name, last_name, email, password_hash, phone, role, STATUS, must_change_password, token_version)
         VALUES (?, ?, ?, ?, ?, 'teacher', 'active', 0, 0)`,
        [first, last, email, passwordHash, phoneFromIndex(teacherPhone++)]
      );
      teachers.push({
        userId: ins.insertId,
        grade,
        section,
        role: homeRole,
        email,
        first,
        last
      });
    }
  }

  // G4-6 subject slot assignment: 12 subjects × 6 sections = 72 → 6 each among 12 teachers
  const upperSections = SECTIONS.filter((s) => s.grade >= 4);
  const upperTeachers = teachers.filter((t) => t.grade >= 4);
  const upperSubjects = SUBJECT_DEFS.filter((d) => subjectApplies(4, d.grades)).map((d) =>
    subjectByName.get(d.name)
  );
  const subjectSlots = [];
  for (const sec of upperSections) {
    for (const sub of upperSubjects) {
      subjectSlots.push({ grade: sec.grade, section: sec.section, subject: sub });
    }
  }
  // Deterministic round-robin
  const slotOwner = new Map(); // key grade|section|subjectId → teacher
  subjectSlots.forEach((slot, idx) => {
    const teacher = upperTeachers[idx % upperTeachers.length];
    const key = `${slot.grade}|${slot.section}|${slot.subject.id}`;
    slotOwner.set(key, teacher);
  });

  // teacher_profiles + teacher_assignments
  // G1–3: subjects_taught = all applicable subjects for the homeroom grade.
  // G4–6: subjects_taught = only subject_ids from slot='subject' assignment rows.
  for (const t of teachers) {
    const gradeSubs = subjectsForGrade(t.grade, subjectByName);
    let subjectRows = []; // { grade, section, subject }
    if (t.grade >= 4) {
      subjectRows = subjectSlots.filter((slot) => {
        const owner = slotOwner.get(`${slot.grade}|${slot.section}|${slot.subject.id}`);
        return owner.userId === t.userId;
      });
    }
    t.subjectRows = subjectRows;

    let taughtIds;
    let handledGrades;
    // Materials shows all subjects for the teacher's homeroom grade (API expands
    // adviser/assistant NULL rows for G1–6). Seed lesson_plans for that full set.
    // G4–6 still keep unique slot='subject' rows for attendance ownership.
    const pairKey = new Set();
    t.taughtPairs = [];
    const addPair = (subjectId, subjectName, grade) => {
      const k = `${subjectId}|${grade}`;
      if (pairKey.has(k)) return;
      pairKey.add(k);
      t.taughtPairs.push({ subjectId, subjectName, grade });
    };

    if (t.grade <= 3) {
      taughtIds = gradeSubs.map((s) => s.id);
      handledGrades = [t.grade];
      for (const s of gradeSubs) addPair(s.id, s.NAME, t.grade);
    } else {
      const homeSubs = subjectsForGrade(t.grade, subjectByName);
      taughtIds = [
        ...new Set([
          ...homeSubs.map((s) => s.id),
          ...subjectRows.map((o) => o.subject.id)
        ])
      ];
      handledGrades = [...new Set([t.grade, ...subjectRows.map((o) => o.grade)])].sort(
        (a, b) => a - b
      );
      // Full 12-subject Materials load for the home grade
      for (const s of homeSubs) addPair(s.id, s.NAME, t.grade);
      // Plus any other grades they own via subject slots
      for (const o of subjectRows) {
        if (o.grade === t.grade) continue;
        addPair(o.subject.id, o.subject.NAME, o.grade);
      }
    }

    const teachingMode = t.grade >= 4 ? 'both' : 'class_adviser';

    await conn.query(
      `INSERT INTO teacher_profiles
       (user_id, teaching_mode, homeroom_grade, homeroom_section, specialization, subjects_taught, grades_handled, homeroom_role)
       VALUES (?, ?, ?, ?, NULL, ?, ?, ?)`,
      [
        t.userId,
        teachingMode,
        t.grade,
        t.section,
        JSON.stringify(taughtIds),
        JSON.stringify(handledGrades),
        t.role
      ]
    );

    // Home adviser/assistant row
    await conn.query(
      `INSERT INTO teacher_assignments (teacher_id, subject_id, grade_level, section, school_year, slot)
       VALUES (?, NULL, ?, ?, ?, ?)`,
      [t.userId, t.grade, t.section, SCHOOL_YEAR, t.role]
    );

    // G4-6 subject rows
    for (const o of subjectRows) {
      await conn.query(
        `INSERT INTO teacher_assignments (teacher_id, subject_id, grade_level, section, school_year, slot)
         VALUES (?, ?, ?, ?, ?, 'subject')`,
        [t.userId, o.subject.id, o.grade, o.section, SCHOOL_YEAR]
      );
    }
  }

  // Verify every G4–6 section×subject has exactly one subject teacher
  console.log('\n=== G4–6 subject coverage ===');
  const missingSlots = [];
  const dupSlots = [];
  const ownerCount = new Map();
  for (const slot of subjectSlots) {
    const key = `${slot.grade}|${slot.section}|${slot.subject.id}`;
    const owner = slotOwner.get(key);
    if (!owner) {
      missingSlots.push(
        `G${slot.grade}-${slot.section} / ${slot.subject.NAME} (id=${slot.subject.id})`
      );
      continue;
    }
    ownerCount.set(key, (ownerCount.get(key) || 0) + 1);
  }
  for (const [key, n] of ownerCount) {
    if (n !== 1) dupSlots.push(`${key} owners=${n}`);
  }
  if (missingSlots.length) {
    console.log(`  MISSING (${missingSlots.length}):`);
    missingSlots.forEach((m) => console.log(`    - ${m}`));
  } else {
    console.log(`  OK: all ${subjectSlots.length} section×subject slots have a teacher`);
  }
  if (dupSlots.length) {
    console.log(`  DUPLICATES:`);
    dupSlots.forEach((m) => console.log(`    - ${m}`));
  }

  // Verify subjects_taught = home-grade subjects ∪ slot='subject' subject_ids
  let profileMismatches = 0;
  for (const t of teachers.filter((x) => x.grade >= 4)) {
    const homeIds = subjectsForGrade(t.grade, subjectByName).map((s) => s.id);
    const expected = [
      ...new Set([...homeIds, ...(t.subjectRows || []).map((o) => o.subject.id)])
    ].sort((a, b) => a - b);
    const [prof] = await conn.query(
      `SELECT subjects_taught FROM teacher_profiles WHERE user_id = ?`,
      [t.userId]
    );
    let fromProfile = [];
    try {
      fromProfile = JSON.parse(prof[0]?.subjects_taught || '[]').map(Number).sort((a, b) => a - b);
    } catch (_) {
      fromProfile = [];
    }
    const same =
      expected.length === fromProfile.length
      && expected.every((id, i) => id === fromProfile[i]);
    if (!same) {
      profileMismatches += 1;
      console.log(
        `  MISMATCH subjects_taught: ${t.email} expected=${JSON.stringify(expected)} profile=${JSON.stringify(fromProfile)}`
      );
    }
  }
  if (!profileMismatches) {
    console.log('  OK: subjects_taught includes home-grade subjects + subject slots for all G4–6 teachers');
  }

  const adviserOf = new Map();
  const assistantOf = new Map();
  for (const t of teachers) {
    const key = `${t.grade}|${t.section}`;
    if (t.role === 'adviser') adviserOf.set(key, t);
    else assistantOf.set(key, t);
  }

  function teacherForAssessment(grade, section, subjectId) {
    if (grade <= 3) {
      // Alternate adviser/assistant by subject id for variety
      const a = adviserOf.get(`${grade}|${section}`);
      const b = assistantOf.get(`${grade}|${section}`);
      return subjectId % 2 === 0 ? a : b;
    }
    return slotOwner.get(`${grade}|${section}|${subjectId}`);
  }

  // ---- Students ----
  const takenUsernames = new Set();
  const [existingEmails] = await conn.query(`SELECT LOWER(email) AS e FROM users`);
  for (const r of existingEmails) takenUsernames.add(String(r.e).toLowerCase());

  let lrnSeq = 1;
  const students = []; // meta objects
  for (const { grade, section } of SECTIONS) {
    const count = 20 + Math.floor(rand() * 5); // 20–24
    for (let i = 0; i < count; i += 1) {
      const gender = rand() < 0.5 ? 'M' : 'F';
      const first = gender === 'M' ? pick(FIRST_NAMES_M) : pick(FIRST_NAMES_F);
      const middle = pick(MIDDLE_NAMES);
      const last = pick(LAST_NAMES);
      const lrn = `${LRN_PREFIX}${String(lrnSeq++).padStart(8, '0')}`;
      const dob = ageDob(grade);
      const [ins] = await conn.query(
        `INSERT INTO students (lrn, first_name, middle_name, last_name, grade_level, section, dob, gender, STATUS, deleted_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'active', NULL)`,
        [lrn, first, middle, last, grade, section, dob, gender]
      );
      const studentId = ins.insertId;
      const username = makeUsername(first, last, lrn, takenUsernames);
      const [uIns] = await conn.query(
        `INSERT INTO users (first_name, last_name, email, password_hash, role, STATUS, must_change_password, student_id, token_version)
         VALUES (?, ?, ?, ?, 'student', 'active', 0, ?, 0)`,
        [first, last, username, passwordHash, studentId]
      );
      const ability = 0.55 + rand() * 0.4; // ~0.55–0.95 → mean ~84%
      students.push({
        id: studentId,
        userId: uIns.insertId,
        username,
        lrn,
        first,
        middle,
        last,
        grade,
        section,
        gender,
        ability,
        key: `${grade}|${section}`
      });
    }
  }

  // Inactive / transferred student (extra)
  {
    const grade = 4;
    const section = 'Jasmine';
    const first = 'Transferred';
    const last = 'Demo';
    const lrn = `${LRN_PREFIX}${String(lrnSeq++).padStart(8, '0')}`;
    const [ins] = await conn.query(
      `INSERT INTO students (lrn, first_name, middle_name, last_name, grade_level, section, dob, gender, STATUS, deleted_at)
       VALUES (?, ?, NULL, ?, ?, ?, ?, 'M', 'inactive', NOW())`,
      [lrn, first, last, grade, section, ageDob(grade)]
    );
    EDGE.inactive = {
      id: ins.insertId,
      name: `${first} ${last}`,
      grade,
      section,
      lrn,
      note: 'inactive/transferred (deleted_at set)'
    };
  }

  const activeStudents = students.filter((s) => true);

  // Assign edge-case students
  EDGE.chronicAbsentee = activeStudents.find((s) => s.grade === 3) || activeStudents[0];
  EDGE.lateHeavy = activeStudents.find((s) => s.grade === 1 && s !== EDGE.chronicAbsentee) || activeStudents[1];
  EDGE.topStudent = activeStudents.find((s) => s.grade === 6) || activeStudents[2];
  if (EDGE.topStudent) EDGE.topStudent.ability = 0.97;
  EDGE.failMathG5 = activeStudents.find((s) => s.grade === 5) || null;
  EDGE.failFilipinoG2 = activeStudents.find((s) => s.grade === 2) || null;

  // ---- Parents (~200) + links ----
  const parents = [];
  const parentCount = 200;
  for (let i = 0; i < parentCount; i += 1) {
    const first = pick(FIRST_NAMES_F.concat(FIRST_NAMES_M));
    const last = pick(LAST_NAMES);
    const email = allocateDemoEmail(
      demoLoginLocalPart(first, last),
      PARENT_EMAIL_SUFFIX,
      takenEmails
    );
    const phone = phoneFromIndex(1000 + i);
    const [ins] = await conn.query(
      `INSERT INTO users (first_name, last_name, email, password_hash, phone, role, STATUS, must_change_password, token_version)
       VALUES (?, ?, ?, ?, ?, 'parent', 'active', 0, 0)`,
      [first, last, email, passwordHash, phone]
    );
    await conn.query(
      `INSERT INTO parent_profiles (user_id, address, emergency_contact) VALUES (?, ?, ?)`,
      [ins.insertId, pick(ADDRESSES), phone]
    );
    parents.push({ userId: ins.insertId, email, first, last, phone, childIds: [] });
  }

  // Family structures first, then 1:1 fill
  const unused = shuffle([...activeStudents]);
  function takeStudent(pred) {
    const idx = unused.findIndex(pred);
    if (idx < 0) return null;
    return unused.splice(idx, 1)[0];
  }

  // One family with 3 children
  const threeParent = parents[0];
  const c1 = takeStudent((s) => s.grade === 1);
  const c2 = takeStudent((s) => s.grade === 3);
  const c3 = takeStudent((s) => s.grade === 5);
  for (const c of [c1, c2, c3].filter(Boolean)) {
    threeParent.childIds.push(c.id);
    c.parentId = threeParent.userId;
  }
  EDGE.siblingOfThree = c1 || c2 || c3;
  if (EDGE.siblingOfThree) {
    EDGE.siblingOfThree.note = `parent ${threeParent.email} has 3 children`;
  }

  // Parent with children in 2 different grades
  const twoGradeParent = parents[1];
  const tg1 = takeStudent((s) => s.grade === 2);
  const tg2 = takeStudent((s) => s.grade === 6);
  for (const c of [tg1, tg2].filter(Boolean)) {
    twoGradeParent.childIds.push(c.id);
    c.parentId = twoGradeParent.userId;
  }

  // Some two-sibling families (~15)
  for (let i = 0; i < 15; i += 1) {
    const p = parents[2 + i];
    const a = unused.shift();
    const b = unused.find((s) => s && s.grade !== (a && a.grade));
    if (!a) break;
    p.childIds.push(a.id);
    a.parentId = p.userId;
    if (b) {
      const bi = unused.indexOf(b);
      if (bi >= 0) unused.splice(bi, 1);
      p.childIds.push(b.id);
      b.parentId = p.userId;
    }
  }

  // Remaining 1:1
  let pIdx = 20;
  for (const s of unused) {
    const p = parents[pIdx % parents.length];
    pIdx += 1;
    p.childIds.push(s.id);
    s.parentId = p.userId;
  }

  const linkRows = [];
  for (const p of parents) {
    for (const sid of p.childIds) {
      linkRows.push([p.userId, sid]);
    }
  }
  await insertBatch(
    conn,
    'INSERT INTO parent_student_links (parent_id, student_id)',
    linkRows,
    (r) => r
  );

  // ---- Lesson plans ----
  // Materials landing uses /teacher/subjects PLUS subjects that appear in the
  // teacher's own lesson_plans. Seed 1–2 plans per assigned (subject, grade)
  // for every teacher so the subject list matches their real load.
  let lessonPlanCount = 0;
  for (const t of teachers) {
    for (const pair of t.taughtPairs || []) {
      const titles = lessonTitlesFor(pair.subjectName, pair.grade);
      const nPlans = Math.min(titles.length, 2 + Math.floor(rand() * 2)); // 2–3
      for (let n = 0; n < nPlans; n += 1) {
        const lessonTitle = pickLessonTitle(pair.subjectName, pair.grade, n + pair.grade);
        await conn.query(
          `INSERT INTO lesson_plans (title, subject_id, grade_level, objectives, file_path, uploaded_by)
           VALUES (?, ?, ?, ?, NULL, ?)`,
          [
            lessonTitle,
            pair.subjectId,
            pair.grade,
            `Learners will practice skills from “${lessonTitle}” in Grade ${pair.grade}.`,
            t.userId
          ]
        );
        lessonPlanCount += 1;
      }
    }
  }
  console.log(`[seed] lesson_plans inserted: ${lessonPlanCount}`);

  // ---- Assessments + questions + scores + submissions ----
  const assessmentMeta = []; // { id, type, subjectId, grade, section, max, quarter, createdBy }
  const questionRows = [];
  const scoreRows = [];
  const submissionRows = [];

  const mathId = subjectByName.get('Math').id;
  const filId = subjectByName.get('Filipino').id;

  const activityRubric = JSON.stringify({
    categories: [
      {
        name: 'Participation',
        max_points: 5,
        levels: [
          { label: 'Excellent', points: 5, description: 'Fully engaged' },
          { label: 'Good', points: 4, description: 'Mostly engaged' },
          { label: 'Fair', points: 3, description: 'Needs reminders' },
          { label: 'Needs Improvement', points: 2, description: 'Off task' }
        ]
      },
      {
        name: 'Understanding',
        max_points: 5,
        levels: [
          { label: 'Excellent', points: 5, description: 'Clear mastery' },
          { label: 'Good', points: 4, description: 'Solid grasp' },
          { label: 'Fair', points: 3, description: 'Partial' },
          { label: 'Needs Improvement', points: 2, description: 'Limited' }
        ]
      }
    ]
  });

  for (const { grade, section } of SECTIONS) {
    const subs = subjectsForGrade(grade, subjectByName);
    const sectionStudents = activeStudents.filter(
      (s) => s.grade === grade && s.section === section
    );
    // Q3 has no demo data yet (SY still in Q2 as of SEED_TODAY).
    for (const quarter of ['Q1', 'Q2']) {
      for (const sub of subs) {
        const teacher = teacherForAssessment(grade, section, sub.id);
        const lessonA = pickLessonTitle(sub.NAME, grade, 0);
        const lessonB = pickLessonTitle(sub.NAME, grade, 1);
        const lessonC = pickLessonTitle(sub.NAME, grade, 2);
        const lessonD = pickLessonTitle(sub.NAME, grade, 3);
        const specs = [
          { type: 'quiz', title: `${lessonA} — Quiz`, lesson: lessonA, max: 20, salt: 1 },
          { type: 'quiz', title: `${lessonB} — Quiz`, lesson: lessonB, max: 20, salt: 2 },
          { type: 'activity', title: `${lessonC} — Activity`, lesson: lessonC, max: 10, salt: 3 },
          { type: 'exam', title: `${lessonD} — Quarterly Exam`, lesson: lessonD, max: 50, salt: 4 }
        ];
        for (const spec of specs) {
          if (!teacher?.userId) {
            throw new Error(
              `No teacher for G${grade}-${section} / ${sub.NAME} (${spec.type} ${quarter})`
            );
          }
          const shareToken = crypto
            .createHash('sha256')
            .update(
              `demo|${SCHOOL_YEAR}|${grade}|${section}|${sub.id}|${quarter}|${spec.type}|${spec.title}`
            )
            .digest('hex')
            .slice(0, 32);
          // G4–6 adviser Records require shared_with_adviser=1
          const sharedWithAdviser = grade >= 4 ? 1 : 0;
          const createdAt = assessmentCreatedAt(
            quarter,
            grade * 100 + section.length * 10 + sub.id + spec.salt + (quarter === 'Q2' ? 50 : 0)
          );
          const [ains] = await conn.query(
            `INSERT INTO assessments
             (title, \`TYPE\`, subject_id, grade_level, section, max_score, quarter,
              share_token, share_enabled, created_by, lesson_title, rubric, shared_with_adviser, created_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?, ?, ?, ?)`,
            [
              spec.title,
              spec.type,
              sub.id,
              grade,
              section,
              spec.max,
              quarter,
              shareToken,
              teacher.userId,
              spec.lesson,
              spec.type === 'activity' ? activityRubric : null,
              sharedWithAdviser,
              createdAt
            ]
          );
          const assessmentId = ains.insertId;
          assessmentMeta.push({
            id: assessmentId,
            type: spec.type,
            subjectId: sub.id,
            subjectName: sub.NAME,
            grade,
            section,
            max: spec.max,
            quarter,
            createdBy: teacher.userId,
            teacherName: `${teacher.first} ${teacher.last}`,
            shareToken
          });

          if (spec.type === 'quiz' || spec.type === 'exam') {
            const qCount = spec.type === 'exam' ? 10 : 5;
            const points = spec.max / qCount;
            for (let qi = 0; qi < qCount; qi += 1) {
              questionRows.push([
                assessmentId,
                null,
                qi,
                'mcq',
                `${sub.NAME} item ${qi + 1} for ${spec.title}`,
                JSON.stringify(['A', 'B', 'C', 'D']),
                'A',
                points,
                null
              ]);
            }
          } else {
            questionRows.push([
              assessmentId,
              null,
              0,
              'activity',
              `Complete the ${sub.NAME} classroom activity.`,
              null,
              null,
              spec.max,
              activityRubric
            ]);
          }

          for (const st of sectionStudents) {
            let pct = st.ability + (rand() - 0.5) * 0.12;
            if (EDGE.failMathG5 && st.id === EDGE.failMathG5.id && sub.id === mathId) {
              pct = 0.55 + rand() * 0.15; // <75%
            }
            if (EDGE.failFilipinoG2 && st.id === EDGE.failFilipinoG2.id && sub.id === filId) {
              pct = 0.55 + rand() * 0.15;
            }
            if (EDGE.topStudent && st.id === EDGE.topStudent.id) {
              pct = 0.94 + rand() * 0.05;
            }
            pct = Math.max(0.4, Math.min(1, pct));
            const score = wholeScore(spec.max, pct);
            let rubricScores = null;
            if (spec.type === 'activity') {
              // Two rubric categories (max 5 each) that sum to the whole-number score
              const part = Math.min(5, Math.round(score / 2));
              const und = Math.max(0, score - part);
              rubricScores = JSON.stringify({
                Participation: part,
                Understanding: und
              });
            }
            scoreRows.push([assessmentId, st.id, score, rubricScores]);
          }
        }
      }
    }
  }

  await insertBatch(
    conn,
    `INSERT INTO assessment_questions
     (assessment_id, question_bank_id, sort_order, item_type, question, choices, answer, points, rubric)`,
    questionRows,
    (r) => r
  );
  await insertBatch(
    conn,
    'INSERT INTO assessment_scores (assessment_id, student_id, score, rubric_scores)',
    scoreRows,
    (r) => r
  );

  // Quiz/exam submissions for every active student (unique assessment+student)
  const scoreLookup = new Map(scoreRows.map((r) => [`${r[0]}|${r[1]}`, r[2]]));
  for (const a of assessmentMeta.filter((x) => x.type === 'quiz' || x.type === 'exam')) {
    const sectionStudents = activeStudents.filter(
      (s) => s.grade === a.grade && s.section === a.section
    );
    const qCount = a.type === 'exam' ? 10 : 5;
    const pointsEach = a.max / qCount;
    for (const st of sectionStudents) {
      const score = scoreLookup.get(`${a.id}|${st.id}`) ?? Math.round(a.max * st.ability);
      const detail = [];
      const answersMap = {};
      for (let qi = 0; qi < qCount; qi += 1) {
        const qid = qi + 1;
        answersMap[String(qid)] = 'A';
        detail.push({
          question_id: qid,
          given: 'A',
          correct: true,
          points: pointsEach
        });
      }
      const answers = JSON.stringify({
        student_id: st.id,
        answers: answersMap,
        detail,
        scored_at: new Date().toISOString()
      });
      submissionRows.push([a.id, st.id, a.shareToken, answers, score, a.max]);
    }
  }
  await insertBatch(
    conn,
    `INSERT INTO quiz_submissions
     (assessment_id, student_id, share_token, answers, score, max_score)`,
    submissionRows,
    (r) => r
  );

  // ---- Attendance ----
  // Parent summary totalSchoolDays = COUNT(DISTINCT DATE) for the student.
  // G1–3: AM+PM (subject_id NULL). G4–6: ≥1 subject row every school day.
  const weekdaySets = [
    [1, 3, 5], // Mon Wed Fri
    [2, 4], // Tue Thu
    [1, 4], // Mon Thu
    [2, 5], // Tue Fri
    [1, 2, 4], // Mon Tue Thu
    [3, 5], // Wed Fri
    [1, 5],
    [2, 3],
    [1, 3],
    [2, 4, 5],
    [1, 2, 5],
    [3, 4]
  ];
  const subjectWeekdays = new Map();
  upperSubjects.forEach((sub, i) => {
    subjectWeekdays.set(sub.id, weekdaySets[i % weekdaySets.length]);
  });

  const attendanceRows = [];
  const attendanceKeys = new Set();
  function pushAttendance(studentId, date, session, subjectId, status, recordedBy) {
    const key = `${studentId}|${date}|${session}|${subjectId == null ? 0 : subjectId}`;
    if (attendanceKeys.has(key)) return;
    attendanceKeys.add(key);
    attendanceRows.push([studentId, date, session, subjectId, status, recordedBy]);
  }

  function statusFor(student, date) {
    if (EDGE.chronicAbsentee && student.id === EDGE.chronicAbsentee.id) {
      const r = rand();
      if (r < 0.25) return 'Absent';
      if (r < 0.28) return 'Late';
      if (r < 0.30) return 'Excused';
      return 'Present';
    }
    if (EDGE.lateHeavy && student.id === EDGE.lateHeavy.id) {
      const r = rand();
      if (r < 0.22) return 'Late';
      if (r < 0.24) return 'Absent';
      if (r < 0.26) return 'Excused';
      return 'Present';
    }
    const r = rand();
    if (r < 0.93) return 'Present';
    if (r < 0.96) return 'Late';
    if (r < 0.98) return 'Absent';
    return 'Excused';
  }

  console.log(`[seed] Attendance school days: ${days.length} (${days[0] || '—'} … ${days[days.length - 1] || '—'})`);

  for (const { grade, section } of SECTIONS) {
    const sectionStudents = activeStudents.filter(
      (s) => s.grade === grade && s.section === section
    );
    const adv = adviserOf.get(`${grade}|${section}`);
    const asst = assistantOf.get(`${grade}|${section}`);
    if (grade <= 3) {
      for (const day of days) {
        const recorder = rand() < 0.7 ? adv : asst;
        for (const st of sectionStudents) {
          pushAttendance(st.id, day, 'AM', null, statusFor(st, day), recorder.userId);
          pushAttendance(st.id, day, 'PM', null, statusFor(st, day), recorder.userId);
        }
      }
    } else {
      const subs = subjectsForGrade(grade, subjectByName);
      for (const day of days) {
        const dow = parseYmd(day).getUTCDay();
        let subjectsToday = subs.filter((sub) => {
          const meets = subjectWeekdays.get(sub.id) || [1, 3, 5];
          return meets.includes(dow);
        });
        // Guarantee ≥1 subject row every school day (parent DISTINCT DATE / Week view)
        if (!subjectsToday.length) subjectsToday = [subs[0]];
        for (const sub of subjectsToday) {
          const teacher = slotOwner.get(`${grade}|${section}|${sub.id}`);
          if (!teacher) continue;
          for (const st of sectionStudents) {
            pushAttendance(st.id, day, 'AM', sub.id, statusFor(st, day), teacher.userId);
          }
        }
      }
    }
  }

  // Katrina Aguilar (G1 Sampaguita, LRN …020): force Absent/Late/Excused in current month
  const katrina = activeStudents.find((s) => s.lrn === `${LRN_PREFIX}00000020`);
  if (katrina) {
    const monthPrefix = SEED_TODAY.slice(0, 7); // YYYY-MM
    const novDays = days.filter((d) => d.startsWith(monthPrefix));
    const pickDays = novDays.slice(-6);
    const force = [
      { day: pickDays[0], status: 'Absent' },
      { day: pickDays[1] || pickDays[0], status: 'Late' },
      { day: pickDays[2] || pickDays[0], status: 'Excused' }
    ];
    for (const f of force) {
      if (!f.day) continue;
      for (const row of attendanceRows) {
        if (row[0] === katrina.id && row[1] === f.day && row[2] === 'AM') {
          row[4] = f.status;
        }
      }
    }
  }

  // Insert attendance in batches (subject_key is generated)
  for (let i = 0; i < attendanceRows.length; i += BATCH) {
    const chunk = attendanceRows.slice(i, i + BATCH);
    const ph = chunk.map(() => '(?,?,?,?,?,?)').join(',');
    const vals = [];
    for (const r of chunk) vals.push(...r);
    await conn.query(
      `INSERT INTO attendance (student_id, \`DATE\`, session, subject_id, \`STATUS\`, recorded_by)
       VALUES ${ph}`,
      vals
    );
  }

  // ---- Announcements / concerns / messages ----
  const annIds = [];
  const anns = [
    {
      title: 'Demo: Welcome to School Year',
      body: 'Welcome to ConnectED demo school year.',
      scope: 'school_wide',
      grade: null,
      section: null,
      audience: 'everyone'
    },
    {
      title: 'Demo: Grade 4 Reminder',
      body: 'Grade 4 parents: please check Progress.',
      scope: 'grade_wide',
      grade: 4,
      section: null,
      audience: 'parents'
    },
    {
      title: 'Demo: Jasmine Class Note',
      body: 'Jasmine section activity next week.',
      scope: 'class_specific',
      grade: 4,
      section: 'Jasmine',
      audience: 'everyone'
    }
  ];
  for (const a of anns) {
    const [ins] = await conn.query(
      `INSERT INTO announcements
       (title, content, sender_id, scope, target_grade, target_section, priority, audience, body)
       VALUES (?, '', ?, ?, ?, ?, 'normal', ?, ?)`,
      [a.title, adminId, a.scope, a.grade, a.section, a.audience, a.body]
    );
    annIds.push(ins.insertId);
  }
  // Some reads
  const readerIds = [teachers[0].userId, parents[0].userId, parents[1].userId];
  for (const aid of annIds) {
    for (const uid of readerIds) {
      await conn.query(
        `INSERT IGNORE INTO announcement_reads (user_id, announcement_id) VALUES (?, ?)`,
        [uid, aid]
      );
    }
  }

  const concernStudent = threeParent.childIds[0] || activeStudents[0].id;
  const [cIns] = await conn.query(
    `INSERT INTO concerns (parent_id, teacher_id, student_id, SUBJECT, message, STATUS, priority)
     VALUES (?, ?, ?, ?, ?, 'open', 'normal')`,
    [
      threeParent.userId,
      adviserOf.get(`${activeStudents.find((s) => s.id === concernStudent)?.grade}|${activeStudents.find((s) => s.id === concernStudent)?.section}`)?.userId
        || teachers[0].userId,
      concernStudent,
      'Demo concern',
      'Just checking on my child’s attendance this week.'
    ]
  );
  await conn.query(
    `INSERT INTO concern_replies (concern_id, sender_id, message) VALUES (?, ?, ?)`,
    [cIns.insertId, teachers[0].userId, 'Thank you — we will follow up. (demo reply)']
  );
  await conn.query(
    `INSERT INTO concerns (parent_id, teacher_id, student_id, SUBJECT, message, STATUS, priority, teacher_reply, replied_at)
     VALUES (?, ?, ?, ?, ?, 'resolved', 'normal', ?, NOW())`,
    [
      parents[1].userId,
      teachers[1].userId,
      twoGradeParent.childIds[0] || activeStudents[1].id,
      'Demo resolved concern',
      'Question about homework.',
      'Answered in class. (demo)'
    ]
  );

  await conn.query(
    `INSERT INTO messages (sender_id, receiver_id, student_id, SUBJECT, message, category, is_read)
     VALUES (?, ?, ?, ?, ?, 'general', 0)`,
    [
      teachers[0].userId,
      threeParent.userId,
      concernStudent,
      'Demo message',
      'Hello from your class adviser (demo).'
    ]
  );

  // Always align demo with current SY progress (Q2 as of SEED_TODAY).
  await conn.query(
    `INSERT INTO app_settings (setting_key, setting_value)
     VALUES ('current_quarter', 'Q2')
     ON DUPLICATE KEY UPDATE setting_value = 'Q2'`
  );
  console.log('[seed] Set app_settings.current_quarter = Q2');
  if (!SET_QUARTER) {
    console.log('[seed] (tip: pass --set-quarter; Q2 is set automatically for this SY)');
  }

  // Annotate edge cases for summary
  function label(edge) {
    if (!edge) return null;
    return {
      name: edge.name || `${edge.first} ${edge.last}`,
      grade: edge.grade,
      section: edge.section,
      lrn: edge.lrn,
      username: edge.username || null,
      note: edge.note || null
    };
  }
  EDGE.chronicAbsentee = label({ ...EDGE.chronicAbsentee, note: 'chronic absentee (~25% Absent)' });
  EDGE.lateHeavy = label({ ...EDGE.lateHeavy, note: 'late-heavy student' });
  EDGE.topStudent = label({ ...EDGE.topStudent, note: 'top student (~95%+)' });
  EDGE.failMathG5 = label({
    ...EDGE.failMathG5,
    note: 'Grade 5 failing Math (<75%), fine elsewhere'
  });
  EDGE.failFilipinoG2 = label({
    ...EDGE.failFilipinoG2,
    note: 'Grade 2 failing Filipino (<75%), fine elsewhere'
  });
  EDGE.siblingOfThree = label(EDGE.siblingOfThree);
  // inactive already labeled

  printSectionRecordsCheck({
    label: 'G1–3 check: Grade 2 — Gumamela',
    grade: 2,
    section: 'Gumamela',
    subjectByName,
    assessmentMeta,
    scoreRows,
    adviserOf,
    assistantOf,
    slotOwner: null,
    isUpper: false
  });
  printSectionRecordsCheck({
    label: 'G4–6 check: Grade 4 — Jasmine (adviser Records / subject teacher)',
    grade: 4,
    section: 'Jasmine',
    subjectByName,
    assessmentMeta,
    scoreRows,
    adviserOf,
    assistantOf,
    slotOwner,
    isUpper: true
  });

  printAttendancePortalChecks({
    days,
    attendanceRows,
    activeStudents,
    teachers,
    adviserOf,
    assistantOf,
    slotOwner,
    subjectByName
  });

  return {
    adminEmail: `admin${DEMO_EMAIL_SUFFIX}`,
    teachers,
    parents,
    threeParent,
    students: activeStudents,
    assessmentCount: assessmentMeta.length,
    scoreCount: scoreRows.length,
    attendanceCount: attendanceRows.length,
    submissionCount: submissionRows.length
  };
}

function weekStartMondayISO(ymd) {
  const dt = parseYmd(ymd);
  const dow = dt.getUTCDay();
  const offset = dow === 0 ? -6 : 1 - dow;
  return formatYmd(new Date(dt.getTime() + offset * 86400000));
}

function summarizeStudentAttendance(studentId, attendanceRows, from, to) {
  const rows = attendanceRows.filter(
    (r) => r[0] === studentId && r[1] >= from && r[1] <= to
  );
  const days = new Set(rows.map((r) => r[1]));
  const counts = { Present: 0, Absent: 0, Late: 0, Excused: 0 };
  for (const r of rows) {
    if (counts[r[4]] != null) counts[r[4]] += 1;
  }
  return {
    totalSchoolDays: days.size,
    present: counts.Present,
    absent: counts.Absent,
    late: counts.Late,
    excused: counts.Excused,
    totalMarks: rows.length
  };
}

function printAttendancePortalChecks({
  days,
  attendanceRows,
  activeStudents,
  teachers,
  adviserOf,
  assistantOf,
  slotOwner,
  subjectByName
}) {
  console.log('\n=== Attendance portal checks ===');
  console.log(`  Seeded school days: ${days.length} (${days[0]} → ${days[days.length - 1]})`);

  // Flag weekdays (non-holiday) with zero attendance rows
  const daysWithRows = new Set(attendanceRows.map((r) => r[1]));
  const emptyDays = days.filter((d) => !daysWithRows.has(d));
  if (emptyDays.length) {
    console.log(`  FLAGGED school days with zero attendance rows: ${emptyDays.join(', ')}`);
  } else {
    console.log('  OK: every seeded school day has attendance rows');
  }

  const katrina = activeStudents.find((s) => s.lrn === `${LRN_PREFIX}00000020`);
  const g4sample =
    activeStudents.find((s) => s.grade === 4 && s.section === 'Jasmine')
    || activeStudents.find((s) => s.grade >= 4);

  function printStudentRanges(label, student) {
    if (!student) {
      console.log(`  ${label}: (not found)`);
      return;
    }
    const weekStart = weekStartMondayISO(SEED_TODAY);
    const monthStart = `${SEED_TODAY.slice(0, 7)}-01`;
    const ranges = [
      ['today', SEED_TODAY, SEED_TODAY],
      ['week', weekStart, SEED_TODAY],
      ['month', monthStart, SEED_TODAY],
      ['school year', ATTENDANCE_START, SEED_TODAY]
    ];
    console.log(
      `  ${label}: ${student.first} ${student.last} (G${student.grade}-${student.section}, LRN ${student.lrn})`
    );
    for (const [name, from, to] of ranges) {
      const s = summarizeStudentAttendance(student.id, attendanceRows, from, to);
      console.log(
        `    ${name} (${from}→${to}): days=${s.totalSchoolDays} P=${s.present} A=${s.absent} L=${s.late} E=${s.excused} marks=${s.totalMarks}`
      );
    }
  }

  printStudentRanges('Katrina Aguilar', katrina);
  printStudentRanges('G4–6 sample', g4sample);

  // Teacher roster / today attendance (matches /roster filters)
  console.log('\n=== Teacher attendance sheet roster check ===');
  let zeroRoster = 0;
  for (const t of teachers) {
    const classes = [];
    // Homeroom
    classes.push({
      grade: t.grade,
      section: t.section,
      subjectId: null,
      label: `G${t.grade}-${t.section} (homeroom ${t.role})`
    });
    for (const row of t.subjectRows || []) {
      classes.push({
        grade: row.grade,
        section: row.section,
        subjectId: row.subject.id,
        label: `G${row.grade}-${row.section} / ${row.subject.NAME}`
      });
    }
    // Dedupe
    const seen = new Set();
    for (const c of classes) {
      const key = `${c.grade}|${c.section}|${c.subjectId || 0}`;
      if (seen.has(key)) continue;
      seen.add(key);
      const roster = activeStudents.filter(
        (s) => s.grade === c.grade && s.section === c.section
      ).length;
      const todayRows = attendanceRows.filter((r) => {
        if (r[1] !== SEED_TODAY) return false;
        const st = activeStudents.find((s) => s.id === r[0]);
        if (!st || st.grade !== c.grade || st.section !== c.section) return false;
        if (c.subjectId == null) return r[3] == null;
        return Number(r[3]) === Number(c.subjectId);
      }).length;
      if (roster === 0) {
        zeroRoster += 1;
        console.log(`  FLAGGED ${t.email}: ${c.label} roster=0 todayRows=${todayRows}`);
      } else {
        console.log(`  ${t.email}: ${c.label} roster=${roster} todayRows=${todayRows}`);
      }
    }
  }
  if (!zeroRoster) console.log('  OK: every demo teacher class has a non-zero roster');

  if (katrina) {
    const weekStart = weekStartMondayISO(SEED_TODAY);
    const weekRows = attendanceRows.filter(
      (r) => r[0] === katrina.id && r[1] >= weekStart && r[1] <= SEED_TODAY
    );
    console.log(
      `\n  Katrina Aguilar attendance rows this week (${weekStart}→${SEED_TODAY}): ${weekRows.length}`
    );
  }
}

/** Post-seed audit for Records completeness. */
function printSectionRecordsCheck({
  label,
  grade,
  section,
  subjectByName,
  assessmentMeta,
  scoreRows,
  adviserOf,
  assistantOf,
  slotOwner,
  isUpper
}) {
  console.log(`\n=== ${label} ===`);
  const subs = subjectsForGrade(grade, subjectByName);
  const scoreCountByAssessment = new Map();
  for (const row of scoreRows) {
    const id = row[0];
    scoreCountByAssessment.set(id, (scoreCountByAssessment.get(id) || 0) + 1);
  }
  let flagged = 0;
  for (const sub of subs) {
    let teacher;
    if (isUpper) {
      teacher = slotOwner.get(`${grade}|${section}|${sub.id}`);
    } else {
      teacher = sub.id % 2 === 0
        ? adviserOf.get(`${grade}|${section}`)
        : assistantOf.get(`${grade}|${section}`);
    }
    const teacherLabel = teacher
      ? `${teacher.first} ${teacher.last} (${teacher.role || 'subject'})`
      : 'MISSING TEACHER';
    console.log(`  ${sub.NAME} — ${teacherLabel}`);
    for (const quarter of ['Q1', 'Q2']) {
      const bits = [];
      for (const type of ['quiz', 'activity', 'exam']) {
        const rows = assessmentMeta.filter(
          (a) =>
            a.grade === grade
            && a.section === section
            && a.subjectId === sub.id
            && a.quarter === quarter
            && a.type === type
            && (!isUpper || a.createdBy === teacher?.userId)
        );
        const scores = rows.reduce(
          (n, a) => n + (scoreCountByAssessment.get(a.id) || 0),
          0
        );
        const expectCount = type === 'quiz' ? 2 : 1;
        const ok = rows.length === expectCount && scores > 0;
        if (!ok) flagged += 1;
        bits.push(
          `${type}:${rows.length}a/${scores}s${ok ? '' : ' ⚠'}`
        );
      }
      console.log(`    ${quarter}: ${bits.join(' | ')}`);
    }
  }
  if (flagged) {
    console.log(`  FLAGGED cells with missing/zero results: ${flagged}`);
  } else {
    console.log('  OK: every subject has 2 quizzes + 1 activity + 1 exam for Q1–Q2 with scores');
  }
}

function printSummary(result) {
  console.log('\n=== DEMO LOGINS (password: Demo@1234) ===');
  console.log(`  admin:     ${result.adminEmail}`);
  const g12 = result.teachers.find((t) => t.grade <= 2 && t.role === 'adviser');
  const g3 = result.teachers.find((t) => t.grade === 3 && t.role === 'adviser');
  const g46 = result.teachers.find((t) => t.grade >= 4 && t.role === 'adviser');
  if (g12) console.log(`  teacher G1-2: ${g12.email}  (${g12.first} ${g12.last}, G${g12.grade}-${g12.section} adviser)`);
  if (g3) console.log(`  teacher G3:   ${g3.email}  (${g3.first} ${g3.last}, G${g3.grade}-${g3.section} adviser)`);
  if (g46) console.log(`  teacher G4-6: ${g46.email}  (${g46.first} ${g46.last}, G${g46.grade}-${g46.section} adviser+subjects)`);
  console.log(`  parent (3 children): ${result.threeParent.email}`);
  const sampleStudent = result.students[0];
  if (sampleStudent) {
    console.log(
      `  student:  ${sampleStudent.username}  (${sampleStudent.first} ${sampleStudent.last}, G${sampleStudent.grade}-${sampleStudent.section})`
    );
  }

  console.log('\n=== EDGE CASES ===');
  for (const [key, val] of Object.entries(EDGE)) {
    if (!val) {
      console.log(`  ${key}: (not set)`);
      continue;
    }
    console.log(
      `  ${key}: ${val.name} | G${val.grade}-${val.section} | LRN ${val.lrn || '—'} | ${val.note || ''}`
    );
  }

  console.log('\n=== VOLUME ===');
  console.log(`  assessments: ${result.assessmentCount}`);
  console.log(`  scores:      ${result.scoreCount}`);
  console.log(`  attendance:  ${result.attendanceCount}`);
  console.log(`  submissions: ${result.submissionCount}`);
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function shutdown(code) {
  try {
    await db.end();
  } catch (_) {
    /* ignore */
  }
  process.exit(code);
}

async function main() {
  assertSafeToRun();
  await ensureRuntimeSchema();

  const conn = await db.getConnection();
  let ok = false;
  try {
    const before = await tableCounts(conn);
    printCounts('BEFORE', before);

    if (WANT_RESET) {
      await conn.beginTransaction();
      try {
        await resetDemo(conn);
        await conn.commit();
      } catch (e) {
        await conn.rollback();
        throw e;
      }
      const after = await tableCounts(conn);
      printCounts('AFTER RESET', after);
      ok = true;
      return;
    }

    // Safe rerun: wipe previous demo rows, then seed fresh.
    if (await alreadySeeded(conn)) {
      console.log('[seed] Demo data present — resetting before reseed…');
      await conn.beginTransaction();
      try {
        await resetDemo(conn);
        await conn.commit();
      } catch (e) {
        await conn.rollback();
        throw e;
      }
    }

    await checkSectionConflicts(conn);

    const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

    await conn.beginTransaction();
    let result;
    try {
      result = await seedCore(conn, passwordHash);
      await conn.commit();
    } catch (e) {
      await conn.rollback();
      throw e;
    }

    const after = await tableCounts(conn);
    printCounts('AFTER', after);
    printSummary(result);
    ok = true;
  } finally {
    try {
      conn.release();
    } catch (_) {
      /* ignore */
    }
  }
  await shutdown(ok ? 0 : 1);
}

main().catch(async (err) => {
  console.error('\n[seed] FAILED:', err.message);
  if (err.stack) console.error(err.stack);
  await shutdown(1);
});
