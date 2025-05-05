/**
 * Types for format-utils.ts
 */

/**
 * Base response interface
 */
export interface BaseResponse {
  success?: boolean;
  error?: string;
}

/**
 * URL entry in mapping results
 */
export interface UrlEntry {
  url: string;
  text?: string;
}

/**
 * Source item in research results
 */
export interface ResearchSource {
  url?: string;
  title?: string;
  snippet?: string;
  relevance?: number;
}

/**
 * Research results structure
 */
export interface ResearchResult extends BaseResponse {
  results: string | {
    summary: string;
    sources?: ResearchSource[];
  };
}

/**
 * URL mapping results structure
 */
export interface UrlMappingResult extends BaseResponse {
  url?: string;
  urls: string[];
  count?: number;
}

/**
 * Search result item
 */
export interface SearchResultItem {
  url: string;
  title?: string;
  snippet?: string;
  description?: string;
}

/**
 * Search results structure
 */
export interface SearchResult extends BaseResponse {
  query?: string;
  results: SearchResultItem[];
}

/**
 * Crawl status error
 */
export interface CrawlError {
  url?: string;
  message?: string;
  error?: string;
}

/**
 * Crawl status structure
 */
export interface CrawlStatusResult extends BaseResponse {
  id: string;
  status: string;
  progress?: number;
  urls_count?: number;
  errors_count?: number;
  urls?: string[];
  errors?: CrawlError[];
}

/**
 * Link item in scrape results
 */
export interface LinkItem {
  url?: string;
  text?: string;
}

/**
 * Format options in scrape results
 */
export interface ScrapeFormats {
  markdown?: string;
  html?: string;
  rawHtml?: string;
  screenshot?: string;
  links?: LinkItem[] | string[];
}

/**
 * Scrape result structure
 */
export interface ScrapeResult extends BaseResponse {
  formats?: ScrapeFormats;
  markdown?: string;
  html?: string;
  text?: string;
  extracted?: Record<string, unknown>;
}

/**
 * Generic formatted content
 */
export type FormattableContent = 
  | ResearchResult
  | UrlMappingResult
  | SearchResult
  | CrawlStatusResult
  | ScrapeResult
  | Record<string, unknown>
  | string
  | null
  | undefined;