/**
 * Schema definition for the crawl4ai_deep_research tool
 * 
 * This tool allows conducting in-depth research on a specific query or topic by:
 * 1. Searching the web for relevant pages
 * 2. Intelligently crawling multiple pages to gather comprehensive information
 * 3. Analyzing and synthesizing the content into a structured response
 */

import { z } from 'zod';

/**
 * Schema for the crawl4ai_deep_research tool
 * 
 * The tool performs multi-page research combining search, crawling, and analysis
 * to provide comprehensive information on a given query or topic.
 */
export const crawl4aiDeepResearchSchema = {
  // The main research query or topic
  query: z.string().describe('The research query or topic to investigate in depth'),
  
  // Maximum depth of research iterations (1-10)
  maxDepth: z.number().min(1).max(10).optional().default(3)
    .describe('Maximum depth of research iterations (1-10). Higher values mean more thorough research but longer execution time'),
  
  // Maximum number of URLs to analyze
  maxUrls: z.number().min(1).max(1000).optional().default(20)
    .describe('Maximum number of URLs to analyze during the research (1-1000). Higher values provide more comprehensive coverage'),
  
  // Time limit for the research operation
  timeLimit: z.number().min(30).max(300).optional().default(120)
    .describe('Maximum time in seconds to spend on the research (30-300). The operation will conclude when either the time limit or URL limit is reached'),
  
  // Include specific domains in the research
  includeDomains: z.array(z.string()).optional()
    .describe('List of domains to specifically include in the research (e.g., ["wikipedia.org", "github.com"])'),
  
  // Exclude specific domains from the research
  excludeDomains: z.array(z.string()).optional()
    .describe('List of domains to exclude from the research'),
  
  // Preferred content formats for the response
  responseFormat: z.enum(['text', 'markdown', 'json']).optional().default('markdown')
    .describe('Preferred format for the research results (text, markdown, or json)'),
  
  // Custom system instructions for AI analysis
  systemInstructions: z.string().optional()
    .describe('Optional custom instructions for AI systems that analyze the content'),
  
  // Whether to include sources in the response
  includeSources: z.boolean().optional().default(true)
    .describe('Whether to include source URLs for each piece of information in the response'),
};

// Export the handler function type
export type Crawl4aiDeepResearchHandler = (params: z.infer<typeof crawl4aiDeepResearchSchema>) => 
  Promise<{ content: Array<{ type: string, text: string }> }>;

// Export the schema
export default crawl4aiDeepResearchSchema;