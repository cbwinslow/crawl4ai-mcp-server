/**
 * Crawl4AI Search Handler
 * 
 * Handler for the search tool that allows searching web content
 */

import { createHandler, createStringValidator } from '../utils/handler-factory';

/**
 * Handler for searching web content
 */
export const handleCrawl4aiSearch = createHandler('search', {
  validateParams: createStringValidator('query', 'Search query is required and must be a string'),
  emptyResponseMessage: (params) => 
    `No results found for query "${params.query}".`,
  errorContext: (params) => `Error searching for "${params.query}"`
});

export default handleCrawl4aiSearch;