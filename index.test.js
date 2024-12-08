jest.setTimeout(5 * 60 * 1000);

// Main
test.skip('runAction - using template name. No variables ', async () => {
    // Context
    // - Environment variable `GITHUB_TOKEN` is set and has access to the repo.
    // - Issue is already created in that repo with number 1.

    // Arrange
    
    // Act
    await runAction({
        repoUrl: 'chriswblake/skills-introduction-to-github',
        issueNumber: 1,
        
        commentTemplate: 'checking-work',
        updateRecent: false
    });

    // Assert
    // Must be manually checked for now
});

test.skip('runAction - using template name', async () => {
    // Context
    // - Environment variable `GITHUB_TOKEN` is set and has access to the repo.
    // - Issue is already created in that repo with number 1.

    // Arrange
    
    // Act
    await runAction({
        repoUrl: 'chriswblake/skills-introduction-to-github',
        issueNumber: 1,

        commentTemplate: 'lesson-finished',
        commentTemplateVars: JSON.stringify({
            'github': {
                'owner': 'chriswblake',
                'repo': 'introduction-to-github',
            }
        }),
        updateRecent: true
    });

    // Assert
    // Must be manually checked for now
});

test.skip('runAction - using file path', async () => {
    // Context
    // - Environment variable `GITHUB_TOKEN` is set and has access to the repo.
    // - Issue is already created in that repo with number 1.

    // Arrange
    
    // Act
    await runAction({
        repoUrl: 'chriswblake/skills-introduction-to-github',
        issueNumber: 1,
        updateRecent: true,

        commentTemplateFile: './templates/lesson-finished.md',
        commentTemplateVars: JSON.stringify({
            'github': {
                'owner': 'chriswblake',
                'repo': 'introduction-to-github',
            }
        })

    });

    // Assert
    // Must be manually checked for now
});


// Methods
test('loadCommentFromFile - using template name. No variables', () => {
    // Arrange
    
    // Act
    const content = loadCommentFromFile({
        commentTemplate: 'checking-work', 
    });

    // Assert
    expect(content).not.toBeNull();
    expect(content).toContain('inspectocat');
    expect(content).toContain('Looks like you are making progress');
});

test('loadCommentFromFile - using template name', () => {
    // Arrange
    
    // Act
    const content = loadCommentFromFile({
        commentTemplate: 'lesson-finished', 
        commentTemplateVars: {
            'github': {
                'owner': 'chriswblake',
                'repo': 'introduction-to-github',
            }
        }
    });

    // Assert
    expect(content).not.toBeNull();
    expect(content).toContain('Congratulations **chriswblake**');
    expect(content).toContain('chriswblake/introduction-to-github');
    expect(content).not.toContain('${{ github.repository }}');
});

test('loadCommentFromFile - using file path', () => {
    // Arrange
    
    // Act
    const content = loadCommentFromFile({
        commentTemplateFile: './templates/lesson-finished.md', 
        commentTemplateVars: {
            'github': {
                'owner': 'chriswblake',
                'repo': 'introduction-to-github',
            }
        }
    });

    // Assert
    expect(content).not.toBeNull();
    expect(content).toContain('Congratulations **chriswblake**');
    expect(content).toContain('chriswblake/introduction-to-github');
    expect(content).not.toContain('${{ github.repository }}');
});

