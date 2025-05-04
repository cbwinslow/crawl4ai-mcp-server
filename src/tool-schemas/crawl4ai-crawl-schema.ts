/**
 * @file crawl4ai-crawl-schema.ts
 * @description Schema definition for the crawl4ai_crawl tool
 * 
 * This module defines the schema for the crawl4ai_crawl tool, which starts an
 * asynchronous crawl of multiple pages from a starting URL. It supports depth control,
 * path filtering, and various customization options to control what content is
 * scraped and how it's processed.
 * 
 * The schema uses Zod for runtime type validation and documentation generation,
 * ensuring type safety and providing descriptive information for MCP clients.
 */

import { z } from 'zod';

/**
 * Defines possible content formats for scraping
 * 
 * @remarks These formats determine how the content of each page is processed
 * and returned in the crawl results.
 */
const FormatEnum = z.enum([
  'markdown',           // Markdown formatted content
  'html',               // Cleaned HTML content
  'rawHtml',            // Raw unprocessed HTML
  'screenshot',         // Screenshot of the visible area
  'links',              // Links found on the page
  'screenshot@fullPage', // Full page screenshot
  'extract'             // LLM-based structured extraction
]);

/**
 * Schema for scrape options during crawling
 * 
 * @remarks This schema defines how each page is scraped during the crawl,
 * including content formats, filtering options, and wait times.
 */
const ScrapeOptionsSchema = z.object({
  // Content formats to extract from each page
  formats: z.array(FormatEnum).optional().default(['markdown'])
    .describe('Content formats to extract from each crawled page. Multiple formats can be requested simultaneously'),
  
  // Whether to extract only the main content
  onlyMainContent: z.boolean().optional().default(true)
    .describe('Extract only the main content from pages, filtering out navigation, sidebars, footers, etc. Improves content quality and reduces noise'),
  
  // HTML tags to specifically include
  includeTags: z.array(z.string()).optional()
    .describe('HTML tags to specifically include in extraction (e.g., ["article", "main", "p"]). Useful for targeting specific content types'),
  
  // HTML tags to exclude
  excludeTags: z.array(z.string()).optional()
    .describe('HTML tags to exclude from extraction (e.g., ["nav", "footer", "aside"]). Helps filter out non-content elements'),
  
  // Time to wait for dynamic content
  waitFor: z.number().optional().default(2000)
    .describe('Time in milliseconds to wait for dynamic content to load on each page. Increase for JavaScript-heavy sites'),
  
  // Whether to remove base64 images
  removeBase64Images: z.boolean().optional().default(true)
    .describe('Remove base64 encoded images from output to reduce response size. Set to false if image data is important'),
}).describe('Options for scraping each page during the crawl. Controls content extraction behavior');

/**
 * Schema for webhook configuration
 * 
 * @remarks This schema defines how crawl completion notifications are sent,
 * supporting both simple URL strings and objects with custom headers.
 */
const WebhookSchema = z.union([
  // Simple webhook URL
  z.string().describe('Webhook URL to notify when crawl is complete. Will receive a POST request with crawl results'),
  
  // Advanced webhook configuration with custom headers
  z.object({
    // Webhook URL
    url: z.string().describe('Webhook URL to receive crawl completion notification'),
    
    // Custom headers for webhook requests
    headers: z.record(z.string()).describe('Custom headers for webhook requests. Useful for authentication or request routing')
  }).describe('Webhook configuration with custom headers for more complex notification requirements')
]).optional().describe('Optional webhook to notify when the crawl is complete. Enables asynchronous processing of crawl results');

/**
 * Schema for the crawl4ai_crawl tool
 * 
 * @remarks This tool starts an asynchronous crawl of multiple pages from a starting URL.
 * It's designed for situations where content from multiple related pages needs to be
 * collected in a single operation.
 */
export const crawl4aiCrawlSchema = {
  // Required: The starting URL for the crawl
  url: z.string()
    .describe('Starting URL for the crawl. The crawler will begin from this page and follow links. Must be a valid URL including protocol (e.g., https://example.com)'),
  
  // Optional with default: Maximum number of pages to crawl
  limit: z.number().min(1).max(1000).optional().default(50)
    .describe('Maximum number of pages to crawl (1-1000). The crawl will stop after processing this many pages. Higher values provide more comprehensive coverage but increase processing time'),
  
  // Optional with default: Maximum link depth to crawl
  maxDepth: z.number().min(1).max(10).optional().default(3)
    .describe('Maximum link depth to crawl (1-10). A depth of 1 means only crawl the starting page, 2 includes pages linked from the starting page, etc. Higher depths reach more content but increase processing time'),
  
  // Optional: URL paths to include in crawling
  includePaths: z.array(z.string()).optional()
    .describe('Only crawl URLs with these path patterns (e.g., ["/blog/", "/docs/"]). If not specified, all paths are included. Useful for targeting specific sections of a website'),
  
  // Optional: URL paths to exclude from crawling
  excludePaths: z.array(z.string()).optional()
    .describe('URL paths to exclude from crawling (e.g., ["/contact/", "/login/"]). Useful for avoiding irrelevant or sensitive pages'),
  
  // Optional with default: Whether to allow crawling links to external domains
  allowExternalLinks: z.boolean().optional().default(false)
    .describe('Allow crawling links to external domains. By default, only links within the same domain are crawled. Setting to true enables cross-domain crawling'),
  
  // Optional with default: Whether to allow crawling links that point to parent directories
  allowBackwardLinks: z.boolean().optional().default(true)
    .describe('Allow crawling links that point to parent directories. Setting to false creates a forward-only crawl pattern'),
  
  // Optional with default: Whether to ignore query parameters when comparing URLs
  ignoreQueryParameters: z.boolean().optional().default(true)
    .describe('Ignore query parameters when comparing URLs to avoid crawling the same page with different parameters. Setting to false treats URLs with different query parameters as distinct'),
  
  // Optional with default: Whether to remove similar URLs during crawl
  deduplicateSimilarURLs: z.boolean().optional().default(true)
    .describe('Remove similar URLs during crawl to avoid content duplication. Uses fuzzy matching to identify and filter out near-duplicate URLs'),
  
  // Optional with default: Whether to skip sitemap.xml discovery
  ignoreSitemap: z.boolean().optional().default(false)
    .describe('Skip sitemap.xml discovery. By default, sitemap.xml is used to discover URLs in addition to HTML links. Setting to true relies solely on HTML link discovery'),
  
  // Optional: Options for scraping each page
  scrapeOptions: ScrapeOptionsSchema.optional()
    .describe('Options for scraping each page during the crawl. Controls content extraction behavior and format'),
  
  // Optional: Webhook to notify when crawl is complete
  webhook: WebhookSchema,
};

/**
 * Type definition for the crawl4ai_crawl handler function
 * 
 * @remarks This type represents the function signature for the handler that processes
 * a crawl4ai_crawl request and initiates the asynchronous crawl operation.
 */
export type Crawl4aiCrawlHandler = (params: z.infer<typeof crawl4aiCrawlSchema>) => 
  Promise<{ content: Array<{ type: string, text: string }> }>;

// Export the schema
export default crawl4aiCrawlSchema;