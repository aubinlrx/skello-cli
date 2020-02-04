const config = require('../config.js');
const fetch = require('node-fetch');

const header = {
  'Content-Type': 'application/json',
};

async function notify(text) {
  const body = JSON.stringify({ text });
  const res = await fetch(config.SLACK_WEBHOOK_URL, { method: 'POST', header, body });
}

module.exports = {
  notify,
};