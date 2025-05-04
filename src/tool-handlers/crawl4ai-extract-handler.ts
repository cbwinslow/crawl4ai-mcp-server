/**
 * Handler implementation for the crawl4ai_extract tool
 * 
 * This handler processes requests to extract structured information from web
 * pages using LLM-based analysis.
 */

import { z } from 'zod';
import { crawl4aiExtractSchema } from '../tool-schemas/crawl4ai-extract-schema';
import adapter from '../adapters';

/**
 * Format extracted data for MCP response
 * 
 * @param content Extracted data from the adapter
 * @returns Formatted content for MCP response
 */
function formatExtractContent(content: any): Array<{ type: string, text: string }> {
  // If content is already in the correct format, return it
  if (Array.isArray(content) && content.every(item => 'type' in item && 'text' in item)) {
    return content;
  }

  // Handle string content
  if (typeof content === 'string') {
    return [{ type: 'text', text: content }];
  }

  // Handle structured content
  if (content && typeof content === 'object') {
    // If data property exists, format as JSON
    if (content.data) {
      return [{ type: 'json', text: JSON.stringify(content.data, null, 2) }];
    }
    
    // If extractions property exists, format as JSON
    if (content.extractions) {
      return [{ type: 'json', text: JSON.stringify(content.extractions, null, 2) }];
    }
    
    // If results property exists (array)
    if (Array.isArray(content.results)) {
      // Handle different formats based on schema or common patterns
      if (content.results.every((item: any) => typeof item === 'object')) {
        return [{ type: 'json', text: JSON.stringify(content.results, null, 2) }];
      }
    }
    
    // Handle markdown format
    if (content.markdown) {
      return [{ type: 'text', text: content.markdown }];
    }
  }

  // Default fallback - stringify the whole content
  return [{ type: 'text', text: JSON.stringify(content, null, 2) }];
}

/**
 * Handler function for the crawl4ai_extract tool
 * 
 * @param params Parameters from the MCP client request
 * @returns Structured data extracted from the URLs
 */
export async function handleCrawl4aiExtract(params: z.infer<typeof crawl4aiExtractSchema>) {
  try {
    console.log(`Extracting data from ${params.urls.length} URLs`);
    
    // Extract urls from params and use the rest as options
    const { urls, ...options } = params;
    
    // Call the adapter to extract data
    const response = await adapter.extract(urls as string[], options);
    
    // Format the response for MCP protocol
    return {
      content: formatExtractContent(response)
    };
  } catch (error) {
    console.error('Error in crawl4ai_extract:', error);
    
    return {
      content: [
        {
          type: 'text',
          text: `Error extracting data from URLs: ${error instanceof Error ? error.message : String(error)}`
        }
      ]
    };
  }
}