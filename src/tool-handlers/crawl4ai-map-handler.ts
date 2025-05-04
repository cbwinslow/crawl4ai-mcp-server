/**
 * Handler implementation for the crawl4ai_map tool
 * 
 * This handler processes requests to discover URLs from a starting point
 * using sitemap.xml and HTML link discovery.
 */

import { z } from 'zod';
import { crawl4aiMapSchema } from '../tool-schemas/crawl4ai-map-schema';
import adapter from '../adapters';

/**
 * Format URL mapping results for MCP response
 * 
 * @param content URL mapping results from the adapter
 * @returns Formatted content for MCP response
 */
function formatMapContent(content: any): Array<{ type: string, text: string }> {
  // If content is already in the correct format, return it
  if (Array.isArray(content) && content.every(item => 'type' in item && 'text' in item)) {
    return content;
  }

  // Handle case where content contains a list of URLs
  if (Array.isArray(content) && content.every(item => typeof item === 'string')) {
    return [{ 
      type: 'text', 
      text: `Discovered ${content.length} URLs:\n\n${content.join('\n')}` 
    }];
  }

  // Handle object with urls property
  if (content && typeof content === 'object' && Array.isArray(content.urls)) {
    // Generate a formatted list of URLs with metadata if available
    let textContent = `Discovered ${content.urls.length} URLs:\n\n`;
    
    // Format each URL with available metadata
    textContent += content.urls.map((url: any, index: number) => {
      if (typeof url === 'string') {
        return `${index + 1}. ${url}`;
      } else if (typeof url === 'object') {
        let urlText = `${index + 1}. ${url.url || 'Unknown URL'}`;
        
        // Add metadata if available
        if (url.title) urlText += `\n   Title: ${url.title}`;
        if (url.lastModified) urlText += `\n   Last Modified: ${url.lastModified}`;
        if (url.depth) urlText += `\n   Depth: ${url.depth}`;
        
        return urlText;
      }
      return `${index + 1}. Unknown URL format`;
    }).join('\n\n');
    
    return [{ type: 'text', text: textContent }];
  }

  // Default fallback
  return [{ type: 'text', text: JSON.stringify(content, null, 2) }];
}

/**
 * Handler function for the crawl4ai_map tool
 * 
 * @param params Parameters from the MCP client request
 * @returns Discovered URLs and site structure
 */
export async function handleCrawl4aiMap(params: z.infer<typeof crawl4aiMapSchema>) {
  try {
    console.log('Mapping URLs from:', params.url);
    
    // Extract url from params and use the rest as options
    const { url, ...options } = params;
    
    // Call the adapter to map URLs
    const response = await adapter.mapUrls(url as string, options);
    
    // Format the response for MCP protocol
    return {
      content: formatMapContent(response)
    };
  } catch (error) {
    console.error('Error in crawl4ai_map:', error);
    
    return {
      content: [
        {
          type: 'text',
          text: `Error mapping URLs from ${params.url}: ${error instanceof Error ? error.message : String(error)}`
        }
      ]
    };
  }
}