/**
 * Handler implementation for the crawl4ai_scrape tool
 * 
 * This handler processes requests to scrape a single webpage with various options
 * for content extraction and preprocessing.
 */

import { z } from 'zod';
import { crawl4aiScrapeSchema } from '../tool-schemas/crawl4ai-scrape-schema';
import adapter from '../adapters';

/**
 * Format content into MCP-compatible format
 * 
 * @param content Raw content from the adapter
 * @returns Formatted content for MCP response
 */
function formatContent(content: any): Array<{ type: string, text: string }> {
  // If content is already in the correct format, return it
  if (Array.isArray(content) && content.every(item => 'type' in item && 'text' in item)) {
    return content;
  }

  // Handle different content formats from the API
  if (typeof content === 'string') {
    return [{ type: 'text', text: content }];
  }

  if (content && typeof content === 'object') {
    // If markdown content is available
    if (content.markdown) {
      return [{ type: 'text', text: content.markdown }];
    }

    // If HTML content is available
    if (content.html) {
      return [{ type: 'html', text: content.html }];
    }

    // Handle structured content
    if (content.data) {
      return [{ type: 'json', text: JSON.stringify(content.data, null, 2) }];
    }
  }

  // Default fallback
  return [{ type: 'text', text: JSON.stringify(content, null, 2) }];
}

/**
 * Handler function for the crawl4ai_scrape tool
 * 
 * @param params Parameters from the MCP client request
 * @returns Extracted content from the scraped webpage
 */
export async function handleCrawl4aiScrape(params: z.infer<typeof crawl4aiScrapeSchema>) {
  try {
    console.log('Scraping URL:', params.url);
    
    // Extract url from params and use the rest as options
    const { url, ...options } = params;
    
    // Call the adapter with parameters
    const response = await adapter.scrape(url as string, options);
    
    // Format the response for MCP protocol
    return {
      content: formatContent(response)
    };
  } catch (error) {
    console.error('Error in crawl4ai_scrape:', error);
    
    return {
      content: [
        {
          type: 'text',
          text: `Error scraping ${params.url}: ${error instanceof Error ? error.message : String(error)}`
        }
      ]
    };
  }
}