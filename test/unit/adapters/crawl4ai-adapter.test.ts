/**
 * Crawl4AI Adapter Tests
 *
 * Unit tests for the Crawl4AI API adapter.
 */

import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import axios from 'axios';
import { Crawl4AIAdapter } from '../../../src/adapters/crawl4ai-adapter';
import { mockAxiosResponse, mockAxiosError } from '../../helpers';

// Mock axios
jest.mock('axios', () => ({
  create: jest.fn(() => mockAxiosInstance),
  defaults: {
    headers: {
      common: {}
    }
  }
}));

// Create mock axios instance
const mockAxiosInstance = {
  get: jest.fn(),
  post: jest.fn(),
  defaults: {
    headers: {
      common: {}
    },
    baseURL: ''
  }
};

describe('Crawl4AIAdapter', () => {
  let adapter: Crawl4AIAdapter;
  
  beforeEach(() => {
    jest.clearAllMocks();
    adapter = new Crawl4AIAdapter('test-api-key', 'https://api.crawl4ai.com');
  });
  
  describe('constructor', () => {
    it('should create an instance with default values', () => {
      const defaultAdapter = new Crawl4AIAdapter();
      expect(axios.create).toHaveBeenCalledWith(expect.objectContaining({
        baseURL: 'http://localhost:11235'
      }));
    });
    
    it('should create an instance with custom values', () => {
      expect(axios.create).toHaveBeenCalledWith(expect.objectContaining({
        baseURL: 'https://api.crawl4ai.com',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
          'User-Agent': 'Crawl4AI-MCP-Server/1.0.0'
        })
      }));
    });
    
    it('should set the API key when provided', () => {
      expect(mockAxiosInstance.defaults.headers.common['Authorization']).toBe('Bearer test-api-key');
    });
  });
  
  describe('setApiKey', () => {
    it('should set the API key in headers', () => {
      adapter.setApiKey('new-api-key');
      expect(mockAxiosInstance.defaults.headers.common['Authorization']).toBe('Bearer new-api-key');
    });
    
    it('should do nothing when API key is empty', () => {
      adapter.setApiKey('');
      expect(mockAxiosInstance.defaults.headers.common['Authorization']).toBe('Bearer test-api-key');
    });
  });
  
  describe('configure', () => {
    it('should set API key when provided', () => {
      adapter.configure({ apiKey: 'configured-key' });
      expect(mockAxiosInstance.defaults.headers.common['Authorization']).toBe('Bearer configured-key');
    });
    
    it('should set base URL when provided', () => {
      adapter.configure({ baseUrl: 'https://new-api.crawl4ai.com' });
      expect(mockAxiosInstance.defaults.baseURL).toBe('https://new-api.crawl4ai.com');
    });
    
    it('should set both API key and base URL when provided', () => {
      adapter.configure({ 
        apiKey: 'both-key', 
        baseUrl: 'https://both-api.crawl4ai.com' 
      });
      
      expect(mockAxiosInstance.defaults.headers.common['Authorization']).toBe('Bearer both-key');
      expect(mockAxiosInstance.defaults.baseURL).toBe('https://both-api.crawl4ai.com');
    });
  });
  
  describe('transformParams', () => {
    it('should transform parameters from camelCase to snake_case', async () => {
      mockAxiosInstance.post.mockResolvedValueOnce(mockAxiosResponse({ success: true }));
      
      await adapter.scrape('https://example.com', { 
        includeTags: ['div', 'p'], 
        removeBase64Images: true 
      });
      
      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        '/scrape',
        expect.objectContaining({ 
          url: 'https://example.com',
          include_tags: ['div', 'p'],
          remove_base64_images: true
        }),
        expect.anything()
      );
    });
    
    it('should transform nested objects recursively', async () => {
      mockAxiosInstance.post.mockResolvedValueOnce(mockAxiosResponse({ success: true }));
      
      await adapter.scrape('https://example.com', { 
        nestedObject: { 
          propertyOne: 'value',
          propertyTwo: true
        }
      });
      
      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        '/scrape',
        expect.objectContaining({ 
          url: 'https://example.com',
          nested_object: { 
            property_one: 'value',
            property_two: true
          }
        }),
        expect.anything()
      );
    });
    
    it('should transform arrays of objects', async () => {
      mockAxiosInstance.post.mockResolvedValueOnce(mockAxiosResponse({ success: true }));
      
      await adapter.scrape('https://example.com', { 
        actions: [
          { 
            actionType: 'click',
            cssSelector: 'button'
          },
          {
            actionType: 'wait',
            timeoutMs: 1000
          }
        ]
      });
      
      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        '/scrape',
        expect.objectContaining({ 
          url: 'https://example.com',
          actions: [
            { 
              action_type: 'click',
              css_selector: 'button'
            },
            {
              action_type: 'wait',
              timeout_ms: 1000
            }
          ]
        }),
        expect.anything()
      );
    });
    
    it('should ignore undefined values', async () => {
      mockAxiosInstance.post.mockResolvedValueOnce(mockAxiosResponse({ success: true }));
      
      await adapter.scrape('https://example.com', { 
        definedValue: 'value',
        undefinedValue: undefined
      });
      
      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        '/scrape',
        expect.objectContaining({ 
          url: 'https://example.com',
          defined_value: 'value'
        }),
        expect.anything()
      );
      
      // The undefined value should not be in the params
      const calledParams = mockAxiosInstance.post.mock.calls[0][1];
      expect('undefined_value' in calledParams).toBe(false);
    });
  });
  
  describe('API methods', () => {
    beforeEach(() => {
      mockAxiosInstance.post.mockReset().mockResolvedValue(mockAxiosResponse({ success: true }));
      mockAxiosInstance.get.mockReset().mockResolvedValue(mockAxiosResponse({ success: true }));
    });
    
    describe('scrape', () => {
      it('should call the scrape endpoint with params', async () => {
        await adapter.scrape('https://example.com', { formats: ['markdown'] });
        
        expect(mockAxiosInstance.post).toHaveBeenCalledWith(
          '/scrape',
          expect.objectContaining({
            url: 'https://example.com',
            formats: ['markdown']
          }),
          expect.any(Object)
        );
      });
      
      it('should handle errors properly', async () => {
        mockAxiosInstance.post.mockRejectedValueOnce(
          mockAxiosError('Scraping failed', 'ERR_SCRAPE', {
            status: 400,
            data: { error: 'Invalid URL format' }
          })
        );
        
        await expect(adapter.scrape('invalid-url')).rejects.toThrow(
          'API error (400): Invalid URL format'
        );
      });
    });
    
    describe('deepResearch', () => {
      it('should call the deep-research endpoint with params', async () => {
        await adapter.deepResearch('Climate change', { maxDepth: 3 });
        
        expect(mockAxiosInstance.post).toHaveBeenCalledWith(
          '/deep-research',
          expect.objectContaining({
            query: 'Climate change',
            max_depth: 3
          }),
          expect.any(Object)
        );
      });
      
      it('should handle errors with special formatting', async () => {
        mockAxiosInstance.post.mockRejectedValueOnce(
          mockAxiosError('Research failed', 'ERR_RESEARCH')
        );
        
        const result = await adapter.deepResearch('Query');
        
        expect(result).toEqual({
          query: 'Query',
          success: false,
          results: { summary: '', sources: [] },
          error: expect.stringContaining('Research failed')
        });
      });
    });
    
    describe('mapUrls', () => {
      it('should call the map endpoint with params', async () => {
        await adapter.mapUrls('https://example.com', { includeSubdomains: true });
        
        expect(mockAxiosInstance.post).toHaveBeenCalledWith(
          '/map',
          expect.objectContaining({
            url: 'https://example.com',
            include_subdomains: true
          }),
          expect.any(Object)
        );
      });
    });
    
    describe('crawl', () => {
      it('should call the crawl endpoint with params', async () => {
        await adapter.crawl('https://example.com', { maxDepth: 2 });
        
        expect(mockAxiosInstance.post).toHaveBeenCalledWith(
          '/crawl',
          expect.objectContaining({
            url: 'https://example.com',
            max_depth: 2
          }),
          expect.any(Object)
        );
      });
    });
    
    describe('checkCrawlStatus', () => {
      it('should call the crawl/status endpoint with params', async () => {
        await adapter.checkCrawlStatus('abc123', { detailed: true });
        
        expect(mockAxiosInstance.get).toHaveBeenCalledWith(
          '/crawl/abc123/status',
          expect.objectContaining({
            params: expect.objectContaining({
              detailed: true
            })
          })
        );
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
            schema: { properties: {} }
          }),
          expect.any(Object)
        );
      });
    });
    
    describe('search', () => {
      it('should call the search endpoint with params', async () => {
        await adapter.search('Query text', { limit: 10 });
        
        expect(mockAxiosInstance.post).toHaveBeenCalledWith(
          '/search',
          expect.objectContaining({
            query: 'Query text',
            limit: 10
          }),
          expect.any(Object)
        );
      });
    });
  });
});