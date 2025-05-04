/**
 * Schema definition for the crawl4ai_crawl tool
 * 
 * This tool starts an asynchronous crawl of multiple pages from a starting URL.
 * It supports depth control, path filtering, and various customization options
 * to control what content is scraped and how it's processed.
 */

import { z } from 'zod';

// Define possible content formats for scraping
const FormatEnum = z.enum([
  'markdown', 
  'html', 
  'rawHtml', 
  'screenshot', 
  'links', 
  'screenshot@fullPage', 
  'extract'
]);

// Define the scrape options schema
const ScrapeOptionsSchema = z.object({
  // Content formats to extract from each page
  formats: z.array(FormatEnum).optional().default(['markdown'])
    .describe('Content formats to extract from each crawled page'),
  
  // Whether to extract only the main content
  onlyMainContent: z.boolean().optional().default(true)
    .describe('Extract only the main content from pages, filtering out navigation, sidebars, footers, etc.'),
  
  // HTML tags to specifically include
  includeTags: z.array(z.string()).optional()
    .describe('HTML tags to specifically include in extraction'),
  
  // HTML tags to exclude
  excludeTags: z.array(z.string()).optional()
    .describe('HTML tags to exclude from extraction'),
  
  // Time to wait for dynamic content
  waitFor: z.number().optional().default(2000)
    .describe('Time in milliseconds to wait for dynamic content to load on each page'),
  
  // Whether to remove base64 images
  removeBase64Images: z.boolean().optional().default(true)
    .describe('Remove base64 encoded images from output to reduce response size'),
}).describe('Options for scraping each page during the crawl');

// Define the webhook options schema
const WebhookSchema = z.union([
  z.string().describe('Webhook URL to notify when crawl is complete'),
  z.object({
    url: z.string().describe('Webhook URL'),
    headers: z.record(z.string()).describe('Custom headers for webhook requests')
  }).describe('Webhook configuration with custom headers')
]).optional().describe('Optional webhook to notify when the crawl is complete');

/**
 * Schema for the crawl4ai_crawl tool
 * 
 * This tool starts an asynchronous crawl of multiple pages from a starting URL.
 */
export const crawl4aiCrawlSchema = {
  // The starting URL for the crawl
  url: z.string().describe('Starting URL for the crawl. The crawler will begin from this page and follow links'),
  
  // Maximum number of pages to crawl
  limit: z.number().min(1).max(1000).optional().default(50)
    .describe('Maximum number of pages to crawl (1-1000). The crawl will stop after processing this many pages'),
  
  // Maximum link depth to crawl
  maxDepth: z.number().min(1).max(10).optional().default(3)
    .describe('Maximum link depth to crawl (1-10). A depth of 1 means only crawl the starting page, 2 includes pages linked from the starting page, etc.'),
  
  // URL paths to include in crawling
  includePaths: z.array(z.string()).optional()
    .describe('Only crawl URLs with these path patterns (e.g., ["/blog/", "/docs/"]). If not specified, all paths are included'),
  
  // URL paths to exclude from crawling
  excludePaths: z.array(z.string()).optional()
    .describe('URL paths to exclude from crawling (e.g., ["/contact/", "/login/"])'),
  
  // Whether to allow crawling links to external domains
  allowExternalLinks: z.boolean().optional().default(false)
    .describe('Allow crawling links to external domains. By default, only links within the same domain are crawled'),
  
  // Whether to allow crawling links that point to parent directories
  allowBackwardLinks: z.boolean().optional().default(true)
    .describe('Allow crawling links that point to parent directories'),
  
  // Whether to ignore query parameters when comparing URLs
  ignoreQueryParameters: z.boolean().optional().default(true)
    .describe('Ignore query parameters when comparing URLs to avoid crawling the same page with different parameters'),
  
  // Whether to remove similar URLs during crawl
  deduplicateSimilarURLs: z.boolean().optional().default(true)
    .describe('Remove similar URLs during crawl to avoid content duplication'),
  
  // Whether to skip sitemap.xml discovery
  ignoreSitemap: z.boolean().optional().default(false)
    .describe('Skip sitemap.xml discovery. By default, sitemap.xml is used to discover URLs in addition to HTML links'),
  
  // Options for scraping each page
  scrapeOptions: ScrapeOptionsSchema.optional()
    .describe('Options for scraping each page during the crawl'),
  
  // Webhook to notify when crawl is complete
  webhook: WebhookSchema,
};

// Export the handler function type
export type Crawl4aiCrawlHandler = (params: z.infer<typeof crawl4aiCrawlSchema>) => 
  Promise<{ content: Array<{ type: string, text: string }> }>;

// Export the schema
export default crawl4aiCrawlSchema;