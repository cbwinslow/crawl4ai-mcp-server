/**
 * Schema definition for the crawl4ai_map tool
 * 
 * This tool discovers URLs from a starting point using both sitemap.xml and
 * HTML link discovery methods. It helps in understanding the structure of a website
 * and finding relevant pages for further scraping or analysis.
 */

import { z } from 'zod';

/**
 * Schema for the crawl4ai_map tool
 * 
 * This tool maps the structure of a website by discovering URLs from a starting point.
 * It can use sitemap.xml files, HTML link analysis, or both to discover URLs.
 */
export const crawl4aiMapSchema = {
  // The starting URL for URL discovery
  url: z.string().describe('Starting URL for URL discovery. This should be the homepage or a section page of the website you want to map'),
  
  // Maximum number of URLs to return
  limit: z.number().min(1).max(500).optional().default(100)
    .describe('Maximum number of URLs to return (1-500). Higher values provide more comprehensive coverage'),
  
  // Optional search term to filter URLs
  search: z.string().optional()
    .describe('Optional search term to filter URLs. Only URLs containing this term will be included in the results'),
  
  // Whether to skip sitemap.xml discovery
  ignoreSitemap: z.boolean().optional().default(false)
    .describe('Skip sitemap.xml discovery and only use HTML links for URL discovery. By default, both methods are used'),
  
  // Whether to only use sitemap.xml for discovery
  sitemapOnly: z.boolean().optional().default(false)
    .describe('Only use sitemap.xml for discovery, ignore HTML links. This is faster but may miss some pages'),
  
  // Whether to include URLs from subdomains
  includeSubdomains: z.boolean().optional().default(false)
    .describe('Include URLs from subdomains in results. By default, only URLs from the same domain are included'),
  
  // Maximum depth for HTML link discovery
  maxDepth: z.number().min(1).max(5).optional().default(2)
    .describe('Maximum depth for HTML link discovery (1-5). Only applies when not using sitemapOnly'),
  
  // Filter URLs by path patterns
  includePaths: z.array(z.string()).optional()
    .describe('Only include URLs with paths matching these patterns (e.g., ["/blog/", "/products/"])'),
  
  // Exclude URLs by path patterns
  excludePaths: z.array(z.string()).optional()
    .describe('Exclude URLs with paths matching these patterns'),
  
  // Output format preference
  format: z.enum(['simple', 'detailed']).optional().default('simple')
    .describe('Output format: "simple" returns just URLs, "detailed" includes metadata like title and last modified date when available'),
};

// Export the handler function type
export type Crawl4aiMapHandler = (params: z.infer<typeof crawl4aiMapSchema>) => 
  Promise<{ content: Array<{ type: string, text: string }> }>;

// Export the schema
export default crawl4aiMapSchema;