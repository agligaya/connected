function itemKind(type) {
  const t = String(type || '').toLowerCase();
  if (t === 'activity') return 'activity';
  if (t === 'exam') return 'exam';
  return 'quiz';
}

function plural(n, one, many) {
  return Number(n) === 1 ? one : many;
}

function joinList(items) {
  const arr = (items || []).filter(Boolean);
  if (arr.length <= 1) return arr[0] || '';
  if (arr.length === 2) return `${arr[0]} and ${arr[1]}`;
  return `${arr.slice(0, -1).join(', ')}, and ${arr[arr.length - 1]}`;
}

function typePhrase(types) {
  const bits = [];
  if (types.quiz) bits.push(`${types.quiz} ${plural(types.quiz, 'quiz', 'quizzes')}`);
  if (types.activity) bits.push(`${types.activity} ${plural(types.activity, 'activity', 'activities')}`);
  if (types.exam) bits.push(`${types.exam} ${plural(types.exam, 'exam', 'exams')}`);
  return joinList(bits);
}

const PASSING = 75;
const STRONG = 85;

function groupBySubject(records) {
  const map = new Map();
  for (const r of records) {
    const key = String(r.subject_name || '').trim() || 'Classwork';
    if (!map.has(key)) map.set(key, []);
    map.get(key).push({
      percent: Number(r.percent) || 0,
      type: itemKind(r.type)
    });
  }
  return [...map.entries()].map(([name, items]) => {
    const avg = Math.round(items.reduce((a, b) => a + b.percent, 0) / items.length);
    const types = { quiz: 0, activity: 0, exam: 0 };
    for (const it of items) types[it.type] += 1;
    return { name, count: items.length, avg, types };
  }).sort((a, b) => a.avg - b.avg);
}

function labeledSubjects(rows) {
  return rows.map((s) => `${s.name} (${s.avg}%)`);
}

function describeSessionMarks(morning, afternoon, singular, pluralWord) {
  const m = Number(morning) || 0;
  const a = Number(afternoon) || 0;
  const parts = [];
  if (m) parts.push(`${m} morning`);
  if (a) parts.push(`${a} afternoon`);
  if (!parts.length) return '';
  const n = m + a;
  return `${joinList(parts)} ${n === 1 ? singular : pluralWord}`;
}

/**
 * Template NLG from attendance + Records grouped by subject. No LLM call.
 */
function typePartPhrase(label, ends) {
  if (!ends?.strong_part) return '';
  const strong = ends.strong_part;
  if (!ends.weak_part) {
    return `In the ${label}, ${strong.name} is ${strong.avg_percent}%.`;
  }
  const weak = ends.weak_part;
  return `In the ${label}, ${strong.name} is the strongest part (${strong.avg_percent}%) and ${weak.name} is the weakest part (${weak.avg_percent}%).`;
}

function partPhrase(lesson) {
  const bits = [
    typePartPhrase('quiz', lesson.quiz_parts),
    typePartPhrase('activity', lesson.activity_parts)
  ].filter(Boolean);
  return bits.length ? ` ${bits.join(' ')}` : '';
}

function buildParentInsight({ firstName, stats, records, average, lessons }) {
  const name = String(firstName || 'Your child').trim() || 'Your child';
  const attDays = Number(stats?.totalDays) || 0;
  const rate = Number(stats?.attendanceRate) || 0;
  const present = Number(stats?.present) || 0;
  const abs = Number(stats?.absent) || 0;
  const late = Number(stats?.late) || 0;
  const totalMarks = present + abs + late;
  const recs = Array.isArray(records) ? records : [];
  const avg = Number(average) || 0;

  if (attDays < 1 && recs.length < 1) {
    return {
      ready: false,
      text: 'Insights will appear here once attendance or scores are recorded.',
      bullets: []
    };
  }

  const bullets = [];
  const subjects = groupBySubject(recs);
  const atRisk = subjects.filter((s) => s.count >= 2 && s.avg < PASSING);
  const strengths = subjects.filter((s) => s.avg >= STRONG);
  const study = subjects.filter((s) => s.avg < STRONG);
  const studyNames = [...new Set(study.map((s) => s.name))];

  if (recs.length) {
    bullets.push(
      `Classwork average across ${recs.length} recorded ${plural(recs.length, 'item', 'items')} is ${avg}%.`
    );
  } else if (attDays > 0) {
    bullets.push('No quiz, activity, or exam scores have been published yet.');
  }

  if (atRisk.length === 1) {
    const s = atRisk[0];
    const mix = typePhrase(s.types);
    bullets.push(
      `${s.name} is at risk of failing (average ${s.avg}% across ${mix || `${s.count} ${plural(s.count, 'item', 'items')}`}).`
    );
  } else if (atRisk.length > 1) {
    bullets.push(`${joinList(labeledSubjects(atRisk))} are at risk of failing.`);
  }

  const lessonRows = Array.isArray(lessons) ? lessons : [];
  const lessonNeeds = lessonRows.filter((l) => Number(l.avg_percent) < PASSING);
  const lessonStrengths = lessonRows.filter((l) => Number(l.avg_percent) >= STRONG);
  lessonNeeds.slice(0, 3).forEach((l) => {
    bullets.push(`${l.lesson} needs work (${l.avg_percent}%).${partPhrase(l)}`);
  });
  lessonStrengths.slice(0, 3).forEach((l) => {
    bullets.push(`${l.lesson} is a strength (${l.avg_percent}%).${partPhrase(l)}`);
  });
  if (!lessonRows.length && studyNames.length) {
    bullets.push(`I recommend ${name} to study more in ${joinList(studyNames)}.`);
    if (study.some((s) => s.count < 2 && !atRisk.includes(s))) {
      bullets.push('Some of those subjects have only 1 recorded item so far.');
    }
  } else if (lessonRows.length && study.some((s) => s.count < 2 && !atRisk.includes(s))) {
    bullets.push('Some subjects have only 1 recorded item so far.');
  }

  if (strengths.length === 1) {
    const s = strengths[0];
    const soFar = s.count < 2 ? 'So far, ' : '';
    bullets.push(
      `${soFar}${s.name} is a strength (average ${s.avg}%${s.count < 2 ? ' on 1 item' : ''}).`
    );
  } else if (strengths.length > 1) {
    bullets.push(`${joinList(strengths.map((s) => s.name))} are strengths.`);
  }

  if (totalMarks > 0 && (abs > 0 || late > 0)) {
    let att = `Over the last 30 days, ${present} of ${totalMarks} sessions were present (${rate}%).`;
    const morning = stats?.bySession?.morning || {};
    const afternoon = stats?.bySession?.afternoon || {};
    const absP = describeSessionMarks(morning.Absent, afternoon.Absent, 'absent mark', 'absent marks');
    const lateP = describeSessionMarks(morning.Late, afternoon.Late, 'late mark', 'late marks');
    const extra = [absP, lateP].filter(Boolean);
    if (extra.length) {
      const n = abs + late;
      att += ` There ${plural(n, 'was', 'were')} ${joinList(extra)}.`;
    }
    bullets.push(att);
  }

  return { ready: true, text: bullets.join(' '), bullets };
}

module.exports = { buildParentInsight, PASSING, STRONG };
