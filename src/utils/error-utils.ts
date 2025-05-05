/**
 * Error Handling Utilities
 *
 * Provides consistent error handling and formatting across the application.
 * These utilities ensure that errors from various sources are handled uniformly
 * and presented in a user-friendly format appropriate for the MCP protocol.
 */

import { AxiosError } from 'axios';

/**
 * Error types for better error classification and handling
 */
export enum ErrorType {
  VALIDATION = 'validation', // Invalid input parameters
  NETWORK = 'network', // Network connectivity issues
  API = 'api', // API response errors
  TIMEOUT = 'timeout', // Request timeouts
  AUTH = 'auth', // Authentication/authorization failures
  RATE_LIMIT = 'rate_limit', // Rate limiting or quota exceeded
  SERVER = 'server', // Server-side errors
  CLIENT = 'client', // Client-side errors
  UNKNOWN = 'unknown', // Unclassified errors
}

/**
 * Structured error object with consistent fields for better error handling
 */
export interface FormattedError {
  message: string; // Human-readable error message
  type: ErrorType; // Error classification
  status?: number; // HTTP status code if applicable
  details?: string; // Additional error details
  retryable?: boolean; // Whether the error is potentially retryable
  errorCode?: string; // Specific error code if available
}

/**
 * Transforms any error into a consistent FormattedError structure
 *
 * @param error - The error object to transform
 * @param context - Optional context string to prefix the error message
 * @returns A standardized FormattedError object
 */
export function transformError(error: unknown, context: string = ''): FormattedError {
  // Set context prefix if provided
  const contextPrefix = context ? `${context}: ` : '';

  // Handle standard Error objects
  if (error instanceof Error) {
    // Only include stack traces in non-production environments
    const isProduction = process.env.NODE_ENV === 'production';
    const safeDetails = isProduction ? 'Error details omitted in production' : error.stack;
    
    // Check for network errors
    if (error.message.includes('timeout')) {
      return {
        message: `${contextPrefix}Request timed out. The operation took too long to complete.`,
        type: ErrorType.TIMEOUT,
        details: safeDetails,
        retryable: true,
      };
    }

    if (error.message.includes('network') || error.message.includes('connection')) {
      return {
        message: `${contextPrefix}Network error: Connection failed or interrupted.`,
        type: ErrorType.NETWORK,
        details: safeDetails,
        retryable: true,
      };
    }

    // Default Error handling
    return {
      message: `${contextPrefix}${error.message}`,
      type: ErrorType.UNKNOWN,
      details: safeDetails,
    };
  }

  // Handle Axios errors with rich error information
  const axiosError = error as AxiosError;
  if (axiosError.isAxiosError) {
    if (axiosError.response) {
      const status = axiosError.response.status;
      const data = axiosError.response.data as Record<string, unknown>;

      // Extract error message from response data
      const errorMessage =
        data?.error ||
        data?.message ||
        data?.errorMessage ||
        data?.error_message ||
        axiosError.message;

      // Extract error code if available
      const errorCode =
        data?.code || data?.errorCode || data?.error_code || axiosError.code || String(status);

      // Determine error type based on status code
      let type = ErrorType.API;
      let retryable = false;

      if (status === 400 || status === 422) {
        type = ErrorType.VALIDATION;
        retryable = false;
      } else if (status === 401 || status === 403) {
        type = ErrorType.AUTH;
        retryable = false;
      } else if (status === 429) {
        type = ErrorType.RATE_LIMIT;
        retryable = true;
      } else if (status >= 500) {
        type = ErrorType.SERVER;
        retryable = true;
      } else if (status >= 400 && status < 500) {
        type = ErrorType.CLIENT;
        retryable = false;
      }

      // Only include detailed response data in non-production environments
      const isProduction = process.env.NODE_ENV === 'production';
      const safeDetails = isProduction 
        ? `Status code: ${status}` 
        : JSON.stringify(data);

      return {
        message: `${contextPrefix}API error (${status}): ${errorMessage}`,
        type,
        status,
        details: safeDetails,
        retryable,
        errorCode,
      };
    }

    if (axiosError.request) {
      // Request was made but no response received
      // Only include detailed request info in non-production environments
      const isProduction = process.env.NODE_ENV === 'production';
      const safeRequestDetails = isProduction 
        ? 'Request details omitted in production' 
        : String(axiosError.request);
        
      return {
        message: `${contextPrefix}Network error: Request sent but no response received.`,
        type: ErrorType.NETWORK,
        details: safeRequestDetails,
        retryable: true,
      };
    }

    // Axios error during request configuration
    const isProduction = process.env.NODE_ENV === 'production';
    const safeStackDetails = isProduction ? 'Stack trace omitted in production' : axiosError.stack;
    
    return {
      message: `${contextPrefix}Request error: ${axiosError.message}`,
      type: ErrorType.CLIENT,
      details: safeStackDetails,
      retryable: false,
    };
  }

  // Default case for unknown errors
  return {
    message: `${contextPrefix}Unknown error: ${String(error)}`,
    type: ErrorType.UNKNOWN,
    retryable: false,
  };
}

/**
 * Formats errors for MCP protocol responses
 *
 * @param error - The error to format
 * @param context - Optional context to add to the error message
 * @returns An array of MCP content objects for the error
 */
export function formatErrorForMCP(
  error: unknown,
  context: string = ''
): Array<{ type: string; text: string }> {
  const formattedError = transformError(error, context);

  // For validation errors, provide more detailed information to help users correct the issue
  if (formattedError.type === ErrorType.VALIDATION && formattedError.details) {
    try {
      const details = JSON.parse(formattedError.details);
      // If there are validation details, include them
      if (details.errors || details.validationErrors || details.fields) {
        const validationErrors = details.errors || details.validationErrors || details.fields;
        return [
          { type: 'text', text: formattedError.message },
          { type: 'text', text: `Validation errors: ${JSON.stringify(validationErrors, null, 2)}` },
        ];
      }
    } catch (e) {
      // If parsing fails, continue with standard formatting
    }
  }

  return [{ type: 'text', text: formattedError.message }];
}

/**
 * Handles critical errors by logging and throwing formatted errors
 * Use this for errors that should terminate the current operation
 *
 * @param error - The error to handle
 * @param context - Context for the error
 * @throws Always throws an error with formatted message
 */
export function handleCriticalError(error: unknown, context: string): never {
  const formattedError = transformError(error, context);
  
  // In production, only log the message and type without sensitive details
  if (process.env.NODE_ENV === 'production') {
    console.error(`CRITICAL ERROR in ${context}:`, {
      message: formattedError.message,
      type: formattedError.type,
      status: formattedError.status
    });
  } else {
    // Full detailed logging in non-production environments
    console.error(`CRITICAL ERROR in ${context}:`, formattedError);
  }
  
  throw new Error(formattedError.message);
}

/**
 * Creates a custom error class for application-specific errors
 */
export class Crawl4AIError extends Error {
  type: ErrorType;
  status?: number;
  details?: string;
  retryable: boolean;

  constructor(
    message: string,
    type: ErrorType = ErrorType.UNKNOWN,
    status?: number,
    details?: string,
    retryable = false
  ) {
    super(message);
    this.name = 'Crawl4AIError';
    this.type = type;
    this.status = status;
    this.details = details;
    this.retryable = retryable;

    // Ensure prototype chain works correctly
    Object.setPrototypeOf(this, Crawl4AIError.prototype);
  }
}

export default {
  transformError,
  formatErrorForMCP,
  handleCriticalError,
  Crawl4AIError,
  ErrorType,
};
