import { createMCPServer } from 'workers-mcp';
import { createCrawl, getCrawlById, listCrawls } from './handlers/crawl';
import { searchDocuments } from './handlers/search';
import { extractContent } from './handlers/extract';

export interface Env {
  CRAWL_DATA: KVNamespace;
  API_VERSION: string;
  MAX_CRAWL_DEPTH: string;
  MAX_CRAWL_PAGES: string;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    // Create the MCP server
    const server = createMCPServer(request, env, ctx, {
      name: 'Crawl4AI MCP Server',
      version: env.API_VERSION,
      tools: [
        {
          identifier: 'crawl',
          name: 'Web Crawler',
          description: 'Crawl web pages and index their content',
          parameters: {
            type: 'object',
            properties: {
              url: {
                type: 'string',
                description: 'The URL to start crawling from'
              },
              maxDepth: {
                type: 'number',
                description: 'Maximum crawl depth (default: 3)'
              },
              maxPages: {
                type: 'number',
                description: 'Maximum number of pages to crawl (default: 100)'
              }
            },
            required: ['url']
          },
          handler: async (params, env) => {
            return createCrawl(params, env as Env);
          }
        },
        {
          identifier: 'getCrawl',
          name: 'Get Crawl Data',
          description: 'Get data from a previous crawl by ID',
          parameters: {
            type: 'object',
            properties: {
              id: {
                type: 'string',
                description: 'The ID of the crawl'
              }
            },
            required: ['id']
          },
          handler: async (params, env) => {
            return getCrawlById(params, env as Env);
          }
        },
        {
          identifier: 'listCrawls',
          name: 'List Crawls',
          description: 'List all crawls or filter by domain',
          parameters: {
            type: 'object',
            properties: {
              domain: {
                type: 'string',
                description: 'Filter crawls by domain (optional)'
              },
              limit: {
                type: 'number',
                description: 'Maximum number of crawls to return (default: 10)'
              }
            }
          },
          handler: async (params, env) => {
            return listCrawls(params, env as Env);
          }
        },
        {
          identifier: 'search',
          name: 'Search Documents',
          description: 'Search indexed documents by query',
          parameters: {
            type: 'object',
            properties: {
              query: {
                type: 'string',
                description: 'The search query'
              },
              crawlId: {
                type: 'string',
                description: 'Limit search to a specific crawl ID (optional)'
              },
              limit: {
                type: 'number',
                description: 'Maximum number of results to return (default: 10)'
              }
            },
            required: ['query']
          },
          handler: async (params, env) => {
            return searchDocuments(params, env as Env);
          }
        },
        {
          identifier: 'extract',
          name: 'Extract Content',
          description: 'Extract structured content from a URL',
          parameters: {
            type: 'object',
            properties: {
              url: {
                type: 'string',
                description: 'The URL to extract content from'
              },
              selectors: {
                type: 'object',
                description: 'Optional CSS selectors to extract specific elements'
              }
            },
            required: ['url']
          },
          handler: async (params, env) => {
            return extractContent(params, env as Env);
          }
        }
      ]
    });

    return server.fetch();
  }
};