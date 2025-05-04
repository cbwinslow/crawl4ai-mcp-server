/**
 * @file crawl4ai-map-schema.ts
 * @description Schema definition for the crawl4ai_map tool
 *
 * This module defines the schema for the crawl4ai_map tool, which discovers URLs
 * from a starting point using both sitemap.xml and HTML link discovery methods.
 * It helps in understanding the structure of a website and finding relevant pages
 * for further scraping or analysis.
 *
 * The schema uses Zod for runtime type validation and documentation generation,
 * ensuring type safety and providing descriptive information for MCP clients.
 */

import { z } from 'zod';

/**
 * Schema for the crawl4ai_map tool
 *
 * @remarks This schema defines all parameters for the crawl4ai_map tool,
 * which maps the structure of a website by discovering URLs from a starting point.
 * It can use sitemap.xml files, HTML link analysis, or both to discover URLs.
 */
export const crawl4aiMapSchema = z.object({
  // Required: The starting URL for URL discovery
  url: z
    .string()
    .describe(
      'Starting URL for URL discovery. This should be the homepage or a section page of the website you want to map. Must include protocol (e.g., https://example.com)'
    ),

  // Optional with default: Maximum number of URLs to return
  limit: z
    .number()
    .min(1)
    .max(500)
    .optional()
    .default(100)
    .describe(
      'Maximum number of URLs to return (1-500). Higher values provide more comprehensive coverage but increase processing time'
    ),

  // Optional: Search term to filter URLs
  search: z
    .string()
    .optional()
    .describe(
      'Optional search term to filter URLs. Only URLs containing this term will be included in the results. Case-insensitive matching is used'
    ),

  // Optional with default: Whether to skip sitemap.xml discovery
  ignoreSitemap: z
    .boolean()
    .optional()
    .default(false)
    .describe(
      'Skip sitemap.xml discovery and only use HTML links for URL discovery. By default, both methods are used for maximum coverage'
    ),

  // Optional with default: Whether to only use sitemap.xml for discovery
  sitemapOnly: z
    .boolean()
    .optional()
    .default(false)
    .describe(
      'Only use sitemap.xml for discovery, ignore HTML links. This is faster but may miss pages not listed in the sitemap'
    ),

  // Optional with default: Whether to include URLs from subdomains
  includeSubdomains: z
    .boolean()
    .optional()
    .default(false)
    .describe(
      'Include URLs from subdomains in results. By default, only URLs from the same domain are included. Setting to true will include URLs like blog.example.com when mapping example.com'
    ),

  // Optional with default: Maximum depth for HTML link discovery
  maxDepth: z
    .number()
    .min(1)
    .max(5)
    .optional()
    .default(2)
    .describe(
      'Maximum depth for HTML link discovery (1-5). Only applies when not using sitemapOnly. A depth of 1 only includes links from the starting page, 2 includes links from those pages, etc.'
    ),

  // Optional: Filter URLs by path patterns (inclusion)
  includePaths: z
    .array(z.string())
    .optional()
    .describe(
      'Only include URLs with paths matching these patterns (e.g., ["/blog/", "/products/"]). URLs must contain at least one of these strings to be included'
    ),

  // Optional: Filter URLs by path patterns (exclusion)
  excludePaths: z
    .array(z.string())
    .optional()
    .describe(
      'Exclude URLs with paths matching these patterns. URLs containing any of these strings will be excluded from results'
    ),

  // Optional with default: Output format preference
  format: z
    .enum(['simple', 'detailed'])
    .optional()
    .default('simple')
    .describe(
      'Output format: "simple" returns just URLs, "detailed" includes metadata like title and last modified date when available from sitemaps or HTML'
    ),
});

/**
 * Type definition for the crawl4ai_map handler function
 *
 * @remarks This type represents the function signature for the handler that processes
 * a crawl4ai_map request and returns the discovered URLs in the specified format.
 */
export type Crawl4aiMapHandler = (
  params: z.infer<typeof crawl4aiMapSchema>
) => Promise<{ content: Array<{ type: string; text: string }> }>;

// Export the schema
export default crawl4aiMapSchema;
