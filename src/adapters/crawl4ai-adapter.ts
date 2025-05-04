/**
 * Crawl4AI Adapter
 * 
 * Provides a clean interface to the Crawl4AI API with simplified parameter handling
 * and consistent error management.
 */

import axios, { AxiosInstance } from 'axios';
import { transformError, handleCriticalError } from '../utils/error-utils';

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
   * Sets the API key
   */
  public setApiKey(apiKey: string): void {
    if (!apiKey) return;
    this.apiClient.defaults.headers.common['Authorization'] = `Bearer ${apiKey}`;
  }
  
  /**
   * Configures the adapter
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
   */
  private async apiRequest<T>(
    method: 'get' | 'post',
    endpoint: string,
    data?: any,
    params?: any
  ): Promise<T> {
    try {
      const config = { params: params ? this.transformParams(params) : undefined };
      const requestData = data ? this.transformParams(data) : undefined;
      
      const response = method === 'get'
        ? await this.apiClient.get<T>(endpoint, config)
        : await this.apiClient.post<T>(endpoint, requestData, config);
        
      return response.data;
    } catch (error) {
      // Transform and rethrow the error
      throw new Error(transformError(error, `API ${method.toUpperCase()} ${endpoint}`).message);
    }
  }

  /**
   * Scrapes a single webpage
   */
  async scrape(url: string, options: Record<string, any> = {}): Promise<any> {
    return this.apiRequest('post', '/scrape', { url, ...options });
  }

  /**
   * Conducts deep research on a query
   */
  async deepResearch(query: string, options: Record<string, any> = {}): Promise<any> {
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
   */
  async mapUrls(url: string, options: Record<string, any> = {}): Promise<any> {
    return this.apiRequest('post', '/map', { url, ...options });
  }

  /**
   * Starts an asynchronous crawl
   */
  async crawl(url: string, options: Record<string, any> = {}): Promise<any> {
    return this.apiRequest('post', '/crawl', { url, ...options });
  }

  /**
   * Checks the status of a crawl
   */
  async checkCrawlStatus(id: string, options: Record<string, any> = {}): Promise<any> {
    return this.apiRequest('get', `/crawl/${id}/status`, undefined, options);
  }

  /**
   * Extracts structured information from websites
   */
  async extract(urls: string[], options: Record<string, any> = {}): Promise<any> {
    return this.apiRequest('post', '/extract', { urls, ...options });
  }

  /**
   * Searches indexed documents for a given query
   */
  async search(query: string, options: Record<string, any> = {}): Promise<any> {
    return this.apiRequest('post', '/search', { query, ...options });
  }
}

// Export the adapter class
export default Crawl4AIAdapter;