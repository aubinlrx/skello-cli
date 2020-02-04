const config = require('../config.js');
const fetch = require('node-fetch');

const baseUrl = 'https://api.github.com/repos/Samy-Amar/Skello';
const headers = {
  'Accept': 'Accept: application/vnd.github.v3+json',
  'Authorization': `token ${config.GITHUB_API_KEY}`,
};

async function listPullRequests() {
  const res = await fetch(`${baseUrl}/pulls?page=1&per_page=100`, { headers });
  const data = await res.json();

  return data;
}

module.exports = {
  listPullRequests,
};
