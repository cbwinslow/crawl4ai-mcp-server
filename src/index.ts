/**
 * Main entry point for the Crawl4AI MCP Server CloudFlare Worker
 * 
 * This file handles incoming requests, routes them to the appropriate handler,
 * and integrates with the OAuth provider for authentication.
 */

import { AuthProvider } from '@cloudflare/workers-oauth-provider';
import { handleMCPRequest } from './mcp-server';

/**
 * Environment interface for Cloudflare Worker
 */
export interface Env {
  // API credentials for Crawl4AI
  CRAWL4AI_API_KEY: string;
  
  // OAuth configuration for authentication
  OAUTH_CLIENT_ID: string;
  OAUTH_CLIENT_SECRET: string;
  
  // KV namespace for session data (optional)
  SESSION_KV?: KVNamespace;
}

/**
 * Worker event handler for incoming requests
 */
export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    // Parse the request URL
    const url = new URL(request.url);
    
    // Setup OAuth provider
    const oauthProvider = new AuthProvider({
      clientId: env.OAUTH_CLIENT_ID,
      clientSecret: env.OAUTH_CLIENT_SECRET,
      redirectUrl: `${url.origin}/oauth/callback`,
      scope: 'read:user',
    });
    
    // Handle OAuth routes
    if (url.pathname.startsWith('/oauth')) {
      return oauthProvider.handleRequest(request);
    }
    
    // Handle MCP requests
    if (url.pathname === '/mcp') {
      try {
        // You may add authentication check here
        return handleMCPRequest(request, env);
      } catch (error) {
        return new Response(JSON.stringify({ error: 'Internal server error' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }
    
    // Handle root path with basic info
    if (url.pathname === '/' || url.pathname === '') {
      return new Response(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Crawl4AI MCP Server</title>
          <style>
            body { font-family: system-ui, sans-serif; max-width: 800px; margin: 0 auto; padding: 2rem; }
            h1 { color: #2563eb; }
            code { background: #f1f5f9; padding: 0.2rem 0.4rem; border-radius: 0.25rem; }
          </style>
        </head>
        <body>
          <h1>Crawl4AI MCP Server</h1>
          <p>This server provides Model Context Protocol (MCP) access to Crawl4AI's web scraping and crawling capabilities.</p>
          <p>To use this server with Claude or other MCP-enabled AI assistants, connect to: <code>${url.origin}/mcp</code></p>
          <p>Authentication is required. <a href="/oauth/login">Login here</a>.</p>
        </body>
        </html>
      `, {
        headers: {
          'Content-Type': 'text/html'
        }
      });
    }
    
    // Return 404 for all other routes
    return new Response('Not Found', { status: 404 });
  },
};