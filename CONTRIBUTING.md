# Contributing to Crawl4AI MCP Server

Thank you for your interest in contributing to the Crawl4AI MCP Server! This document provides guidelines and instructions for contributing to the project.

## Table of Contents

- [Contributing to Crawl4AI MCP Server](#contributing-to-crawl4ai-mcp-server)
  - [Table of Contents](#table-of-contents)
  - [Code of Conduct](#code-of-conduct)
  - [Getting Started](#getting-started)
  - [Development Workflow](#development-workflow)
  - [Pull Request Process](#pull-request-process)
  - [Coding Standards](#coding-standards)
  - [Commit Message Guidelines](#commit-message-guidelines)
  - [Testing](#testing)
  - [Documentation](#documentation)
  - [Branch Strategy](#branch-strategy)
  - [Release Process](#release-process)
  - [Thank You](#thank-you)

## Code of Conduct

By participating in this project, you are expected to uphold our Code of Conduct. Please report unacceptable behavior to project maintainers.

## Getting Started

1. Fork the repository on GitHub
2. Clone your fork to your local machine
3. Set up the development environment as described in the [README.md](README.md)
4. Create a new branch for your feature or bugfix

## Development Workflow

1. Choose an existing issue to work on or create a new one
2. Comment on the issue to let others know you're working on it
3. Create a new branch with a descriptive name:

   ```bash
   git checkout -b feature/feature-name
   # or
   git checkout -b fix/bug-name
   ```

4. Make your changes, following the coding standards
5. Add tests for new functionality
6. Run the existing tests to ensure nothing breaks
7. Commit your changes following the commit message guidelines
8. Push your branch to your fork
9. Create a pull request

## Pull Request Process

1. Ensure your code follows the project's coding standards
2. Update the README.md with details of changes if applicable
3. The PR should work with the current codebase and pass all tests
4. Add a clear description of the changes made and reference any related issues
5. Wait for review from a maintainer

## Coding Standards

- Use TypeScript for all code
- Follow existing code style and patterns
- Use meaningful variable and function names
- Add comments for complex logic
- Keep functions small and focused on a single responsibility
- Use interfaces for type definitions
- Prefer immutable data structures

## Commit Message Guidelines

Follow the Conventional Commits format:

```plaintext
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

Types:

- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation only changes
- `style`: Changes that do not affect the meaning of the code
- `refactor`: A code change that neither fixes a bug nor adds a feature
- `perf`: A code change that improves performance
- `test`: Adding missing tests or correcting existing tests
- `chore`: Changes to the build process or auxiliary tools

Examples:

- `feat(tool-schemas): Add crawl4ai_scrape schema`
- `fix(oauth): Fix token validation logic`
- `docs: Update installation instructions`

## Testing

- Write tests for all components
- Test error cases as well as happy paths
- Use mock objects for external dependencies
- Run tests locally before submitting a PR:

  ```bash
  npm test
  ```

## Documentation

- Update documentation for any API changes
- Document any new features or changed behavior
- Keep the README.md up to date
- Add code examples where appropriate
- Document complex logic with comments

## Branch Strategy

- The `main` branch is the default branch and should always be stable
- Create feature branches from `main`
- Name branches according to what they implement (`feature/component-name` or `fix/issue-name`)
- Create pull requests to merge your changes back to `main`

## Release Process

Releases are managed by the maintainers and follow semantic versioning:

- MAJOR version when you make incompatible API changes
- MINOR version when you add functionality in a backwards compatible manner
- PATCH version when you make backwards compatible bug fixes

## Thank You

Your contributions to open source, large or small, make projects like this possible. Thank you for taking the time to contribute.
