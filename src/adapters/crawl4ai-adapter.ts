/**
 * Crawl4AI Adapter
 * 
 * Provides a clean interface to the Crawl4AI API with simplified parameter handling
 * and consistent error management.
 */

import axios, { AxiosInstance } from 'axios';
import { transformError, ErrorType } from '../utils/error-utils';

/**
 * Crawl4AI specific error class
 */
class Crawl4AIError extends Error {
  type: ErrorType;
  
  constructor(message: string, type: ErrorType = ErrorType.UNKNOWN) {
    super(message);
    this.name = 'Crawl4AIError';
    this.type = type;
  }
}

/**
 * Configuration for the adapter
 */
interface AdapterConfig {
  apiKey?: string;
  baseUrl?: string;
}

/**
 * Converts camelCase to snake_case for API compatibility
 */
function toSnakeCase(str: string): string {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
}

/**
 * Adapter for the Crawl4AI API
 */
export class Crawl4AIAdapter {
  private apiClient: AxiosInstance;
  private baseUrl: string;
  
  /**
   * Creates a new adapter instance
   * 
   * @param apiKey - Optional API key for authentication
   * @param baseUrl - Base URL for the Crawl4AI API, defaults to local Docker instance
   */
  constructor(apiKey: string = '', baseUrl = 'http://localhost:11235') {
    this.baseUrl = baseUrl;

    this.apiClient = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Crawl4AI-MCP-Server/1.0.0',
      },
      timeout: 60000,
    });
    
    if (apiKey) {
      this.setApiKey(apiKey);
    }
  }
  
  /**
   * Sets the API key for authentication
   * 
   * @param apiKey - API key to use for authorization
   */
  public setApiKey(apiKey: string): void {
    if (!apiKey) return;
    this.apiClient.defaults.headers.common['Authorization'] = `Bearer ${apiKey}`;
  }
  
  /**
   * Configures the adapter with new settings
   * 
   * @param config - Configuration object with apiKey and/or baseUrl
   */
  public configure(config: AdapterConfig): void {
    if (config.apiKey) {
      this.setApiKey(config.apiKey);
    }
    
    if (config.baseUrl) {
      this.baseUrl = config.baseUrl;
      this.apiClient.defaults.baseURL = config.baseUrl;
    }
  }

  /**
   * Transforms parameters from camelCase to snake_case
   * 
   * @param params - Parameters to transform
   * @returns Transformed parameters with snake_case keys
   */
  private transformParams(params: Record<string, any>): Record<string, any> {
    const result: Record<string, any> = {};
    
    for (const [key, value] of Object.entries(params)) {
      // Skip undefined values
      if (value === undefined) continue;
      
      const snakeCaseKey = toSnakeCase(key);
      
      // Transform nested objects and arrays
      if (value !== null && typeof value === 'object') {
        result[snakeCaseKey] = Array.isArray(value)
          ? value.map(item => typeof item === 'object' && item !== null ? this.transformParams(item) : item)
          : this.transformParams(value);
      } else {
        result[snakeCaseKey] = value;
      }
    }
    
    return result;
  }

  /**
   * Makes an API request with error handling
   * 
   * @param method - HTTP method to use (get or post)
   * @param endpoint - API endpoint to call
   * @param data - Optional request body data (for POST requests)
   * @param params - Optional query parameters (for GET requests)
   * @returns The response data from the API
   * @throws Formatted error with context
   */
  private async apiRequest<T>(
    method: 'get' | 'post',
    endpoint: string,
    data?: any,
    params?: any
  ): Promise<T> {
    const requestContext = `API ${method.toUpperCase()} ${endpoint}`;
    
    try {
      // Transform parameters to snake_case
      const config = { params: params ? this.transformParams(params) : undefined };
      const requestData = data ? this.transformParams(data) : undefined;
      
      // Make the appropriate request
      const response = method === 'get'
        ? await this.apiClient.get<T>(endpoint, config)
        : await this.apiClient.post<T>(endpoint, requestData, config);
        
      // Handle empty responses
      if (!response.data) {
        return {} as T;
      }
      
      return response.data;
    } catch (error) {
      // Transform the error to a standardized format
      const formattedError = transformError(error, requestContext);
      
      // Log detailed error information for debugging
      console.error(`Error in ${requestContext}:`, {
        error: formattedError,
        endpoint,
        method,
        params: params ? this.transformParams(params) : undefined,
        data: data ? JSON.stringify(data).substring(0, 500) : undefined
      });
      
      // Rethrow with the formatted message
      throw new Error(formattedError.message);
    }
  }

  /**
   * Scrapes a single webpage
   * 
   * @param url - URL to scrape
   * @param options - Additional scraping options
   * @returns Scraped content
   */
  async scrape(url: string, options: Record<string, any> = {}): Promise<any> {
    if (!url) {
      throw new Crawl4AIError('URL is required for scraping', ErrorType.VALIDATION);
    }
    
    return this.apiRequest('post', '/scrape', { url, ...options });
  }

  /**
   * Conducts deep research on a query
   * 
   * @param query - Research query
   * @param options - Additional research options
   * @returns Research results
   */
  async deepResearch(query: string, options: Record<string, any> = {}): Promise<any> {
    if (!query) {
      throw new Crawl4AIError('Query is required for deep research', ErrorType.VALIDATION);
    }
    
    try {
      return await this.apiRequest('post', '/deep-research', { query, ...options });
    } catch (error) {
      // Special handling for research errors to maintain consistent format
      return {
        query,
        success: false,
        results: { summary: '', sources: [] },
        error: transformError(error, 'Deep research failed').message
      };
    }
  }

  /**
   * Discovers URLs from a starting point
   * 
   * @param url - Starting URL for discovery
   * @param options - Additional mapping options
   * @returns Discovered URLs
   */
  async mapUrls(url: string, options: Record<string, any> = {}): Promise<any> {
    if (!url) {
      throw new Crawl4AIError('URL is required for URL mapping', ErrorType.VALIDATION);
    }
    
    return this.apiRequest('post', '/map', { url, ...options });
  }

  /**
   * Starts an asynchronous crawl
   * 
   * @param url - Starting URL for the crawl
   * @param options - Additional crawling options
   * @returns Crawl job information
   */
  async crawl(url: string, options: Record<string, any> = {}): Promise<any> {
    if (!url) {
      throw new Crawl4AIError('URL is required for crawling', ErrorType.VALIDATION);
    }
    
    return this.apiRequest('post', '/crawl', { url, ...options });
  }

  /**
   * Checks the status of a crawl
   * 
   * @param id - Crawl job ID to check
   * @param options - Additional status options
   * @returns Crawl status information
   */
  async checkCrawlStatus(id: string, options: Record<string, any> = {}): Promise<any> {
    if (!id) {
      throw new Crawl4AIError('Crawl ID is required to check status', ErrorType.VALIDATION);
    }
    
    return this.apiRequest('get', `/crawl/${id}/status`, undefined, options);
  }

  /**
   * Extracts structured information from websites
   * 
   * @param urls - URLs to extract from
   * @param options - Additional extraction options
   * @returns Extracted structured data
   */
  async extract(urls: string[], options: Record<string, any> = {}): Promise<any> {
    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      throw new Crawl4AIError('At least one URL is required for extraction', ErrorType.VALIDATION);
    }
    
    return this.apiRequest('post', '/extract', { urls, ...options });
  }

  /**
   * Searches indexed documents for a given query
   * 
   * @param query - Search query
   * @param options - Additional search options
   * @returns Search results
   */
  async search(query: string, options: Record<string, any> = {}): Promise<any> {
    if (!query) {
      throw new Crawl4AIError('Search query is required', ErrorType.VALIDATION);
    }
    
    return this.apiRequest('post', '/search', { query, ...options });
  }
}

// Export the adapter class
export default Crawl4AIAdapter;