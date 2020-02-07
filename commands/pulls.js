const chalk = require('chalk');
const fetch = require('node-fetch');
const figures = require('figures');
const cliSelect = require('cli-select');
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

  cliSelect({
    values: pullRequests,
    valueRenderer: (value, selected) => {
      const text = pullRequestText(value);

      if (selected) {
        return `${chalk.blue(text)}`;
      }

      return `${text}`;
    },
    selected: chalk.blue(figures.circleFilled),
    unselected: figures.circle,
  }).then((response) => {
    const link = response.value._links.html.href;

    console.log(`Opening ${link} in browser...`);
    openInBrowser(link);
  }).catch(error => null);
}

async function getPullRequests() {
  const spinner = ora('Fetching pull requests...').start()

  let pullRequests = await GithubService.listPullRequests();

  const pullRequestCount = pullRequests.length;
  const pullRequestIds = pullRequests.map(pr => pr.number);

  spinner.prefixText = `[0/${pullRequestCount}] `;

  pullRequests = [];

  let count = 1;

  for (var i = pullRequestIds.length - 1; i >= 0; i--) {
    spinner.prefixText = `[${count}/${pullRequestCount}] `;
    const pullRequest = await GithubService.getPullRequest(pullRequestIds[i]);
    count++;
    pullRequests.push(pullRequest);
  }

  spinner.stop();

  return pullRequests;
}

function pullRequestText(pullRequest) {
  const additions = chalk.green(`+${pullRequest.additions}`);
  const deletions = chalk.red(`+${pullRequest.deletions}`);
  const files = `files: ${pullRequest.changed_files}`;
  return `${pullRequest.title} ${files} ${additions} ${deletions}`
}

module.exports = {
  NAME,
  helpText,
  handle,
};