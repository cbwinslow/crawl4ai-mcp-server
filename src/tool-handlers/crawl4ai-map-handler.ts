/**
 * Crawl4AI Map Handler
 * 
 * Handler for the map tool that discovers URLs from a starting point
 */

import { createHandler, createStringValidator } from '../utils/handler-factory';

/**
 * Handler for discovering URLs
 */
export const handleCrawl4aiMap = createHandler('mapUrls', {
  validateParams: createStringValidator('url', 'URL is required and must be a string'),
  emptyResponseMessage: (params) => 
    `No URLs were discovered from ${params.url}.`,
  errorContext: (params) => `Error mapping URLs from ${params.url}`
});

export default handleCrawl4aiMap;