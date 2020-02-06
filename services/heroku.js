const config = require('../config.js');
const fetch = require('node-fetch');

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

async function getTestRun(id) {
  const res = await fetch(`${baseUrl}/test-runs/${id}`, { headers });
  const data = await res.json();

  return data;
}

async function listTestCases(testRunId) {
  const res = await fetch(`${baseUrl}/test-runs/${testRunId}/test-cases`, { headers });
  const data = await res.json();

  return data; 
}


async function listTestNodes(testRunId) {
  const res = await fetch(`${baseUrl}/test-runs/${testRunId}/test-nodes`, { headers });
  const data = await res.json();

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