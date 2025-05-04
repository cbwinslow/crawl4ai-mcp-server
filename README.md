# Crawl4AI MCP Server

🚀 High-performance MCP Server for Crawl4AI - Enable AI assistants to access web scraping, crawling, and deep research via Model Context Protocol. Faster and more efficient than FireCrawl!

## Overview

This project implements a custom Model Context Protocol (MCP) Server that integrates with Crawl4AI, an open-source web scraping and crawling library. The server is deployed as a remote MCP server on CloudFlare Workers, allowing AI assistants like Claude to access Crawl4AI's powerful web scraping capabilities.

## Features

- 🌐 **Single Webpage Scraping**: Extract content from individual webpages
- 🔍 **Deep Research**: Conduct comprehensive research across multiple pages
- 🗺️ **URL Discovery**: Map and discover URLs from a starting point
- 🕸️ **Asynchronous Crawling**: Crawl entire websites efficiently
- 📊 **Structured Data Extraction**: Extract specific data using CSS selectors or LLM-based strategies
- 🔒 **OAuth Authentication**: Secure access with proper authorization

## Project Structure

```
crawl4ai-mcp/
├── src/
│   ├── index.ts               # Main entry point with OAuth provider setup
│   ├── auth-handler.ts        # Authentication handler
│   ├── mcp-server.ts          # MCP server implementation
│   ├── crawl4ai-adapter.ts    # Adapter for Crawl4AI API
│   ├── tool-schemas/          # MCP tool schema definitions
│   │   └── [...].ts           # Tool schemas
│   └── utils/                 # Utility functions
├── tests/                     # Test cases
├── wrangler.toml              # CloudFlare Workers configuration
└── package.json               # Node.js dependencies
```

## Development with Claude Code

This project is designed to be developed using Claude Code, with multiple sessions working on different components. Each issue in the repository corresponds to a specific component that can be implemented by a Claude Code session.

### Setup Instructions

1. **Create a Claude Code Session for an Issue**

   ```bash
   # Clone the repository
   git clone https://github.com/BjornMelin/crawl4ai-mcp-server.git
   cd crawl4ai-mcp-server
   
   # Create a new branch for the issue you want to work on
   git checkout -b feature/issue-name
   
   # Start a Claude Code session
   claude code
   ```

2. **Connect Claude to the Issue**

   In the Claude Code session, provide context about the issue:

   ```
   I'm working on issue #X (Title) from the crawl4ai-mcp-server repository. 
   The goal is to implement [feature]. Please help me implement this component
   following the project architecture and best practices.
   ```

3. **Follow Conventional Commits**

   When making commits, follow the conventional commits format:

   ```
   feat: Add new feature
   fix: Fix bug
   docs: Update documentation
   chore: Update dependencies
   test: Add tests
   ```

4. **Create Pull Requests**

   After completing an issue:

   ```bash
   # Push your branch
   git push origin feature/issue-name
   
   # Create a pull request using GitHub CLI or web interface
   gh pr create --title "feat: Implement feature" --body "Closes #X" --base main
   ```

## Issues to Implement

1. **Project Setup and Configuration** (Issue #1)
   - Initialize CloudFlare Worker project
   - Set up TypeScript configuration
   - Create package.json and wrangler.toml

2. **MCP Server and Tool Schemas** (Issue #2)
   - Implement MCP server with McpAgent
   - Define tool schemas for Crawl4AI capabilities

3. **Crawl4AI Adapter** (Issue #3)
   - Create adapter for Crawl4AI operations
   - Implement error handling and response formatting

4. **OAuth Authentication** (Issue #4)
   - Implement authentication with workers-oauth-provider
   - Create login page and token management

5. **Main Worker Entry Point** (Issue #5)
   - Tie everything together with the main entry point
   - Configure the OAuth provider and routing

6. **Utility Functions** (Issue #6)
   - Implement response formatting and error handling utilities

7. **Testing, Deployment, and Documentation** (Issue #7)
   - Set up testing and deployment workflows
   - Create comprehensive documentation

## License

[MIT](LICENSE)
