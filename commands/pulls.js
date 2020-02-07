const chalk = require('chalk');

/*
* [NAME]
*/
const NAME = 'pulls';

/*
* [HELP] review-app help message
*/
const helpText =
`
${chalk.bold('NAME')}
    skello-pulls Manage pulls requests

${chalk.bold('SYNOPSIS')}
    ${chalk.underline('skello')} ${chalk.underline(NAME)} ${chalk.underline('list')}
`;

/*
* [HANDLER]
*/
function handle(args) {
  const [_, subCommand, ...tail] = args;

  if (args.includes('--help')) {
    console.log(helpText);
    return;
  }

  switch(subCommand) {
    case 'list':
      list();
      break;
    default:
      console.log(helpText);
  }
}

module.exports = {
  NAME,
  helpText,
  handle,
};