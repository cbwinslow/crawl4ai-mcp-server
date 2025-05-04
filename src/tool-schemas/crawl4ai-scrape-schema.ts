/**
 * Schema for the crawl4ai_scrape tool
 * 
 * Defines parameters for scraping a single webpage with various options.
 */

import { z } from 'zod';
import { urlParam, timeoutParam, LocationSchema, ExtractConfigSchema } from './common-schemas';

/**
 * Action types that can be performed before scraping
 */
const ActionTypes = z.enum([
  'wait',        // Wait for a specified time
  'click',       // Click on an element
  'screenshot',  // Take a screenshot
  'write',       // Type text into an input
  'press',       // Press a keyboard key
  'scroll',      // Scroll the page
  'scrape',      // Perform an intermediate scrape
  'executeJavascript' // Run custom JavaScript
]);

/**
 * Schema for pre-scraping actions
 */
const ActionSchema = z.object({
  type: ActionTypes,
  selector: z.string().optional()
    .describe('CSS selector for the target element'),
  milliseconds: z.number().optional()
    .describe('Time to wait in milliseconds'),
  text: z.string().optional()
    .describe('Text to write'),
  key: z.string().optional()
    .describe('Key to press'),
  direction: z.enum(['up', 'down']).optional()
    .describe('Scroll direction'),
  fullPage: z.boolean().optional()
    .describe('Take full page screenshot'),
  script: z.string().optional()
    .describe('JavaScript code to execute'),
});

/**
 * Content format options
 */
const FormatEnum = z.enum([
  'markdown',
  'html',
  'rawHtml',
  'screenshot',
  'links',
  'screenshot@fullPage',
  'extract'
]);

/**
 * Schema for the crawl4ai_scrape tool
 */
export const crawl4aiScrapeSchema = {
  url: urlParam,
  formats: z.array(FormatEnum).default(['markdown'])
    .describe('Content formats to extract'),
  actions: z.array(ActionSchema).optional()
    .describe('Actions to perform before scraping'),
  waitFor: z.number().optional()
    .describe('Time to wait for dynamic content'),
  onlyMainContent: z.boolean().optional()
    .describe('Extract only the main content'),
  includeTags: z.array(z.string()).optional()
    .describe('HTML tags to include'),
  excludeTags: z.array(z.string()).optional()
    .describe('HTML tags to exclude'),
  mobile: z.boolean().optional()
    .describe('Use mobile viewport'),
  timeout: timeoutParam,
  extract: ExtractConfigSchema.optional(),
  location: LocationSchema.optional(),
  removeBase64Images: z.boolean().optional()
    .describe('Remove base64 encoded images'),
  skipTlsVerification: z.boolean().optional()
    .describe('Skip TLS certificate verification'),
};

export default crawl4aiScrapeSchema;