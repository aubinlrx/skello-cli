const config = require('../config.js');
const fetch = require('node-fetch');
const cache = require('../utils/cache.js');

const baseUrl = 'https://api.github.com/repos/skelloapp/skello-app';
const headers = {
  'Accept': 'Accept: application/vnd.github.v3+json',
  'Authorization': `token ${config.GITHUB_API_KEY}`,
};

async function listPullRequests() {
  const cacheKey = `pull-requests`;
  const cachedData = await cache.get(cacheKey);

  if (cachedData) return cachedData;

  const res = await fetch(`${baseUrl}/pulls?page=1&per_page=100`, { headers });
  const data = await res.json();

  await cache.set(cacheKey, data, 3 * 60 * 1000); // 3 minutes

  return data;
}

async function getPullRequest(number) {
  const cacheKey = `pull-request-${number}`;
  const cachedData = await cache.get(cacheKey);

  if (cachedData) return cachedData;

  const res = await fetch(`${baseUrl}/pulls/${number}`, { headers });
  const data = await res.json();

  await cache.set(cacheKey, data,  30 * 60 * 1000); // 30 minutes

  return data;
}

module.exports = {
  listPullRequests,
  getPullRequest,
};
