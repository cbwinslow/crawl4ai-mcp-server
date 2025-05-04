/**
 * Error Utils Tests
 *
 * Unit tests for the error handling utility functions.
 */

import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import {
  transformError,
  formatErrorForMCP,
  handleCriticalError,
  ErrorType,
  Crawl4AIError,
} from '../../../src/utils/error-utils';

describe('Error Utils', () => {
  describe('transformError', () => {
    it('should transform standard Error objects', () => {
      const error = new Error('Test error');
      const result = transformError(error);

      expect(result).toEqual({
        message: 'Test error',
        type: ErrorType.UNKNOWN,
        details: error.stack,
      });
    });

    it('should include context when provided', () => {
      const error = new Error('Test error');
      const result = transformError(error, 'Operation context');

      expect(result.message).toBe('Operation context: Test error');
    });

    it('should identify timeout errors', () => {
      const error = new Error('Request timeout');
      const result = transformError(error);

      expect(result.type).toBe(ErrorType.TIMEOUT);
    });

    it('should identify network errors', () => {
      const error = new Error('network error occurred');
      const result = transformError(error);

      expect(result.type).toBe(ErrorType.NETWORK);
    });

    // Direct mock approach for Axios errors with different response codes
    it('should transform validation errors (400)', () => {
      // Create a mock that closely matches the structure Axios would generate
      const axiosError = {
        isAxiosError: true,
        name: 'AxiosError',
        message: 'Request failed with status code 400',
        response: {
          status: 400,
          data: { error: 'Invalid parameters' },
          statusText: 'Bad Request',
          headers: {},
          config: {},
        },
        code: 'ERR_BAD_REQUEST',
        stack: 'Error: Request failed with status code 400\n    at test',
      } as any;

      const result = transformError(axiosError);
      expect(result.type).toBe(ErrorType.VALIDATION);
      expect(result.retryable).toBe(false);
    });

    it('should handle auth errors (401)', () => {
      const axiosError = {
        isAxiosError: true,
        name: 'AxiosError',
        message: 'Request failed with status code 401',
        response: {
          status: 401,
          data: { error: 'Invalid API key' },
          statusText: 'Unauthorized',
          headers: {},
          config: {},
        },
        code: 'ERR_UNAUTHORIZED',
      } as any;

      const result = transformError(axiosError);
      expect(result.type).toBe(ErrorType.AUTH);
      expect(result.retryable).toBe(false);
    });

    it('should handle rate limiting errors (429)', () => {
      const axiosError = {
        isAxiosError: true,
        name: 'AxiosError',
        message: 'Request failed with status code 429',
        response: {
          status: 429,
          data: { error: 'Rate limit exceeded' },
          statusText: 'Too Many Requests',
          headers: {},
          config: {},
        },
        code: 'ERR_TOO_MANY_REQUESTS',
      } as any;

      const result = transformError(axiosError);
      expect(result.type).toBe(ErrorType.RATE_LIMIT);
      expect(result.retryable).toBe(true);
    });

    it('should handle server errors (500)', () => {
      const axiosError = {
        isAxiosError: true,
        name: 'AxiosError',
        message: 'Request failed with status code 500',
        response: {
          status: 500,
          data: { error: 'Server error occurred' },
          statusText: 'Internal Server Error',
          headers: {},
          config: {},
        },
        code: 'ERR_SERVER_ERROR',
      } as any;

      const result = transformError(axiosError);
      expect(result.type).toBe(ErrorType.SERVER);
      expect(result.retryable).toBe(true);
    });

    it('should handle axios errors with request but no response', () => {
      const axiosError = {
        isAxiosError: true,
        name: 'AxiosError',
        message: 'Network Error',
        request: {
          responseURL: 'https://api.example.com/endpoint',
          status: 0,
          responseText: '',
          readyState: 4,
        },
        response: undefined,
        code: 'ECONNABORTED',
      } as any;

      const result = transformError(axiosError);
      expect(result.type).toBe(ErrorType.NETWORK);
      expect(result.retryable).toBe(true);
    });

    it('should handle unknown errors', () => {
      const result = transformError('Unknown error');

      expect(result).toEqual({
        message: 'Unknown error: Unknown error',
        type: ErrorType.UNKNOWN,
        retryable: false,
      });
    });
  });

  describe('formatErrorForMCP', () => {
    it('should format errors for MCP protocol', () => {
      const error = new Error('Test error');
      const result = formatErrorForMCP(error);

      expect(result).toEqual([{ type: 'text', text: 'Test error' }]);
    });

    it('should include context in formatted MCP error', () => {
      const error = new Error('Test error');
      const result = formatErrorForMCP(error, 'Operation context');

      expect(result).toEqual([{ type: 'text', text: 'Operation context: Test error' }]);
    });
  });

  describe('handleCriticalError', () => {
    let consoleErrorSpy: any;

    beforeEach(() => {
      consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
      consoleErrorSpy.mockRestore();
    });

    it('should log and throw formatted errors', () => {
      const error = new Error('Critical error');

      expect(() => {
        handleCriticalError(error, 'Critical operation');
      }).toThrow('Critical operation: Critical error');

      expect(consoleErrorSpy).toHaveBeenCalled();
    });
  });

  describe('Crawl4AIError', () => {
    it('should create a custom error with proper type', () => {
      const error = new Crawl4AIError('Test custom error', ErrorType.VALIDATION);

      expect(error).toBeInstanceOf(Error);
      expect(error.name).toBe('Crawl4AIError');
      expect(error.message).toBe('Test custom error');
      expect(error.type).toBe(ErrorType.VALIDATION);
    });

    it('should default to UNKNOWN error type', () => {
      const error = new Crawl4AIError('Unknown error type');

      expect(error.type).toBe(ErrorType.UNKNOWN);
    });

    it('should include optional properties when provided', () => {
      const error = new Crawl4AIError(
        'Error with details',
        ErrorType.API,
        403,
        'Detailed information',
        true
      );

      expect(error.status).toBe(403);
      expect(error.details).toBe('Detailed information');
      expect(error.retryable).toBe(true);
    });
  });
});
