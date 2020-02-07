const config = require('./config.js');
const commands = require('./commands/index.js');

const mandatoryEnvVars = [
  'HEROKU_PIPELINE_ID',
  'HEROKU_API_KEY',
  'GITHUB_API_KEY',
  'SLACK_WEBHOOK_URL',
];

if (mandatoryEnvVars.some(key => !config[key])) {
  mandatoryEnvVars.forEach((envVar) => {
    if (!config[envVar]) console.log(`Please set ${envVar}`);
  });

  return;
}

const [command, ...tail] = args = process.argv.slice(2);

switch(command) {
  case commands.apps.NAME:
    commands.apps.handle(args);
    break;
  case commands.tests.NAME:
    commands.tests.handle(args);
    break;
  case commands.pulls.NAME:
    commands.pulls.handle(args);
    break;
  case '--help':
    console.log(commands.helpText);
    break;
  default:
    console.log(commands.helpText);
}
