/**
 * Crawl4AI Adapter
 * 
 * This adapter provides an interface between the MCP server and the Crawl4AI API,
 * enabling web scraping, crawling, and extraction capabilities.
 * 
 * Features:
 * - Error handling with retry logic
 * - Caching for improved performance
 * - Type-safe API interface
 * - Support for all Crawl4AI operations
 */

import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { LRUCache } from 'lru-cache';
import { z } from 'zod';

// Import schemas for type safety
import {
  crawl4aiScrapeSchema,
  crawl4aiDeepResearchSchema,
  crawl4aiMapSchema,
  crawl4aiCrawlSchema,
  crawl4aiExtractSchema,
  crawl4aiCheckCrawlStatusSchema,
} from '../tool-schemas';

// Error handling and retry configuration
interface RetryConfig {
  maxRetries: number;
  initialDelayMs: number;
  maxDelayMs: number;
  backoffFactor: number;
}

// Default retry configuration
const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  initialDelayMs: 1000,
  maxDelayMs: 10000,
  backoffFactor: 2,
};

// Default cache options
const DEFAULT_CACHE_OPTIONS: LRUCache.Options<string, any> = {
  max: 100,
  ttl: 1000 * 60 * 15, // 15 minutes cache
};

// Error types for better error handling
enum ErrorType {
  NETWORK = 'network',
  RATE_LIMIT = 'rate_limit',
  AUTHENTICATION = 'authentication',
  SERVER = 'server',
  CLIENT = 'client',
  UNKNOWN = 'unknown',
}

class Crawl4AIError extends Error {
  type: ErrorType;
  statusCode?: number;
  retryable: boolean;

  constructor(message: string, type: ErrorType, statusCode?: number, retryable = false) {
    super(message);
    this.name = 'Crawl4AIError';
    this.type = type;
    this.statusCode = statusCode;
    this.retryable = retryable;
  }
}

/**
 * Crawl4AI Adapter class
 * 
 * Provides methods for interacting with the Crawl4AI API with error
 * handling, retry logic, and performance optimizations.
 */
export class Crawl4AIAdapter {
  private apiClient: AxiosInstance;
  private retryConfig: RetryConfig;
  private cache: LRUCache<string, any>;
  private baseUrl: string;
  
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
    
    if (error instanceof Crawl4AIError) {
      return `${context} error (${error.type}): ${error.message}`;
    }
    
    const axiosError = error as import('axios').AxiosError;
    if (axiosError.response) {
      const status = axiosError.response.status;
      const errorData = axiosError.response.data as any;
      return `FireCrawl API error (${status}): ${errorData.error || errorData.message || axiosError.message}`;
    }
    
    if (error instanceof Error) {
      return `${context} error: ${error.message}`;
    }
    
    return `Unknown ${context} error: ${String(error)}`;
  }

  /**
   * Creates a new Crawl4AI adapter instance
   * 
   * @param apiKey API key for authentication
   * @param retryConfig Configuration for retry behavior
   * @param cacheOptions Options for the LRU cache
   * @param baseUrl Base URL for the API (defaults to the official Crawl4AI API)
   */
  constructor(
    apiKey: string,
    retryConfig: RetryConfig = DEFAULT_RETRY_CONFIG,
    cacheOptions: LRUCache.Options<string, any> = DEFAULT_CACHE_OPTIONS,
    baseUrl = 'https://api.firecrawl.dev/v1'
  ) {
    this.baseUrl = baseUrl;
    this.retryConfig = retryConfig;

    // Initialize API client with authentication
    this.apiClient = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'User-Agent': 'Crawl4AI-MCP-Server/1.0.0',
      },
    });

    // Setup response interceptor for error classification
    this.apiClient.interceptors.response.use(
      (response) => response,
      (error) => {
        if (!error.response) {
          // Network error (no response)
          return Promise.reject(new Crawl4AIError(
            'Network error: Unable to connect to the Crawl4AI API',
            ErrorType.NETWORK,
            undefined,
            true
          ));
        }

        const { status, data } = error.response;
        let errorMessage = data?.message || error.message || 'Unknown API error';
        let errorType = ErrorType.UNKNOWN;
        let retryable = false;

        // Classify errors for better handling
        switch (status) {
          case 401:
          case 403:
            errorType = ErrorType.AUTHENTICATION;
            errorMessage = 'Authentication error: Invalid or expired API key';
            break;
          case 429:
            errorType = ErrorType.RATE_LIMIT;
            errorMessage = 'Rate limit exceeded: Too many requests';
            retryable = true;
            break;
          case 400:
          case 422:
            errorType = ErrorType.CLIENT;
            errorMessage = `Client error: ${errorMessage}`;
            break;
          case 500:
          case 502:
          case 503:
          case 504:
            errorType = ErrorType.SERVER;
            errorMessage = `Server error: ${errorMessage}`;
            retryable = true;
            break;
        }

        return Promise.reject(new Crawl4AIError(
          errorMessage,
          errorType,
          status,
          retryable
        ));
      }
    );

    // Initialize cache
    this.cache = new LRUCache(cacheOptions);
  }

  /**
   * Generic method to execute API requests with retry logic
   * 
   * @param method HTTP method (GET, POST, etc.)
   * @param endpoint API endpoint
   * @param data Request payload
   * @param cacheKey Optional cache key for GET requests
   * @returns API response data
   */
  private async executeRequest<T = any>(
    method: string,
    endpoint: string,
    data?: any,
    cacheKey?: string
  ): Promise<T> {
    // Try to get from cache for GET requests if cache key is provided
    if (method === 'GET' && cacheKey && this.cache.has(cacheKey)) {
      console.log(`Cache hit for ${cacheKey}`);
      return this.cache.get(cacheKey) as T;
    }

    // Implement retry logic
    let retries = 0;
    let lastError: Error | null = null;

    while (retries <= this.retryConfig.maxRetries) {
      try {
        let response: AxiosResponse<T>;

        // Execute the request based on method
        switch (method) {
          case 'GET':
            response = await this.apiClient.get<T>(endpoint, { params: data });
            break;
          case 'POST':
            response = await this.apiClient.post<T>(endpoint, data);
            break;
          case 'PUT':
            response = await this.apiClient.put<T>(endpoint, data);
            break;
          case 'DELETE':
            response = await this.apiClient.delete<T>(endpoint, { data });
            break;
          default:
            throw new Error(`Unsupported HTTP method: ${method}`);
        }

        // Cache the response for GET requests if a cache key is provided
        if (method === 'GET' && cacheKey) {
          this.cache.set(cacheKey, response.data);
        }

        return response.data;
      } catch (error) {
        lastError = error as Error;
        
        // Only retry if this is a retryable error
        if (error instanceof Crawl4AIError && error.retryable && retries < this.retryConfig.maxRetries) {
          const delay = Math.min(
            this.retryConfig.initialDelayMs * Math.pow(this.retryConfig.backoffFactor, retries),
            this.retryConfig.maxDelayMs
          );
          
          console.log(`Retrying request to ${endpoint} after ${delay}ms (attempt ${retries + 1}/${this.retryConfig.maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, delay));
          retries++;
        } else {
          // Non-retryable error or max retries reached
          break;
        }
      }
    }

    // If we've exhausted retries, throw the last error
    throw lastError || new Error('Request failed with unknown error');
  }

  /**
   * Scrape a single webpage with advanced options for content extraction
   * 
   * @param url URL to scrape
   * @param options Scraping options
   * @returns Scraped content
   */
  async scrape(
    url: string,
    options: Partial<Omit<z.infer<typeof crawl4aiScrapeSchema>, 'url'>> = {}
  ): Promise<any> {
    console.log(`Scraping URL: ${url}`);
    
    // Generate cache key based on URL and options
    const cacheKey = `scrape:${url}:${JSON.stringify(options)}`;
    
    try {
      const result = await this.executeRequest(
        'POST',
        '/scrape',
        { url, ...options },
        cacheKey
      );
      
      return result;
    } catch (error) {
      console.error(`Error scraping ${url}:`, error);
      throw new Error(this.transformError(error, 'scrape'));
    }
  }

  /**
   * Conduct deep research on a query using web crawling and AI analysis
   * 
   * @param query The query to research
   * @param options Deep research options
   * @returns Research results with synthesized information
   */
  async deepResearch(
    query: string,
    options: Partial<Omit<z.infer<typeof crawl4aiDeepResearchSchema>, 'query'>> = {}
  ): Promise<any> {
    console.log(`Conducting deep research on: ${query}`);
    
    // Deep research is typically not cached due to its dynamic nature
    
    try {
      const result = await this.executeRequest(
        'POST',
        '/deep-research',
        { query, ...options }
      );
      
      return result;
    } catch (error) {
      console.error(`Error researching ${query}:`, error);
      // For deepResearch, return a structured error response instead of throwing
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
   * Discover URLs from a starting point using sitemap and link discovery
   * 
   * @param url Starting URL for discovery
   * @param options URL mapping options
   * @returns Discovered URLs and site structure
   */
  async mapUrls(
    url: string,
    options: Partial<Omit<z.infer<typeof crawl4aiMapSchema>, 'url'>> = {}
  ): Promise<any> {
    console.log(`Mapping URLs from: ${url}`);
    
    // Generate cache key based on URL and options
    const cacheKey = `map:${url}:${JSON.stringify(options)}`;
    
    try {
      const result = await this.executeRequest(
        'POST',
        '/map',
        { url, ...options },
        cacheKey
      );
      
      return result;
    } catch (error) {
      console.error(`Error mapping URLs from ${url}:`, error);
      throw new Error(this.transformError(error, 'URL mapping'));
    }
  }

  /**
   * Start an asynchronous crawl of multiple pages from a starting URL
   * 
   * @param url Starting URL for the crawl
   * @param options Crawl configuration options
   * @returns Crawl job details including ID for status checking
   */
  async crawl(
    url: string,
    options: Partial<Omit<z.infer<typeof crawl4aiCrawlSchema>, 'url'>> = {}
  ): Promise<any> {
    console.log(`Starting crawl from: ${url}`);
    
    try {
      const result = await this.executeRequest(
        'POST',
        '/crawl',
        { url, ...options }
      );
      
      return result;
    } catch (error) {
      console.error(`Error starting crawl from ${url}:`, error);
      throw new Error(this.transformError(error, 'crawl'));
    }
  }

  /**
   * Check the status of an asynchronous crawl job
   * 
   * @param id Crawl job ID to check
   * @param options Status check options
   * @returns Current status of the crawl job
   */
  async checkCrawlStatus(
    id: string,
    options: Partial<Omit<z.infer<typeof crawl4aiCheckCrawlStatusSchema>, 'id'>> = {}
  ): Promise<any> {
    console.log(`Checking crawl status for job: ${id}`);
    
    try {
      const result = await this.executeRequest(
        'GET',
        `/crawl/${id}/status`,
        options
      );
      
      return result;
    } catch (error) {
      console.error(`Error checking crawl status for job ${id}:`, error);
      throw new Error(this.transformError(error, 'status check'));
    }
  }

  /**
   * Extract structured information from web pages using LLM
   * 
   * @param urls List of URLs to extract information from
   * @param options Extraction options including schema and prompts
   * @returns Structured data extracted from the URLs
   */
  async extract(
    urls: string[],
    options: Partial<Omit<z.infer<typeof crawl4aiExtractSchema>, 'urls'>> = {}
  ): Promise<any> {
    console.log(`Extracting data from ${urls.length} URLs`);
    
    // Generate cache key based on URLs and options
    const cacheKey = `extract:${urls.join(',')}:${JSON.stringify(options)}`;
    
    try {
      const result = await this.executeRequest(
        'POST',
        '/extract',
        { urls, ...options },
        cacheKey
      );
      
      return result;
    } catch (error) {
      console.error(`Error extracting data from URLs:`, error);
      throw new Error(this.transformError(error, 'extraction'));
    }
  }

  /**
   * Clear the adapter's cache
   */
  clearCache(): void {
    this.cache.clear();
    console.log('Cache cleared');
  }

  /**
   * Get cache statistics
   * 
   * @returns Object with cache statistics
   */
  getCacheStats(): { size: number, maxSize: number } {
    return {
      size: this.cache.size,
      maxSize: this.cache.max as number,
    };
  }
}

// Export the adapter class
export default Crawl4AIAdapter;