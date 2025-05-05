/**
 * Crawl4AI Search Handler
 *
 * Handler for the search tool that allows searching web content with optional scraping.
 * This handler searches web pages based on a user's query and can optionally retrieve
 * full content from search results.
 */

import { createHandler, createStringValidator } from '../utils/handler-factory';

/**
 * Handler for searching web content
 *
 * Validates the search query parameter and passes it to the adapter's search method.
 * Provides appropriate error messages if search fails or returns empty results.
 *
 * @returns Formatted search results in MCP-compatible format
 */
export const handleCrawl4aiSearch = createHandler('search', {
  // Validate that a search query is provided
  validateParams: createStringValidator('query', 'Search query is required and must be a string'),

  // Message to return if search returns empty results
  emptyResponseMessage: params =>
    `No results found for query "${params.query}". Try a different search term or check your search filters.`,

  // Context for error messages
  errorContext: params => `Error searching for "${params.query}"`,

  // Optional: Transform the response to enhance formatting
  transformResponse: response => {
    // Add special handling for search results if needed
    if (response.results && Array.isArray(response.results)) {
      return {
        query: response.query,
        count: response.results.length,
        results: response.results,
      };
    }
    return response;
  },
});

export default handleCrawl4aiSearch;
