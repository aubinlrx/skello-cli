const chalk = require('chalk');
const fetch = require('node-fetch');
const inquirer = require('inquirer');
const ora = require('ora');
const openInBrowser = require('open');
const { parseSorter } = require('../utils/cli.js');
const _ = require('lodash');

// Services
const GithubService = require('../services/github.js')

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
      list(parseSorter(tail));
      break;
    default:
      console.log(helpText);
  }
}

/*
* [COMMAND] list - list all open pull requests
*/
async function list(sorter) {
  let pullRequests = [];

  pullRequests = await getPullRequests();

  if (sorter) {
    pullRequests = _.sortBy(pullRequests, sorter.fields);
    if (sorter.direction === 'desc') pullRequests.reverse();
  }

  inquirer
    .prompt({
      type: 'list',
      name: 'pull_request',
      choices: pullRequests.map(pr => ({ name: getPullRequestName(pr), value: pr })),
      message: 'Select pull request:',
      pageSize: 50
    })
    .then(answers => {
      const link = answers.pull_request.html_url;

      console.log(`Opening ${link} in browser...`);
      openInBrowser(link);
    });
}

async function getPullRequests() {
  const spinner = ora('Fetching pull requests...').start()

  let pullRequests = await GithubService.listPullRequests();

  const pullRequestCount = pullRequests.length;
  const pullRequestIds = pullRequests.map(pr => pr.number);

  spinner.prefixText = `[0/${pullRequestCount}] `;

  pullRequests = [];

  let count = 1;

  for (let i = pullRequestIds.length - 1; i >= 0; i--) {
    spinner.prefixText = `[${count}/${pullRequestCount}] `;
    const pullRequest = await GithubService.getPullRequest(pullRequestIds[i]);
    count++;
    pullRequests.push(pullRequest);
  }

  spinner.stop();

  return pullRequests;
}

/**
 * @return name to display in menu
 */
function getPullRequestName(pullRequest) {
  const messageMaxLength = 60;
  const additions = chalk.green(`+${pullRequest.additions}`);
  const deletions = chalk.red(`+${pullRequest.deletions}`);
  const files = `${pullRequest.changed_files} file${pullRequest.changed_files > 1 ? 's' : ''}`;

  const commitMessage = pullRequest.title.length > messageMaxLength
    ? pullRequest.title.substr(0, messageMaxLength) + '…'
    : pullRequest.title;
  return `${commitMessage} - ${chalk.blue(pullRequest.user.login)} - ${files}, ${additions} ${deletions}`
}

module.exports = {
  NAME,
  helpText,
  handle,
};
