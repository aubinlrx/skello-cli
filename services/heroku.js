const config = require('../config.js');
const fetch = require('node-fetch');
const cache = require('../utils/cache.js');

const baseUrl = 'https://api.heroku.com';
const headers = { 
  'Accept': 'application/vnd.heroku+json; version=3',
  'Authorization': `Bearer ${config.HEROKU_API_KEY}`,
};

async function listApps() {
  const res = await fetch(`${baseUrl}/apps`, { headers });
  const data = await res.json();
  
  return data;
}

async function listReviewApps() {
  const res = await fetch(`${baseUrl}/pipelines/${config.HEROKU_PIPELINE_ID}/review-apps`, { headers });
  const data = await res.json();

  return data;
}

async function listTestRuns() {
  const res = await fetch(`${baseUrl}/pipelines/${config.HEROKU_PIPELINE_ID}/test-runs`, { headers });
  const data = await res.json();

  return data;
}

async function getTestRun(testRunId) {
  const cacheKey = `test-run-${testRunId}`;
  const cachedData = await cache.get(cacheKey);

  if (cachedData) return cachedData;

  const res = await fetch(`${baseUrl}/test-runs/${testRunId}`, { headers });
  const data = await res.json();

  await cache.set(cacheKey, data, 3 * 60 * 1000); // 3 minutes

  return data;
}

async function listTestCases(testRunId) {
  const cacheKey = `test-runs-${testRunId}-test-cases`;
  const cachedData = await cache.get(cacheKey);

  if (cachedData) return cachedData;

  const res = await fetch(`${baseUrl}/test-runs/${testRunId}/test-cases`, { headers });
  const data = await res.json();

  await cache.set(cacheKey, data, 3 * 60 * 1000); // 3 minutes

  return data; 
}


async function listTestNodes(testRunId) {
  const cacheKey = `test-runs-${testRunId}-test-nodes`;
  const cachedData = await cache.get(cacheKey);

  if (cachedData) return cachedData;

  const res = await fetch(`${baseUrl}/test-runs/${testRunId}/test-nodes`, { headers });
  const data = await res.json();

  await cache.set(cacheKey, data, 3 * 60 * 1000); // 3 minutes

  return data;
}


module.exports = {
  listApps,
  listReviewApps,
  listTestRuns,
  getTestRun,
  listTestCases,
  listTestNodes,
};