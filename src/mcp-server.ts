/**
 * MCP Server implementation for Crawl4AI
 * 
 * This file implements the Model Context Protocol server for the Crawl4AI integration,
 * providing web scraping and crawling capabilities to AI assistants through MCP.
 */

import { MCPServer, createWorkerTransport } from '@modelcontextprotocol/sdk';
import { Env, parseEnvInt } from './index';

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

// Import adapter and utilities
import adapter, { getConfigLimits } from './adapters';

/**
 * Create a properly typed handler function for MCP tools
 * This addresses the Sourcery comment about repeated env casting
 * 
 * @param handler The original handler function
 * @returns A wrapped handler with proper env typing and error handling
 */
function createTypedHandler(handler: (params: any, env?: any) => Promise<any>) {
  return async (params: any, rawEnv?: any): Promise<any> => {
    try {
      // Cast the environment to the proper type once
      const env = rawEnv as Env;
      
      // Parse and validate any numeric parameters
      if (params.maxDepth !== undefined) {
        params.maxDepth = parseEnvInt(params.maxDepth.toString(), 3);
      }
      
      if (params.limit !== undefined) {
        params.limit = parseEnvInt(params.limit.toString(), 100);
      }
      
      if (params.timeout !== undefined) {
        params.timeout = parseEnvInt(params.timeout.toString(), 30000);
      }
      
      // Apply global limits from environment configuration
      const { maxCrawlDepth, maxCrawlPages, maxTimeoutMs } = getConfigLimits(env);
      
      // Enforce maximum limits
      if (params.maxDepth !== undefined) {
        params.maxDepth = Math.min(params.maxDepth, maxCrawlDepth);
      }
      
      if (params.limit !== undefined) {
        params.limit = Math.min(params.limit, maxCrawlPages);
      }
      
      if (params.timeout !== undefined) {
        params.timeout = Math.min(params.timeout, maxTimeoutMs);
      }
      
      // Call the original handler with properly typed environment
      return handler(params, env);
    } catch (error) {
      console.error('Handler error:', error);
      
      // Return a standardized error response
      return {
        content: [
          {
            type: 'text',
            text: `Error processing request: ${error instanceof Error ? error.message : String(error)}`
          }
        ]
      };
    }
  };
}

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
  
  // Define tool configurations for registration
  const toolConfigs = [
    {
      name: 'crawl4ai_scrape',
      description: 'Scrape a single webpage with advanced options for content extraction. Supports various formats including markdown, HTML, and screenshots. Can execute custom actions like clicking or scrolling before scraping.',
      parameters: crawl4aiScrapeSchema,
      handler: createTypedHandler(handleCrawl4aiScrape)
    },
    {
      name: 'crawl4ai_map',
      description: 'Discover URLs from a starting point. Can use both sitemap.xml and HTML link discovery.',
      parameters: crawl4aiMapSchema,
      handler: createTypedHandler(handleCrawl4aiMap)
    },
    {
      name: 'crawl4ai_crawl',
      description: 'Start an asynchronous crawl of multiple pages from a starting URL. Supports depth control, path filtering, and webhook notifications.',
      parameters: crawl4aiCrawlSchema,
      handler: createTypedHandler(handleCrawl4aiCrawl)
    },
    {
      name: 'crawl4ai_check_crawl_status',
      description: 'Check the status of a crawl job.',
      parameters: crawl4aiCheckCrawlStatusSchema,
      handler: createTypedHandler(handleCrawl4aiCheckCrawlStatus)
    },
    {
      name: 'crawl4ai_extract',
      description: 'Extract structured information from web pages using LLM. Supports both cloud AI and self-hosted LLM extraction.',
      parameters: crawl4aiExtractSchema,
      handler: createTypedHandler(handleCrawl4aiExtract)
    },
    {
      name: 'crawl4ai_deep_research',
      description: 'Conduct deep research on a query using web crawling, search, and AI analysis.',
      parameters: crawl4aiDeepResearchSchema,
      handler: createTypedHandler(handleCrawl4aiDeepResearch)
    }
  ];
  
  // Register all tools by iterating through the configuration array
  for (const config of toolConfigs) {
    server.registerTool(config);
  }
  
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