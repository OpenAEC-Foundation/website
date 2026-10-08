// Repositories omitted from public product listings and activity feeds.
const excludedRepos = new Set(['open-frame-studio']);

const isExcludedRepo = (name) => excludedRepos.has(String(name || '').toLowerCase());

module.exports = { isExcludedRepo };
