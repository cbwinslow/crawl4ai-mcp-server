/**
 * Tool Handler Factory
 *
 * Creates standardized handlers for Crawl4AI operations with consistent
 * parameter validation, error handling, and response formatting.
 */

// Import Zod types when needed in the future
// import { z } from 'zod';
import adapter from '../adapters';
import { formatContent } from './format-utils';
import { formatErrorForMCP } from './error-utils';
import { MCPResponse, ToolHandler } from '../types';

/**
 * Options for customizing handler behavior
 */
interface HandlerOptions<T extends Record<string, unknown>, R> {
  /** Optional parameter validation function */
  validateParams?: (params: T) => void;

  /** Optional response transformation function */
  transformResponse?: (response: R) => unknown;

  /** Optional empty response message */
  emptyResponseMessage?: (params: T) => string;

  /** Optional error context */
  errorContext?: (params: T) => string;
}

/**
 * Factory function to create standardized handlers for Crawl4AI operations
 * 
 * This function creates a handler that:
 * 1. Validates parameters with the provided validator
 * 2. Extracts main parameters (url, query, id) and passes them to the adapter
 * 3. Transforms and formats the response for MCP protocol
 * 4. Handles and formats errors consistently
 * 
 * @typeParam T - The type of parameters the handler accepts
 * @typeParam K - The key of the adapter method to call
 * @param adapterMethod - The method name on the adapter to call
 * @param options - Optional configuration for validation, transformation, and error handling
 * @returns A function that handles MCP tool requests with consistent error handling
 */
export function createHandler<T extends Record<string, unknown>, K extends keyof typeof adapter>(
  adapterMethod: K,
  options: HandlerOptions<T, Awaited<ReturnType<(typeof adapter)[K]>>> = {}
): ToolHandler<T> {
  return async (params: T): Promise<MCPResponse> => {
    try {
      // Optional parameter validation
      if (options.validateParams) {
        options.validateParams(params);
      }

      // Extract main parameters based on convention (url or query)
      const mainParam = (params.url as string) || (params.query as string) || (params.id as string);
      const restParams = { ...params };

      if ('url' in params) delete restParams.url;
      if ('query' in params) delete restParams.query;
      if ('id' in params) delete restParams.id;

      // Call the adapter method with appropriate parameters
      // We need to handle each adapter method signature pattern
      let response;
      if ('urls' in params && Array.isArray(params.urls)) {
        // For extract method that takes array of URLs as first param
        response = await (adapter[adapterMethod] as (
          urls: string[], 
          options: Record<string, unknown>
        ) => Promise<unknown>)(params.urls, restParams);
      } else {
        // For methods that take a single string param (url, query, id) and options
        response = await (adapter[adapterMethod] as (
          param: string, 
          options: Record<string, unknown>
        ) => Promise<unknown>)(mainParam, restParams);
      }

      // Handle empty response
      if (!response) {
        const message = options.emptyResponseMessage
          ? options.emptyResponseMessage(params)
          : `No content was returned from ${mainParam}.`;

        return {
          content: [{ type: 'text', text: message }],
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
 * 
 * This function returns a validator that can be used with the createHandler factory
 * to enforce that a specific parameter exists and is a string value. If validation
 * fails, it throws an error with a custom or default message.
 * 
 * @typeParam T - The type of parameters to validate
 * @param paramName - The name of the parameter to validate
 * @param errorMessage - Optional custom error message
 * @returns A validation function that can be passed to createHandler's options
 * @throws Error if the parameter doesn't exist or isn't a string
 */
export function createStringValidator<T extends Record<string, unknown>>(
  paramName: keyof T,
  errorMessage?: string
): (params: T) => void {
  return (params: T) => {
    const value = params[paramName];
    if (!value || typeof value !== 'string') {
      throw new Error(errorMessage || `${String(paramName)} is required and must be a string`);
    }
  };
}

/**
 * Creates a validator function that checks if a parameter exists and is an array
 * 
 * This function returns a validator that can be used with the createHandler factory
 * to enforce that a specific parameter exists and is an array. If validation
 * fails, it throws an error with a custom or default message.
 * 
 * @typeParam T - The type of parameters to validate
 * @param paramName - The name of the parameter to validate
 * @param errorMessage - Optional custom error message
 * @returns A validation function that can be passed to createHandler's options
 * @throws Error if the parameter doesn't exist or isn't an array
 */
export function createArrayValidator<T extends Record<string, unknown>>(
  paramName: keyof T,
  errorMessage?: string
): (params: T) => void {
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
  createArrayValidator,
};
