# Crawl4AI MCP Server

A CloudFlare Worker-based Model Context Protocol (MCP) server that provides web crawling, searching, and content extraction capabilities to AI assistants.

## Features

- **Web Crawling**: Crawl websites from a starting URL with configurable depth and page limits
- **Content Search**: Search through previously crawled content
- **Content Extraction**: Extract structured content from specific URLs
- **MCP Integration**: Seamlessly integrates with MCP clients like Claude Desktop, allowing AI assistants to use these tools directly

## Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- [npm](https://www.npmjs.com/)
- [Wrangler](https://developers.cloudflare.com/workers/wrangler/install-and-update/) (CloudFlare Workers CLI)
- A CloudFlare account

## Installation

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

   Then update `wrangler.toml` with the KV namespace ID:
   ```toml
   kv_namespaces = [
     { binding = "CRAWL_DATA", id = "your-namespace-id" }
   ]
   ```

## Development

1. Start the development server:
   ```bash
   npm run dev
   ```

2. The server will be available at http://localhost:8787

## Deployment

1. Deploy to CloudFlare Workers:
   ```bash
   npm run deploy
   ```

## Usage with MCP Clients

This server implements the Model Context Protocol, allowing AI assistants to access its tools. To connect with an MCP client:

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

## Project Structure

```
crawl4ai-mcp-server/
├── src/
│   ├── index.ts              # Main entry point
│   ├── handlers/
│   │   ├── crawl.ts          # Web crawling implementation
│   │   ├── search.ts         # Search functionality
│   │   └── extract.ts        # Content extraction
├── .github/                  # GitHub configuration
├── wrangler.toml             # CloudFlare Workers configuration
├── tsconfig.json             # TypeScript configuration
├── package.json              # Node.js dependencies
└── README.md                 # Project documentation
```

## License

MIT