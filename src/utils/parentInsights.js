function itemKind(type) {
  const t = String(type || '').toLowerCase();
  if (t === 'activity') return 'activity';
  if (t === 'exam') return 'exam';
  return 'quiz';
}

function plural(n, one, many) {
  return Number(n) === 1 ? one : many;
}

/**
 * Template NLG from attendance + Records scores. No LLM call.
 */
function buildParentInsight({ firstName, stats, records, average }) {
  const name = String(firstName || 'Your child').trim() || 'Your child';
  const attDays = Number(stats?.totalDays) || 0;
  const rate = Number(stats?.attendanceRate) || 0;
  const abs = Number(stats?.absent) || 0;
  const late = Number(stats?.late) || 0;
  const recs = Array.isArray(records) ? records : [];
  const avg = Number(average) || 0;

  if (attDays < 1 && recs.length < 1) {
    return {
      ready: false,
      text: 'Insights will appear here once attendance or scores are recorded.'
    };
  }

  const parts = [];

  if (attDays > 0) {
    let att = `Over the last 30 days, ${name}'s attendance rate is ${rate}%.`;
    if (abs > 0 && late > 0) {
      att += ` There ${plural(abs, 'was', 'were')} ${abs} ${plural(abs, 'absent mark', 'absent marks')} and ${late} ${plural(late, 'late mark', 'late marks')}.`;
    } else if (abs > 0) {
      att += ` There ${plural(abs, 'was', 'were')} ${abs} ${plural(abs, 'absent mark', 'absent marks')}.`;
    } else if (late > 0) {
      att += ` There ${plural(late, 'was', 'were')} ${late} ${plural(late, 'late mark', 'late marks')}.`;
    } else {
      att += ' Attendance has been consistent.';
    }
    parts.push(att);
  }

  if (recs.length) {
    const latest = recs[0];
    const kind = itemKind(latest.type);
    const subj = latest.subject_name ? ` in ${latest.subject_name}` : '';
    const title = latest.title ? ` (${latest.title})` : '';
    let scores = `Classwork average across ${recs.length} recorded ${plural(recs.length, 'item', 'items')} is ${avg}%.`;
    scores += ` The latest ${kind}${subj}${title} scored ${Number(latest.percent) || 0}%.`;
    if (avg >= 85) scores += ' Overall performance is strong.';
    else if (avg >= 75) scores += ' Overall performance is satisfactory.';
    else if (avg >= 60) scores += ' Some items may need extra review at home.';
    else scores += ' Consider checking in with the teacher about recent scores.';
    parts.push(scores);
  } else if (attDays > 0) {
    parts.push('No quiz, activity, or exam scores have been published yet.');
  }

  return { ready: true, text: parts.join(' ') };
}

module.exports = { buildParentInsight };
