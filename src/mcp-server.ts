/**
 * MCP Server implementation for Crawl4AI
 * 
 * This file implements the Model Context Protocol server for the Crawl4AI integration,
 * providing web scraping and crawling capabilities to AI assistants through MCP.
 */

import { MCPServer, createWorkerTransport } from '@modelcontextprotocol/sdk';
import { Env } from './index';

// Import all tool schemas and handlers
import {
  crawl4aiScrapeSchema,
  crawl4aiMapSchema,
  crawl4aiCrawlSchema,
  crawl4aiCheckCrawlStatusSchema,
  crawl4aiExtractSchema,
  crawl4aiDeepResearchSchema
} from './tool-schemas';

import {
  handleCrawl4aiScrape,
  handleCrawl4aiMap,
  handleCrawl4aiCrawl,
  handleCrawl4aiCheckCrawlStatus,
  handleCrawl4aiExtract,
  handleCrawl4aiDeepResearch
} from './tool-handlers';

// Import adapter to configure API key
import adapter from './adapters';

/**
 * Create and configure the MCP server
 * 
 * @param apiKey Optional API key for Crawl4AI authentication
 * @returns Configured MCP server instance
 */
const createServer = (apiKey?: string) => {
  // Set API key if provided
  if (apiKey) {
    adapter.setApiKey(apiKey);
  }
  
  // Create new MCP server instance
  const server = new MCPServer();
  
  // Register all tool schemas and handlers
  server.registerTool({
    name: 'crawl4ai_scrape',
    description: 'Scrape a single webpage with advanced options for content extraction. Supports various formats including markdown, HTML, and screenshots. Can execute custom actions like clicking or scrolling before scraping.',
    parameters: crawl4aiScrapeSchema,
    handler: handleCrawl4aiScrape
  });
  
  server.registerTool({
    name: 'crawl4ai_map',
    description: 'Discover URLs from a starting point. Can use both sitemap.xml and HTML link discovery.',
    parameters: crawl4aiMapSchema,
    handler: handleCrawl4aiMap
  });
  
  server.registerTool({
    name: 'crawl4ai_crawl',
    description: 'Start an asynchronous crawl of multiple pages from a starting URL. Supports depth control, path filtering, and webhook notifications.',
    parameters: crawl4aiCrawlSchema,
    handler: handleCrawl4aiCrawl
  });
  
  server.registerTool({
    name: 'crawl4ai_check_crawl_status',
    description: 'Check the status of a crawl job.',
    parameters: crawl4aiCheckCrawlStatusSchema,
    handler: handleCrawl4aiCheckCrawlStatus
  });
  
  server.registerTool({
    name: 'crawl4ai_extract',
    description: 'Extract structured information from web pages using LLM. Supports both cloud AI and self-hosted LLM extraction.',
    parameters: crawl4aiExtractSchema,
    handler: handleCrawl4aiExtract
  });
  
  server.registerTool({
    name: 'crawl4ai_deep_research',
    description: 'Conduct deep research on a query using web crawling, search, and AI analysis.',
    parameters: crawl4aiDeepResearchSchema,
    handler: handleCrawl4aiDeepResearch
  });
  
  return server;
};

/**
 * Create the MCP server transport for Cloudflare Workers
 * 
 * @param request The incoming HTTP request
 * @param env Environment variables and bindings
 * @returns Configured MCP transport instance
 */
export const createWorkerMCPTransport = (request: Request, env: Env) => {
  const server = createServer(env.CRAWL4AI_API_KEY);
  return createWorkerTransport(server, request);
};

/**
 * Handle MCP requests from clients
 * 
 * @param request The incoming HTTP request
 * @param env Environment variables and bindings
 * @returns HTTP response
 */
export const handleMCPRequest = async (request: Request, env: Env): Promise<Response> => {
  const transport = createWorkerMCPTransport(request, env);
  return transport.handleRequest();
};