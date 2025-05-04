/**
 * Crawl4AI Scrape Handler
 *
 * Handler for the scrape tool that allows scraping a single webpage with advanced options
 */

import { createHandler, createStringValidator } from '../utils/handler-factory';

/**
 * Handler for scraping a single webpage
 */
export const handleCrawl4aiScrape = createHandler('scrape', {
  validateParams: createStringValidator('url', 'URL is required and must be a string'),
  emptyResponseMessage: params =>
    `No content was returned from ${params.url}. The page might be empty, protected, or blocked.`,
  errorContext: params => `Error scraping ${params.url}`,
});

export default handleCrawl4aiScrape;
