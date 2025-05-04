# Claude Code Instructions for Crawl4AI MCP Server

## Project Overview

This project implements a custom Model Context Protocol (MCP) Server that integrates with Crawl4AI, an open-source web scraping and crawling library. The server is deployed as a remote MCP server on CloudFlare Workers, allowing AI assistants like Claude to access Crawl4AI's powerful web scraping capabilities.

## Architecture

```
┌────────────────┐     ┌─────────────────┐     ┌─────────────────────┐
│                │     │                 │     │                     │
│  AI Assistant  │────▶│ CloudFlare MCP  │────▶│  Crawl4AI Service   │
│  (e.g. Claude) │     │     Server      │     │                     │
│                │     │                 │     │                     │
└────────────────┘     └─────────────────┘     └─────────────────────┘
                              │
                              ▼
                       ┌─────────────────┐
                       │                 │
                       │  OAuth Provider │
                       │                 │
                       └─────────────────┘
```

The architecture includes:
1. **CloudFlare Worker**: Hosts the MCP server and handles requests
2. **OAuth Provider**: Manages authentication and authorization
3. **MCP Server Interface**: Defines tools and handles MCP protocol
4. **Crawl4AI Adapter**: Translates MCP requests to Crawl4AI operations
5. **KV Storage**: Stores OAuth tokens and session data

## Development Guidelines

### Code Style

- Use TypeScript for all code
- Follow conventional commits format for commit messages
- Use meaningful variable and function names
- Add comments for complex logic
- Keep functions small and focused

### Branch Strategy

- Create feature branches from `main`
- Name branches according to the feature they implement (`feature/component-name`)
- Commit regularly with descriptive commit messages
- Create pull requests that reference the issues they close

### Testing

- Write tests for all components
- Test error cases as well as happy paths
- Use mock objects for external dependencies

## Tool Definitions

The MCP Server exposes the following tools:

1. **crawl4ai_scrape**: Scrape a single webpage with options for content extraction
2. **crawl4ai_deep_research**: Conduct comprehensive research on a topic
3. **crawl4ai_map**: Discover URLs from a starting point
4. **crawl4ai_crawl**: Start an asynchronous crawl of multiple pages
5. **crawl4ai_extract**: Extract structured information from web pages
6. **crawl4ai_check_crawl_status**: Check the status of a crawl job

## Dependencies

- `@cloudflare/workers-oauth-provider`: For OAuth implementation
- `@cloudflare/mcp-agent`: For MCP server implementation
- `crawl4ai`: For web scraping capabilities
- `typescript`: For type safety
- `node-fetch`: For API requests
- `zod`: For schema validation

## Commit Message Guidelines

Follow the Conventional Commits format:

```
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
