/**
 * Types for Crawl4AI API
 * 
 * Contains interface definitions for Crawl4AI adapter parameters and responses
 */

import { ErrorType } from '../utils/error-utils';

/**
 * Base response interface for all API responses
 */
export interface BaseResponse {
  success: boolean;
  error?: string;
}

/**
 * Action types that can be performed before scraping
 */
export enum ActionType {
  WAIT = 'wait',
  CLICK = 'click',
  SCREENSHOT = 'screenshot',
  WRITE = 'write',
  PRESS = 'press',
  SCROLL = 'scroll',
  SCRAPE = 'scrape',
  EXECUTE_JAVASCRIPT = 'executeJavascript',
}

/**
 * Content format options
 */
export enum ContentFormat {
  MARKDOWN = 'markdown',
  HTML = 'html',
  RAW_HTML = 'rawHtml',
  SCREENSHOT = 'screenshot',
  LINKS = 'links',
  SCREENSHOT_FULL_PAGE = 'screenshot@fullPage',
  EXTRACT = 'extract',
}

/**
 * Pre-scraping action interface
 */
export interface Action {
  type: ActionType;
  selector?: string;
  milliseconds?: number;
  text?: string;
  key?: string;
  direction?: 'up' | 'down';
  fullPage?: boolean;
  script?: string;
}

/**
 * Location settings interface
 */
export interface LocationSettings {
  country?: string;
  languages?: string[];
}

/**
 * Extract configuration interface
 */
export interface ExtractConfig {
  prompt?: string;
  systemPrompt?: string;
  schema?: Record<string, unknown>;
}

/**
 * Scrape options interface
 */
export interface ScrapeOptions {
  formats?: ContentFormat[];
  actions?: Action[];
  waitFor?: number;
  onlyMainContent?: boolean;
  includeTags?: string[];
  excludeTags?: string[];
  mobile?: boolean;
  timeout?: number;
  extract?: ExtractConfig;
  location?: LocationSettings;
  removeBase64Images?: boolean;
  skipTlsVerification?: boolean;
}

/**
 * Scrape result interface
 */
export interface ScrapeResult extends BaseResponse {
  url: string;
  content?: Record<ContentFormat, string | string[] | Record<string, unknown>>;
  timestamp?: string;
}

/**
 * Deep research options interface
 */
export interface DeepResearchOptions {
  maxDepth?: number;
  maxUrls?: number;
  timeLimit?: number;
}

/**
 * Source item in deep research results
 */
export interface ResearchSource {
  url: string;
  title?: string;
  snippet?: string;
  relevance?: number;
}

/**
 * Deep research result interface
 */
export interface DeepResearchResult extends BaseResponse {
  query: string;
  results: {
    summary: string;
    sources: ResearchSource[];
  };
}

/**
 * Map URLs options interface
 */
export interface MapUrlsOptions {
  limit?: number;
  search?: string;
  sitemapOnly?: boolean;
  ignoreSitemap?: boolean;
  includeSubdomains?: boolean;
}

/**
 * Map URLs result interface
 */
export interface MapUrlsResult extends BaseResponse {
  url: string;
  urls: string[];
  count: number;
}

/**
 * Crawl options interface
 */
export interface CrawlOptions {
  maxDepth?: number;
  limit?: number;
  includePaths?: string[];
  excludePaths?: string[];
  ignoreQueryParameters?: boolean;
  allowExternalLinks?: boolean;
  allowBackwardLinks?: boolean;
  deduplicateSimilarURLs?: boolean;
  ignoreSitemap?: boolean;
  webhook?: string | { url: string; headers?: Record<string, string> };
  scrapeOptions?: ScrapeOptions;
}

/**
 * Crawl result interface
 */
export interface CrawlResult extends BaseResponse {
  id: string;
  url: string;
  status: 'queued' | 'in_progress' | 'completed' | 'failed';
  estimatedPagesRemaining?: number;
  estimatedTimeRemaining?: number;
}

/**
 * Check crawl status options interface
 */
export interface CheckCrawlStatusOptions {
  includeResults?: boolean;
}

/**
 * Crawl status interface
 */
export interface CrawlStatus extends BaseResponse {
  id: string;
  url: string;
  status: 'queued' | 'in_progress' | 'completed' | 'failed';
  progress: number;
  pagesProcessed: number;
  pagesTotal: number;
  startTime: string;
  endTime?: string;
  results?: Record<string, unknown>[];
}

/**
 * Extract options interface
 */
export interface ExtractOptions {
  prompt?: string;
  systemPrompt?: string;
  schema?: Record<string, unknown>;
  allowExternalLinks?: boolean;
  includeSubdomains?: boolean;
  enableWebSearch?: boolean;
}

/**
 * Extract result interface
 */
export interface ExtractResult extends BaseResponse {
  urls: string[];
  data: Record<string, unknown>;
}

/**
 * Search options interface
 */
export interface SearchOptions {
  limit?: number;
  filter?: string;
  tbs?: string;
  lang?: string;
  country?: string;
  location?: LocationSettings;
  scrapeOptions?: ScrapeOptions;
}

/**
 * Search result interface
 */
export interface SearchResult extends BaseResponse {
  query: string;
  results: Array<{
    url: string;
    title: string;
    description: string;
    content?: Record<string, unknown>;
  }>;
}

/**
 * Crawl4AI specific error class
 */
export class Crawl4AIError extends Error {
  type: ErrorType;
  status?: number;
  details?: string;
  retryable: boolean;

  constructor(
    message: string,
    type: ErrorType = ErrorType.UNKNOWN,
    status?: number,
    details?: string,
    retryable = false
  ) {
    super(message);
    this.name = 'Crawl4AIError';
    this.type = type;
    this.status = status;
    this.details = details;
    this.retryable = retryable;

    // Ensure prototype chain works correctly
    Object.setPrototypeOf(this, Crawl4AIError.prototype);
  }
}