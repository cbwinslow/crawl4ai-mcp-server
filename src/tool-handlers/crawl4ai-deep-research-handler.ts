/**
 * Crawl4AI Deep Research Handler
 *
 * Handler for the deep research tool that conducts comprehensive research on a topic
 */

import { createHandler, createStringValidator } from '../utils/handler-factory';

/**
 * Handler for deep research on a query
 */
export const handleCrawl4aiDeepResearch = createHandler('deepResearch', {
  validateParams: createStringValidator('query', 'Query is required and must be a string'),
  emptyResponseMessage: params => `Research on "${params.query}" did not return any results.`,
  errorContext: params => `Error researching "${params.query}"`,
});

export default handleCrawl4aiDeepResearch;
