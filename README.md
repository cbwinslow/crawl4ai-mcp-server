# ⚠️ NOTICE

> **MCP SERVER CURRENTLY UNDER DEVELOPMENT**  
> **NOT READY FOR PRODUCTION USE**  
> **WILL UPDATE WHEN OPERATIONAL**

# Crawl4AI MCP Server

🚀 High-performance MCP Server for Crawl4AI - Enable AI assistants to access web scraping, crawling, and deep research via Model Context Protocol. Faster and more efficient than FireCrawl!

## Overview

This project implements a custom Model Context Protocol (MCP) Server that integrates with Crawl4AI, an open-source web scraping and crawling library. The server is deployed as a remote MCP server on CloudFlare Workers, allowing AI assistants like Claude to access Crawl4AI's powerful web scraping capabilities.

## Documentation

For comprehensive details about this project, please refer to the following documentation:

- [Migration Plan](docs/MIGRATION_PLAN.md) - Detailed plan for migrating from Firecrawl to Crawl4AI
- [Enhanced Architecture](docs/ENHANCED_ARCHITECTURE.md) - Multi-tenant architecture with cloud provider flexibility
- [Implementation Guide](docs/IMPLEMENTATION_GUIDE.md) - Technical implementation details and code examples
- [Codebase Simplification](docs/SIMPLIFICATION.md) - Details on code simplification and best practices implemented
- [Docker Setup Guide](docs/DOCKER.md) - Instructions for Docker setup for local development and production

## Features

### Web Data Acquisition

- 🌐 **Single Webpage Scraping**: Extract content from individual webpages
- 🕸️ **Web Crawling**: Crawl websites with configurable depth and page limits
- 🗺️ **URL Discovery**: Map and discover URLs from a starting point
- 🕸️ **Asynchronous Crawling**: Crawl entire websites efficiently

### Content Processing

- 🔍 **Deep Research**: Conduct comprehensive research across multiple pages
- 📊 **Structured Data Extraction**: Extract specific data using CSS selectors or LLM-based extraction
- 🔎 **Content Search**: Search through previously crawled content

### Integration & Security

- 🔄 **MCP Integration**: Seamless integration with MCP clients (Claude Desktop, etc.)
- 🔒 **OAuth Authentication**: Secure access with proper authorization
- 🔒 **Authentication Options**: Secure access via OAuth or API key (Bearer token)
- ⚡ **High Performance**: Optimized for speed and efficiency
- 📦 **Database Connectivity**: Optional client to send data and files to SQL or vector databases via HTTP APIs

## Project Structure

```plaintext
crawl4ai-mcp/
├── src/
│   ├── index.ts               # Main entry point with OAuth provider setup
│   ├── auth-handler.ts        # Authentication handler
│   ├── mcp-server.ts          # MCP server implementation
│   ├── crawl4ai-adapter.ts    # Adapter for Crawl4AI API
│   ├── tool-schemas/          # MCP tool schema definitions
│   │   └── [...].ts           # Tool schemas
│   ├── handlers/
│   │   ├── crawl.ts           # Web crawling implementation
│   │   ├── search.ts          # Search functionality
│   │   └── extract.ts         # Content extraction
│   └── utils/                 # Utility functions
├── tests/                     # Test cases
├── .github/                   # GitHub configuration
├── wrangler.toml              # CloudFlare Workers configuration
├── tsconfig.json              # TypeScript configuration
├── package.json               # Node.js dependencies
└── README.md                  # Project documentation
```

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- [npm](https://www.npmjs.com/)
- [Wrangler](https://developers.cloudflare.com/workers/wrangler/install-and-update/) (CloudFlare Workers CLI)
- A CloudFlare account

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/BjornMelin/crawl4ai-mcp-server.git
   cd crawl4ai-mcp-server
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up CloudFlare KV namespace:

   ```bash
   wrangler kv:namespace create CRAWL_DATA
   ```

4. Update `wrangler.toml` with the KV namespace ID:

   ```toml
   kv_namespaces = [
     { binding = "CRAWL_DATA", id = "your-namespace-id" }
   ]
   ```

## Development

### Local Development

#### Using NPM

1. Start the development server:

   ```bash
   npm run dev
   ```

2. The server will be available at <http://localhost:8787>

#### Using Docker

You can also use Docker for local development, which includes the Crawl4AI API and a debug UI:

1. Set up environment variables:

   ```bash
   cp .env.example .env
   # Edit .env file with your API key
   ```

2. Start the Docker development environment:

   ```bash
   docker-compose up -d
   ```

3. Access the services:
   - MCP Server: <http://localhost:8787>
   - Crawl4AI UI: <http://localhost:3000>

See the [Docker Setup Guide](docs/DOCKER.md) for more details.

### Testing

The project includes a comprehensive test suite using Jest. To run tests:

```bash
# Run all tests
npm test

# Run tests with watch mode during development
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run only unit tests
npm run test:unit

# Run only integration tests
npm run test:integration
```

When running in Docker:

```bash
docker-compose exec mcp-server npm test
```

### Database Client Usage

The repository includes a `DatabaseClient` utility for sending data or files to external database services (SQL or vector DBs) via HTTP APIs.

```typescript
import { DatabaseClient } from './src/utils/database-client';

const client = new DatabaseClient({ apiBaseUrl: 'https://example.com/api', apiKey: 'KEY' });
await client.saveData({ foo: 'bar' });
await client.saveFile('content', 'example.txt');
```

## Deployment

1. Deploy to CloudFlare Workers:

   ```bash
   npm run deploy
   ```

2. Your server will be available at the CloudFlare Workers URL assigned to your deployed worker.

## Usage with MCP Clients

This server implements the Model Context Protocol, allowing AI assistants to access its tools.

### Authentication

- Implement OAuth authentication with workers-oauth-provider
- Add API key authentication using Bearer tokens
- Create login page and token management

### Connecting to an MCP Client

1. Use the CloudFlare Workers URL assigned to your deployed worker
2. In Claude Desktop or other MCP clients, add this server as a tool source

### Available Tools

- `crawl`: Crawl web pages from a starting URL
- `getCrawl`: Retrieve crawl data by ID
- `listCrawls`: List all crawls or filter by domain
- `search`: Search indexed documents by query
- `extract`: Extract structured content from a URL

## Configuration

The server can be configured by modifying environment variables in `wrangler.toml`:

- `MAX_CRAWL_DEPTH`: Maximum depth for web crawling (default: 3)
- `MAX_CRAWL_PAGES`: Maximum pages to crawl (default: 100)
- `API_VERSION`: API version string (default: "v1")
- `OAUTH_CLIENT_ID`: OAuth client ID for authentication
- `OAUTH_CLIENT_SECRET`: OAuth client secret for authentication

## Roadmap

The project is being developed with these components in mind:

1. **Project Setup and Configuration**: CloudFlare Worker setup, TypeScript configuration
2. **MCP Server and Tool Schemas**: Implementation of MCP server with tool definitions
3. **Crawl4AI Adapter**: Integration with the Crawl4AI functionality
4. **OAuth Authentication**: Secure authentication implementation
5. **Performance Optimizations**: Enhancing speed and reliability
6. **Advanced Extraction Features**: Improving structured data extraction capabilities

## Contributing

Contributions are welcome! Please check the open issues or create a new one before starting work on a feature or bug fix. See [Contributing Guidelines](CONTRIBUTING.md) for detailed guidelines.

## Support

If you encounter issues or have questions:

- Open an issue on the GitHub repository
- Check the [Crawl4AI documentation](https://crawl4ai.com/docs)
- Refer to the [Model Context Protocol specification](https://github.com/anthropics/model-context-protocol)

## How to Cite

If you use Crawl4AI MCP Server in your research or projects, please cite it using the following BibTeX entry:

```bibtex
@software{crawl4ai_mcp_2025,
  author = {Melin, Bjorn},
  title = {Crawl4AI MCP Server: High-performance Web Crawling for AI Assistants},
  url = {https://github.com/BjornMelin/crawl4ai-mcp-server},
  version = {1.0.0},
  year = {2025},
  month = {5}
}
```

## License

[MIT](LICENSE)