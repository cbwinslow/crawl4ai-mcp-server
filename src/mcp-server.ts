/**
 * MCP Server implementation for Crawl4AI
 * 
 * This file implements the Model Context Protocol server for the Crawl4AI integration,
 * providing web scraping and crawling capabilities to AI assistants through MCP.
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { randomUUID } from 'crypto';

// Import tool schemas
import {
  crawl4aiScrapeSchema,
  crawl4aiDeepResearchSchema,
  crawl4aiMapSchema,
  crawl4aiCrawlSchema,
  crawl4aiExtractSchema,
  crawl4aiCheckCrawlStatusSchema
} from './tool-schemas';

// Import tool handlers
import {
  handleCrawl4aiScrape,
  handleCrawl4aiDeepResearch,
  handleCrawl4aiMap,
  handleCrawl4aiCrawl,
  handleCrawl4aiExtract,
  handleCrawl4aiCheckCrawlStatus
} from './tool-handlers';

/**
 * Initialize the MCP server with Crawl4AI tool schemas and handlers
 */
export function initializeMcpServer() {
  // Create MCP server instance
  const server = new McpServer({
    name: 'Crawl4AI MCP Server',
    version: '1.0.0',
  });

  // Register Crawl4AI tools with their schemas and handlers
  server.tool(
    'crawl4ai_scrape',
    crawl4aiScrapeSchema,
    handleCrawl4aiScrape
  );

  server.tool(
    'crawl4ai_deep_research',
    crawl4aiDeepResearchSchema,
    handleCrawl4aiDeepResearch
  );

  server.tool(
    'crawl4ai_map',
    crawl4aiMapSchema,
    handleCrawl4aiMap
  );

  server.tool(
    'crawl4ai_crawl',
    crawl4aiCrawlSchema,
    handleCrawl4aiCrawl
  );

  server.tool(
    'crawl4ai_extract',
    crawl4aiExtractSchema,
    handleCrawl4aiExtract
  );

  server.tool(
    'crawl4ai_check_crawl_status',
    crawl4aiCheckCrawlStatusSchema,
    handleCrawl4aiCheckCrawlStatus
  );

  return server;
}

/**
 * Create an HTTP transport for the MCP server
 */
export function createMcpServerTransport(req: Request, env: any) {
  return new StreamableHTTPServerTransport({
    sessionIdGenerator: () => randomUUID(),
    onsessioninitialized: (sessionId) => {
      // Store session data in KV storage if needed
      console.log(`Session initialized: ${sessionId}`);
    }
  });
}

/**
 * Handle MCP requests from clients
 * 
 * @param request The incoming HTTP request
 * @param env Environment variables and bindings
 * @returns HTTP response
 */
export async function handleMcpRequest(request: Request, env: any): Promise<Response> {
  const server = initializeMcpServer();
  const transport = createMcpServerTransport(request, env);
  
  // Connect the transport to the server
  await server.connect(transport);
  
  // Process the request through the transport
  return await transport.handleRequest(request, new Response());
}