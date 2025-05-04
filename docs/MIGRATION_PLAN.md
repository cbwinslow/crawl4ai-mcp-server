# Crawl4AI MCP Server Migration Plan

## Overview

This document outlines the comprehensive plan for migrating the current MCP Server implementation from using the Firecrawl API to properly integrating with Crawl4AI. The plan is designed to ensure that the MCP server is fully managed remotely and can be accessed from Claude.ai via Claude integrations.

## Current Architecture & Issues

The current architecture has several issues that need to be addressed:

1. The adapter class is named `Crawl4AIAdapter` but points to Firecrawl's API endpoint (`https://api.firecrawl.dev/v1`)
2. Error handling references "FireCrawl API error" rather than "Crawl4AI error"
3. The code is designed for a REST API service, but Crawl4AI is primarily a Python library with a different architecture
4. The `setApiKey` method is referenced but not implemented in the adapter class

## Target Architecture

The migration will establish a fully functional remote MCP server that:

1. Properly integrates with Crawl4AI
2. Is accessible via web Claude.ai through Claude integrations
3. Runs entirely on Cloudflare or another suitable hosting solution

## Key Architectural Decisions

After analyzing Crawl4AI's documentation, we've identified three potential approaches:

### Approach 1: Cloudflare Worker with Remote Crawl4AI Docker Instance ✅

**Description**: Keep the current Cloudflare Worker implementation but connect it to a remote Crawl4AI Docker server that exposes HTTP API endpoints.

**Pros**:
- Requires minimal changes to the current codebase
- Leverages Cloudflare's global network for availability
- Maintains a clean separation of concerns

**Cons**:
- Requires hosting and maintaining a separate Crawl4AI Docker server
- Potential latency between Cloudflare and the Docker server

**Implementation Details**:
- Deploy a Crawl4AI Docker server on a cloud provider (AWS, GCP, Azure)
- Update the MCP server to connect to this remote Docker server
- Configure authentication between the systems

### Approach 2: Serverless Python Function with API Gateway ❌

**Description**: Rewrite parts of the MCP server in Python and deploy as serverless functions, directly using the Crawl4AI Python library.

**Pros**:
- Direct integration with Crawl4AI
- No need for a separate Docker server

**Cons**:
- Complete rewrite in Python
- Loses benefits of Cloudflare's network
- Serverless cold starts could impact performance
- Browsers and web crawling typically don't work well in serverless environments

### Approach 3: Hybrid Solution with Edge Compute ❌

**Description**: Use Cloudflare Workers for the MCP interface and basic logic, but use a separate service or Workers AI for executing Python code.

**Pros**:
- Maintains most of the current TypeScript codebase
- Could potentially remain within the Cloudflare ecosystem

**Cons**:
- Complex architecture with multiple components
- Cloudflare doesn't currently support running arbitrary Python code
- Development and maintenance complexity

## Selected Solution: Approach 1

We recommend **Approach 1**: Cloudflare Worker with Remote Crawl4AI Docker Instance, as it provides the best balance of implementation simplicity, performance, and alignment with current architecture.

## Host Infrastructure Requirements

### Cloudflare Worker (MCP Server)
- Standard Cloudflare Worker (no special requirements)
- KV storage for session data (already configured)
- Environment variables for configuration

### Crawl4AI Docker Server
- Host with Docker support:
  - AWS EC2 (recommended t3.medium or higher)
  - GCP Compute Engine
  - Azure VM
  - DigitalOcean Droplet (4GB RAM minimum)
- Minimum Requirements:
  - 4GB RAM (8GB recommended)
  - 2 vCPUs
  - 20GB storage
  - Public IP with firewall configured to allow the Cloudflare Worker to connect
- Container Configuration:
  - Default port: 11235 
  - Shared memory: 1GB minimum
  - Environment variables for API keys and configuration

## Implementation Plan

### Phase 1: Docker Server Setup

1. Set up a VM instance on a cloud provider (AWS EC2 recommended)
2. Install Docker and dependencies
3. Pull and run the Crawl4AI Docker image:
   ```bash
   docker run -d \
     -p 11235:11235 \
     --name crawl4ai \
     --shm-size=1g \
     unclecode/crawl4ai:latest
   ```
4. Configure security (firewall, JWT authentication)
5. Set up monitoring and auto-restart capabilities

### Phase 2: MCP Server Updates

1. Update `src/index.ts` to add `CRAWL4AI_API_URL` to the `Env` interface
2. Implement the missing `setApiKey` method in the `Crawl4AIAdapter` class
3. Update adapter's `baseUrl` to use the environment variable
4. Fix references to 'Firecrawl' in error messages and documentation
5. Implement parameter transformation for Crawl4AI Docker API format
6. Update error handling to properly capture Crawl4AI error responses
7. Modify endpoint methods to match Crawl4AI API
8. Update documentation to explain Crawl4AI Docker server requirement

### Phase 3: Deployment and Testing

1. Deploy updated Cloudflare Worker with new environment variables
2. Configure the worker to connect to the Docker server
3. Test all tool functionalities:
   - crawl4ai_scrape
   - crawl4ai_map
   - crawl4ai_crawl
   - crawl4ai_check_crawl_status
   - crawl4ai_extract
   - crawl4ai_deep_research
4. Test integration with Claude.ai

### Phase 4: Documentation and Monitoring

1. Update README.md with comprehensive setup and configuration instructions
2. Document the external dependencies (Docker server)
3. Set up monitoring for both the Cloudflare Worker and Docker server
4. Create troubleshooting guides

## Code Changes

### 1. Update src/index.ts

```typescript
// Add CRAWL4AI_API_URL to Env interface
export interface Env {
  // API credentials for Crawl4AI
  CRAWL4AI_API_KEY: string;
  
  // Crawl4AI API URL (defaults to http://localhost:11235 if not specified)
  CRAWL4AI_API_URL?: string;
  
  // ...other existing properties
}
```

### 2. Update src/mcp-server.ts

```typescript
// Update to pass API URL to adapter
export const createWorkerMCPTransport = (request: Request, env: Env) => {
  const server = createServer(env.CRAWL4AI_API_KEY, env.CRAWL4AI_API_URL);
  return createWorkerTransport(server, request);
};

// Update createServer function
const createServer = (apiKey?: string, apiUrl?: string) => {
  // Set API key and base URL if provided
  if (apiKey || apiUrl) {
    adapter.configure({ apiKey, baseUrl: apiUrl });
  }
  
  // ...rest of function
};
```

### 3. Update src/adapters/crawl4ai-adapter.ts

```typescript
// Add configuration interface
interface AdapterConfig {
  apiKey?: string;
  baseUrl?: string;
}

// Update constructor
constructor(
  apiKey: string = '',
  retryConfig: RetryConfig = DEFAULT_RETRY_CONFIG,
  cacheOptions: LRUCache.Options<string, any> = DEFAULT_CACHE_OPTIONS,
  baseUrl = 'http://localhost:11235'  // Default to local Crawl4AI Docker server
) {
  this.baseUrl = baseUrl;
  this.retryConfig = retryConfig;

  // Initialize API client
  this.apiClient = axios.create({
    baseURL: this.baseUrl,
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'Crawl4AI-MCP-Server/1.0.0',
    },
  });
  
  // Set API key if provided
  if (apiKey) {
    this.setApiKey(apiKey);
  }
  
  // ...rest of constructor
}

// Add missing setApiKey method
public setApiKey(apiKey: string): void {
  if (!apiKey) return;
  
  // Update the Authorization header in the API client
  this.apiClient.defaults.headers.common['Authorization'] = `Bearer ${apiKey}`;
}

// Add a configure method
public configure(config: AdapterConfig): void {
  if (config.apiKey) {
    this.setApiKey(config.apiKey);
  }
  
  if (config.baseUrl) {
    this.baseUrl = config.baseUrl;
    this.apiClient.defaults.baseURL = config.baseUrl;
  }
}
```

## Deployment Instructions

### Cloudflare Worker Deployment

1. Add the required environment variables in your Cloudflare Workers configuration:
   - `CRAWL4AI_API_KEY`: Your API key for the Crawl4AI Docker server
   - `CRAWL4AI_API_URL`: The URL where your Crawl4AI Docker server is deployed (e.g., `https://crawl4ai-api.example.com`)

2. Deploy the worker:
   ```bash
   wrangler deploy
   ```

### Claude.ai Integration

1. Set up the integration in Claude.ai using the deployed Cloudflare Worker URL as the endpoint
2. Configure authentication for the integration
3. Test the integration by asking Claude to use the Crawl4AI tools

## Estimated Timeline

- **Phase 1 (Docker Server Setup)**: 1-2 days
- **Phase 2 (MCP Server Updates)**: 2-3 days
- **Phase 3 (Deployment and Testing)**: 1-2 days
- **Phase 4 (Documentation and Monitoring)**: 1 day

**Total Estimated Time**: 5-8 days

## Risks and Mitigations

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| Crawl4AI API changes | Medium | High | Regular monitoring and update process |
| Docker server outages | Medium | High | Implement health checks and auto-recovery |
| Authentication failures | Low | High | Comprehensive testing of auth flow |
| Rate limiting | Medium | Medium | Implement caching and backoff strategy |
| Cloudflare worker limitations | Low | Medium | Monitor worker performance metrics |

## Maintenance Considerations

- **Docker Updates**: Regularly update the Crawl4AI Docker image
- **API Compatibility**: Monitor for breaking changes in the Crawl4AI API
- **Performance Monitoring**: Set up alerting for both the worker and Docker server
- **Cost Management**: Track usage and optimize based on patterns
- **Backup Strategy**: Regular backups of configuration and key data

## Alternatives Considered

### Self-hosting Python Service with Crawl4AI

While using the Docker server approach is recommended, it's also possible to create a custom Python service that uses the Crawl4AI library directly. This would give more control over the implementation but would require significantly more development and maintenance effort.

### Direct Integration from Browser

Due to CORS restrictions and the need for server-side processing, directly integrating with Crawl4AI from the browser is not feasible.

## Conclusion

This migration plan provides a clear path to properly integrate the MCP server with Crawl4AI while maintaining remote accessibility for Claude.ai. The recommended approach leverages Cloudflare Workers for the MCP server implementation while connecting to a dedicated Crawl4AI Docker server for web crawling functionality.

By following this plan, we can ensure a robust, maintainable solution that works well with Claude integrations and provides reliable web crawling capabilities.