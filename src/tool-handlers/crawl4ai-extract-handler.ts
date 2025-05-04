/**
 * Crawl4AI Extract Handler
 * 
 * Handler for the extract tool that extracts structured information from web pages
 */

import { createHandler, createArrayValidator } from '../utils/handler-factory';

/**
 * Handler for extracting structured data
 */
export const handleCrawl4aiExtract = createHandler('extract', {
  validateParams: createArrayValidator('urls', 'URLs are required and must be an array'),
  emptyResponseMessage: (params) => 
    `No data could be extracted from the provided URLs.`,
  errorContext: (params) => `Error extracting data from URLs`
});

export default handleCrawl4aiExtract;