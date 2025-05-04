/**
 * Crawl4AI MCP Server
 * 
 * Entry point for the Cloudflare Worker that hosts the Crawl4AI MCP server.
 */

import { handleMCPRequest } from './mcp-server';

/**
 * Environment variables for the worker
 */
export interface Env {
  /**
   * API key for the Crawl4AI service
   */
  CRAWL4AI_API_KEY: string;
  
  /**
   * Base URL for the Crawl4AI API (defaults to http://localhost:11235)
   */
  CRAWL4AI_API_URL?: string;
}

/**
 * Handles all requests to the worker
 */
export default {
  /**
   * Handle HTTP requests to the worker
   */
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    
    // Handle MCP requests
    if (url.pathname === '/mcp') {
      return handleMCPRequest(request, env);
    }
    
    // Handle health check
    if (url.pathname === '/health') {
      return new Response(JSON.stringify({
        status: 'ok',
        timestamp: new Date().toISOString(),
        service: 'crawl4ai-mcp-server'
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Handle unsupported paths
    return new Response('Not Found', { status: 404 });
  }
};