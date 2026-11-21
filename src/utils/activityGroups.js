const db = require('../../db');

let schemaPromise = null;

async function ensureActivityGroupsSchema(conn = db) {
  if (schemaPromise) return schemaPromise;
  schemaPromise = (async () => {
    try {
      await conn.query(
        `ALTER TABLE assessments
         ADD COLUMN activity_grouping VARCHAR(20) NOT NULL DEFAULT 'individual'`
      );
    } catch (e) { /* column may already exist */ }
    await conn.query(`
      CREATE TABLE IF NOT EXISTS assessment_groups (
        id INT AUTO_INCREMENT PRIMARY KEY,
        assessment_id INT NOT NULL,
        group_number INT NOT NULL,
        members_per_group INT NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY uq_assessment_group (assessment_id, group_number),
        KEY idx_assessment_groups_assessment (assessment_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    await conn.query(`
      CREATE TABLE IF NOT EXISTS assessment_group_members (
        id INT AUTO_INCREMENT PRIMARY KEY,
        group_id INT NOT NULL,
        student_id INT NOT NULL,
        is_leader TINYINT(1) NOT NULL DEFAULT 0,
        UNIQUE KEY uq_group_student (group_id, student_id),
        KEY idx_group_members_group (group_id),
        KEY idx_group_members_student (student_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
  })().catch((err) => {
    schemaPromise = null;
    throw err;
  });
  return schemaPromise;
}

function shuffleInPlace(list) {
  for (let i = list.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = list[i];
    list[i] = list[j];
    list[j] = tmp;
  }
  return list;
}

/** Split roster into groups of membersPerGroup; last group may be smaller. */
function buildAutoGroups(studentIds, membersPerGroup) {
  const size = Math.max(2, Math.min(20, Number(membersPerGroup) || 0));
  const ids = shuffleInPlace([...studentIds].map(Number).filter((id) => id > 0));
  if (!ids.length) return [];

  const groups = [];
  for (let i = 0; i < ids.length; i += size) {
    const members = ids.slice(i, i + size);
    // Avoid a leftover solo when possible: fold a single remainder into the previous group.
    if (members.length === 1 && groups.length) {
      groups[groups.length - 1].memberIds.push(members[0]);
      break;
    }
    groups.push({
      groupNumber: groups.length + 1,
      memberIds: members,
      leaderId: members[0]
    });
  }
  return groups.map((g, idx) => ({ ...g, groupNumber: idx + 1, membersPerGroup: size }));
}

async function clearAssessmentGroups(assessmentId, conn = db) {
  const [rows] = await conn.query(
    'SELECT id FROM assessment_groups WHERE assessment_id = ?',
    [assessmentId]
  );
  const ids = rows.map((r) => r.id);
  if (ids.length) {
    await conn.query(
      `DELETE FROM assessment_group_members WHERE group_id IN (${ids.map(() => '?').join(',')})`,
      ids
    );
  }
  await conn.query('DELETE FROM assessment_groups WHERE assessment_id = ?', [assessmentId]);
}

async function saveAutoGroups(assessmentId, membersPerGroup, studentIds, conn = db) {
  await ensureActivityGroupsSchema(conn);
  const plans = buildAutoGroups(studentIds, membersPerGroup);
  if (!plans.length) {
    const err = new Error('No active students to group.');
    err.status = 400;
    throw err;
  }

  await clearAssessmentGroups(assessmentId, conn);

  const groups = [];
  for (const plan of plans) {
    const [result] = await conn.query(
      `INSERT INTO assessment_groups (assessment_id, group_number, members_per_group)
       VALUES (?, ?, ?)`,
      [assessmentId, plan.groupNumber, plan.membersPerGroup]
    );
    const groupId = result.insertId;
    const members = [];
    for (const studentId of plan.memberIds) {
      const isLeader = Number(studentId) === Number(plan.leaderId) ? 1 : 0;
      await conn.query(
        `INSERT INTO assessment_group_members (group_id, student_id, is_leader)
         VALUES (?, ?, ?)`,
        [groupId, studentId, isLeader]
      );
      members.push({ student_id: studentId, is_leader: !!isLeader });
    }
    groups.push({
      id: groupId,
      group_number: plan.groupNumber,
      members_per_group: plan.membersPerGroup,
      leader_student_id: plan.leaderId,
      members
    });
  }
  return groups;
}

async function loadAssessmentGroups(assessmentId, conn = db) {
  await ensureActivityGroupsSchema(conn);
  const [groupRows] = await conn.query(
    `SELECT id, assessment_id, group_number, members_per_group
     FROM assessment_groups
     WHERE assessment_id = ?
     ORDER BY group_number`,
    [assessmentId]
  );
  if (!groupRows.length) return [];

  const groupIds = groupRows.map((g) => g.id);
  const [memberRows] = await conn.query(
    `SELECT m.group_id, m.student_id, m.is_leader,
            s.first_name, s.last_name
     FROM assessment_group_members m
     JOIN students s ON s.id = m.student_id
     WHERE m.group_id IN (${groupIds.map(() => '?').join(',')})
     ORDER BY m.is_leader DESC, s.last_name, s.first_name`,
    groupIds
  );

  const byGroup = new Map();
  for (const row of memberRows) {
    if (!byGroup.has(row.group_id)) byGroup.set(row.group_id, []);
    byGroup.get(row.group_id).push({
      student_id: row.student_id,
      first_name: row.first_name,
      last_name: row.last_name,
      is_leader: !!Number(row.is_leader)
    });
  }

  return groupRows.map((g) => {
    const members = byGroup.get(g.id) || [];
    const leader = members.find((m) => m.is_leader) || members[0] || null;
    return {
      id: g.id,
      group_number: g.group_number,
      members_per_group: g.members_per_group,
      leader_student_id: leader?.student_id || null,
      members
    };
  });
}

/** Map studentId -> { group_number, is_leader, member_ids[] } */
function indexGroupsByStudent(groups) {
  const map = new Map();
  for (const group of groups || []) {
    const memberIds = (group.members || []).map((m) => Number(m.student_id));
    for (const member of group.members || []) {
      map.set(Number(member.student_id), {
        group_id: group.id,
        group_number: group.group_number,
        is_leader: !!member.is_leader,
        leader_student_id: group.leader_student_id,
        member_ids: memberIds
      });
    }
  }
  return map;
}

/**
 * Expand teacher score rows so a scored group member (prefer leader) writes the
 * same score/rubric to every classmate in that group.
 */
function expandScoresForGroups(scoreRows, groups) {
  if (!groups?.length || !Array.isArray(scoreRows) || !scoreRows.length) {
    return scoreRows || [];
  }

  const byStudent = indexGroupsByStudent(groups);
  const incoming = new Map();
  for (const row of scoreRows) {
    const sid = Number(row.student_id);
    if (!sid) continue;
    incoming.set(sid, row);
  }

  const handledGroups = new Set();
  const expanded = [];
  const seenStudents = new Set();

  for (const row of scoreRows) {
    const sid = Number(row.student_id);
    if (!sid) continue;
    const info = byStudent.get(sid);
    if (!info) {
      if (!seenStudents.has(sid)) {
        expanded.push(row);
        seenStudents.add(sid);
      }
      continue;
    }
    if (handledGroups.has(info.group_id)) continue;
    handledGroups.add(info.group_id);

    const leaderRow = info.leader_student_id ? incoming.get(Number(info.leader_student_id)) : null;
    const source = leaderRow || row;
    for (const memberId of info.member_ids) {
      if (seenStudents.has(memberId)) continue;
      seenStudents.add(memberId);
      expanded.push({
        ...source,
        student_id: memberId
      });
    }
  }

  return expanded;
}

module.exports = {
  ensureActivityGroupsSchema,
  buildAutoGroups,
  clearAssessmentGroups,
  saveAutoGroups,
  loadAssessmentGroups,
  indexGroupsByStudent,
  expandScoresForGroups
};
