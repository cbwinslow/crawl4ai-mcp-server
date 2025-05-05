/**
 * Response Formatting Utilities
 *
 * Converts various response types to MCP-compatible format.
 * These utilities handle different data structures from Crawl4AI API responses
 * and transform them into the standardized MCP content format.
 */

import { MCPContent } from '../types';
import {
  FormattableContent,
  // Only import type interfaces that are directly used as type annotations
  SearchResultItem,
  CrawlError,
  LinkItem
} from '../types/format-utils';

/**
 * Content types used in MCP responses
 */
export enum ContentType {
  TEXT = 'text',
  HTML = 'html',
  JSON = 'json',
  IMAGE = 'image',
  AUDIO = 'audio',
  VIDEO = 'video',
}

/**
 * Formats any content into MCP-compatible format
 *
 * @param content - The content to format
 * @returns Array of MCP content objects
 */
export function formatContent(content: FormattableContent): MCPContent[] {
  // Already in MCP format
  if (Array.isArray(content) && content.every(item => 'type' in item && 'text' in item)) {
    return content;
  }

  // Handle null, undefined, or empty content
  if (content === null || content === undefined) {
    return [{ type: ContentType.TEXT, text: 'No content returned.' }];
  }

  // Handle primitives
  if (typeof content === 'string') {
    return [{ type: ContentType.TEXT, text: content }];
  }

  if (typeof content !== 'object') {
    return [{ type: ContentType.TEXT, text: String(content) }];
  }

  // Handle specific content types with specialized handlers
  const handlers = [
    handleResearchResults, // For deep research responses
    handleUrlMapping, // For URL discovery responses
    handleSearchResults, // For search responses
    handleCrawlStatus, // For crawl status responses
    handleScrapeResults, // For scrape responses with multiple formats
    handleFormatProperties, // For content with explicit format properties
  ];

  // Try each handler until one returns a non-empty result
  for (const handler of handlers) {
    const result = handler(content);
    if (result.length > 0) {
      return result;
    }
  }

  // Default to JSON for complex objects
  return [{ type: ContentType.JSON, text: JSON.stringify(content, null, 2) }];
}

/**
 * Handles research results with summary and sources
 *
 * @param content - Content to format
 * @returns Formatted MCP content
 */
function handleResearchResults(content: Record<string, unknown>): MCPContent[] {
  if (!content.results) {
    return [];
  }

  // Handle string results
  if (typeof content.results === 'string') {
    return [{ type: ContentType.TEXT, text: content.results }];
  }

  // Handle research results with summary and sources
  if (content.results.summary) {
    const parts: MCPContent[] = [{ type: ContentType.TEXT, text: content.results.summary }];

    // Add sources if available
    if (content.results.sources && Array.isArray(content.results.sources)) {
      // Format sources as a bulleted list
      const sourcesList = content.results.sources
        .map((s: ResearchSource | string) => {
          if (typeof s === 'string') return `- ${s}`;
          const url = s.url || '';
          const title = s.title ? `: ${s.title}` : '';
          return `- ${url}${title}`;
        })
        .join('\n');

      if (sourcesList) {
        parts.push({ type: ContentType.TEXT, text: `\nSources:\n${sourcesList}` });
      }
    }

    return parts;
  }

  return [];
}

/**
 * Handles URL mapping results
 *
 * @param content - Content to format
 * @returns Formatted MCP content
 */
function handleUrlMapping(content: Record<string, unknown>): MCPContent[] {
  if (!content.urls || !Array.isArray(content.urls)) {
    return [];
  }

  // Format URLs as a bulleted list
  const urlCount = content.urls.length;
  const urlList = content.urls.map((url: string) => `- ${url}`).join('\n');

  return [
    {
      type: ContentType.TEXT,
      text: `${urlCount} URL${urlCount === 1 ? '' : 's'} discovered:\n${urlList}`,
    },
  ];
}

/**
 * Handles search results
 *
 * @param content - Content to format
 * @returns Formatted MCP content
 */
function handleSearchResults(content: Record<string, unknown>): MCPContent[] {
  if (!content.results || !Array.isArray(content.results)) {
    return [];
  }

  // Format for search results
  const resultCount = content.results.length;
  const { query: searchQuery = '' } = content;
  const header = `${resultCount} result${resultCount === 1 ? '' : 's'} for "${searchQuery}":\n\n`;

  // Format each result
  const formattedResults = content.results
    .map((result: SearchResultItem, index: number) => {
      const { url = '', title: resultTitle, snippet: resultSnippet, description } = result;
      const title = resultTitle || url || `Result ${index + 1}`;
      const snippet = resultSnippet || description || '';

      return `${index + 1}. **${title}**\n   ${url}\n   ${snippet}\n`;
    })
    .join('\n');

  return [{ type: ContentType.TEXT, text: header + formattedResults }];
}

/**
 * Handles crawl status responses
 *
 * @param content - Content to format
 * @returns Formatted MCP content
 */
function handleCrawlStatus(content: Record<string, unknown>): MCPContent[] {
  // Check if it looks like a crawl status response
  if (!content.id || content.status === undefined) {
    return [];
  }

  // Format status
  const { id, status } = content;
  const progress = content.progress !== undefined ? `${content.progress}%` : 'unknown';

  let statusText = `Crawl Job: ${id}\nStatus: ${status}\nProgress: ${progress}`;

  // Add counts if available
  if (content.urls_count !== undefined) {
    statusText += `\nURLs Crawled: ${content.urls_count}`;
  }

  if (content.errors_count !== undefined) {
    statusText += `\nErrors: ${content.errors_count}`;
  }

  const parts: MCPContent[] = [{ type: ContentType.TEXT, text: statusText }];

  // Add URLs if available
  if (content.urls && Array.isArray(content.urls) && content.urls.length > 0) {
    const urlList = content.urls.map((url: string) => `- ${url}`).join('\n');

    parts.push({ type: ContentType.TEXT, text: `\nCrawled URLs:\n${urlList}` });
  }

  // Add errors if available
  if (content.errors && Array.isArray(content.errors) && content.errors.length > 0) {
    const errorList = content.errors
      .map((error: CrawlError) => {
        const url = error.url || '';
        const message = error.message || error.error || 'Unknown error';
        return `- ${url}: ${message}`;
      })
      .join('\n');

    parts.push({ type: ContentType.TEXT, text: `\nErrors:\n${errorList}` });
  }

  return parts;
}

/**
 * Handles scrape results with potentially multiple formats
 *
 * @param content - Content to format
 * @returns Formatted MCP content
 */
function handleScrapeResults(content: Record<string, unknown>): MCPContent[] {
  // Handle scrape results with formats
  if (content.formats && typeof content.formats === 'object') {
    const parts: MCPContent[] = [];

    // Add markdown content if available
    if (content.formats.markdown) {
      parts.push({ type: ContentType.TEXT, text: content.formats.markdown });
    }

    // Add HTML content if available and no markdown
    else if (content.formats.html) {
      parts.push({ type: ContentType.HTML, text: content.formats.html });
    }

    // Add raw HTML if no other formats
    else if (content.formats.rawHtml) {
      parts.push({ type: ContentType.HTML, text: content.formats.rawHtml });
    }

    // Add screenshot if available
    if (content.formats.screenshot) {
      parts.push({
        type: ContentType.IMAGE,
        text: content.formats.screenshot,
      });
    }

    // Add links if available
    if (
      content.formats.links &&
      Array.isArray(content.formats.links) &&
      content.formats.links.length > 0
    ) {
      const linkCount = content.formats.links.length;
      const linkList = content.formats.links
        .map((link: LinkItem | string) => {
          const url = typeof link === 'string' ? link : link.url || '';
          const text = link.text ? `: ${link.text}` : '';
          return `- ${url}${text}`;
        })
        .join('\n');

      parts.push({
        type: ContentType.TEXT,
        text: `\n${linkCount} link${linkCount === 1 ? '' : 's'} found:\n${linkList}`,
      });
    }

    if (parts.length > 0) {
      return parts;
    }
  }

  return [];
}

/**
 * Handles content with specific format properties
 *
 * @param content - Content to format
 * @returns Formatted MCP content
 */
function handleFormatProperties(content: Record<string, unknown>): MCPContent[] {
  // Handle content with explicit format properties
  if (content.markdown) {
    return [{ type: ContentType.TEXT, text: content.markdown }];
  }

  if (content.html) {
    return [{ type: ContentType.HTML, text: content.html }];
  }

  if (content.text) {
    return [{ type: ContentType.TEXT, text: content.text }];
  }

  // Handle extracted structured data
  if (content.extracted && typeof content.extracted === 'object') {
    return [
      {
        type: ContentType.JSON,
        text: JSON.stringify(content.extracted, null, 2),
      },
    ];
  }

  return [];
}

/**
 * Creates a standardized MCP content item with specified type and text
 *
 * @param type - The content type (text, html, json, etc.)
 * @param text - The content text
 * @returns An MCPContent object
 */
export const createMCPContent = (type: ContentType, text: string): MCPContent => 
  ({ type, text });

/**
 * Creates a standardized text content item
 *
 * @param text - The text content
 * @returns An MCPContent object with type 'text'
 */
export const createTextContent = (text: string): MCPContent => 
  createMCPContent(ContentType.TEXT, text);

/**
 * Creates a standardized HTML content item
 *
 * @param html - The HTML content
 * @returns An MCPContent object with type 'html'
 */
export const createHTMLContent = (html: string): MCPContent => 
  createMCPContent(ContentType.HTML, html);

/**
 * Creates a standardized JSON content item
 *
 * @param data - The data to stringify as JSON
 * @returns An MCPContent object with type 'json'
 */
export const createJSONContent = (data: unknown): MCPContent => 
  createMCPContent(ContentType.JSON, JSON.stringify(data, null, 2));

/**
 * Creates a standardized MCP response with content
 *
 * @param content - The content items (or single item)
 * @returns An MCPResponse object
 */
export const createMCPResponse = (content: MCPContent | MCPContent[]): MCPResponse => 
  ({ content: Array.isArray(content) ? content : [content] });

export default {
  formatContent,
  ContentType,
  createMCPContent,
  createTextContent,
  createHTMLContent,
  createJSONContent,
  createMCPResponse,
};
