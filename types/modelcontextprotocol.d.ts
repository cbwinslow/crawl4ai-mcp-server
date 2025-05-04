/**
 * Type declarations for @modelcontextprotocol/sdk
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
    parameters: Record<string, any>;
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
    handler: (params: any, rawEnv?: any) => Promise<MCPResponse>;
  }
  
  /**
   * MCP Server class
   */
  export class MCPServer {
    /**
     * Constructor
     */
    constructor();
    
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
  }
  
  /**
   * Creates a Cloudflare Worker transport for the MCP server
   */
  export function createWorkerTransport(server: MCPServer, request: Request): {
    handleRequest: () => Promise<Response>;
  };
}