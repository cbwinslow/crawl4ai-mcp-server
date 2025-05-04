/**
 * Crawl4AI Crawl Handler
 * 
 * Handler for the crawl tool that starts an asynchronous crawl of multiple pages
 */

import { createHandler, createStringValidator } from '../utils/handler-factory';

/**
 * Handler for starting a crawl
 */
export const handleCrawl4aiCrawl = createHandler('crawl', {
  validateParams: createStringValidator('url', 'URL is required and must be a string'),
  emptyResponseMessage: (params) => 
    `Crawl could not be started from ${params.url}.`,
  errorContext: (params) => `Error starting crawl from ${params.url}`
});

export default handleCrawl4aiCrawl;