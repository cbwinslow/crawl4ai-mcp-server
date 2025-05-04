/**
 * Type declarations for @modelcontextprotocol/sdk
 * Based on version 1.11.0
 */

declare module '@modelcontextprotocol/sdk' {
  /**
   * MCP Content item
   */
  export interface MCPContent {
    type: string;
    text: string;
  }
  
  /**
   * MCP Request format
   */
  export interface MCPRequest {
    name: string;
    parameters: Record<string, unknown>;
  }
  
  /**
   * MCP Response format
   */
  export interface MCPResponse {
    content: MCPContent[];
  }
  
  /**
   * Tool schema definition
   */
  export interface ToolSchema {
    name: string;
    description: string;
    parameters: object;
    handler: (params: Record<string, unknown>, rawEnv?: unknown) => Promise<MCPResponse>;
  }
  
  /**
   * MCP Server class
   */
  export class MCPServer {
    /**
     * Constructor
     */
    constructor(options?: { name: string; version: string });
    
    /**
     * Register a tool with the server
     */
    registerTool(tool: ToolSchema): void;
    
    /**
     * Get all registered tools
     */
    getTools(): ToolSchema[];
    
    /**
     * Handle MCP request
     */
    handleRequest(request: MCPRequest): Promise<MCPResponse>;
    
    /**
     * Connect to a transport
     */
    connect(transport: unknown): Promise<void>;
    
    /**
     * Register a resource
     */
    resource(name: string, uri: string | ResourceTemplate, handler: (uri: URL, params: Record<string, string>) => Promise<{ contents: Array<{ uri: string; text: string }> }>): void;
    
    /**
     * Register a tool
     */
    tool(name: string, parameters: Record<string, unknown>, handler: (params: Record<string, unknown>) => Promise<MCPResponse>): void;
    
    /**
     * Register a prompt
     */
    prompt(name: string, parameters: Record<string, unknown>, handler: (params: Record<string, unknown>) => { messages: Array<{ role: string; content: MCPContent }> }): void;
  }
  
  /**
   * Resource Template for dynamic resources
   */
  export class ResourceTemplate {
    constructor(template: string, options?: { list?: unknown });
  }
  
  /**
   * Creates a Cloudflare Worker transport for the MCP server
   */
  export function createWorkerTransport(server: MCPServer, request: Request): {
    handleRequest: () => Promise<Response>;
  };
  
  /**
   * Transport interfaces
   */
  export interface Transport {
    handleRequest: (req: unknown, res: unknown, body?: unknown) => Promise<unknown>;
    onclose?: () => void;
    sessionId?: string;
  }
  
  /**
   * Server Transport options
   */
  export interface ServerTransportOptions {
    sessionIdGenerator?: () => string;
    onsessioninitialized?: (sessionId: string) => void;
    eventStore?: unknown;
  }
  
  /**
   * Function to check if a request is an initialize request
   */
  export function isInitializeRequest(body: unknown): boolean;
  
  /**
   * OAuth Server Provider
   */
  export class ProxyOAuthServerProvider {
    constructor(options: {
      endpoints: {
        authorizationUrl: string;
        tokenUrl: string;
        revocationUrl: string;
      };
      verifyAccessToken: (token: string) => Promise<{ token: string; clientId: string; scopes: string[] }>;
      getClient: (clientId: string) => Promise<{ client_id: string; redirect_uris: string[] }>;
    });
  }
  
  /**
   * MCP Auth Router
   */
  export function mcpAuthRouter(options: {
    provider: unknown;
    issuerUrl: URL;
    baseUrl: URL;
    serviceDocumentationUrl: URL;
  }): unknown;
}

declare module '@modelcontextprotocol/sdk/server/mcp.js' {
  export { McpServer } from '@modelcontextprotocol/sdk';
}

declare module '@modelcontextprotocol/sdk/server/stdio.js' {
  export class StdioServerTransport {
    constructor();
  }
}

declare module '@modelcontextprotocol/sdk/server/streamableHttp.js' {
  import { ServerTransportOptions, Transport } from '@modelcontextprotocol/sdk';
  
  export class StreamableHTTPServerTransport implements Transport {
    constructor(options?: ServerTransportOptions);
    sessionId?: string;
    handleRequest(req: unknown, res: unknown, body?: unknown): Promise<unknown>;
    onclose?: () => void;
  }
}

declare module '@modelcontextprotocol/sdk/server/sse.js' {
  import { Transport } from '@modelcontextprotocol/sdk';
  
  export class SSEServerTransport implements Transport {
    constructor(messagesPath: string, res: unknown);
    sessionId: string;
    handlePostMessage(req: unknown, res: unknown, body?: unknown): Promise<unknown>;
    handleRequest(req: unknown, res: unknown): Promise<unknown>;
    onclose?: () => void;
  }
}

declare module '@modelcontextprotocol/sdk/types.js' {
  export function isInitializeRequest(body: unknown): boolean;
}

declare module '@modelcontextprotocol/sdk/client/index.js' {
  export class Client {
    constructor(options: { name: string; version: string });
    connect(transport: unknown): Promise<void>;
  }
}

declare module '@modelcontextprotocol/sdk/client/streamableHttp.js' {
  export class StreamableHTTPClientTransport {
    constructor(baseUrl: URL);
  }
}

declare module '@modelcontextprotocol/sdk/client/sse.js' {
  export class SSEClientTransport {
    constructor(baseUrl: URL);
  }
}