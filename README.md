# Action: Add Skill Feedback

Select a premade feedback message and post it as a comment on an Issue.
  - Action includes some premade messages.
  - Option to load a message from a markdown file.
  - Replaces some special variables in the feedback message.

## Workflow Inputs

| Input Name | Description | Required | Default |
| ---------- | ----------- | -------- | ------- |
| `repo-url` | The url of the repository where the issue is located. | No | same repository |
| `issue-number` | The issue number to post the comment to. | Yes | - |
| `premade-comment-name`| The name of a premade comment. Overrides file-location if provided. | No | - |
| `file-location` | The location of a markdown file (.md) to be loaded as the comment. | No | - |
| `update-recent` | Replace the most recent comment by the same user. | No | `false` |

### Premade Comment Options
Below are the optional values for the `premade-comment-name` input. Click the name to preview the comment.

| Comment Name | When to Use | Description |
|--------------|-------------|-------------|
| [`ready-waiting-to-check`](comment-premade/0-ready-waiting-to-check.md) | After new lessons steps have been shared. | Informs user that they have steps to complete. |
| [`checking`](comment-premade/1-checking.md) | At the beginning of a "check work" workflow. | Informs user their work is being evaulated, and to wait a moment. |
| [`step-passed-preparing-next-step`](comment-premade/2-step-passed-preparing-next-step.md) | At the end of a "check work" workflow. | Informs users that they completed all steps and more are coming. |
| [`congratulations`](comment-premade/x-congratulations.md) | After the ***entire*** Skill course is finished. | Let's the user know they are finished. Congratulates them for it! |

## Examples

> [!IMPORTANT]
> The issue must already exist. In the below examples, that is issue `#1`.  

### Example - Premade comment

```yml
name: Congratulation Completion
on: push:
permissions:
  issues: write
jobs:
  add-feedback:
    runs-on: ubuntu-latest
    steps:
      - name: Congratulate finishing the Skill
        uses: chriswblake/action-add-skill-feedback@v1
        with:
          issue-number: 1
          comment-template: 'lesson-finished'
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### Example - Comment from a file

`./my-comment.md`
```md
🤷 Having trouble? Here are some resources that might help.
... 
(some custom content)
...
```

`.github/workflows/my-workflow.yml`
```yml
name: my-workflow
on: push:
permissions:
  issues: write
jobs:
  add-feedback:
    runs-on: ubuntu-latest
    steps:
      - name: Congratulate finishing the Skill
        uses: chriswblake/action-add-skill-feedback@v1
        with:
          issue-number: 1
          comment-template-file: './my-comment.md'
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### Example - Premade comment template with variables

```yml
name: Template with Variables
on: push:
permissions:
  issues: write
jobs:
  add-feedback:
    runs-on: ubuntu-latest
    steps:
      - name: Provide feedback about mistake
        uses: chriswblake/action-add-skill-feedback@v1
        with:
          issue-number: 1
          comment-template: 'teacher'
          comment-template-vars: '{
            "title": "Having trouble?",
            "body": "The following tips might help! ..."
          }'
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```


&copy; 2024 GitHub &bull; [Code of Conduct](https://www.contributor-covenant.org/version/2/1/code_of_conduct/code_of_conduct.md) &bull; [MIT License](https://gh.io/mit)