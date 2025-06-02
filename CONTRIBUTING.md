# Contributing to LLmpeg

First off, thank you for considering contributing to LLmpeg! It's people like you that make LLmpeg such a great tool.

## Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check existing issues as you might find out that you don't need to create one. When you are creating a bug report, please include as many details as possible:

* Use a clear and descriptive title
* Describe the exact steps which reproduce the problem
* Provide specific examples to demonstrate the steps
* Describe the behavior you observed after following the steps
* Explain which behavior you expected to see instead and why
* Include your system details (OS, Node.js version, etc.)

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, please include:

* Use a clear and descriptive title
* Provide a step-by-step description of the suggested enhancement
* Provide specific examples to demonstrate the steps
* Describe the current behavior and explain which behavior you expected to see instead
* Explain why this enhancement would be useful

### Pull Requests

* Fork the repo and create your branch from `master`
* If you've added code that should be tested, add tests
* Ensure the test suite passes
* Make sure your code lints
* Issue that pull request!

## Development Process

1. Fork the repository
2. Clone your fork
   ```bash
   git clone https://github.com/your-username/llmpeg.git
   cd llmpeg
   ```

3. Install dependencies
   ```bash
   bun install
   ```

4. Create a branch
   ```bash
   git checkout -b feature/your-feature-name
   ```

5. Make your changes
   * Write or update tests as needed
   * Follow the existing code style
   * Update documentation as needed

6. Run tests and linting
   ```bash
   bun run test:types
   bun run lint
   bun run format
   ```

7. Commit your changes
   ```bash
   git commit -m "feat: add some amazing feature"
   ```
   
   We follow [Conventional Commits](https://www.conventionalcommits.org/) specification:
   * `feat:` new feature
   * `fix:` bug fix
   * `docs:` documentation changes
   * `style:` formatting, missing semi colons, etc
   * `refactor:` code change that neither fixes a bug nor adds a feature
   * `test:` adding missing tests
   * `chore:` maintain

8. Push to your fork
   ```bash
   git push origin feature/your-feature-name
   ```

9. Open a Pull Request

## Style Guide

### TypeScript Style Guide

* Use TypeScript for all new code
* Follow the existing code style
* Use meaningful variable names
* Add types to all function parameters and return values
* Avoid `any` types

### Commit Messages

* Use the present tense ("Add feature" not "Added feature")
* Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
* Limit the first line to 72 characters or less
* Reference issues and pull requests liberally after the first line

## Additional Notes

### Issue and Pull Request Labels

* `bug` - Something isn't working
* `enhancement` - New feature or request
* `good first issue` - Good for newcomers
* `help wanted` - Extra attention is needed
* `question` - Further information is requested
* `documentation` - Improvements or additions to documentation
* `duplicate` - This issue or pull request already exists
* `invalid` - This doesn't seem right
* `wontfix` - This will not be worked on

Thank you for contributing! 🎉