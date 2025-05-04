/**
 * Adapters for interacting with the Crawl4AI API
 * 
 * This module provides a unified interface for all Crawl4AI capabilities,
 * handling authentication, request formatting, and response parsing.
 */

import Crawl4AIAdapter from './crawl4ai-adapter';
import { parseEnvInt } from '../index';

/**
 * Create a singleton instance of the Crawl4AI adapter
 */
const adapter = new Crawl4AIAdapter();

/**
 * Transform any error into a standardized format
 * 
 * @param error The original error
 * @param context The operation context for more specific error messages
 * @returns Standardized error message
 */
export function transformError(error: unknown, context = 'API'): string {
  if (error instanceof Error) {
    return `${context} error: ${error.message}`;
  }
  return `Unknown ${context} error: ${String(error)}`;
}

/**
 * Helper to safely parse and validate configuration limits
 * 
 * @param env Environment object
 * @returns Parsed configuration limits with fallback defaults
 */
export function getConfigLimits(env: any) {
  return {
    maxCrawlDepth: parseEnvInt(env?.MAX_CRAWL_DEPTH, 3),
    maxCrawlPages: parseEnvInt(env?.MAX_CRAWL_PAGES, 100),
    maxTimeoutMs: parseEnvInt(env?.MAX_TIMEOUT_MS, 30000)
  };
}

export default adapter;