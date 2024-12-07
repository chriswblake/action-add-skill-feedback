const core = require('@actions/core');
const github = require('@actions/github');
const fs = require('fs');
const path = require('path');
const { exit } = require('process');

/**
 * Main function to run the GitHub Action.
 * Note: Values are passed using destructuring so optionality is similar worklow inputs.
 * @param {string} repoUrl - The URL of the repository.
 * @param {number} issueNumber - The issue number to post the comment to.
 * @param {string} premadeCommentName - The name of a premade comment.
 * @param {string} fileLocation - The location of a markdown file to be loaded as the comment.
 * @param {boolean} updateRecent - Whether to replace the most recent comment by the same user.
 */
async function runAction({repoUrl, issueNumber, premadeCommentName, fileLocation, updateRecent, }) {
  core.info(`Running action with inputs:
    repoUrl: ${repoUrl}
    issueNumber: ${issueNumber}
    premadeCommentName: ${premadeCommentName}
    fileLocation: ${fileLocation}
    updateRecent: ${updateRecent}
  `);

// If ran as a github action, pass workflow's inputs to the action
if (process.env.GITHUB_ACTIONS) {
  runAction({
    repoUrl: core.getInput('repo-url'),
    issueNumber: core.getInput('issue-number'),
    premadeCommentName: core.getInput('premade-comment-name'),
    fileLocation: core.getInput('file-location'),
    updateRecent: core.getInput('update-recent') === 'true',
  });
}
