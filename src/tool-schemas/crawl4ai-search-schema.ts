/**
 * Crawl4AI Search Schema
 * 
 * Schema for the search tool that allows searching web content
 */

import { z } from 'zod';

export const crawl4aiSearchSchema = z.object({
  query: z.string().describe('Search query string'),
  limit: z.number().optional().describe('Maximum number of results to return (default: 5)'),
  filter: z.string().optional().describe('Search filter'),
  country: z.string().optional().describe('Country code for search results (default: us)'),
  lang: z.string().optional().describe('Language code for search results (default: en)'),
  tbs: z.string().optional().describe('Time-based search filter'),
  scrapeOptions: z.object({
    formats: z.array(z.enum(['markdown', 'html', 'rawHtml'])).optional()
      .describe('Content formats to extract from search results'),
    onlyMainContent: z.boolean().optional()
      .describe('Extract only the main content from results'),
    waitFor: z.number().optional()
      .describe('Time in milliseconds to wait for dynamic content')
  }).optional().describe('Options for scraping search results'),
  location: z.object({
    country: z.string().describe('Country code for geolocation'),
    languages: z.array(z.string()).optional().describe('Language codes for content')
  }).optional().describe('Location settings for search')
});

export default crawl4aiSearchSchema;