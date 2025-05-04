/**
 * Error Handling Utilities
 * 
 * Provides consistent error handling and formatting across the application.
 */

import { AxiosError } from 'axios';

/**
 * Error types for better error classification
 */
export enum ErrorType {
  VALIDATION = 'validation',
  NETWORK = 'network',
  API = 'api',
  TIMEOUT = 'timeout',
  AUTH = 'auth',
  UNKNOWN = 'unknown'
}

/**
 * Structured error object with consistent fields
 */
export interface FormattedError {
  message: string;
  type: ErrorType;
  status?: number;
  details?: string;
}

/**
 * Transforms any error into a consistent FormattedError structure
 */
export function transformError(error: unknown, context: string = ''): FormattedError {
  // Handle standard Error objects
  if (error instanceof Error) {
    // Check for network errors like timeouts or connection failures
    if (error.message.includes('timeout') || error.message.includes('network')) {
      return {
        message: `${context ? `${context}: ` : ''}${error.message}`,
        type: ErrorType.TIMEOUT,
        details: error.stack
      };
    }
    
    // Default Error handling
    return {
      message: `${context ? `${context}: ` : ''}${error.message}`,
      type: ErrorType.UNKNOWN,
      details: error.stack
    };
  }
  
  // Handle Axios errors with rich error information
  const axiosError = error as AxiosError;
  if (axiosError.response) {
    const status = axiosError.response.status;
    const data = axiosError.response.data as any;
    
    // Determine error type based on status code
    let type = ErrorType.API;
    if (status === 401 || status === 403) type = ErrorType.AUTH;
    if (status === 400 || status === 422) type = ErrorType.VALIDATION;
    
    return {
      message: `API error (${status}): ${data?.error || data?.message || axiosError.message}`,
      type,
      status,
      details: JSON.stringify(data)
    };
  }
  
  if (axiosError.request) {
    // Request was made but no response received
    return {
      message: 'Network error: No response received',
      type: ErrorType.NETWORK,
      details: String(axiosError.request)
    };
  }
  
  // Default case for unknown errors
  return {
    message: `Unknown error: ${String(error)}`,
    type: ErrorType.UNKNOWN
  };
}

/**
 * Formats errors for MCP protocol responses
 */
export function formatErrorForMCP(error: unknown, context: string = ''): Array<{type: string, text: string}> {
  const formattedError = transformError(error, context);
  return [{ type: 'text', text: formattedError.message }];
}

/**
 * Handles critical errors by logging and throwing formatted errors
 */
export function handleCriticalError(error: unknown, context: string): never {
  const formattedError = transformError(error, context);
  console.error(`${context}:`, formattedError);
  throw new Error(formattedError.message);
}

export default {
  transformError,
  formatErrorForMCP,
  handleCriticalError,
  ErrorType
};