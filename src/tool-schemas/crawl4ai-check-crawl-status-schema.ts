/**
 * @file crawl4ai-check-crawl-status-schema.ts
 * @description Schema definition for the crawl4ai_check_crawl_status tool
 *
 * This module defines the schema for the crawl4ai_check_crawl_status tool, which checks
 * the status of an asynchronous crawl job initiated by the crawl4ai_crawl tool. It
 * provides information about the progress, completion status, and results of the
 * crawl operation.
 *
 * The schema uses Zod for runtime type validation and documentation generation,
 * ensuring type safety and providing descriptive information for MCP clients.
 */

import { z } from 'zod';

/**
 * Schema for the crawl4ai_check_crawl_status tool
 *
 * @remarks This tool is used to check the progress and results of an asynchronous crawl job.
 * It can provide statistics, list of URLs, error details, and can download the full results
 * when the crawl is complete. It also provides the option to cancel an ongoing crawl.
 */
export const crawl4aiCheckCrawlStatusSchema = z.object({
  // Required: The ID of the crawl job to check
  id: z
    .string()
    .describe(
      'Crawl job ID to check. This is the ID returned by the crawl4ai_crawl tool when initiating a crawl. Must be a valid UUID or other identifier'
    ),

  // Optional with default: Whether to include detailed statistics about the crawl
  includeStats: z
    .boolean()
    .optional()
    .default(true)
    .describe(
      'Include detailed statistics about the crawl (pages crawled, errors, rate limits, etc.). Provides comprehensive metrics about the crawl operation'
    ),

  // Optional with default: Whether to include the list of crawled URLs in the response
  includeUrls: z
    .boolean()
    .optional()
    .default(true)
    .describe(
      'Include the list of URLs that were successfully crawled. Useful for verification and for creating reports of crawled content'
    ),

  // Optional with default: Whether to include error details in the response
  includeErrors: z
    .boolean()
    .optional()
    .default(true)
    .describe(
      'Include details about any errors encountered during the crawl. Useful for diagnosing issues with specific pages or domains'
    ),

  // Optional with default: Whether to download the crawl results
  downloadResults: z
    .boolean()
    .optional()
    .default(false)
    .describe(
      'Download the full crawl results. If false, only the status and statistics are returned. Setting to true returns the complete crawled content'
    ),

  // Optional with default: Format for downloaded results
  downloadFormat: z
    .enum(['json', 'markdown', 'csv'])
    .optional()
    .default('json')
    .describe(
      'Format for downloaded results, if downloadResults is true. "json" is structured for programmatic use, "markdown" for human readability, and "csv" for tabular data'
    ),

  // Optional with default: Maximum size in KB for downloaded results
  maxResultSize: z
    .number()
    .optional()
    .default(1000)
    .describe(
      'Maximum size in KB for downloaded results. Larger results will be truncated. Increase for more comprehensive results, but be aware of potential memory usage'
    ),

  // Optional with default: Whether to cancel the crawl job if it's still running
  cancelIfRunning: z
    .boolean()
    .optional()
    .default(false)
    .describe(
      "Cancel the crawl job if it's still running. This will stop the crawl and return the results collected so far. Useful for terminating long-running crawls that have collected sufficient data"
    ),
});

/**
 * Type definition for the crawl4ai_check_crawl_status handler function
 *
 * @remarks This type represents the function signature for the handler that processes
 * a crawl4ai_check_crawl_status request and returns information about the crawl job.
 */
export type Crawl4aiCheckCrawlStatusHandler = (
  params: z.infer<typeof crawl4aiCheckCrawlStatusSchema>
) => Promise<{ content: Array<{ type: string; text: string }> }>;

// Export the schema
export default crawl4aiCheckCrawlStatusSchema;
