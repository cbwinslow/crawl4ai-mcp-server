/**
 * Schema definition for the crawl4ai_check_crawl_status tool
 * 
 * This tool checks the status of an asynchronous crawl job initiated by the
 * crawl4ai_crawl tool. It provides information about the progress, completion status,
 * and results of the crawl operation.
 */

import { z } from 'zod';

/**
 * Schema for the crawl4ai_check_crawl_status tool
 * 
 * This tool is used to check the progress and results of an asynchronous crawl job.
 */
export const crawl4aiCheckCrawlStatusSchema = {
  // The ID of the crawl job to check
  id: z.string()
    .describe('Crawl job ID to check. This is the ID returned by the crawl4ai_crawl tool when initiating a crawl'),
  
  // Whether to include detailed statistics about the crawl
  includeStats: z.boolean().optional().default(true)
    .describe('Include detailed statistics about the crawl (pages crawled, errors, etc.)'),
  
  // Whether to include the list of crawled URLs in the response
  includeUrls: z.boolean().optional().default(true)
    .describe('Include the list of URLs that were successfully crawled'),
  
  // Whether to include error details in the response
  includeErrors: z.boolean().optional().default(true)
    .describe('Include details about any errors encountered during the crawl'),
  
  // Whether to download the crawl results
  downloadResults: z.boolean().optional().default(false)
    .describe('Download the full crawl results. If false, only the status and statistics are returned'),
  
  // Format for downloaded results
  downloadFormat: z.enum(['json', 'markdown', 'csv']).optional().default('json')
    .describe('Format for downloaded results, if downloadResults is true'),
  
  // Maximum size in KB for downloaded results
  maxResultSize: z.number().optional().default(1000)
    .describe('Maximum size in KB for downloaded results. Larger results will be truncated'),
  
  // Whether to cancel the crawl job if it's still running
  cancelIfRunning: z.boolean().optional().default(false)
    .describe('Cancel the crawl job if it\'s still running. This will stop the crawl and return the results collected so far'),
};

// Export the handler function type
export type Crawl4aiCheckCrawlStatusHandler = (params: z.infer<typeof crawl4aiCheckCrawlStatusSchema>) => 
  Promise<{ content: Array<{ type: string, text: string }> }>;

// Export the schema
export default crawl4aiCheckCrawlStatusSchema;