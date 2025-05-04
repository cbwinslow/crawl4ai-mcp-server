/**
 * MCP Server Integration Tests
 *
 * Tests the MCP server endpoints and integration with the adapter.
 */

import { MCPRequest, MCPResponse } from '../../src/types';
import { createMCPServer } from '../../src/mcp-server';

// Mock the adapter module
jest.mock('../../src/adapters', () => {
  return {
    __esModule: true,
    default: {
      configure: jest.fn(),
      scrape: jest.fn().mockResolvedValue({ success: true, markdown: 'Test content' }),
      deepResearch: jest.fn().mockResolvedValue({ 
        success: true, 
        results: { 
          summary: 'Research results',
          sources: ['https://example.com']
        } 
      }),
      mapUrls: jest.fn().mockResolvedValue({ 
        success: true, 
        urls: ['https://example.com/page1', 'https://example.com/page2'] 
      }),
      crawl: jest.fn().mockResolvedValue({ 
        success: true, 
        id: 'crawl-123', 
        message: 'Crawl started successfully' 
      }),
      checkCrawlStatus: jest.fn().mockResolvedValue({ 
        success: true, 
        status: 'completed', 
        progress: 100 
      }),
      extract: jest.fn().mockResolvedValue({ 
        success: true, 
        results: [{ title: 'Test', content: 'Extracted content' }] 
      }),
      search: jest.fn().mockResolvedValue({ 
        success: true, 
        results: [{ url: 'https://example.com', title: 'Example', snippet: 'Example content' }] 
      }),
    }
  };
});

// Mock environment variables
process.env.CRAWL4AI_API_KEY = 'test-api-key';
process.env.CRAWL4AI_API_URL = 'https://api.crawl4ai.test';

describe('MCP Server Integration', () => {
  let server: any;
  
  beforeAll(() => {
    server = createMCPServer({
      apiKey: process.env.CRAWL4AI_API_KEY,
      baseUrl: process.env.CRAWL4AI_API_URL
    });
  });
  
  it('should initialize with the correct configuration', () => {
    expect(server).toBeDefined();
    expect(server.getTools).toBeDefined();
    
    const tools = server.getTools();
    expect(tools).toBeInstanceOf(Array);
    expect(tools.length).toBeGreaterThan(0);
    
    // Should have the expected tools
    const toolNames = tools.map((tool: any) => tool.name);
    expect(toolNames).toContain('crawl4ai_scrape');
    expect(toolNames).toContain('crawl4ai_deep_research');
    expect(toolNames).toContain('crawl4ai_map');
    expect(toolNames).toContain('crawl4ai_crawl');
    expect(toolNames).toContain('crawl4ai_check_crawl_status');
    expect(toolNames).toContain('crawl4ai_extract');
    expect(toolNames).toContain('crawl4ai_search');
  });
  
  describe('Tool Handling', () => {
    it('should handle crawl4ai_scrape requests', async () => {
      const request: MCPRequest = {
        name: 'crawl4ai_scrape',
        parameters: {
          url: 'https://example.com',
          formats: ['markdown']
        }
      };
      
      const response = await server.handleRequest(request);
      
      expect(response).toBeDefined();
      expect(response.content).toBeInstanceOf(Array);
      expect(response.content[0].type).toBe('text');
      expect(response.content[0].text).toBe('Test content');
    });
    
    it('should handle crawl4ai_deep_research requests', async () => {
      const request: MCPRequest = {
        name: 'crawl4ai_deep_research',
        parameters: {
          query: 'Climate change',
          maxDepth: 3
        }
      };
      
      const response = await server.handleRequest(request);
      
      expect(response).toBeDefined();
      expect(response.content).toBeInstanceOf(Array);
      expect(response.content[0].type).toBe('text');
      expect(response.content[0].text).toBe('Research results');
      expect(response.content[1].text).toContain('Sources:');
    });
    
    // Add more tests for other tools here
  });
});