/**
 * Crawl4AI Adapter Tests
 *
 * Unit tests for the Crawl4AI API adapter.
 */

import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import axios, { AxiosError, AxiosResponse } from 'axios';
import { Crawl4AIAdapter } from '../../../src/adapters/crawl4ai-adapter';

// Define a custom type for our mocked Axios errors
interface MockAxiosError extends Omit<AxiosError, 'response'> {
  isAxiosError: boolean;
  message: string;
  code?: string;
  response?: {
    status: number;
    data: unknown;
    statusText: string;
    headers: Record<string, string>;
    config: Record<string, unknown>;
  };
  request?: unknown;
}

// Create mock axios instance with proper types
const mockAxiosInstance = {
  get: jest.fn(),
  post: jest.fn(),
  defaults: {
    headers: {
      common: {
        Authorization: undefined,
      },
    },
    baseURL: '',
  },
};

// Mock axios before test execution
beforeEach(() => {
  // Reset our mock implementation
  jest.resetAllMocks();
  // Mock implementation of axios.create to return our mock instance
  (axios.create as jest.Mock).mockReturnValue(mockAxiosInstance);
});

// Mock axios module
jest.mock('axios', () => {
  return {
    create: jest.fn(() => mockAxiosInstance),
    defaults: {
      headers: {
        common: {},
      },
    },
  };
});

describe('Crawl4AIAdapter', () => {
  let adapter: Crawl4AIAdapter;

  beforeEach(() => {
    // Clear mock calls for assertions
    jest.clearAllMocks();

    // Make sure our mockAxiosInstance is properly initialized before each test
    (axios as unknown as { create: jest.Mock }).create = jest.fn(() => mockAxiosInstance);

    // Create the adapter
    adapter = new Crawl4AIAdapter('test-api-key', 'https://api.crawl4ai.com');
  });

  describe('constructor', () => {
    it('should create an instance with default values', () => {
      // Using _ to indicate unused variable to TypeScript
      const _ = new Crawl4AIAdapter();
      expect(axios.create).toHaveBeenCalledWith(
        expect.objectContaining({
          baseURL: 'http://localhost:11235',
        })
      );
    });

    it('should create an instance with custom values', () => {
      expect(axios.create).toHaveBeenCalledWith(
        expect.objectContaining({
          baseURL: 'https://api.crawl4ai.com',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'User-Agent': 'Crawl4AI-MCP-Server/1.0.0',
          }),
        })
      );
    });

    it('should set the API key when provided', () => {
      expect(mockAxiosInstance.defaults.headers.common['Authorization']).toBe(
        'Bearer test-api-key'
      );
    });
  });

  describe('setApiKey', () => {
    it('should set the API key in headers', () => {
      adapter.setApiKey('new-api-key');
      expect(mockAxiosInstance.defaults.headers.common['Authorization']).toBe('Bearer new-api-key');
    });

    it('should do nothing when API key is empty', () => {
      adapter.setApiKey('');
      expect(mockAxiosInstance.defaults.headers.common['Authorization']).toBe(
        'Bearer test-api-key'
      );
    });
  });

  describe('configure', () => {
    it('should set API key when provided', () => {
      adapter.configure({ apiKey: 'configured-key' });
      expect(mockAxiosInstance.defaults.headers.common['Authorization']).toBe(
        'Bearer configured-key'
      );
    });

    it('should set base URL when provided', () => {
      adapter.configure({ baseUrl: 'https://new-api.crawl4ai.com' });
      expect(mockAxiosInstance.defaults.baseURL).toBe('https://new-api.crawl4ai.com');
    });

    it('should set both API key and base URL when provided', () => {
      adapter.configure({
        apiKey: 'both-key',
        baseUrl: 'https://both-api.crawl4ai.com',
      });

      expect(mockAxiosInstance.defaults.headers.common['Authorization']).toBe('Bearer both-key');
      expect(mockAxiosInstance.defaults.baseURL).toBe('https://both-api.crawl4ai.com');
    });
  });

  describe('transformParams', () => {
    it('should transform parameters from camelCase to snake_case', async () => {
      mockAxiosInstance.post.mockResolvedValueOnce({
        data: { success: true },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {},
      });

      await adapter.scrape('https://example.com', {
        includeTags: ['div', 'p'],
        removeBase64Images: true,
      });

      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        '/scrape',
        expect.objectContaining({
          url: 'https://example.com',
          include_tags: ['div', 'p'],
          remove_base64_images: true,
        }),
        expect.anything()
      );
    });

    it('should transform nested objects recursively', async () => {
      mockAxiosInstance.post.mockResolvedValueOnce({
        data: { success: true },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {},
      });

      await adapter.scrape('https://example.com', {
        nestedObject: {
          propertyOne: 'value',
          propertyTwo: true,
        },
      });

      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        '/scrape',
        expect.objectContaining({
          url: 'https://example.com',
          nested_object: {
            property_one: 'value',
            property_two: true,
          },
        }),
        expect.anything()
      );
    });

    it('should transform arrays of objects', async () => {
      mockAxiosInstance.post.mockResolvedValueOnce({
        data: { success: true },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {},
      });

      await adapter.scrape('https://example.com', {
        actions: [
          {
            actionType: 'click',
            cssSelector: 'button',
          },
          {
            actionType: 'wait',
            timeoutMs: 1000,
          },
        ],
      });

      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        '/scrape',
        expect.objectContaining({
          url: 'https://example.com',
          actions: [
            {
              action_type: 'click',
              css_selector: 'button',
            },
            {
              action_type: 'wait',
              timeout_ms: 1000,
            },
          ],
        }),
        expect.anything()
      );
    });

    it('should ignore undefined values', async () => {
      mockAxiosInstance.post.mockResolvedValueOnce({
        data: { success: true },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {},
      });

      await adapter.scrape('https://example.com', {
        definedValue: 'value',
        undefinedValue: undefined,
      });

      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        '/scrape',
        expect.objectContaining({
          url: 'https://example.com',
          defined_value: 'value',
        }),
        expect.anything()
      );

      // The undefined value should not be in the params
      const calledParams = mockAxiosInstance.post.mock.calls[0][1] as Record<string, any>;
      expect('undefined_value' in calledParams).toBe(false);
    });
  });

  describe('Error handling', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      
      // Save original NODE_ENV
      this.originalNodeEnv = process.env.NODE_ENV;
    });
    
    afterEach(() => {
      // Restore original NODE_ENV
      process.env.NODE_ENV = this.originalNodeEnv;
    });

    it('should handle network errors', async () => {
      const networkError: MockAxiosError = {
        isAxiosError: true,
        message: 'Network Error',
        code: 'ECONNABORTED',
        request: {},
      };

      mockAxiosInstance.post.mockRejectedValueOnce(networkError);

      await expect(adapter.scrape('https://example.com')).rejects.toThrow(
        'Network Error while calling API POST /scrape'
      );
    });

    it('should handle timeout errors', async () => {
      const timeoutError: MockAxiosError = {
        isAxiosError: true,
        message: 'timeout of 60000ms exceeded',
        code: 'ECONNABORTED',
        request: {},
      };

      mockAxiosInstance.post.mockRejectedValueOnce(timeoutError);

      await expect(adapter.scrape('https://example.com')).rejects.toThrow(
        'Request timed out while calling API POST /scrape'
      );
    });

    it('should handle DNS resolution errors', async () => {
      const dnsError: MockAxiosError = {
        isAxiosError: true,
        message: 'getaddrinfo ENOTFOUND nonexistent.domain.com',
        code: 'ENOTFOUND',
        request: {},
      };

      mockAxiosInstance.post.mockRejectedValueOnce(dnsError);

      await expect(adapter.scrape('https://nonexistent.domain.com')).rejects.toThrow(
        'Cannot resolve host: nonexistent.domain.com'
      );
    });

    it('should handle non-axios errors', async () => {
      const genericError = new Error('Something unexpected happened');
      
      mockAxiosInstance.post.mockRejectedValueOnce(genericError);

      await expect(adapter.scrape('https://example.com')).rejects.toThrow(
        'Something unexpected happened'
      );
    });
    
    it('should handle empty response data', async () => {
      mockAxiosInstance.post.mockResolvedValueOnce({
        data: null,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {},
      });
      
      const result = await adapter.scrape('https://example.com');
      expect(result).toEqual({});
    });

    it('should handle special deepResearch error gracefully', async () => {
      const researchError: MockAxiosError = {
        isAxiosError: true,
        message: 'Research servers unavailable',
        response: {
          status: 503,
          data: { error: 'Research service temporarily unavailable' },
          statusText: 'Service Unavailable',
          headers: {},
          config: {},
        },
      };

      mockAxiosInstance.post.mockRejectedValueOnce(researchError);
      
      // deepResearch has special error handling to return a structured result even on error
      const result = await adapter.deepResearch('test query');
      
      expect(result).toEqual({
        query: 'test query',
        success: false,
        results: { summary: '', sources: [] },
        error: expect.stringContaining('Research service temporarily unavailable'),
      });
    });

    it('should include detailed error for API responses with error details', async () => {
      const detailedError: MockAxiosError = {
        isAxiosError: true,
        message: 'Request failed with status code 400',
        response: {
          status: 400,
          data: { 
            error: 'Bad Request', 
            message: 'Invalid URL format', 
            details: 'URL must begin with http:// or https://'
          },
          statusText: 'Bad Request',
          headers: {},
          config: {},
        },
      };

      mockAxiosInstance.post.mockRejectedValueOnce(detailedError);
      
      await expect(adapter.scrape('invalid-url')).rejects.toThrow(
        'API error (400): Invalid URL format'
      );
    });
    
    it('should handle malformed API error responses', async () => {
      const malformedError: MockAxiosError = {
        isAxiosError: true,
        message: 'Request failed with status code 500',
        response: {
          status: 500,
          data: 'Internal Server Error', // String instead of object
          statusText: 'Internal Server Error',
          headers: {},
          config: {},
        },
      };

      mockAxiosInstance.post.mockRejectedValueOnce(malformedError);
      
      await expect(adapter.scrape('https://example.com')).rejects.toThrow(
        'API error (500): Internal Server Error'
      );
    });
    
    it('should handle errors differently in production environment', async () => {
      // Mock console.error
      const originalConsoleError = console.error;
      const mockConsoleError = jest.fn();
      console.error = mockConsoleError;
      
      try {
        // Set production environment
        process.env.NODE_ENV = 'production';
        
        const detailedError = {
          isAxiosError: true,
          message: 'Request failed with status code 500',
          response: {
            status: 500,
            data: { 
              error: 'Internal Server Error',
              sensitive_data: 'This should not be logged',
              stack_trace: 'Long stack trace that should be hidden in production'
            },
            statusText: 'Internal Server Error',
            headers: {},
            config: {},
          },
        } as any;

        mockAxiosInstance.post.mockRejectedValueOnce(detailedError);
        
        try {
          await adapter.scrape('https://example.com');
        } catch (error) {
          // Expected to throw, but we want to check console.error
        }
        
        // Check that console.error was called, but without sensitive information
        expect(mockConsoleError).toHaveBeenCalled();
        const consoleArgs = mockConsoleError.mock.calls[0][1];
        
        // In production environment, should not contain sensitive data
        expect(consoleArgs.data).toBeUndefined();
        expect(JSON.stringify(consoleArgs)).not.toContain('sensitive_data');
        expect(JSON.stringify(consoleArgs)).not.toContain('stack_trace');
        
        // Should still contain error type and status
        expect(consoleArgs.error.type).toBeDefined();
        expect(consoleArgs.error.status).toBe(500);
      } finally {
        // Restore console.error
        console.error = originalConsoleError;
      }
    });
    
    it('should include detailed error information in development environment', async () => {
      // Mock console.error
      const originalConsoleError = console.error;
      const mockConsoleError = jest.fn();
      console.error = mockConsoleError;
      
      try {
        // Set development environment
        process.env.NODE_ENV = 'development';
        
        const detailedError = {
          isAxiosError: true,
          message: 'Request failed with status code 500',
          response: {
            status: 500,
            data: { 
              error: 'Internal Server Error',
              sensitive_data: 'This should be logged in development',
              debug_info: 'Additional debug information'
            },
            statusText: 'Internal Server Error',
            headers: {},
            config: {},
          },
          stack: 'Error stack trace',
        } as any;

        mockAxiosInstance.post.mockRejectedValueOnce(detailedError);
        
        try {
          await adapter.scrape('https://example.com');
        } catch (error) {
          // Expected to throw, but we want to check console.error
        }
        
        // In development, detailed information should be included
        expect(mockConsoleError).toHaveBeenCalled();
        const consoleArgs = mockConsoleError.mock.calls[0][1];
        
        // Should include detailed information in development
        expect(consoleArgs.error.details).toBeDefined();
        expect(consoleArgs.data).toBeDefined();
        
        // The stringified error should contain detailed information
        const errorString = JSON.stringify(consoleArgs);
        expect(errorString).toContain('Internal Server Error');
        expect(errorString).toContain('debug_info');
      } finally {
        // Restore console.error
        console.error = originalConsoleError;
      }
    });
  });

  describe('API methods', () => {
    beforeEach(() => {
      mockAxiosInstance.post.mockReset().mockResolvedValue({
        data: { success: true },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {},
      });
      mockAxiosInstance.get.mockReset().mockResolvedValue({
        data: { success: true },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {},
      });
    });

    describe('scrape', () => {
      it('should call the scrape endpoint with params', async () => {
        await adapter.scrape('https://example.com', { formats: ['markdown'] });

        expect(mockAxiosInstance.post).toHaveBeenCalledWith(
          '/scrape',
          expect.objectContaining({
            url: 'https://example.com',
            formats: ['markdown'],
          }),
          expect.any(Object)
        );
      });

      it('should handle errors properly', async () => {
        // Create a proper Axios error structure
        const axiosError: MockAxiosError = {
          isAxiosError: true,
          name: 'AxiosError',
          message: 'Request failed with status code 400',
          response: {
            status: 400,
            data: { error: 'Invalid URL format' },
            statusText: 'Bad Request',
            headers: {},
            config: {},
          },
          code: 'ERR_SCRAPE',
        };

        mockAxiosInstance.post.mockRejectedValueOnce(axiosError);

        await expect(adapter.scrape('invalid-url')).rejects.toThrow(
          'API error (400): Invalid URL format'
        );
      });

      it('should handle 401 unauthorized error', async () => {
        const axiosError: MockAxiosError = {
          isAxiosError: true,
          message: 'Request failed with status code 401',
          response: {
            status: 401,
            data: { error: 'Unauthorized access - Invalid API key' },
            statusText: 'Unauthorized',
            headers: {},
            config: {},
          },
        };

        mockAxiosInstance.post.mockRejectedValueOnce(axiosError);
        await expect(adapter.scrape('https://example.com')).rejects.toThrow(
          'API error (401): Unauthorized access - Invalid API key'
        );
      });

      it('should handle 403 forbidden error', async () => {
        const axiosError: MockAxiosError = {
          isAxiosError: true,
          message: 'Request failed with status code 403',
          response: {
            status: 403,
            data: { error: 'Forbidden - Insufficient permissions' },
            statusText: 'Forbidden',
            headers: {},
            config: {},
          },
        };

        mockAxiosInstance.post.mockRejectedValueOnce(axiosError);
        await expect(adapter.scrape('https://example.com')).rejects.toThrow(
          'API error (403): Forbidden - Insufficient permissions'
        );
      });

      it('should handle 429 rate limit error', async () => {
        const axiosError: MockAxiosError = {
          isAxiosError: true,
          message: 'Request failed with status code 429',
          response: {
            status: 429,
            data: { error: 'Too Many Requests - Rate limit exceeded' },
            statusText: 'Too Many Requests',
            headers: {},
            config: {},
          },
        };

        mockAxiosInstance.post.mockRejectedValueOnce(axiosError);
        await expect(adapter.scrape('https://example.com')).rejects.toThrow(
          'API error (429): Too Many Requests - Rate limit exceeded'
        );
      });

      it('should handle 500 server error', async () => {
        const axiosError: MockAxiosError = {
          isAxiosError: true,
          message: 'Request failed with status code 500',
          response: {
            status: 500,
            data: { error: 'Internal Server Error' },
            statusText: 'Internal Server Error',
            headers: {},
            config: {},
          },
        };

        mockAxiosInstance.post.mockRejectedValueOnce(axiosError);
        await expect(adapter.scrape('https://example.com')).rejects.toThrow(
          'API error (500): Internal Server Error'
        );
      });

      it('should validate URL parameter', async () => {
        await expect(adapter.scrape('')).rejects.toThrow('URL is required for scraping');
        await expect(adapter.scrape(undefined as unknown as string)).rejects.toThrow('URL is required for scraping');
      });
    });

    describe('deepResearch', () => {
      it('should call the deep-research endpoint with params', async () => {
        await adapter.deepResearch('Climate change', { maxDepth: 3 });

        expect(mockAxiosInstance.post).toHaveBeenCalledWith(
          '/deep-research',
          expect.objectContaining({
            query: 'Climate change',
            max_depth: 3,
          }),
          expect.any(Object)
        );
      });

      it('should handle errors with special formatting', async () => {
        // Create a proper Axios error structure
        const axiosError = {
          isAxiosError: true,
          name: 'AxiosError',
          message: 'Research failed',
          code: 'ERR_RESEARCH',
        } as any;

        mockAxiosInstance.post.mockRejectedValueOnce(axiosError);

        const result = await adapter.deepResearch('Query');

        expect(result).toEqual({
          query: 'Query',
          success: false,
          results: { summary: '', sources: [] },
          error: expect.stringContaining('Research failed'),
        });
      });

      it('should validate query parameter', async () => {
        await expect(adapter.deepResearch('')).rejects.toThrow('Query is required for deep research');
        await expect(adapter.deepResearch(undefined as unknown as string)).rejects.toThrow('Query is required for deep research');
      });
    });

    describe('mapUrls', () => {
      it('should call the map endpoint with params', async () => {
        await adapter.mapUrls('https://example.com', {
          includeSubdomains: true,
        });

        expect(mockAxiosInstance.post).toHaveBeenCalledWith(
          '/map',
          expect.objectContaining({
            url: 'https://example.com',
            include_subdomains: true,
          }),
          expect.any(Object)
        );
      });

      it('should validate URL parameter', async () => {
        await expect(adapter.mapUrls('')).rejects.toThrow('URL is required for URL mapping');
        await expect(adapter.mapUrls(undefined as unknown as string)).rejects.toThrow('URL is required for URL mapping');
      });
    });

    describe('crawl', () => {
      it('should call the crawl endpoint with params', async () => {
        await adapter.crawl('https://example.com', { maxDepth: 2 });

        expect(mockAxiosInstance.post).toHaveBeenCalledWith(
          '/crawl',
          expect.objectContaining({
            url: 'https://example.com',
            max_depth: 2,
          }),
          expect.any(Object)
        );
      });

      it('should validate URL parameter', async () => {
        await expect(adapter.crawl('')).rejects.toThrow('URL is required for crawling');
        await expect(adapter.crawl(undefined as unknown as string)).rejects.toThrow('URL is required for crawling');
      });
    });

    describe('checkCrawlStatus', () => {
      it('should call the crawl/status endpoint with params', async () => {
        await adapter.checkCrawlStatus('abc123', { detailed: true });

        expect(mockAxiosInstance.get).toHaveBeenCalledWith(
          '/crawl/abc123/status',
          expect.objectContaining({
            params: expect.objectContaining({
              detailed: true,
            }),
          })
        );
      });

      it('should validate ID parameter', async () => {
        await expect(adapter.checkCrawlStatus('')).rejects.toThrow('Crawl ID is required to check status');
        await expect(adapter.checkCrawlStatus(undefined as unknown as string)).rejects.toThrow('Crawl ID is required to check status');
      });
    });

    describe('extract', () => {
      it('should call the extract endpoint with params', async () => {
        const urls = ['https://example.com', 'https://example.org'];
        await adapter.extract(urls, { schema: { properties: {} } });

        expect(mockAxiosInstance.post).toHaveBeenCalledWith(
          '/extract',
          expect.objectContaining({
            urls,
            schema: { properties: {} },
          }),
          expect.any(Object)
        );
      });

      it('should validate URLs parameter', async () => {
        await expect(adapter.extract([])).rejects.toThrow('At least one URL is required for extraction');
        await expect(adapter.extract(undefined as unknown as string[])).rejects.toThrow('At least one URL is required for extraction');
        await expect(adapter.extract(null as unknown as string[])).rejects.toThrow('At least one URL is required for extraction');
        await expect(adapter.extract('not-an-array' as unknown as string[])).rejects.toThrow('At least one URL is required for extraction');
      });
    });

    describe('search', () => {
      it('should call the search endpoint with params', async () => {
        await adapter.search('Query text', { limit: 10 });

        expect(mockAxiosInstance.post).toHaveBeenCalledWith(
          '/search',
          expect.objectContaining({
            query: 'Query text',
            limit: 10,
          }),
          expect.any(Object)
        );
      });

      it('should validate query parameter', async () => {
        await expect(adapter.search('')).rejects.toThrow('Search query is required');
        await expect(adapter.search(undefined as unknown as string)).rejects.toThrow('Search query is required');
      });
    });
  });
});
