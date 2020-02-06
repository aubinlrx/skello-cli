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

const args = process.argv.slice(2);

if (args[0] === 'apps') {
  const subCommand = args[1];

  if (args.includes('--help')) {
    console.log(commands.apps.helpText);
  } else if (subCommand === 'list') {
    commands.apps.list();
  } else if (subCommand === 'push') {
    commands.apps.push();
  } else if (subCommand === 'open') {
    commands.apps.open(args[2]);
  } else {
    console.log(commands.apps.helpText);
  }
} else if (args[0] === 'tests') {
  const subCommand = args[1];

  if (args.includes('--help')) {
    console.log(commands.tests.helpText);
  } else if (subCommand === 'status') {
    commands.tests.status(args[2]);
  } else if (subCommand === 'list') {
    commands.tests.list();
  } else {
    console.log(commands.tests.helpText);
  }
} else if (args.includes('--help')) {
  console.log(commands.helpText);
} else {
  console.log(commands.helpText);
}
