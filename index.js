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

if (args[0] === 'review-app') {
  const subCommand = args[1];

  if (args.includes('--help')) {
    console.log(commands.reviewApp.helpText);
  } else if (subCommand === 'list') {
    commands.reviewApp.list();
  } else if (subCommand === 'push') {
    commands.reviewApp.push();
  } else {
    console.log(commands.reviewApp.helpText);
  }
} else if (args.includes('--help')) {
  console.log(commands.helpText);
} else {
  console.log(commands.helpText);
}
