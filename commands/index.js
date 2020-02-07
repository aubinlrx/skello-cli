const apps = require('./apps.js');
const tests = require('./tests.js');
const pulls = require('./pulls.js');

const helpText =
`usage: skello [--help] <command>

These are common Skello commands used in various sitations:

  apps Manage active review apps
`;

module.exports = {
  helpText,
  apps,
  tests,
  pulls,
};