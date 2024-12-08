const core = require('@actions/core');
const github = require('@actions/github');
const fs = require('fs');
const path = require('path');
const mustache = require('mustache');
const { exit } = require('process');

/**
 * Main function to run the GitHub Action.
 * Note: Values are passed using destructuring so optionality is similar worklow inputs.
 * @param {string} repoUrl - The URL of the repository.
 * @param {number} issueNumber - The issue number to post the comment to.
 * @param {string} commentTemplate - The name of a premade template.
 * @param {string} commentTemplateFile - The location of a markdown file to be used as the template.
 * @param {object|string} commentTemplateVars - A JSON array of variables to be replaced in the template, or the string representation.
 * @param {boolean} updateRecent - Whether to replace the most recent comment by the same user.
 */
async function runAction({repoUrl, issueNumber, commentTemplate, commentTemplateFile, commentTemplateVars, updateRecent }) {
  core.info(`Running action with inputs:
    repoUrl: ${repoUrl}
    issueNumber: ${issueNumber}
    commentTemplate: ${commentTemplate}
    commentTemplateFile: ${commentTemplateFile}
    commentTemplateVars: ${commentTemplateVars}
    updateRecent: ${updateRecent}
  `);

  // Check inputs
  if (!issueNumber) {
    core.setFailed('Missing required input: issue-number');
    exit(1);
  }
  if (commentTemplate && commentTemplateFile) {
    core.setFailed("Please pick only one: 'comment-template' or 'comment-template-file'");
    exit(1);
  }
  if (!commentTemplate && !commentTemplateFile) {
    core.setFailed("Missing required input: 'comment-template' or 'comment-template-file'");
    exit(1);
  }

  // Try to convert commentTemplateVars to JSON
  if (typeof commentTemplateVars === 'string' && commentTemplateVars.length > 0) {
    try {
      commentTemplateVars = JSON.parse(commentTemplateVars);
    } catch (error) {
      core.setFailed("Invalid JSON input: 'comment-template-vars'");
      exit(1);
    }
  }
  
  try {
    // If repoUrl is not provided, use the context repo
    if (!repoUrl) {
      const { owner, repo } = github.context.repo;
      repoUrl = `https://github.com/${owner}/${repo}`;
    }

    // Extract owner and repo from the repoUrl
    const [owner, repo] = repoUrl.replace('https://github.com/', '').split('/');

    // Load the comment using a template
    const commentBody = loadCommentFromFile({
      commentTemplate,
      commentTemplateFile,
      commentTemplateVars
    });

    // Create an authenticated GitHub client
    const token = process.env.GITHUB_TOKEN;
    if (!token) {
      throw new Error('GITHUB_TOKEN is not set');
    }
    const octokit = github.getOctokit(token);
    
    // Post the comment
    const result = await postComment(
      octokit,
      owner,
      repo,
      issueNumber,
      updateRecent,
      commentBody
    );

  } catch (error) {
    // Set the action as failed if an error occurs
    core.setFailed(error.message);
    exit(1);
  }
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
  const { data: { login } } = await octokit.rest.users.getAuthenticated(); // github-actions[bot]
  const mostRecentComment = comments.reverse().find(comment => comment.user.login === login);

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
 * Load the content of a markdown file and replace variables.
 * @param {string} commentTemplate - Name of a premade template.
 * @param {string} commentTemplateFile - Location of a markdown file template. Ignored if commentTemplate is set.
 * @param {object} commentTemplateVars - A JSON object with variables to be replaced in the markdown text.
 * @returns {string} - The content of the file with variables replaced.
 */
function loadCommentFromFile({commentTemplate, commentTemplateFile, commentTemplateVars}) {
 
  // If commentTemplate is set, override commentTemplateFile
  if (commentTemplate) {
    const fl = path.resolve(__dirname, 'templates', commentTemplate+'.md');
    if (fs.existsSync(fl)) {
      commentTemplateFile = fl;
    }else
    {
      core.setFailed("Unknown Template: " + commentTemplate);
      exit(1);
    }
  }

  // Load markdown file as template
  const filePath = path.resolve(commentTemplateFile);
  let template = fs.readFileSync(filePath, 'utf8');

  // Replace variables in template.
  const output = mustache.render(template, commentTemplateVars);

  return output;
}

// If ran as a github action, pass workflow's inputs to the action
if (process.env.GITHUB_ACTIONS) {
  runAction({
    repoUrl: core.getInput('repo-url'),
    issueNumber: core.getInput('issue-number'),
    commentTemplate: core.getInput('comment-template'),
    commentTemplateFile: core.getInput('comment-template-file'),
    commentTemplateVars: core.getInput('comment-template-vars'),
    updateRecent: core.getInput('update-recent') === 'true',
  });
}

// Export functions to enable unit testing
module.exports = {
  runAction,
  loadCommentFromFile
};
