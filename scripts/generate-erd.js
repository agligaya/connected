// Generates docs/erd.svg (crow's foot ERD) from the table definitions below.
// Render to PNG with a headless browser (see docs/README note in chat) or open the SVG directly.
const fs = require('fs');
const path = require('path');

// ---------------------------------------------------------------- tables
// Column flags: PK primary key, FK declared foreign key, LK logical foreign key (no DB constraint), UK unique
const T = {
  users: ['people', [
    ['id', 'int', 'PK'], ['first_name', 'varchar(100)'], ['last_name', 'varchar(100)'], ['email', 'varchar(255)', 'UK'],
    ['password_hash', 'varchar(255)'], ['phone', 'varchar(20)'], ['role', "enum(admin,teacher,parent,student)"],
    ['STATUS', 'enum(active,inactive)'], ['must_change_password', 'tinyint(1)'], ['temp_password_expires_at', 'datetime'],
    ['token_version', 'int'], ['avatar_url', 'varchar(500)'], ['student_id', 'int', 'LK,UK'], ['created_at', 'timestamp']]],
  students: ['people', [
    ['id', 'int', 'PK'], ['lrn', 'varchar(12)', 'UK'], ['first_name', 'varchar(100)'], ['middle_name', 'varchar(100)'],
    ['last_name', 'varchar(100)'], ['grade_level', 'int'], ['section', 'varchar(10)'], ['dob', 'date'],
    ['gender', 'enum(M,F)'], ['STATUS', 'enum(active,inactive)'], ['created_at', 'timestamp'], ['deleted_at', 'timestamp']]],
  teacher_profiles: ['people', [
    ['id', 'int', 'PK'], ['user_id', 'int', 'FK,UK'], ['teaching_mode', 'enum'], ['homeroom_grade', 'int'],
    ['homeroom_section', 'varchar(10)'], ['homeroom_role', 'enum(adviser,assistant)'], ['specialization', 'varchar(100)'],
    ['subjects_taught', 'longtext'], ['grades_handled', 'longtext']]],
  parent_profiles: ['people', [
    ['id', 'int', 'PK'], ['user_id', 'int', 'FK,UK'], ['address', 'text'], ['emergency_contact', 'varchar(20)']]],
  parent_student_links: ['people', [
    ['id', 'int', 'PK'], ['parent_id', 'int', 'FK,UK'], ['student_id', 'int', 'FK,UK'], ['created_at', 'timestamp']]],

  subjects: ['school', [
    ['id', 'int', 'PK'], ['CODE', 'varchar(20)', 'UK'], ['NAME', 'varchar(100)', 'UK'], ['description', 'text'],
    ['applicable_grades', 'varchar(20)'], ['deleted_at', 'timestamp']]],
  teacher_assignments: ['school', [
    ['id', 'int', 'PK'], ['teacher_id', 'int', 'FK'], ['subject_id', 'int', 'FK'], ['grade_level', 'int'],
    ['section', 'varchar(10)'], ['school_year', 'varchar(20)'], ['slot', 'enum(adviser,assistant,subject)']]],
  attendance: ['school', [
    ['id', 'int', 'PK'], ['student_id', 'int', 'FK,UK'], ['DATE', 'date', 'UK'], ['session', 'enum(AM,PM)', 'UK'],
    ['subject_id', 'int', 'LK'], ['subject_key', 'int (generated)', 'UK'],
    ['STATUS', 'enum(Present,Absent,Late,Excused)'], ['recorded_by', 'int', 'FK'], ['created_at', 'timestamp']]],
  app_settings: ['school', [
    ['setting_key', 'varchar(64)', 'PK'], ['setting_value', 'varchar(255)'], ['updated_at', 'timestamp']]],

  lesson_plans: ['classwork', [
    ['id', 'int', 'PK'], ['title', 'varchar(255)'], ['subject_id', 'int', 'FK'], ['grade_level', 'int'],
    ['objectives', 'text'], ['file_path', 'varchar(500)'], ['uploaded_by', 'int', 'FK'], ['created_at', 'timestamp']]],
  ai_recommendations: ['classwork', [
    ['id', 'int', 'PK'], ['lesson_plan_id', 'int', 'LK'], ['teacher_id', 'int', 'LK'], ['subject_id', 'int', 'LK'],
    ['grade_level', 'int'], ['status', 'enum(pending,approved,rejected)'], ['provider', 'varchar(32)'],
    ['source_excerpt', 'text'], ['content', 'json'], ['assessment_id', 'int', 'LK'], ['approved_type', 'varchar(20)'],
    ['created_at', 'timestamp'], ['updated_at', 'timestamp']]],
  quiz_sets: ['classwork', [
    ['id', 'int', 'PK'], ['teacher_id', 'int', 'LK'], ['title', 'varchar(255)'], ['subject_id', 'int', 'LK'],
    ['grade_level', 'int'], ['lesson_plan_id', 'int', 'LK'], ['lesson_title', 'varchar(255)'],
    ['ai_recommendation_id', 'int', 'LK'], ['source', 'enum(ai,manual)'], ['status', 'enum(active,archived)'],
    ['kind', 'varchar(20)'], ['created_at', 'timestamp'], ['updated_at', 'timestamp']]],
  question_bank: ['classwork', [
    ['id', 'int', 'PK'], ['teacher_id', 'int', 'LK'], ['quiz_set_id', 'int', 'LK'], ['subject_id', 'int', 'LK'],
    ['grade_level', 'int'], ['lesson_plan_id', 'int', 'LK'], ['lesson_title', 'varchar(255)'],
    ['item_type', 'varchar(32)'], ['question', 'text'], ['choices', 'json'], ['answer', 'varchar(500)'],
    ['points', 'decimal(8,2)'], ['rubric', 'json'], ['folder', 'varchar(20)'], ['source', 'enum(ai,manual)'],
    ['ai_recommendation_id', 'int', 'LK'], ['status', 'enum(active,archived)'], ['created_at', 'timestamp'],
    ['updated_at', 'timestamp']]],
  assessments: ['classwork', [
    ['id', 'int', 'PK'], ['title', 'varchar(255)'], ['TYPE', 'enum(quiz,activity,exam)'], ['subject_id', 'int', 'FK'],
    ['grade_level', 'int'], ['section', 'varchar(10)'], ['max_score', 'int'], ['quarter', 'varchar(10)'],
    ['lesson_plan_id', 'int', 'LK'], ['lesson_title', 'varchar(255)'], ['created_by', 'int', 'FK'],
    ['share_token', 'varchar(32)', 'UK'], ['share_enabled', 'tinyint(1)'], ['quiz_link', 'varchar(500)'],
    ['quiz_attendance_date', 'date'], ['quiz_attendance_session', 'varchar(2)'], ['quiz_subject_id', 'int', 'LK'],
    ['quiz_closes_at', 'datetime'], ['quiz_makeup_student_ids', 'json'], ['quiz_makeup_closes_at', 'datetime'],
    ['activity_mode', 'varchar(20)'], ['activity_target_at', 'datetime'], ['rubric', 'json'], ['created_at', 'timestamp']]],
  assessment_questions: ['classwork', [
    ['id', 'int', 'PK'], ['assessment_id', 'int', 'LK'], ['question_bank_id', 'int', 'LK'], ['sort_order', 'int'],
    ['item_type', 'varchar(32)'], ['question', 'text'], ['choices', 'json'], ['answer', 'varchar(500)'],
    ['points', 'decimal(8,2)'], ['rubric', 'json'], ['created_at', 'timestamp']]],
  assessment_scores: ['classwork', [
    ['id', 'int', 'PK'], ['assessment_id', 'int', 'FK'], ['student_id', 'int', 'FK'], ['score', 'decimal(8,2)'],
    ['rubric_scores', 'json'], ['recorded_at', 'timestamp']]],
  quiz_submissions: ['classwork', [
    ['id', 'int', 'PK'], ['assessment_id', 'int', 'LK,UK'], ['student_id', 'int', 'LK,UK'], ['share_token', 'varchar(32)'],
    ['answers', 'json'], ['score', 'decimal(8,2)'], ['max_score', 'decimal(8,2)'], ['submitted_at', 'timestamp']]],

  announcements: ['comms', [
    ['id', 'int', 'PK'], ['title', 'varchar(255)'], ['content', 'text'], ['body', 'text'], ['sender_id', 'int', 'FK'],
    ['admin_id', 'int'], ['scope', 'enum(school_wide,grade_wide,class_specific)'], ['target_grade', 'int'],
    ['target_section', 'varchar(10)'], ['priority', 'enum(low,normal,high,urgent)'],
    ['audience', 'enum(teachers,parents,everyone)'], ['created_at', 'timestamp'], ['updated_at', 'timestamp']]],
  announcement_reads: ['comms', [
    ['user_id', 'int', 'PK,FK'], ['announcement_id', 'int', 'PK,FK'], ['read_at', 'timestamp']]],
  messages: ['comms', [
    ['id', 'int', 'PK'], ['sender_id', 'int', 'FK'], ['receiver_id', 'int', 'FK'], ['student_id', 'int', 'FK'],
    ['SUBJECT', 'varchar(255)'], ['message', 'text'], ['category', 'enum(concern,announcement,general)'],
    ['is_read', 'tinyint(1)'], ['created_at', 'timestamp']]],
  concerns: ['comms', [
    ['id', 'int', 'PK'], ['parent_id', 'int', 'FK'], ['teacher_id', 'int', 'FK'], ['student_id', 'int', 'FK'],
    ['SUBJECT', 'varchar(255)'], ['message', 'text'], ['STATUS', 'enum(open,resolved,closed)'],
    ['priority', 'enum(low,normal,high,urgent)'], ['teacher_reply', 'text'], ['replied_at', 'timestamp'],
    ['created_at', 'timestamp'], ['updated_at', 'timestamp']]],
  concern_replies: ['comms', [
    ['id', 'int', 'PK'], ['concern_id', 'int', 'LK'], ['sender_id', 'int', 'LK'], ['message', 'text'], ['created_at', 'timestamp']]],
  concern_reads: ['comms', [
    ['user_id', 'int', 'PK,LK'], ['concern_id', 'int', 'PK,LK'], ['read_at', 'timestamp']]],
  inbox_trash: ['comms', [
    ['user_id', 'int', 'PK,LK'], ['item_type', 'enum(announcement,concern,message)', 'PK'], ['item_id', 'int', 'PK'],
    ['emptied', 'tinyint(1)'], ['trashed_at', 'timestamp']]],

  sms_queue: ['system', [
    ['id', 'int', 'PK'], ['parent_id', 'int', 'LK'], ['student_id', 'int', 'LK'], ['phone', 'varchar(20)'],
    ['body', 'varchar(500)'], ['status', 'enum(pending,sent,failed)'], ['attempts', 'int'], ['last_error', 'varchar(500)'],
    ['created_at', 'timestamp'], ['sent_at', 'timestamp']]],
  activity_due_notices: ['system', [
    ['id', 'int', 'PK'], ['assessment_id', 'int', 'LK,UK'], ['student_id', 'int', 'LK,UK'], ['parent_id', 'int', 'LK,UK'],
    ['closes_at', 'datetime', 'UK'], ['created_at', 'timestamp']]],
  activity_log: ['system', [
    ['id', 'int', 'PK'], ['user_id', 'int', 'LK'], ['user_name', 'varchar(255)'], ['user_role', 'varchar(20)'],
    ['ACTION', 'varchar(100)'], ['target_type', 'varchar(50)'], ['target_name', 'varchar(255)'], ['details', 'text'],
    ['created_at', 'timestamp']]],
};

// ---------------------------------------------------------------- relationships
// [parent, child, verb, parentEnd, childEnd, logical]
// parentEnd: 'one' (exactly one) | 'zeroone' ; childEnd: 'many0' | 'many1' | 'zeroone' | 'one'
const R = [
  ['users', 'teacher_profiles', 'has', 'one', 'zeroone'],
  ['users', 'parent_profiles', 'has', 'one', 'zeroone'],
  ['users', 'parent_student_links', 'parent of', 'one', 'many0'],
  ['students', 'parent_student_links', 'child of', 'one', 'many0'],
  ['students', 'users', 'logs in as', 'zeroone', 'zeroone', true], // users.student_id is nullable and unique
  ['users', 'teacher_assignments', 'assigned', 'one', 'many0'],
  ['subjects', 'teacher_assignments', 'taught in', 'zeroone', 'many0'],
  ['students', 'attendance', 'has', 'one', 'many0'],
  ['users', 'attendance', 'records', 'one', 'many0'],
  ['subjects', 'attendance', 'for', 'zeroone', 'many0', true],
  ['subjects', 'lesson_plans', 'covers', 'zeroone', 'many0'],
  ['users', 'lesson_plans', 'uploads', 'one', 'many0'],
  ['lesson_plans', 'ai_recommendations', 'generates', 'one', 'many0', true],
  ['users', 'ai_recommendations', 'requests', 'one', 'many0', true],
  ['subjects', 'ai_recommendations', 'for', 'zeroone', 'many0', true],
  ['assessments', 'ai_recommendations', 'approved as', 'zeroone', 'many0', true],
  ['users', 'quiz_sets', 'owns', 'one', 'many0', true],
  ['subjects', 'quiz_sets', 'for', 'zeroone', 'many0', true],
  ['lesson_plans', 'quiz_sets', 'source of', 'zeroone', 'many0', true],
  ['ai_recommendations', 'quiz_sets', 'drafts', 'zeroone', 'many0', true],
  ['quiz_sets', 'question_bank', 'groups', 'zeroone', 'many0', true],
  ['users', 'question_bank', 'writes', 'one', 'many0', true],
  ['subjects', 'question_bank', 'for', 'zeroone', 'many0', true],
  ['lesson_plans', 'question_bank', 'source of', 'zeroone', 'many0', true],
  ['ai_recommendations', 'question_bank', 'produces', 'zeroone', 'many0', true],
  ['users', 'assessments', 'creates', 'one', 'many0'],
  ['subjects', 'assessments', 'covers', 'zeroone', 'many0'],
  ['subjects', 'assessments', 'attendance subject', 'zeroone', 'many0', true], // assessments.quiz_subject_id
  ['lesson_plans', 'assessments', 'based on', 'zeroone', 'many0', true],
  ['assessments', 'assessment_questions', 'contains', 'one', 'many0', true],
  ['question_bank', 'assessment_questions', 'copied into', 'zeroone', 'many0', true],
  ['assessments', 'assessment_scores', 'scored in', 'one', 'many0'],
  ['students', 'assessment_scores', 'earns', 'one', 'many0'],
  ['assessments', 'quiz_submissions', 'receives', 'one', 'many0', true],
  ['students', 'quiz_submissions', 'submits', 'one', 'many0', true],
  ['users', 'announcements', 'posts', 'one', 'many0'],
  ['announcements', 'announcement_reads', 'read by', 'one', 'many0'],
  ['users', 'announcement_reads', 'reads', 'one', 'many0'],
  ['users', 'messages', 'sends', 'one', 'many0'],            // messages.sender_id
  ['users', 'messages', 'receives', 'zeroone', 'many0'],      // messages.receiver_id
  ['students', 'messages', 'about', 'zeroone', 'many0'],
  ['users', 'concerns', 'raises', 'one', 'many0'],            // concerns.parent_id
  ['users', 'concerns', 'handles', 'zeroone', 'many0'],       // concerns.teacher_id
  ['students', 'concerns', 'about', 'zeroone', 'many0'],
  ['concerns', 'concern_replies', 'has', 'one', 'many0', true],
  ['users', 'concern_replies', 'writes', 'one', 'many0', true],
  ['concerns', 'concern_reads', 'tracked by', 'one', 'many0', true],
  ['users', 'concern_reads', 'reads', 'one', 'many0', true],
  ['users', 'inbox_trash', 'trashes', 'one', 'many0', true],
  ['users', 'sms_queue', 'receives sms', 'zeroone', 'many0', true],
  ['students', 'sms_queue', 'about', 'zeroone', 'many0', true],
  ['assessments', 'activity_due_notices', 'due notice', 'one', 'many0', true],
  ['students', 'activity_due_notices', 'for', 'one', 'many0', true],
  ['users', 'activity_due_notices', 'notifies', 'one', 'many0', true],
  ['users', 'activity_log', 'performs', 'zeroone', 'many0', true],
];

// ---------------------------------------------------------------- layout (columns of tables)
const COLS = [
  ['announcements', 'announcement_reads', 'inbox_trash', 'activity_log', 'app_settings'],
  ['concerns', 'concern_replies', 'concern_reads', 'messages'],
  ['users', 'teacher_profiles', 'parent_profiles', 'teacher_assignments', 'parent_student_links'],
  ['subjects', 'lesson_plans', 'quiz_sets', 'ai_recommendations', 'question_bank'],
  ['assessments', 'assessment_questions', 'sms_queue', 'activity_due_notices'],
  ['students', 'attendance', 'assessment_scores', 'quiz_submissions'],
];

const GROUP = {
  people: { fill: '#e3edfb', head: '#2f5da8', label: 'People & accounts' },
  school: { fill: '#e0f3ef', head: '#217a6b', label: 'School setup & attendance' },
  classwork: { fill: '#fdeedb', head: '#c06a12', label: 'Classwork & assessments' },
  comms: { fill: '#efe6f8', head: '#74449e', label: 'Communication' },
  system: { fill: '#ececec', head: '#5c5c5c', label: 'System & notifications' },
};

const W = 300, HEAD = 36, ROW = 21, COLGAP = 240, ROWGAP = 56, TOP = 260, LEFT = 50;
const ROWH = { users: 30, students: 30 }; // hub tables get taller rows so their many connectors have room

// ---------------------------------------------------------------- geometry
const box = {};
COLS.forEach((names, ci) => {
  let y = TOP;
  names.forEach((n) => {
    const rh = ROWH[n] || ROW;
    const h = HEAD + rh * T[n][1].length + 8;
    box[n] = { name: n, x: LEFT + ci * (W + COLGAP), y, w: W, h, col: ci, rh };
    y += h + ROWGAP;
  });
});
const maxY = Math.max(...Object.values(box).map((b) => b.y + b.h));
const maxX = Math.max(...Object.values(box).map((b) => b.x + b.w));
const WIDTH = maxX + 260; // right margin leaves room for loop connectors on the last column
let LEGEND_Y = maxY + 120; // finalised after routing (bottom lanes need space)
let HEIGHT = LEGEND_Y + 170;

// connection endpoints -> choose sides
const conns = R.map((r, i) => ({ id: i, parent: r[0], child: r[1], verb: r[2], pEnd: r[3], cEnd: r[4], logical: !!r[5] }));
conns.forEach((c) => {
  const P = box[c.parent], C = box[c.child];
  if (P.col === C.col) { c.pSide = 'R'; c.cSide = 'R'; c.loop = true; }
  else if (C.col > P.col) { c.pSide = 'R'; c.cSide = 'L'; }
  else { c.pSide = 'L'; c.cSide = 'R'; }
});

// spread anchors per box side
const sideLists = {};
conns.forEach((c) => {
  [['p', c.parent, c.pSide, c.child], ['c', c.child, c.cSide, c.parent]].forEach(([end, name, side, other]) => {
    const key = name + '|' + side;
    (sideLists[key] = sideLists[key] || []).push({ c, end, other });
  });
});
Object.entries(sideLists).forEach(([key, list]) => {
  const [name] = key.split('|');
  const b = box[name];
  // order by the vertical position of the other end so lines tend not to cross
  list.sort((a, z) => (box[a.other].y + box[a.other].h / 2) - (box[z.other].y + box[z.other].h / 2) || a.c.id - z.c.id);
  const top = b.y + HEAD + 10, bottom = b.y + b.h - 10;
  list.forEach((e, i) => {
    const y = list.length === 1 ? (top + bottom) / 2 : top + (bottom - top) * (i + 0.5) / list.length;
    e.c[e.end + 'Y'] = y;
  });
});

// vertical channel allocation per column gap
const gapUse = {};
let topLanes = 0, botLanes = 0;
function channelX(gapIdx) {
  gapIdx = Math.max(0, gapIdx);
  const left = LEFT + gapIdx * (W + COLGAP) + W; // right edge of column gapIdx
  gapUse[gapIdx] = (gapUse[gapIdx] || 0) + 1;
  const n = gapUse[gapIdx];
  const slots = 30;
  const step = (COLGAP - 70) / slots;
  return left + 35 + ((n * 11) % slots) * step;
}

function edgeX(name, side) {
  const b = box[name];
  return side === 'R' ? b.x + b.w : b.x;
}

// ---------------------------------------------------------------- drawing helpers
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
let svgLines = [];
let svgBoxes = [];
let svgLabels = [];

function symbol(px, py, ux, uy, kind, color) {
  // (px,py) point on box edge, (ux,uy) unit vector pointing away from the box
  const vx = -uy, vy = ux;
  const P = (d, s) => [px + ux * d + vx * s, py + uy * d + vy * s];
  const line = (a, b) => `<line x1="${a[0].toFixed(1)}" y1="${a[1].toFixed(1)}" x2="${b[0].toFixed(1)}" y2="${b[1].toFixed(1)}" stroke="${color}" stroke-width="2"/>`;
  const bar = (d) => line(P(d, -8), P(d, 8));
  const circle = (d) => { const c = P(d, 0); return `<circle cx="${c[0].toFixed(1)}" cy="${c[1].toFixed(1)}" r="5.5" fill="#fff" stroke="${color}" stroke-width="2"/>`; };
  const crow = () => [line(P(16, 0), P(0, -9)), line(P(16, 0), P(0, 0)), line(P(16, 0), P(0, 9))].join('');
  switch (kind) {
    case 'one': return bar(9) + bar(15);
    case 'zeroone': return bar(9) + circle(19);
    case 'many0': return crow() + circle(24);
    case 'many1': return crow() + bar(21);
    default: return '';
  }
}

conns.forEach((c) => {
  const P = box[c.parent], C = box[c.child];
  const x1 = edgeX(c.parent, c.pSide), y1 = c.pY;
  const x2 = edgeX(c.child, c.cSide), y2 = c.cY;
  const color = c.logical ? '#7a6a64' : '#3b2a26';
  const dash = c.logical ? ' stroke-dasharray="7 5"' : '';
  let d;
  let xFirst = null, xLast = null; // x of the first and last vertical run (for placing labels)
  let laneY = null;
  if (c.loop) {
    // same column: leave on the right, run down the gap, come back in
    const gx = channelX(P.col);
    d = `M${x1},${y1} H${gx} V${y2} H${x2}`;
    xFirst = xLast = gx;
  } else if (Math.abs(P.col - C.col) === 1) {
    const mx = channelX(Math.min(P.col, C.col));
    d = `M${x1},${y1} H${mx} V${y2} H${x2}`;
    xFirst = xLast = mx;
  } else {
    // long hop: go through the gap next to the parent, travel along a lane above or below
    // all tables, then come down the gap next to the child. This keeps lines out of other tables.
    const gP = c.pSide === 'R' ? P.col : P.col - 1;
    const gC = c.cSide === 'L' ? C.col - 1 : C.col;
    const mid = (y1 + y2) / 2;
    const useTop = mid < (TOP + maxY) / 2;
    const lane = useTop ? TOP - 24 - (topLanes++) * 7 : maxY + 26 + (botLanes++) * 7;
    const xP = channelX(gP), xC = channelX(gC);
    d = `M${x1},${y1} H${xP} V${lane} H${xC} V${y2} H${x2}`;
    xFirst = xP; xLast = xC; laneY = lane;
  }
  // relationship verb: put it on the child-side or parent-side horizontal run if it fits
  const labelW = c.verb.length * 5.6 + 8;
  const fit = (xa, xb) => {
    const dir = Math.sign(xb - xa) || 1;
    const start = xa + dir * 36, end = xb - dir * 5;
    return Math.abs(end - start) >= labelW ? (start + end) / 2 : null;
  };
  const lc = fit(x2, xLast);
  const pc = lc === null ? fit(x1, xFirst) : null;
  const addLabel = (cx, cy) => svgLabels.push(
    `<text x="${cx.toFixed(1)}" y="${(cy - 5).toFixed(1)}" text-anchor="middle" font-size="11" font-style="italic" fill="#4a3a35" stroke="#ffffff" stroke-width="3.5" paint-order="stroke" stroke-linejoin="round">${esc(c.verb)}</text>`);
  if (lc !== null) addLabel(lc, y2);
  else if (pc !== null) addLabel(pc, y1);
  else if (laneY !== null) addLabel((xFirst + xLast) / 2, laneY); // long hop: label the lane
  else addLabel(xFirst, (y1 + y2) / 2 + 5); // sits on the vertical run with a white halo
  c.labelled = true;
  svgLines.push(`<path d="${d}" fill="none" stroke="${color}" stroke-width="1.8"${dash} stroke-linejoin="round"/>`);
  const pu = c.pSide === 'R' ? [1, 0] : [-1, 0];
  const cu = c.cSide === 'R' ? [1, 0] : [-1, 0];
  svgLines.push(symbol(x1, y1, pu[0], pu[1], c.pEnd, color));
  svgLines.push(symbol(x2, y2, cu[0], cu[1], c.cEnd, color));
});

LEGEND_Y = maxY + 26 + botLanes * 7 + 50;
HEIGHT = LEGEND_Y + 170;
console.log('unlabelled relationships:', conns.filter((c) => !c.labelled).map((c) => c.parent + '-' + c.child).join(', ') || 'none');
console.log('long hops: top lanes', topLanes, 'bottom lanes', botLanes, 'gap usage', JSON.stringify(gapUse));

// boxes
Object.values(box).forEach((b) => {
  const [group, cols] = T[b.name];
  const g = GROUP[group];
  let s = `<g>`;
  s += `<rect x="${b.x}" y="${b.y}" width="${b.w}" height="${b.h}" rx="9" fill="${g.fill}" stroke="${g.head}" stroke-width="2"/>`;
  s += `<path d="M${b.x},${b.y + HEAD} V${b.y + 9} a9,9 0 0 1 9,-9 H${b.x + b.w - 9} a9,9 0 0 1 9,9 V${b.y + HEAD} z" fill="${g.head}"/>`;
  s += `<text x="${b.x + b.w / 2}" y="${b.y + 24}" text-anchor="middle" font-size="16" font-weight="700" fill="#fff">${esc(b.name)}</text>`;
  cols.forEach((col, i) => {
    const [name, type, flags = ''] = col;
    const rh = b.rh;
    const y = b.y + HEAD + 4 + i * rh;
    const f = flags.split(',').filter(Boolean);
    const isPK = f.includes('PK');
    const rowFill = i % 2 ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.25)';
    const ty = y + rh / 2 + 4.5;
    s += `<rect x="${b.x + 2}" y="${y}" width="${b.w - 4}" height="${rh}" fill="${rowFill}"/>`;
    // badge
    let badge = '';
    const fkBadge = f.includes('FK') ? 'FK' : (f.includes('LK') ? 'FK*' : '');
    if (isPK) badge = fkBadge ? 'PK,' + fkBadge : 'PK'; // composite keys: part of PK and also a foreign key
    else badge = fkBadge;
    if (f.includes('UK') && !isPK) badge = badge ? badge + ',UK' : 'UK';
    if (badge) {
      const bc = isPK ? '#b3261e' : (badge.startsWith('FK') ? '#1f5fa8' : '#6b5b57');
      s += `<text x="${b.x + 8}" y="${ty}" font-size="10" font-weight="700" fill="${bc}">${esc(badge)}</text>`;
    }
    const nameX = b.x + 56;
    s += `<text x="${nameX}" y="${ty}" font-size="13" ${isPK ? 'font-weight="700" text-decoration="underline"' : ''} fill="#2a1d1a">${esc(name)}</text>`;
    // long enum lists would run into the column name, so show just "enum" for those
    const shownType = type.length > 20 && type.startsWith('enum') ? 'enum' : type;
    s += `<text x="${b.x + b.w - 8}" y="${ty}" text-anchor="end" font-size="11" fill="#6b5b57">${esc(shownType)}</text>`;
  });
  s += `</g>`;
  svgBoxes.push(s);
});

// ---------------------------------------------------------------- legend
function legend() {
  const y0 = LEGEND_Y;
  let s = `<rect x="${LEFT}" y="${y0}" width="${WIDTH - 2 * LEFT}" height="140" rx="12" fill="#faf6f2" stroke="#cdbfb6" stroke-width="1.5"/>`;
  s += `<text x="${LEFT + 20}" y="${y0 + 28}" font-size="16" font-weight="700" fill="#5f0d0a">Legend</text>`;
  // notation samples
  const items = [
    ['one', 'Exactly one'],
    ['zeroone', 'Zero or one'],
    ['many0', 'Zero or many'],
    ['many1', 'One or many'],
  ];
  items.forEach(([k, label], i) => {
    const x = LEFT + 40 + i * 230, y = y0 + 70;
    s += `<line x1="${x}" y1="${y}" x2="${x + 110}" y2="${y}" stroke="#3b2a26" stroke-width="1.8"/>`;
    s += symbol(x + 110, y, -1, 0, k, '#3b2a26');
    s += `<text x="${x + 125}" y="${y + 5}" font-size="13" fill="#2a1d1a">${label}</text>`;
  });
  const y2 = y0 + 108;
  s += `<line x1="${LEFT + 40}" y1="${y2}" x2="${LEFT + 150}" y2="${y2}" stroke="#3b2a26" stroke-width="1.8"/>`;
  s += `<text x="${LEFT + 162}" y="${y2 + 5}" font-size="13" fill="#2a1d1a">Foreign key enforced by the database</text>`;
  s += `<line x1="${LEFT + 470}" y1="${y2}" x2="${LEFT + 580}" y2="${y2}" stroke="#7a6a64" stroke-width="1.8" stroke-dasharray="7 5"/>`;
  s += `<text x="${LEFT + 592}" y="${y2 + 5}" font-size="13" fill="#2a1d1a">Logical relationship (used by the code, no DB constraint)</text>`;
  s += `<text x="${LEFT + 1060}" y="${y2 + 5}" font-size="13" fill="#2a1d1a"><tspan font-weight="700" fill="#b3261e">PK</tspan> primary key    <tspan font-weight="700" fill="#1f5fa8">FK</tspan> foreign key    <tspan font-weight="700" fill="#1f5fa8">FK*</tspan> logical FK    <tspan font-weight="700" fill="#6b5b57">UK</tspan> unique (or part of a composite unique key)</text>`;
  // group colours (right side of the notation row)
  const keys = Object.values(GROUP);
  keys.forEach((g, i) => {
    const x = LEFT + 1060 + (i % 3) * 270, y = y0 + 58 + Math.floor(i / 3) * 28;
    s += `<rect x="${x}" y="${y - 12}" width="20" height="16" rx="3" fill="${g.fill}" stroke="${g.head}" stroke-width="2"/>`;
    s += `<text x="${x + 28}" y="${y + 1}" font-size="13" fill="#2a1d1a">${esc(g.label)}</text>`;
  });
  return s;
}

const title = `<text x="${WIDTH / 2}" y="54" text-anchor="middle" font-size="34" font-weight="700" fill="#5f0d0a">ConnectED - Entity Relationship Diagram</text>
<text x="${WIDTH / 2}" y="86" text-anchor="middle" font-size="16" fill="#6b5b57">27 tables, ${conns.length} relationships - crow's foot notation - database: connected_system (MySQL)</text>
<text x="${WIDTH / 2}" y="110" text-anchor="middle" font-size="13" fill="#6b5b57">Note: inbox_trash.item_id points to an announcement, concern or message depending on item_type; users.student_id links a student login to its student record.</text>`;

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" font-family="Segoe UI, Arial, sans-serif">
<rect width="${WIDTH}" height="${HEIGHT}" fill="#ffffff"/>
${title}
<g>${svgLines.join('\n')}</g>
${svgBoxes.join('\n')}
<g>${svgLabels.join('\n')}</g>
${legend()}
</svg>
`;

const out = path.join(__dirname, '..', 'docs', 'erd.svg');
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, svg);
console.log('Wrote', out, `${WIDTH}x${HEIGHT}`);
