/**
 * Schema definition for the crawl4ai_scrape tool
 * 
 * This tool allows scraping a single webpage with advanced options for content extraction.
 * It supports various formats including markdown, HTML, and screenshots, and can execute 
 * custom actions like clicking or scrolling before scraping.
 */

import { z } from 'zod';

// Define the action types that can be performed before scraping
const ActionTypes = z.enum([
  'wait', 
  'click', 
  'screenshot', 
  'write', 
  'press', 
  'scroll', 
  'scrape', 
  'executeJavascript'
]);

// Action schema for pre-scraping actions
const ActionSchema = z.object({
  type: ActionTypes,
  selector: z.string().optional().describe('CSS selector for the target element'),
  milliseconds: z.number().optional().describe('Time to wait in milliseconds (for wait action)'),
  text: z.string().optional().describe('Text to write (for write action)'),
  key: z.string().optional().describe('Key to press (for press action)'),
  direction: z.enum(['up', 'down']).optional().describe('Scroll direction'),
  fullPage: z.boolean().optional().describe('Take full page screenshot'),
  script: z.string().optional().describe('JavaScript code to execute'),
}).describe('Action to perform before scraping');

// Content format options for the response
const FormatEnum = z.enum([
  'markdown', 
  'html', 
  'rawHtml', 
  'screenshot', 
  'links', 
  'screenshot@fullPage', 
  'extract'
]);

// Extract configuration for structured data extraction
const ExtractConfigSchema = z.object({
  prompt: z.string().optional().describe('User prompt for LLM extraction'),
  systemPrompt: z.string().optional().describe('System prompt for LLM extraction'),
  schema: z.record(z.any()).optional().describe('Schema for structured data extraction'),
}).describe('Configuration for structured data extraction');

// Geolocation settings
const LocationSchema = z.object({
  country: z.string().optional().describe('Country code for geolocation'),
  languages: z.array(z.string()).optional().describe('Language codes for content'),
}).describe('Location settings for scraping');

// Main schema for crawl4ai_scrape tool
export const crawl4aiScrapeSchema = {
  url: z.string().describe('The URL to scrape'),
  formats: z.array(FormatEnum).default(['markdown']).describe('Content formats to extract (default: [\'markdown\'])'),
  actions: z.array(ActionSchema).optional().describe('List of actions to perform before scraping'),
  waitFor: z.number().optional().describe('Time in milliseconds to wait for dynamic content to load'),
  onlyMainContent: z.boolean().optional().describe('Extract only the main content, filtering out navigation, footers, etc.'),
  includeTags: z.array(z.string()).optional().describe('HTML tags to specifically include in extraction'),
  excludeTags: z.array(z.string()).optional().describe('HTML tags to exclude from extraction'),
  mobile: z.boolean().optional().describe('Use mobile viewport'),
  timeout: z.number().optional().describe('Maximum time in milliseconds to wait for the page to load'),
  extract: ExtractConfigSchema.optional().describe('Configuration for structured data extraction'),
  location: LocationSchema.optional().describe('Location settings for scraping'),
  removeBase64Images: z.boolean().optional().describe('Remove base64 encoded images from output'),
  skipTlsVerification: z.boolean().optional().describe('Skip TLS certificate verification'),
};

// Export the handler function type (implementation will be in separate file)
export type Crawl4aiScrapeHandler = (params: z.infer<typeof crawl4aiScrapeSchema>) => Promise<{ content: Array<{ type: string, text: string }> }>;

// Export the schema
export default crawl4aiScrapeSchema;