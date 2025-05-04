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
  ErrorType
} from '../../../src/utils/error-utils';
import { mockAxiosError } from '../../helpers';

describe('Error Utils', () => {
  describe('transformError', () => {
    it('should transform standard Error objects', () => {
      const error = new Error('Test error');
      const result = transformError(error);
      
      expect(result).toEqual({
        message: 'Test error',
        type: ErrorType.UNKNOWN,
        details: error.stack
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
      
      expect(result.type).toBe(ErrorType.TIMEOUT);
    });
    
    it('should transform axios errors with response', () => {
      const error = mockAxiosError('Bad request', 'ECONNABORTED', {
        status: 400,
        data: { error: 'Invalid parameters' }
      });
      
      const result = transformError(error);
      
      expect(result).toEqual({
        message: 'API error (400): Invalid parameters',
        type: ErrorType.VALIDATION,
        status: 400,
        details: JSON.stringify({ error: 'Invalid parameters' })
      });
    });
    
    it('should handle auth errors', () => {
      const error = mockAxiosError('Unauthorized', 'ECONNABORTED', {
        status: 401,
        data: { error: 'Invalid API key' }
      });
      
      const result = transformError(error);
      
      expect(result.type).toBe(ErrorType.AUTH);
    });
    
    it('should handle axios errors with request but no response', () => {
      const error = mockAxiosError('Network Error', 'ECONNABORTED') as any;
      error.response = undefined;
      error.request = { responseText: 'No response' };
      
      const result = transformError(error);
      
      expect(result).toEqual({
        message: 'Network error: No response received',
        type: ErrorType.NETWORK,
        details: String(error.request)
      });
    });
    
    it('should handle unknown errors', () => {
      const result = transformError('Unknown error');
      
      expect(result).toEqual({
        message: 'Unknown error: Unknown error',
        type: ErrorType.UNKNOWN
      });
    });
  });
  
  describe('formatErrorForMCP', () => {
    it('should format errors for MCP protocol', () => {
      const error = new Error('Test error');
      const result = formatErrorForMCP(error);
      
      expect(result).toEqual([
        { type: 'text', text: 'Test error' }
      ]);
    });
    
    it('should include context in formatted MCP error', () => {
      const error = new Error('Test error');
      const result = formatErrorForMCP(error, 'Operation context');
      
      expect(result).toEqual([
        { type: 'text', text: 'Operation context: Test error' }
      ]);
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
});