const { loadCommentFromFile } = require('./index');
// Methods
test('loadCommentFromFile - Correctly loads and replaces variables in the markdown file', () => {
    // Arrange
    const fileLocation = './comment-premade/x-congratulations.md';
    process.env.GITHUB_REPOSITORY = 'chriswblake/introduction-to-github-v2';

    // Act
    const content = loadCommentFromFile(fileLocation);

    // Assert
    expect(content).not.toBeNull();
    expect(content).toContain('Congratulations');
    expect(content).toContain('chriswblake/introduction-to-github-v2');
    expect(content).not.toContain('${{ github.repository }}');
});
