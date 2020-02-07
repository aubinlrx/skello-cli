const cliSelect = require('cli-select');
const chalk = require('chalk');
const openInBrowser = require('open');
const ora = require('ora');
const figures = require('figures');
const moment = require('moment');
const _ = require('lodash');
const currentBranchName = require('current-git-branch');

// Services
const SlackService = require('../services/slack.js');
const GithubService = require('../services/github.js');
const HerokuService = require('../services/heroku.js');

const NAME = 'apps';

/*
* [HELP] review-app help message
*/
const helpText =
`
${chalk.bold('NAME')}
    skello-apps Manage active review apps

${chalk.bold('SYNOPSIS')}
    ${chalk.underline('skello')} ${chalk.underline(NAME)} ${chalk.underline('list')}
    ${chalk.underline('skello')} ${chalk.underline(NAME)} ${chalk.underline('push')}
    ${chalk.underline('skello')} ${chalk.underline(NAME)} ${chalk.underline('open')}
`;

/*
* [HANDLER]
*/
function handle(args) {
  const [_, subCommand, branchName, ...tail] = args;

  if (args.includes('--help')) {
    console.log(helpText);
    return;
  }

  switch(subCommand) {
    case 'list':
      list();
      break;
    case 'push':
      push();
      break;
    case 'open':
      open(branchName);
      break;
    default:
      console.log(helpText);
  }
}

/*
* [COMMAND] skello review-app list: list all active review app and permit to open them in browser
*/
async function list() {
  const values = await getAppInfos();

  console.log(`${chalk.red.bold('?')} Please choose an app to open:`);

  cliSelect({
    values: values,
    valueRenderer: (value, selected) => {
      if (selected) {
        return `${chalk.blue.bold.underline(value.text)}`;
      }

      return `${value.text}`;
    },
    selected: chalk.blue(figures.circleFilled),
    unselected: figures.circle,
  }).then(response => {
      console.log(`Opening ${response.value.pullRequest.head.ref} in browser...`);
      openInBrowser(response.value.url);
    })
    .catch(error => null)
}

/*
* [COMMAND] skello review-app push: push all active review app in Slack
*/
async function push() {
  const values = await getAppInfos();

  let slackMessage = 'Here is an update on Review Apps:\n\n';

  sortedValues = _.sortBy(values, value => moment(value.app.updated_at).format('X')).reverse();

  slackMessage += sortedValues.reduce(function(memo, value) {
    memo += `<${value.url}|${value.pullRequest.title}> (updated ${moment(value.app.updated_at).fromNow()}) | *${value.pullRequest.user.login}*\n`;
    return memo;
  }, '');

  console.log('Sending review apps to slack...');

  SlackService.notify(slackMessage);
}

/*
* [COMMAND] skello apps open <branch> | [current]: open a specific branch
*/
async function open(branchName) {
  if (!branchName || branchName === '') {
    console.log('Please enter a valid branch name or the current keyword.');
    return;
  }

  if (branchName === 'current') {
    openAppByBranchName(currentBranchName());
  } else {
    openAppByBranchName(branchName);
  }
}

async function openAppByBranchName(branchName) {
  const spinner = ora(`Loading app infos for ${branchName}...`).start();
  const reviewApps = await HerokuService.listReviewApps();
  const apps = await HerokuService.listApps();
  spinner.stop();

  const reviewApp = reviewApps.find(ra => ra.branch === branchName);

  if (reviewApp) {
    const app = apps.find(a => a.id === reviewApp.app.id);

    if (app) {
      openInBrowser(app.web_url);  
    } else {
      console.log('Can\'t open review app.')
    }
  } else {
    console.log('The review app doesn\t exist.');
  }
}

async function getAppInfos() {
  const spinner = ora('Loading review apps...').start();

  const pulls = await GithubService.listPullRequests();
  const apps = await HerokuService.listApps();
  const reviewApps = await HerokuService.listReviewApps();

  spinner.stop();

  let values = reviewApps.map((reviewApp) => {
    const app = apps.find(app => app.id === reviewApp.app.id);
    const pullRequest = pulls.find(pull => reviewApp.branch === pull.head.ref);
    const data = {
      pullRequest: pullRequest,
      reviewApp: reviewApp,
      app: app
    };

    if (pullRequest) {
      const isMerged = pullRequest.merged_at !== null;
      const isClosed = pullRequest.closed_at !== null;

      const text = `[${pullRequest.head.ref}] - Author: ${pullRequest.user.login} | Head: ${pullRequest.base.ref}`;

      if (isMerged) text += ' [Merged]';
      if (isClosed) text += ' [Closed]';

      data.text = text;
      data.url = app.web_url;

      return data;
    }

    return null;
  });

  return values;
}

module.exports = {
  NAME,
  helpText,
  handle,
  push,
  list,
  open,
};