/**
 * Handler implementation for the crawl4ai_crawl tool
 * 
 * This handler processes requests to start an asynchronous crawl of multiple pages
 * from a starting URL.
 */

import { z } from 'zod';
import { crawl4aiCrawlSchema } from '../tool-schemas/crawl4ai-crawl-schema';
import adapter from '../adapters';

/**
 * Format crawl job details for MCP response
 * 
 * @param content Crawl job details from the adapter
 * @returns Formatted content for MCP response
 */
function formatCrawlContent(content: any): Array<{ type: string, text: string }> {
  // If content is already in the correct format, return it
  if (Array.isArray(content) && content.every(item => 'type' in item && 'text' in item)) {
    return content;
  }

  // Handle structured content with crawl job details
  if (content && typeof content === 'object') {
    let textContent = '';
    
    // Add job ID if available
    if (content.id) {
      textContent += `Crawl job started with ID: ${content.id}\n\n`;
    }
    
    // Add job status if available
    if (content.status) {
      textContent += `Status: ${content.status}\n`;
    }
    
    // Add estimated time if available
    if (content.estimatedTimeSeconds) {
      textContent += `Estimated time: ${content.estimatedTimeSeconds} seconds\n`;
    }
    
    // Add scope information if available
    if (content.scope) {
      textContent += `\nScope: ${content.scope}\n`;
    }
    
    // Add configuration summary if available
    if (content.config) {
      textContent += '\nConfiguration:\n';
      const config = content.config;
      
      if (config.limit) textContent += `- Maximum pages: ${config.limit}\n`;
      if (config.maxDepth) textContent += `- Maximum depth: ${config.maxDepth}\n`;
      if (config.allowExternalLinks !== undefined) textContent += `- External links: ${config.allowExternalLinks ? 'Allowed' : 'Not allowed'}\n`;
    }
    
    // Add webhook information if available
    if (content.webhook) {
      textContent += `\nResults will be sent to webhook: ${typeof content.webhook === 'string' ? content.webhook : content.webhook.url}\n`;
    }
    
    // Add check status instructions
    textContent += `\nUse the crawl4ai_check_crawl_status tool with ID: ${content.id} to check the status of this crawl job.`;
    
    return [{ type: 'text', text: textContent }];
  }

  // Default fallback
  return [{ type: 'text', text: JSON.stringify(content, null, 2) }];
}

/**
 * Handler function for the crawl4ai_crawl tool
 * 
 * @param params Parameters from the MCP client request
 * @returns Information about the started crawl job
 */
export async function handleCrawl4aiCrawl(params: z.infer<typeof crawl4aiCrawlSchema>) {
  try {
    console.log('Starting crawl from:', params.url);
    
    // Extract url from params and use the rest as options
    const { url, ...options } = params;
    
    // Call the adapter to start the crawl
    const response = await adapter.crawl(url as string, options);
    
    // Format the response for MCP protocol
    return {
      content: formatCrawlContent(response)
    };
  } catch (error) {
    console.error('Error in crawl4ai_crawl:', error);
    
    return {
      content: [
        {
          type: 'text',
          text: `Error starting crawl from ${params.url}: ${error instanceof Error ? error.message : String(error)}`
        }
      ]
    };
  }
}