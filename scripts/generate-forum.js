// scripts/generate-forum.js
// Writes data/forum.json for the /forum/ page: the most recent GitHub
// Discussions from every public OpenAEC repo that has Discussions switched on,
// plus whether the general forum repo (COMMUNITY_REPO) exists yet.
// GraphQL needs a token: runs in GitHub Actions with GITHUB_TOKEN. Without a
// token the existing data/forum.json is left untouched.
const fs = require('fs');
const path = require('path');

const ORG = 'OpenAEC-Foundation';
// The general forum: questions that are not about one tool. The /forum/ page
// only shows its "start a discussion" button once this repo exists.
const COMMUNITY_REPO = 'community';
const MAX_DISCUSSIONS = 30;
const OUT = path.join(__dirname, '..', 'data', 'forum.json');
const TOKEN = process.env.GITHUB_TOKEN;

async function graphql(query, variables) {
  const res = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${TOKEN}`,
      'Content-Type': 'application/json',
      'User-Agent': 'OpenAEC-Forum-Bot',
    },
    body: JSON.stringify({ query, variables }),
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}: graphql`);
  const json = await res.json();
  if (json.errors) throw new Error(json.errors.map(e => e.message).join('; '));
  return json.data;
}

const REPOS = `query($org: String!, $after: String) {
  organization(login: $org) {
    repositories(first: 100, after: $after, privacy: PUBLIC) {
      pageInfo { hasNextPage endCursor }
      nodes { name url hasDiscussionsEnabled isArchived }
    }
  }
}`;

const DISCUSSIONS = `query($owner: String!, $name: String!) {
  repository(owner: $owner, name: $name) {
    discussions(first: 20, orderBy: { field: UPDATED_AT, direction: DESC }) {
      totalCount
      nodes {
        title url createdAt updatedAt isAnswered
        category { name emoji }
        author { login }
        comments { totalCount }
      }
    }
  }
}`;

async function main() {
  if (!TOKEN) {
    console.log('  GITHUB_TOKEN ontbreekt: data/forum.json blijft zoals hij is.');
    return;
  }

  const repos = [];
  let after = null;
  do {
    const data = await graphql(REPOS, { org: ORG, after });
    const page = data.organization.repositories;
    repos.push(...page.nodes);
    after = page.pageInfo.hasNextPage ? page.pageInfo.endCursor : null;
  } while (after);

  const withDiscussions = repos
    .filter(r => r.hasDiscussionsEnabled && !r.isArchived)
    .sort((a, b) => a.name.localeCompare(b.name));
  const community = repos.find(r => r.name === COMMUNITY_REPO && r.hasDiscussionsEnabled);

  const discussions = [];
  const forums = [];
  for (const repo of withDiscussions) {
    const data = await graphql(DISCUSSIONS, { owner: ORG, name: repo.name });
    const d = data.repository.discussions;
    forums.push({ repo: repo.name, url: `${repo.url}/discussions`, count: d.totalCount });
    for (const n of d.nodes) {
      discussions.push({
        title: n.title,
        url: n.url,
        repo: repo.name,
        category: n.category ? n.category.name : null,
        author: n.author ? n.author.login : null,
        createdAt: n.createdAt,
        updatedAt: n.updatedAt,
        comments: n.comments.totalCount,
        answered: n.isAnswered === true,
      });
    }
  }
  discussions.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

  const out = {
    generated: new Date().toISOString(),
    community: {
      repo: `${ORG}/${COMMUNITY_REPO}`,
      exists: Boolean(community),
      url: `https://github.com/${ORG}/${COMMUNITY_REPO}/discussions`,
      newUrl: `https://github.com/${ORG}/${COMMUNITY_REPO}/discussions/new/choose`,
    },
    forums,
    discussions: discussions.slice(0, MAX_DISCUSSIONS),
  };
  fs.writeFileSync(OUT, JSON.stringify(out, null, 2) + '\n');
  console.log(`  data/forum.json: ${out.discussions.length} discussies uit ${forums.length} repo's` +
    (community ? '' : `, ${ORG}/${COMMUNITY_REPO} bestaat nog niet`));
}

// Never fails the pipeline: on an API problem the previous data/forum.json stays.
main().catch(err => {
  console.warn(`  generate-forum: ${err.message} (data/forum.json ongewijzigd)`);
});
