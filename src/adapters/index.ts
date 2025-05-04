/**
 * Adapters for interacting with the Crawl4AI API
 * 
 * This module provides a unified interface for all Crawl4AI capabilities,
 * handling authentication, request formatting, and response parsing.
 */

import { z } from 'zod';
import type { AxiosError } from 'axios';

/**
 * Crawl4AI adapter interface
 * 
 * Each method corresponds to a Crawl4AI capability exposed through the MCP tools.
 */
interface Crawl4AIAdapter {
  /**
   * Scrape a single webpage with options
   * 
   * @param url URL to scrape
   * @param options Scraping options
   */
  scrape(url: string, options: any): Promise<any>;
  
  /**
   * Conduct deep research on a query
   * 
   * @param query Research topic or query
   * @param options Research options
   */
  deepResearch(query: string, options: any): Promise<any>;
  
  /**
   * Discover URLs from a starting point
   * 
   * @param url Starting URL
   * @param options URL discovery options
   */
  mapUrls(url: string, options: any): Promise<any>;
  
  /**
   * Start an asynchronous crawl
   * 
   * @param url Starting URL for the crawl
   * @param options Crawl options
   */
  crawl(url: string, options: any): Promise<any>;
  
  /**
   * Extract structured data from URLs
   * 
   * @param urls URLs to extract from
   * @param options Extraction options
   */
  extract(urls: string[], options: any): Promise<any>;
  
  /**
   * Check status of an asynchronous crawl
   * 
   * @param id Crawl job ID
   * @param options Status check options
   */
  checkCrawlStatus(id: string, options: any): Promise<any>;
}

/**
 * Implementation of the Crawl4AI adapter
 * 
 * This adapter connects to the Crawl4AI API to perform web scraping,
 * crawling, and data extraction operations.
 */
class Crawl4AIAdapterImpl implements Crawl4AIAdapter {
  private apiKey: string;
  private baseUrl: string;
  
  constructor(apiKey?: string, baseUrl = 'https://api.crawl4ai.com/v1') {
    this.apiKey = apiKey || '';
    this.baseUrl = baseUrl;
  }
  
  /**
   * Transform errors into a consistent format
   * 
   * @param error The error to transform
   * @param context The operation context for more specific error messages
   * @returns Formatted error message
   */
  private transformError(error: unknown, context = 'API'): string {
    if (error instanceof z.ZodError) {
      return `Invalid ${context} options: ${error.message}`;
    }
    
    const axiosError = error as AxiosError;
    if (axiosError.response) {
      const status = axiosError.response.status;
      const errorData = axiosError.response.data as any;
      return `Crawl4AI API error (${status}): ${errorData.error || errorData.message || axiosError.message}`;
    }
    
    if (error instanceof Error) {
      return `${context} error: ${error.message}`;
    }
    
    return `Unknown ${context} error: ${String(error)}`;
  }
  
  /**
   * Set API key for authentication
   */
  setApiKey(apiKey: string): void {
    this.apiKey = apiKey;
  }
  
  /**
   * Make an authenticated request to the Crawl4AI API
   */
  private async makeRequest(path: string, method = 'GET', body?: any): Promise<any> {
    try {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      if (this.apiKey) {
        headers['Authorization'] = `Bearer ${this.apiKey}`;
      }
      
      const options: RequestInit = {
        method,
        headers,
      };
      
      if (body) {
        options.body = JSON.stringify(body);
      }
      
      const response = await fetch(`${this.baseUrl}${path}`, options);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Crawl4AI API error (${response.status}): ${errorText}`);
      }
      
      return response.json();
    } catch (error) {
      throw new Error(this.transformError(error, 'API request'));
    }
  }
  
  /**
   * Scrape a single webpage
   */
  async scrape(url: string, options: any): Promise<any> {
    try {
      console.log(`[Adapter] Scraping URL: ${url}`);
      
      // This will be replaced with actual API calls in production
      const mockResponse = {
        url,
        timestamp: new Date().toISOString(),
        markdown: `# Example Scraped Content for ${url}\n\nThis is placeholder content that would be replaced with actual scraped content in production.`,
      };
      
      return mockResponse;
    } catch (error) {
      throw new Error(this.transformError(error, 'scrape'));
    }
  }
  
  /**
   * Conduct deep research on a query
   */
  async deepResearch(query: string, options: any): Promise<any> {
    try {
      console.log(`[Adapter] Researching: ${query}`);
      
      // This will be replaced with actual API calls in production
      const mockResponse = {
        query,
        timestamp: new Date().toISOString(),
        summary: `Research summary for "${query}"`,
        findings: `This is a detailed research report about "${query}" with comprehensive analysis from multiple sources.`,
        sources: [
          { url: 'https://example.com/1', title: 'Example Source 1', description: 'Description of source 1' },
          { url: 'https://example.com/2', title: 'Example Source 2', description: 'Description of source 2' },
        ]
      };
      
      return mockResponse;
    } catch (error) {
      // For deepResearch, we return a structured error response instead of throwing
      const errorMsg = this.transformError(error, 'deep research');
      return {
        query,
        success: false,
        results: { summary: '', sources: [], details: {} },
        error: errorMsg,
      };
    }
  }
  
  /**
   * Discover URLs from a starting point
   */
  async mapUrls(url: string, options: any): Promise<any> {
    try {
      console.log(`[Adapter] Mapping URLs from: ${url}`);
      
      // This will be replaced with actual API calls in production
      const mockResponse = {
        url,
        timestamp: new Date().toISOString(),
        urls: [
          { url: `${url}/page1`, title: 'Page 1', lastModified: '2024-05-01T12:00:00Z', depth: 1 },
          { url: `${url}/page2`, title: 'Page 2', lastModified: '2024-05-02T12:00:00Z', depth: 1 },
          { url: `${url}/section/page3`, title: 'Page 3', lastModified: '2024-05-03T12:00:00Z', depth: 2 },
        ]
      };
      
      return mockResponse;
    } catch (error) {
      throw new Error(this.transformError(error, 'URL mapping'));
    }
  }
  
  /**
   * Start an asynchronous crawl
   */
  async crawl(url: string, options: any): Promise<any> {
    try {
      console.log(`[Adapter] Starting crawl from: ${url}`);
      
      // This will be replaced with actual API calls in production
      const crawlId = Math.random().toString(36).substring(2, 15);
      
      const mockResponse = {
        id: crawlId,
        url,
        timestamp: new Date().toISOString(),
        status: 'in_progress',
        estimatedTimeSeconds: 120,
        config: {
          limit: options.limit || 50,
          maxDepth: options.maxDepth || 3,
          allowExternalLinks: options.allowExternalLinks || false,
        }
      };
      
      return mockResponse;
    } catch (error) {
      throw new Error(this.transformError(error, 'crawl'));
    }
  }
  
  /**
   * Extract structured data from URLs
   */
  async extract(urls: string[], options: any): Promise<any> {
    try {
      console.log(`[Adapter] Extracting data from ${urls.length} URLs`);
      
      // This will be replaced with actual API calls in production
      const mockResponse = {
        timestamp: new Date().toISOString(),
        extractions: urls.map(url => ({
          url,
          data: {
            title: `Title for ${url}`,
            description: `Description extracted from ${url}`,
            metadata: {
              author: 'Example Author',
              publishDate: '2024-05-01'
            }
          }
        }))
      };
      
      return mockResponse;
    } catch (error) {
      throw new Error(this.transformError(error, 'extraction'));
    }
  }
  
  /**
   * Check status of an asynchronous crawl
   */
  async checkCrawlStatus(id: string, options: any): Promise<any> {
    try {
      console.log(`[Adapter] Checking status of crawl job: ${id}`);
      
      // This will be replaced with actual API calls in production
      const mockStatuses = ['in_progress', 'completed', 'failed'];
      const randomStatus = mockStatuses[Math.floor(Math.random() * mockStatuses.length)];
      
      const mockResponse = {
        id,
        status: randomStatus,
        timestamp: new Date().toISOString(),
        startedAt: new Date(Date.now() - 60000).toISOString(),
        progress: randomStatus === 'completed' ? 1.0 : Math.random(),
        stats: {
          pagesProcessed: 42,
          pagesSucceeded: 38,
          pagesFailed: 4,
          bytesProcessed: 1248576
        },
        urls: [
          'https://example.com/page1',
          'https://example.com/page2',
          'https://example.com/page3',
        ]
      };
      
      if (randomStatus === 'completed') {
        mockResponse.completedAt = new Date().toISOString();
      } else if (randomStatus === 'in_progress') {
        mockResponse.estimatedCompletionTime = new Date(Date.now() + 30000).toISOString();
      }
      
      return mockResponse;
    } catch (error) {
      throw new Error(this.transformError(error, 'status check'));
    }
  }
}

// Create and export the adapter instance
const adapter = new Crawl4AIAdapterImpl();
export default adapter;