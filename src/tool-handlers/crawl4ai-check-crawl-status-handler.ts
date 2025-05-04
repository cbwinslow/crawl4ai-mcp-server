/**
 * Crawl4AI Check Crawl Status Handler
 *
 * Handler for the check crawl status tool that monitors crawl job status
 */

import { createHandler, createStringValidator } from '../utils/handler-factory';

/**
 * Handler for checking crawl status
 */
export const handleCrawl4aiCheckCrawlStatus = createHandler('checkCrawlStatus', {
  validateParams: createStringValidator('id', 'Crawl job ID is required and must be a string'),
  emptyResponseMessage: params => `No status information available for crawl job ${params.id}.`,
  errorContext: params => `Error checking crawl status for job ${params.id}`,
});

export default handleCrawl4aiCheckCrawlStatus;
