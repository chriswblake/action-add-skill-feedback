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

/**
 * Load the content of a markdown file and replace supported variables from github workflow context.
 * @param {string} fileLocation - The location of the markdown file.
 * @returns {string} - The content of the file with variables replaced.
 */
function loadCommentFromFile(fileLocation) {
  // Load markdown file content
  const filePath = path.resolve(fileLocation);
  let content = fs.readFileSync(filePath, 'utf8');

  // Replace supported variables. Example: ${{ github.repository }} -> owner/repo
  supported_variables = {
    'github.repository': `${github.context.repo.owner}/${github.context.repo.repo}`,
    'inputs.repo-url': core.getInput('repo-url')
  }
  for (const [key, value] of Object.entries(supported_variables)) {
    content = content.replace(new RegExp(`\\$\\{\\{\\s*${key}\\s*\\}\\}`, 'g'), value);
  }

  return content;
}

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

// Export functions to enable unit testing
module.exports = {
  loadCommentFromFile
};
