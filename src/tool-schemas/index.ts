/**
 * @file index.ts
 * @description Export file for all Crawl4AI MCP tool schemas
 * 
 * This module serves as a barrel export for all the Zod schema definitions used by the
 * Crawl4AI MCP tools. Barrel exports provide a centralized point for importing multiple
 * components, simplifying imports in other files where multiple schemas are needed.
 * 
 * These schemas define the structure, validation rules, and documentation for each tool's
 * parameters, ensuring type safety and providing descriptive information for MCP clients.
 * 
 * Each schema corresponds to a specific tool in the Crawl4AI suite:
 * - crawl4aiScrapeSchema: Schema for single webpage scraping
 * - crawl4aiDeepResearchSchema: Schema for comprehensive multi-page research
 * - crawl4aiMapSchema: Schema for URL discovery operations
 * - crawl4aiCrawlSchema: Schema for asynchronous multi-page crawling
 * - crawl4aiExtractSchema: Schema for structured data extraction
 * - crawl4aiCheckCrawlStatusSchema: Schema for crawl job status monitoring
 * - crawl4aiSearchSchema: Schema for web content search
 * 
 * @module tool-schemas
 */

export { default as crawl4aiScrapeSchema } from './crawl4ai-scrape-schema';
export { default as crawl4aiDeepResearchSchema } from './crawl4ai-deep-research-schema';
export { default as crawl4aiMapSchema } from './crawl4ai-map-schema';
export { default as crawl4aiCrawlSchema } from './crawl4ai-crawl-schema';
export { default as crawl4aiExtractSchema } from './crawl4ai-extract-schema';
export { default as crawl4aiCheckCrawlStatusSchema } from './crawl4ai-check-crawl-status-schema';
export { default as crawl4aiSearchSchema } from './crawl4ai-search-schema';