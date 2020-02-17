const chalk = require('chalk');
const openInBrowser = require('open');
const fetch = require('node-fetch');
const _ = require('lodash');
const moment = require('moment');
const currentBranchName = require('current-git-branch');
const inquirer = require('inquirer');
const ora = require('ora');

// Services
const HerokuService = require('../services/heroku.js');

/*
* [NAME]
*/
const NAME = 'tests';

/*
* [HELP] tests help message
*/
const helpText =
`
${chalk.bold('NAME')}
    skello-tests: Manage CI tests

${chalk.bold('SYNOPSIS')}
    ${chalk.underline('skello')} ${chalk.underline(NAME)} ${chalk.underline('status')} [branch-name]
    ${chalk.underline('skello')} ${chalk.underline(NAME)} ${chalk.underline('list')}
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
    case 'status':
      status(branchName);
      break;
    case 'list':
      list();
      break;
    default:
      console.log(helpText);
  }
}

/*
* [COMMAND] skello tests status:
*/
async function status(branchName) {
  branchName = branchName === undefined ? currentBranchName() : branchName;

  console.log("Test status for git branch", chalk.cyan(branchName));
  const tests = await HerokuService.listTestRuns();
  const test = tests.find(t => t.commit_branch === branchName);
  if (test === undefined) {
    console.log(chalk.red("No test found."));
    return;
  }

  const result = await parseTestFailuresFor(test);
  if (typeof result === 'object') {
    Object.keys(result).forEach((nodeId) => {
      console.log(`Node #${nodeId}`);

      if (result[nodeId].length === 0) {
        console.log('   Failures parsing for this node not implemented.');
      } else {
        result[nodeId].forEach((error) => {
          console.log(`   ${error}`);
        });
      }
    });
  }
}

function getTestName(test) {
  let icon;

  switch (test.status) {
    case 'succeeded':
      icon = chalk.green('✔');
      break;
    case 'failed':
      icon = chalk.red('✖');
      break;
    case 'building':
      icon = chalk.yellow('⧖');
      break;
    default:
      icon = chalk.yellow('…');
      break;
  }

  // Keep first line of commit message
  const lf = test.commit_message.indexOf("\n");
  if (lf != -1) {
    test.commit_message = test.commit_message.substr(0, lf);
  }

  const branchName = chalk.bold(`[${test.commit_branch}]`);
  return `${icon} ${branchName} ${test.commit_message}`;
}

/*
* [COMMAND] skello tests list:
*/
async function list() {
  const spinner = ora(`Loading failed test runs...`).start();
  let tests = await HerokuService.listTestRuns();
  spinner.stop();

  tests = _.sortBy(tests, (test) => moment(test.updated_at).format('X')).reverse();

  tests = _.uniqBy(tests, (test) => test.commit_branch);

  inquirer
    .prompt({
      name: 'test',
      message: 'Please choose a branch:',
      type: 'list',
      choices: tests.map(test => ({name: getTestName(test), value: test })),
      pageSize: 20,
    })
    .then(async function(answers) {
      const spinner = ora(`Loading failures ouput...`).start();
      const result = await parseTestFailuresFor(answers.test);
      spinner.stop();

      if (result) {
        Object.keys(result).forEach((nodeId) => {
          console.log(`Node #${nodeId}`);

          if (result[nodeId].length === 0) {
            console.log('   Failures parsing for this node not implemented.');
          } else {
            result[nodeId].forEach((error) => {
              console.log(`   ${error}`);
            });
          }
        });
      }
    });
}

async function parseTestFailuresFor(test) {
  let nodes = await HerokuService.listTestNodes(test.id);

  if (test.status === 'succeeded') {
    console.log(chalk.green('All tests passed successfully.'));
    return;
  }

  if (test.status === 'building') {
    console.log(chalk.yellow('Test suite is still building.'));
    return;
  }

  if (test.status === 'running') {
    const delta = moment(moment.now()).diff(test.created_at, 'minutes');
    console.log(chalk.yellow(`Running since ${delta} minutes...`));
  }

  nodes = _.sortBy(nodes, (node) => node.index);
  const result = {};

  for (let i = nodes.length - 1; i >= 0; i--) {
    let node = nodes[i]

    if (node.status == 'failed') {
      const res = await fetch(node.output_stream_url);
      const data = await res.text();

      result[node.index] = [];

      data.split('\n').forEach((line) => {
        const rspecMatch = line.match(/^rspec\s+(.+):(\d+)/)

        if (rspecMatch) {
          result[node.index].push(rspecMatch[0]);
        }

        const rubocopMatch = line.match(/^(.+):(\d+):(\d+):(.+)/)

        if (rubocopMatch) {
          result[node.index].push(rubocopMatch[0]);
        }

        const minitestMatch = line.match(/^bin\/rails\stest\s(.+):(\d+)/)

        if (minitestMatch) {
          result[node.index].push(minitestMatch[0]);
        }
      });
    }
  }

  return result;
}

module.exports = {
  NAME,
  helpText,
  handle,
};
