/**
 * Shared TypeScript types for the application
 */

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
 * Base handler type for all tool handlers
 */
export type ToolHandler<T> = (params: T) => Promise<MCPResponse>;

/**
 * Configuration object for tool registration
 */
export interface ToolConfig {
  name: string;
  description: string;
  parameters: object;
  handler: (params: Record<string, unknown>, rawEnv?: unknown) => Promise<MCPResponse>;
}
