/**
 * Tool Handler Factory
 * 
 * Creates standardized handlers for Crawl4AI operations with consistent
 * parameter validation, error handling, and response formatting.
 */

import { z } from 'zod';
import adapter from '../adapters';
import { formatContent } from './format-utils';
import { formatErrorForMCP } from './error-utils';
import { MCPResponse, ToolHandler } from '../types';

/**
 * Options for customizing handler behavior
 */
interface HandlerOptions<T, R> {
  /** Optional parameter validation function */
  validateParams?: (params: T) => void;
  
  /** Optional response transformation function */
  transformResponse?: (response: R) => any;
  
  /** Optional empty response message */
  emptyResponseMessage?: (params: T) => string;
  
  /** Optional error context */
  errorContext?: (params: T) => string;
}

/**
 * Factory function to create standardized handlers for Crawl4AI operations
 */
export function createHandler<T, K extends keyof typeof adapter>(
  adapterMethod: K,
  options: HandlerOptions<T, Awaited<ReturnType<typeof adapter[K]>>> = {}
): ToolHandler<T> {
  
  return async (params: T): Promise<MCPResponse> => {
    try {
      // Optional parameter validation
      if (options.validateParams) {
        options.validateParams(params);
      }
      
      // Extract main parameters based on convention (url or query)
      const mainParam = (params as any).url || (params as any).query || (params as any).id;
      const restParams = { ...params };
      if ((params as any).url) delete (restParams as any).url;
      if ((params as any).query) delete (restParams as any).query;
      if ((params as any).id) delete (restParams as any).id;
      
      // Call the adapter method with appropriate parameters
      // We need to handle each adapter method signature pattern
      let response;
      if ((params as any).urls) {
        // For extract method that takes array of URLs as first param
        response = await (adapter[adapterMethod] as any)((params as any).urls, restParams);
      } else {
        // For methods that take a single string param (url, query, id) and options
        response = await (adapter[adapterMethod] as any)(mainParam, restParams);
      }
      
      // Handle empty response
      if (!response) {
        const message = options.emptyResponseMessage 
          ? options.emptyResponseMessage(params)
          : `No content was returned from ${mainParam}.`;
          
        return {
          content: [{ type: 'text', text: message }]
        };
      }
      
      // Transform the response if needed
      const transformedResponse = options.transformResponse 
        ? options.transformResponse(response) 
        : response;
      
      // Format for MCP
      return { content: formatContent(transformedResponse) };
    } catch (error) {
      // Get error context
      const context = options.errorContext 
        ? options.errorContext(params)
        : `Error during operation`;
        
      // Format and return error
      return { content: formatErrorForMCP(error, context) };
    }
  };
}

/**
 * Creates a validator function that checks if a parameter exists and is a string
 */
export function createStringValidator<T>(paramName: keyof T, errorMessage?: string): (params: T) => void {
  return (params: T) => {
    const value = params[paramName];
    if (!value || typeof value !== 'string') {
      throw new Error(errorMessage || `${String(paramName)} is required and must be a string`);
    }
  };
}

/**
 * Creates a validator function that checks if a parameter exists and is an array
 */
export function createArrayValidator<T>(paramName: keyof T, errorMessage?: string): (params: T) => void {
  return (params: T) => {
    const value = params[paramName];
    if (!value || !Array.isArray(value)) {
      throw new Error(errorMessage || `${String(paramName)} is required and must be an array`);
    }
  };
}

export default {
  createHandler,
  createStringValidator,
  createArrayValidator
};