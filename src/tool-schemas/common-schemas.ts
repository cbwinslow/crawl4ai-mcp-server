/**
 * Common Schema Components
 * 
 * Reusable Zod schema components shared across multiple tool schemas.
 */

import { z } from 'zod';

/**
 * Common URL parameter used in multiple tools
 */
export const urlParam = z.string()
  .describe('URL to process. Must be a valid URL including protocol (e.g., https://example.com)');

/**
 * Common timeout parameter used in multiple tools
 */
export const timeoutParam = z.number().optional()
  .describe('Maximum time in milliseconds to wait for the operation to complete');

/**
 * Location settings schema used in multiple tools
 */
export const LocationSchema = z.object({
  country: z.string().optional()
    .describe('Country code for geolocation (e.g., "US", "GB", "DE")'),
  
  languages: z.array(z.string()).optional()
    .describe('Language codes for content (e.g., ["en", "fr"])'),
}).describe('Location settings for controlling geolocation and language preferences');

/**
 * Extract configuration schema used in multiple tools
 */
export const ExtractConfigSchema = z.object({
  prompt: z.string().optional()
    .describe('User prompt for LLM extraction'),
  
  systemPrompt: z.string().optional()
    .describe('System prompt for LLM extraction'),
  
  schema: z.record(z.any()).optional()
    .describe('JSON schema for structured data extraction'),
}).describe('Configuration for structured data extraction using LLM');

export default {
  urlParam,
  timeoutParam,
  LocationSchema,
  ExtractConfigSchema
};