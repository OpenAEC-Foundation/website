// scripts/compute-download-trends.js
// Reads daily snapshots from data/history-downloads/ and computes
// week-over-week and total deltas per tool. Writes data/download-trends.json.
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const historyDir = path.join(ROOT, 'data', 'history-downloads');

if (!fs.existsSync(historyDir)) {
  console.error('No history-downloads/ folder yet. Run generate-downloads.js first.');
  process.exit(0);
}

const files = fs.readdirSync(historyDir)
  .filter(f => f.endsWith('.json'))
  .sort();

if (files.length === 0) {
  console.error('No snapshots in history-downloads/.');
  process.exit(0);
}

const snapshots = files.map(f => {
  const data = JSON.parse(fs.readFileSync(path.join(historyDir, f), 'utf8'));
  return { date: f.replace('.json', ''), ...data };
});

console.log(`Loaded ${snapshots.length} snapshots (${snapshots[0].date} → ${snapshots[snapshots.length-1].date})`);

// Get ISO Monday of a date string
function mondayOf(dateStr) {
  const d = new Date(dateStr + 'T00:00:00Z');
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() - day + 1);
  return d.toISOString().substring(0, 10);
}

// Build per-week-end snapshots: pick the latest snapshot in each ISO week
const weekSnapshots = {};
snapshots.forEach(s => {
  const wk = mondayOf(s.date);
  if (!weekSnapshots[wk] || s.date > weekSnapshots[wk].date) {
    weekSnapshots[wk] = s;
  }
});
const weeks = Object.keys(weekSnapshots).sort();

// Compute week-over-week deltas per repo
const weeklyDeltas = []; // [{ week, perRepo: {repo: delta}, total }]
for (let i = 1; i < weeks.length; i++) {
  const prev = weekSnapshots[weeks[i - 1]];
  const cur = weekSnapshots[weeks[i]];
  const perRepo = {};
  Object.keys(cur.perRepo).forEach(repo => {
    // Een repo die in de vorige momentopname nog niet werd gevolgd, levert
    // anders zijn hele historie als "groei van deze week" op. Zulke repo's
    // tellen pas mee vanaf de eerste week waarin ze in beide metingen staan.
    if (!(repo in prev.perRepo)) return;
    const before = prev.perRepo[repo];
    const after = cur.perRepo[repo];
    const delta = after - before;
    if (delta !== 0) perRepo[repo] = delta;
  });
  const total = Object.values(perRepo).reduce((s, n) => s + n, 0);
  weeklyDeltas.push({
    weekEnd: weeks[i],
    weekStart: weeks[i - 1],
    perRepo,
    total,
  });
}

// Total since first snapshot
const first = snapshots[0];
const last = snapshots[snapshots.length - 1];
const totalDelta = {};
Object.keys(last.perRepo).forEach(repo => {
  if (!(repo in first.perRepo)) return;   // pas volgen vanaf de eerste meting
  const before = first.perRepo[repo];
  const after = last.perRepo[repo];
  totalDelta[repo] = after - before;
});

const output = {
  generated: new Date().toISOString(),
  firstSnapshot: first.date,
  lastSnapshot: last.date,
  snapshotCount: snapshots.length,
  weekCount: weeks.length,
  weeklyDeltas,
  totalDelta,
  totalDownloadsAdded: Object.values(totalDelta).reduce((s, n) => s + n, 0),
};

fs.writeFileSync(path.join(ROOT, 'data', 'download-trends.json'), JSON.stringify(output, null, 2));

console.log(`\nWeek-over-week deltas:`);
weeklyDeltas.forEach(w => {
  console.log(`  ${w.weekStart} → ${w.weekEnd}: +${w.total} downloads`);
});
console.log(`\nTotal since first snapshot (${first.date}): +${output.totalDownloadsAdded} downloads`);
console.log('Top repos:');
Object.entries(totalDelta).sort((a, b) => b[1] - a[1]).slice(0, 10).forEach(([repo, n]) => {
  if (n > 0) console.log(`  ${repo.padEnd(35)} +${n}`);
});
console.log('\nWritten to data/download-trends.json');
