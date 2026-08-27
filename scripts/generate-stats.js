// scripts/generate-stats.js
// Runs in GitHub Actions with GITHUB_TOKEN for 5000 req/hour
const fs = require('fs');
const path = require('path');

const ORG = 'OpenAEC-Foundation';
// External community repos counted in the ecosystem totals (stars, commits,
// issues, contributors). These live outside the org but are part of the
// OpenAEC ecosystem. Full "owner/name" form.
const EXTERNAL_REPOS = ['HakanSeven12/OpenCADStudio'];
const TOKEN = process.env.GITHUB_TOKEN;
const headers = {
  'Accept': 'application/vnd.github.v3+json',
  'User-Agent': 'OpenAEC-Stats-Bot',
};
if (TOKEN) headers['Authorization'] = `Bearer ${TOKEN}`;

async function ghFetch(url) {
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}: ${url}`);
  return res.json();
}

async function fetchAllPages(baseUrl) {
  const results = [];
  let page = 1;
  while (true) {
    const sep = baseUrl.includes('?') ? '&' : '?';
    const data = await ghFetch(`${baseUrl}${sep}per_page=100&page=${page}`);
    if (!Array.isArray(data) || data.length === 0) break;
    results.push(...data);
    page++;
  }
  return results;
}

function buildTimeSeries(publicRepos, currentSummary) {
  // Build DAILY time series. Prefers AUTHORITATIVE data from
  // data/history/YYYY-MM-DD.json snapshots (recorded daily by this script).
  // For dates BEFORE the first snapshot, falls back to a synthetic series
  // built from repo creation dates (less accurate but better than empty).
  // Use UTC throughout to avoid day-boundary drift (CEST is UTC+2 → local
  // midnight is the previous day's 22:00 UTC, which shifted ISO dates by 1
  // and excluded today from the series).
  const startDate = new Date(Date.UTC(2025, 11, 1, 12, 0, 0));
  const endDate = new Date();
  endDate.setUTCHours(23, 59, 59);

  // Generate all days from start to today, formatted as YYYY-MM-DD (UTC)
  const allDays = [];
  const d = new Date(startDate);
  while (d <= endDate) {
    allDays.push(d.toISOString().substring(0, 10));
    d.setUTCDate(d.getUTCDate() + 1);
  }

  // Load all daily snapshots (sorted by date)
  const historyDir = path.join(__dirname, '..', 'data', 'history');
  const snapshots = {};
  try {
    fs.readdirSync(historyDir)
      .filter(f => /^\d{4}-\d{2}-\d{2}\.json$/.test(f))
      .forEach(f => {
        const day = f.replace('.json', '');
        try { snapshots[day] = JSON.parse(fs.readFileSync(path.join(historyDir, f), 'utf8')); }
        catch (e) { /* ignore corrupt snapshot */ }
      });
  } catch (e) { /* no history dir yet */ }
  const snapshotDays = Object.keys(snapshots).sort();
  const firstSnapDay = snapshotDays[0];
  const today = endDate.toISOString().substring(0, 10);

  // Today's values are always the freshest — overwrite/insert today's snapshot
  // so the chart line ends on the current totals even before the next daily run.
  if (currentSummary) {
    snapshots[today] = {
      publicRepos: currentSummary.publicRepos,
      totalStars: currentSummary.totalStars,
      totalCommits: currentSummary.totalCommits,
      uniqueContributors: currentSummary.uniqueContributors,
      totalOpenIssues: currentSummary.totalOpenIssues,
      openIssues: currentSummary.openIssues,
      closedIssues: currentSummary.closedIssues,
      openPRs: currentSummary.openPRs,
      closedPRs: currentSummary.closedPRs,
      mergedPRs: currentSummary.mergedPRs,
      estimatedLinesOfCode: currentSummary.estimatedLinesOfCode,
    };
    if (!snapshotDays.includes(today)) snapshotDays.push(today);
  }

  // For old snapshots that lack closedIssues, estimate it by scaling today's
  // closed/open ratio against the snapshot's open-issue count. Not historically
  // exact, but produces a sensible curve that becomes accurate as new daily
  // snapshots accumulate.
  const todayClosed = currentSummary?.closedIssues ?? 0;
  const todayOpen   = currentSummary?.openIssues ?? currentSummary?.totalOpenIssues ?? 1;
  const closedPerOpen = todayOpen > 0 ? (todayClosed / todayOpen) : 0;

  function snapshotValues(snap) {
    const openIssues = snap.openIssues ?? snap.totalOpenIssues ?? 0;
    const closedIssues = snap.closedIssues != null
      ? snap.closedIssues
      : Math.round(openIssues * closedPerOpen);
    return {
      repos: snap.publicRepos ?? snap.totalRepos ?? 0,
      stars: snap.totalStars ?? 0,
      issues: snap.totalOpenIssues ?? openIssues,
      openIssues: openIssues,
      closedIssues: closedIssues,
      totalIssues: openIssues + closedIssues,
      commits: snap.totalCommits ?? 0,
      loc: snap.estimatedLinesOfCode ?? 0,
      contributors: snap.uniqueContributors ?? 0,
    };
  }

  // Synthetic pre-snapshot fallback (creation-based) — only used for days
  // BEFORE we started recording snapshots.
  const startDateStr = '2025-12-01';
  const preExisting = publicRepos.filter(r => r.created_at.substring(0, 10) < startDateStr);
  let cumRepos = preExisting.length;
  let cumStars = preExisting.reduce((s, r) => s + r.stargazers_count, 0);
  let cumIssues = preExisting.reduce((s, r) => s + r.open_issues_count, 0);
  let cumCommits = preExisting.reduce((s, r) => s + (r._commitCount || 0), 0);
  let locSinceDec2025 = 0;
  let cumContributors = preExisting.reduce((s, r) => s + (r._contributorCount || 0), 0);
  const synthetic = {};

  function buildSyntheticForDay(day) {
    const reposToday = publicRepos.filter(r => r.created_at.substring(0, 10) === day);
    cumRepos += reposToday.length;
    cumStars += reposToday.reduce((s, r) => s + r.stargazers_count, 0);
    cumIssues += reposToday.reduce((s, r) => s + r.open_issues_count, 0);
    cumCommits += reposToday.reduce((s, r) => s + (r._commitCount || 0), 0);
    locSinceDec2025 += reposToday.reduce((s, r) => s + r.size, 0) * 25;
    cumContributors += reposToday.reduce((s, r) => s + (r._contributorCount || 0), 0);
    const synthClosed = Math.round(cumIssues * closedPerOpen);
    synthetic[day] = {
      repos: cumRepos,
      stars: cumStars,
      issues: cumIssues,
      openIssues: cumIssues,
      closedIssues: synthClosed,
      totalIssues: cumIssues + synthClosed,
      commits: cumCommits,
      loc: Math.round(locSinceDec2025),
      // synthetic contributor count is a sum-of-counts (over-counts duplicates),
      // so we clamp it to the current unique total to avoid wildly wrong values.
      contributors: Math.min(cumContributors, currentSummary?.uniqueContributors ?? cumContributors),
    };
  }

  // Helper: find latest snapshot ≤ day
  function snapshotAtOrBefore(day) {
    let best = null;
    for (const sd of snapshotDays) {
      if (sd <= day) best = sd;
      else break;
    }
    return best ? snapshots[best] : null;
  }

  const data = {};
  allDays.forEach(day => {
    // Always advance synthetic series so the fallback stays continuous.
    buildSyntheticForDay(day);

    // Prefer snapshot if we have one ≤ this day
    if (firstSnapDay && day >= firstSnapDay) {
      const snap = snapshotAtOrBefore(day);
      if (snap) { data[day] = snapshotValues(snap); return; }
    }
    data[day] = synthetic[day];
  });

  // Smooth join: scale pre-snapshot synthetic data so it ramps up to the
  // first snapshot's values (otherwise the chart shows an unrealistic dip).
  if (firstSnapDay && synthetic[firstSnapDay]) {
    const firstSnapVals = snapshotValues(snapshots[firstSnapDay]);
    const synthPeak = synthetic[firstSnapDay];
    const FIELDS = ['repos','stars','issues','openIssues','closedIssues','totalIssues','commits','loc','contributors'];
    const factors = {};
    FIELDS.forEach(f => {
      factors[f] = synthPeak[f] > 0 ? (firstSnapVals[f] / synthPeak[f]) : 1;
    });
    for (const day of allDays) {
      if (day >= firstSnapDay) break;
      const scaled = {};
      FIELDS.forEach(f => {
        scaled[f] = Math.round((synthetic[day][f] || 0) * factors[f]);
      });
      data[day] = scaled;
    }
  }

  // Generate month labels for x-axis (first day of each month that appears)
  const monthLabels = {};
  allDays.forEach(day => {
    const month = day.substring(0, 7);
    if (!monthLabels[month]) monthLabels[month] = day;
  });

  return {
    days: allDays,
    data: data,
    monthLabels: monthLabels,
  };
}

// Get a single `total_count` from the GitHub search API for an issue/PR query.
// Cheap (one request) and the only reliable way to split issues from PRs.
async function searchCount(query) {
  try {
    const url = `https://api.github.com/search/issues?q=${encodeURIComponent(query)}&per_page=1`;
    const data = await ghFetch(url);
    return data.total_count ?? 0;
  } catch (e) {
    console.warn(`  Warning: search query failed (${query}): ${e.message}`);
    return null;
  }
}

async function main() {
  console.log('Fetching all repos...');
  const repos = await fetchAllPages(`https://api.github.com/orgs/${ORG}/repos?type=all`);

  // Append external community repos (e.g. Open CAD Studio) so they count in the totals.
  for (const fullName of EXTERNAL_REPOS) {
    try {
      const ext = await ghFetch(`https://api.github.com/repos/${fullName}`);
      if (ext && ext.id) {
        ext._external = true;
        repos.push(ext);
        console.log(`  + external repo: ${fullName} (${ext.stargazers_count} stars)`);
      }
    } catch (e) {
      console.warn(`  Warning: external repo ${fullName}: ${e.message}`);
    }
  }

  // Forks tellen niet mee: dat is andermans software die toevallig in de org
  // staat. Zonder deze filter leverde de fork llvm-project in zijn eentje
  // 352.681 van de 362.737 commits — 97% van de teller kwam niet van OpenAEC.
  // De repo's uit EXTERNAL_REPOS zijn geen forks en blijven dus meetellen.
  const forks = repos.filter(r => r.fork);
  if (forks.length) {
    console.log(`  Skipping ${forks.length} fork(s), not our own software: ${forks.map(r => r.name).join(', ')}`);
  }
  const ownRepos = repos.filter(r => !r.fork);

  const publicRepos = ownRepos.filter(r => !r.private);

  console.log(`Found ${ownRepos.length} own repos (${publicRepos.length} public, incl. ${EXTERNAL_REPOS.length} external)`);

  // Org-wide issue/PR counts via search API (one request each)
  console.log('Fetching org-wide issue & PR counts...');
  const [openIssues, closedIssues, openPRs, closedPRs, mergedPRs] = await Promise.all([
    searchCount(`org:${ORG} is:issue is:open`),
    searchCount(`org:${ORG} is:issue is:closed`),
    searchCount(`org:${ORG} is:pr is:open`),
    searchCount(`org:${ORG} is:pr is:closed`),
    searchCount(`org:${ORG} is:pr is:merged`),
  ]);
  console.log(`  Issues: ${openIssues} open, ${closedIssues} closed`);
  console.log(`  PRs:    ${openPRs} open, ${closedPRs} closed (${mergedPRs} merged)`);

  // External repos aren't covered by the org-wide search — count them separately.
  let extOpenIssues = 0, extClosedIssues = 0, extOpenPRs = 0, extClosedPRs = 0, extMergedPRs = 0;
  for (const fullName of EXTERNAL_REPOS) {
    const [oi, ci, op, cp, mp] = await Promise.all([
      searchCount(`repo:${fullName} is:issue is:open`),
      searchCount(`repo:${fullName} is:issue is:closed`),
      searchCount(`repo:${fullName} is:pr is:open`),
      searchCount(`repo:${fullName} is:pr is:closed`),
      searchCount(`repo:${fullName} is:pr is:merged`),
    ]);
    extOpenIssues += oi; extClosedIssues += ci; extOpenPRs += op; extClosedPRs += cp; extMergedPRs += mp;
    console.log(`  ${fullName}: ${oi} open issues, ${ci} closed`);
  }

  const contributorSet = new Set();
  let totalCommits = 0;

  for (const repo of publicRepos) {
    console.log(`  Processing ${repo.name}...`);
    try {
      const contributors = await fetchAllPages(
        `https://api.github.com/repos/${repo.owner.login}/${repo.name}/contributors?anon=false`
      );
      contributors.forEach(c => contributorSet.add(c.login));
      const repoCommits = contributors.reduce((s, c) => s + (c.contributions || 0), 0);
      totalCommits += repoCommits;
      repo._commitCount = repoCommits;
      repo._contributorCount = contributors.length;
    } catch (e) {
      console.warn(`  Warning: ${repo.name}: ${e.message}`);
      repo._commitCount = 0;
      repo._contributorCount = 0;
    }
  }

  const newsItems = [];
  const today = new Date().toISOString().substring(0, 10);
  const newsCutoff = '2026-01-01'; // All news since Jan 1, 2026

  // Fetch releases from ALL repos (we still need release counts for private repos
  // internally), but news items are ONLY emitted for public repos below.
  for (const repo of ownRepos) {
    try {
      // Fetch ALL releases (paginated) to get full history
      const releases = await fetchAllPages(
        `https://api.github.com/repos/${repo.owner.login}/${repo.name}/releases`
      );
      repo._releases = releases.length;
      repo._latestRelease = releases[0]?.tag_name || null;
      repo._latestReleaseDate = releases[0]?.published_at?.substring(0, 10) || null;

      // SECURITY: never publish private-repo activity in the public news feed.
      if (repo.private) {
        console.log(`    ${repo.name}: PRIVATE — releases hidden from news feed`);
        continue;
      }

      // External repos count in the stats, but their releases are not flooded
      // into our news feed (Open CAD Studio releases very frequently).
      if (repo._external) {
        console.log(`    ${repo.name}: EXTERNAL — counted in stats, releases not in news feed`);
        continue;
      }

      // Group releases by date for this repo
      const releasesByDate = {};
      releases.forEach(rel => {
        const relDate = rel.published_at?.substring(0, 10);
        if (relDate && relDate >= newsCutoff) {
          if (!releasesByDate[relDate]) releasesByDate[relDate] = [];
          releasesByDate[relDate].push(rel);
        }
      });

      // Create one news item per repo per day
      Object.entries(releasesByDate).forEach(([date, rels]) => {
        const tags = rels.map(r => r.tag_name);
        if (rels.length === 1) {
          newsItems.push({
            type: 'release',
            repo: repo.name,
            title: `${repo.name} ${tags[0]} uitgebracht`,
            description: rels[0].name || `Nieuwe versie ${tags[0]}`,
            date: date,
            url: rels[0].html_url,
            count: 1,
          });
        } else {
          // Multiple releases on same day
          const first = tags[tags.length - 1];
          const last = tags[0];
          newsItems.push({
            type: 'release',
            repo: repo.name,
            title: `${repo.name}: ${rels.length} releases (${first} \u2192 ${last})`,
            description: `Versies: ${tags.reverse().join(', ')}`,
            date: date,
            url: rels[0].html_url,
            count: rels.length,
          });
        }
      });
      console.log(`    ${repo.name}: ${releases.length} releases, ${releases.filter(r => r.published_at?.substring(0, 10) >= newsCutoff).length} since ${newsCutoff}`);
    } catch (e) {
      repo._releases = 0;
      repo._latestRelease = null;
    }
  }

  // PUBLIC repos created since cutoff date (private repos are never announced)
  publicRepos.forEach(repo => {
    if (repo._external) return; // external repos are not announced as "new"
    if (repo.created_at.substring(0, 10) >= newsCutoff) {
      newsItems.push({
        type: 'new_repo',
        repo: repo.name,
        title: `Nieuwe repository: ${repo.name}`,
        description: repo.description || 'Nieuw project gestart',
        date: repo.created_at.substring(0, 10),
        url: repo.html_url,
      });
    }
  });

  newsItems.sort((a, b) => b.date.localeCompare(a.date));
  console.log(`\n  Total news items: ${newsItems.length} (${newsItems.filter(n => n.type === 'release').length} releases, ${newsItems.filter(n => n.type === 'new_repo').length} new repos)`);

  const langStats = {};
  publicRepos.forEach(r => {
    if (r.language) langStats[r.language] = (langStats[r.language] || 0) + 1;
  });

  const monthlyCreation = {};
  publicRepos.forEach(r => {
    const month = r.created_at.substring(0, 7);
    monthlyCreation[month] = (monthlyCreation[month] || 0) + 1;
  });

  const summary = {
    totalRepos: ownRepos.length,
    publicRepos: publicRepos.length,
    privateRepos: ownRepos.length - publicRepos.length,
    totalStars: publicRepos.reduce((s, r) => s + r.stargazers_count, 0),
    totalForks: publicRepos.reduce((s, r) => s + r.forks_count, 0),
    // GitHub's `open_issues_count` counts BOTH issues AND PRs — keep the legacy
    // field for back-compat but expose the clean split via the search-API fields.
    totalOpenIssues: publicRepos.reduce((s, r) => s + r.open_issues_count, 0),
    openIssues: openIssues + extOpenIssues,
    closedIssues: closedIssues + extClosedIssues,
    openPRs: openPRs + extOpenPRs,
    closedPRs: closedPRs + extClosedPRs,
    mergedPRs: mergedPRs + extMergedPRs,
    totalSizeKB: publicRepos.reduce((s, r) => s + r.size, 0),
    estimatedLinesOfCode: Math.round(publicRepos.filter(r => r.created_at >= '2025-12-01').reduce((s, r) => s + r.size, 0) * 25),
    totalCommits: totalCommits,
    uniqueContributors: contributorSet.size,
    languages: Object.keys(langStats).length,
  };

  const stats = {
    generated: new Date().toISOString(),
    summary: summary,
    languageDistribution: langStats,
    monthlyRepoCreation: monthlyCreation,
    repos: publicRepos.map(r => ({
      name: r.name,
      description: r.description,
      language: r.language,
      stars: r.stargazers_count,
      forks: r.forks_count,
      openIssues: r.open_issues_count,
      sizeKB: r.size,
      commits: r._commitCount,
      contributors: r._contributorCount,
      releases: r._releases,
      latestRelease: r._latestRelease,
      latestReleaseDate: r._latestReleaseDate,
      createdAt: r.created_at.substring(0, 10),
      updatedAt: r.updated_at.substring(0, 10),
      url: r.html_url,
    })).sort((a, b) => b.stars - a.stars),
    topByStars: [...publicRepos].sort((a, b) => b.stargazers_count - a.stargazers_count).slice(0, 5).map(r => ({ name: r.name, value: r.stargazers_count })),
    topByCommits: [...publicRepos].sort((a, b) => (b._commitCount || 0) - (a._commitCount || 0)).slice(0, 5).map(r => ({ name: r.name, value: r._commitCount })),
    topBySize: [...publicRepos].sort((a, b) => b.size - a.size).slice(0, 5).map(r => ({ name: r.name, value: Math.round(r.size / 1024) + ' MB' })),
    // Time series: prefers data/history/*.json snapshots for accuracy
    timeSeries: buildTimeSeries(publicRepos, summary),
  };

  const dataDir = path.join(__dirname, '..', 'data');
  const historyDir = path.join(dataDir, 'history');

  // Also read existing history files to build a historical trend
  const historyFiles = fs.existsSync(historyDir) ? fs.readdirSync(historyDir).filter(f => f.endsWith('.json')).sort() : [];
  stats.historicalTrend = historyFiles.map(f => {
    try {
      const d = JSON.parse(fs.readFileSync(path.join(historyDir, f), 'utf8'));
      return { date: f.replace('.json', ''), ...d };
    } catch { return null; }
  }).filter(Boolean);
  fs.mkdirSync(dataDir, { recursive: true });
  fs.mkdirSync(historyDir, { recursive: true });

  fs.writeFileSync(path.join(dataDir, 'stats.json'), JSON.stringify(stats, null, 2));
  fs.writeFileSync(path.join(dataDir, 'news.json'), JSON.stringify(newsItems, null, 2));
  fs.writeFileSync(path.join(historyDir, `${today}.json`), JSON.stringify(stats.summary, null, 2));

  console.log(`\nDone! Written to data/stats.json, data/news.json, data/history/${today}.json`);
  console.log(`Summary: ${stats.summary.totalRepos} repos, ${stats.summary.totalStars} stars, ${stats.summary.uniqueContributors} contributors`);
}

main().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
