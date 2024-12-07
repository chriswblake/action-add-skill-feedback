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

  // Check for required inputs
  if (!issueNumber) {
    core.setFailed('Missing required input: issue-number');
    exit(1);
  }
  if (!premadeCommentName && !fileLocation) {
    core.setFailed('Missing required input: premade-comment-name or file-location');
    exit(1);
  }
  
  try {
    // If repoUrl is not provided, use the context repo
    if (!repoUrl) {
      const { owner, repo } = github.context.repo;
      repoUrl = `https://github.com/${owner}/${repo}`;
    }

    // Extract owner and repo from the repoUrl
    const [owner, repo] = repoUrl.replace('https://github.com/', '').split('/');

    // Load premade comment or specified file
    switch (premadeCommentName) {
      case 'ready-waiting-to-check':
      case '0-ready-waiting-to-check':
        fileLocation = './comment-premade/0-ready-waiting-to-check.md';
        break;
      
      case 'checking':
      case '1-checking':
        fileLocation = './comment-premade/1-checking.md';
        break;
      
      case 'step-passed-preparing-next-step':
      case '2-step-passed-preparing-next-step':
        fileLocation = './comment-premade/2-step-passed-preparing-next-step.md';
        break;
      
      case 'congratulations':
      case 'x-congratulations':
        fileLocation = './comment-premade/x-congratulations.md';
        break;
    }
    const commentBody = loadCommentFromFile(fileLocation);
  } catch (error) {
    // Set the action as failed if an error occurs
    core.setFailed(error.message);
  }
/**
 * Get the ID of the most recent comment by the authenticated user on the specified issue.
 * @param {Object} octokit - The authenticated GitHub client.
 * @param {string} owner - The owner of the repository.
 * @param {string} repo - The name of the repository.
 * @param {number} issueNumber - The issue number.
 * @returns {number|null} - The ID of the most recent comment or null if no comment is found.
 */
async function getMostRecentCommentId(octokit, owner, repo, issueNumber) {

  // Get the list of comments on the issue
  const { data: comments } = await octokit.rest.issues.listComments({
    owner,
    repo,
    issue_number: issueNumber,
  });

  // Find the most recent comment by the authenticated user
  const mostRecentComment = comments.reverse().find(comment => comment.user.login === owner);

  // If there is a comment, return its id, otherwise return null
  return mostRecentComment ? mostRecentComment.id : null;
}

/**
 * Post a comment on the specified issue. Optionally update the most recent comment by the same user.
 * @param {Object} octokit - The authenticated GitHub client.
 * @param {string} owner - The owner of the repository.
 * @param {string} repo - The name of the repository.
 * @param {number} issueNumber - The issue number.
 * @param {boolean} updateRecent - Whether to replace the most recent comment by the same user.
 * @param {string} commentBody - The content of the comment.
 * @returns {Object} - The result of the comment creation or update.
 */
async function postComment(octokit, owner, repo, issueNumber, updateRecent, commentBody) {

  if (updateRecent) {
    // Get most recent comment from same user
    const mostRecentCommentId = await getMostRecentCommentId(octokit, owner, repo, issueNumber);
    
    // Update the comment
    const result = await octokit.rest.issues.updateComment({
      owner: owner,
      repo: repo,
      comment_id: mostRecentCommentId,
      body: commentBody
    });

    // Log the comment update
    core.info(`Comment updated:
      repo: ${owner}/${repo}
      issueId: ${issueNumber}
      commentId: ${mostRecentCommentId}
    `);

    return result;
  } else
  {
    // Create a new comment
    const result = await octokit.rest.issues.createComment({
      owner: owner,
      repo: repo,
      issue_number: issueNumber,
      body: commentBody
    });

    // Log the comment creation
    const commentId = result.data.id;
    core.info(`Comment created:
      repo: ${owner}/${repo}
      issueId: ${issueNumber}
      commentId: ${commentId}
    `);

    return result;
  }
}

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
