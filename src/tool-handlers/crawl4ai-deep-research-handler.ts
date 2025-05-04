/**
 * Handler implementation for the crawl4ai_deep_research tool
 * 
 * This handler processes requests to conduct deep research on a specific query
 * by searching the web, crawling multiple pages, and synthesizing the content.
 */

import { z } from 'zod';
import { crawl4aiDeepResearchSchema } from '../tool-schemas/crawl4ai-deep-research-schema';
import adapter from '../adapters';

/**
 * Format research content for MCP response
 * 
 * @param content Research results from the adapter
 * @returns Formatted content for MCP response
 */
function formatResearchContent(content: any): Array<{ type: string, text: string }> {
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
    // Research content typically has summary and sources
    const formattedContent = [];
    
    // Add summary if available
    if (content.summary) {
      formattedContent.push({ type: 'text', text: content.summary });
    }
    
    // Add research findings
    if (content.findings) {
      formattedContent.push({ type: 'text', text: content.findings });
    }
    
    // Add sources in markdown format if available
    if (content.sources && Array.isArray(content.sources)) {
      const sourcesList = content.sources
        .map((source: any, index: number) => `${index + 1}. [${source.title || 'Source'}](${source.url}) - ${source.description || 'No description'}`)
        .join('\n');
      
      if (sourcesList) {
        formattedContent.push({ type: 'text', text: `\n\nSources:\n${sourcesList}` });
      }
    }
    
    // Return formatted content if any
    if (formattedContent.length > 0) {
      return formattedContent;
    }
  }

  // Default fallback
  return [{ type: 'text', text: JSON.stringify(content, null, 2) }];
}

/**
 * Handler function for the crawl4ai_deep_research tool
 * 
 * @param params Parameters from the MCP client request
 * @returns Research results with synthesized information
 */
export async function handleCrawl4aiDeepResearch(params: z.infer<typeof crawl4aiDeepResearchSchema>) {
  try {
    console.log('Conducting deep research on:', params.query);
    
    // Extract query from params and use the rest as options
    const { query, ...options } = params;
    
    // Call the adapter to conduct the research
    const response = await adapter.deepResearch(query as string, options);
    
    // Format the response for MCP protocol
    return {
      content: formatResearchContent(response)
    };
  } catch (error) {
    console.error('Error in crawl4ai_deep_research:', error);
    
    return {
      content: [
        {
          type: 'text',
          text: `Error researching "${params.query}": ${error instanceof Error ? error.message : String(error)}`
        }
      ]
    };
  }
}