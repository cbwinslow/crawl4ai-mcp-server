/**
 * Adapter management and instantiation
 * 
 * This file creates and exports the singleton instance of the Crawl4AI adapter.
 */

import Crawl4AIAdapter from './crawl4ai-adapter';

// Initialize the adapter with API key from environment
const apiKey = process.env.CRAWL4AI_API_KEY || '';

if (!apiKey) {
  console.warn('Warning: CRAWL4AI_API_KEY environment variable is not set. API calls will fail.');
}

// Create a singleton instance of the adapter
const adapter = new Crawl4AIAdapter(apiKey);

// Export the adapter instance
export default adapter;
