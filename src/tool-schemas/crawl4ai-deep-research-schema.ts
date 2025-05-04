/**
 * @file crawl4ai-deep-research-schema.ts
 * @description Schema definition for the crawl4ai_deep_research tool
 * 
 * This module defines the schema for the crawl4ai_deep_research tool, which enables
 * conducting in-depth research on a specific query or topic by performing a series of
 * steps: searching the web for relevant pages, intelligently crawling multiple pages
 * to gather comprehensive information, and analyzing and synthesizing the content into
 * a structured response.
 * 
 * The schema uses Zod for runtime type validation and documentation generation,
 * ensuring type safety and providing descriptive information for MCP clients.
 */

import { z } from 'zod';

/**
 * Schema for the crawl4ai_deep_research tool
 * 
 * @remarks This tool performs multi-page research combining search, crawling, and analysis
 * to provide comprehensive information on a given query or topic. It's designed for
 * situations where a simple web search or page scrape is insufficient, and deeper
 * research across multiple sources is required.
 */
export const crawl4aiDeepResearchSchema = {
  // Required: The main research query or topic
  query: z.string()
    .describe('The research query or topic to investigate in depth. This should be specific enough to guide the research but broad enough to allow for comprehensive coverage'),
  
  // Optional with default: Maximum depth of research iterations
  maxDepth: z.number().min(1).max(10).optional().default(3)
    .describe('Maximum depth of research iterations (1-10). Higher values mean more thorough research but longer execution time. Each iteration may explore sub-topics discovered in previous iterations'),
  
  // Optional with default: Maximum number of URLs to analyze
  maxUrls: z.number().min(1).max(1000).optional().default(20)
    .describe('Maximum number of URLs to analyze during the research (1-1000). Higher values provide more comprehensive coverage but increase processing time and resource usage'),
  
  // Optional with default: Time limit for the research operation
  timeLimit: z.number().min(30).max(300).optional().default(120)
    .describe('Maximum time in seconds to spend on the research (30-300). The operation will conclude when either the time limit or URL limit is reached, whichever comes first'),
  
  // Optional: Include specific domains in the research
  includeDomains: z.array(z.string()).optional()
    .describe('List of domains to specifically include in the research (e.g., ["wikipedia.org", "github.com"]). These domains will be prioritized in the search and crawl phases'),
  
  // Optional: Exclude specific domains from the research
  excludeDomains: z.array(z.string()).optional()
    .describe('List of domains to exclude from the research. No content will be fetched from these domains, useful for avoiding low-quality or irrelevant sources'),
  
  // Optional with default: Preferred content format for the response
  responseFormat: z.enum(['text', 'markdown', 'json']).optional().default('markdown')
    .describe('Preferred format for the research results. "markdown" provides well-formatted content with headers and lists, "json" is structured for programmatic use, and "text" is plain text'),
  
  // Optional: Custom system instructions for AI analysis
  systemInstructions: z.string().optional()
    .describe('Optional custom instructions for AI systems that analyze the content. This can guide the analysis process, specify output format, or focus on particular aspects of the research'),
  
  // Optional with default: Whether to include sources in the response
  includeSources: z.boolean().optional().default(true)
    .describe('Whether to include source URLs for each piece of information in the response. Setting to true enables attribution and verification of information'),
};

/**
 * Type definition for the crawl4ai_deep_research handler function
 * 
 * @remarks This type represents the function signature for the handler that processes
 * a crawl4ai_deep_research request and returns the research results.
 */
export type Crawl4aiDeepResearchHandler = (params: z.infer<typeof crawl4aiDeepResearchSchema>) => 
  Promise<{ content: Array<{ type: string, text: string }> }>;

// Export the schema
export default crawl4aiDeepResearchSchema;