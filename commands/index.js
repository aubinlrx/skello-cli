const reviewApp = require('./review_app.js');

const helpText =
`usage: skello [--help] <command>

These are common Skello commands used in various sitations:

  review-app Manage active review apps
`;

module.exports = {
  helpText,
  reviewApp,
};