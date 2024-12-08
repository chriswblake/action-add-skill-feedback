const { loadCommentFromFile } = require('./index');
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
        commentTemplate: 'x-congratulations', 
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
        commentTemplateFile: './comment-premade/x-congratulations.md', 
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

