/**
 * Response Formatting Utilities
 * 
 * Converts various response types to MCP-compatible format.
 */

import { MCPContent } from '../types';

/**
 * Formats any content into MCP-compatible format
 */
export function formatContent(content: any): MCPContent[] {
  // Already in MCP format
  if (Array.isArray(content) && content.every(item => 'type' in item && 'text' in item)) {
    return content;
  }

  // Handle primitives
  if (typeof content === 'string') {
    return [{ type: 'text', text: content }];
  }

  if (!content || typeof content !== 'object') {
    return [{ type: 'text', text: String(content) }];
  }
  
  // Handle results structure with different formats
  const handlers = [
    handleResearchResults,
    handleUrlMapping,
    handleFormatProperties,
  ];
  
  // Try each handler until one returns a non-empty result
  for (const handler of handlers) {
    const result = handler(content);
    if (result.length > 0) {
      return result;
    }
  }
  
  // Default to JSON for complex objects
  return [{ type: 'json', text: JSON.stringify(content, null, 2) }];
}

// Handles research results with summary and sources
function handleResearchResults(content: any): MCPContent[] {
  if (!content.results) return [];
  
  // Handle string results
  if (typeof content.results === 'string') {
    return [{ type: 'text', text: content.results }];
  }
  
  // Handle research results with summary and sources
  if (content.results.summary) {
    const parts: MCPContent[] = [{ type: 'text', text: content.results.summary }];
    
    // Add sources if available
    if (content.results.sources && Array.isArray(content.results.sources)) {
      const sourcesList = content.results.sources
        .map((s: any) => `- ${s.url || s}`)
        .join('\n');
        
      if (sourcesList) {
        parts.push({ type: 'text', text: `\nSources:\n${sourcesList}` });
      }
    }
    
    return parts;
  }
  
  return [];
}

// Handles URL mapping results
function handleUrlMapping(content: any): MCPContent[] {
  if (!content.urls || !Array.isArray(content.urls)) return [];
  
  return [{ 
    type: 'text', 
    text: `URLs discovered:\n${content.urls.map((url: string) => `- ${url}`).join('\n')}`
  }];
}

// Handles content with specific format properties
function handleFormatProperties(content: any): MCPContent[] {
  if (content.markdown) {
    return [{ type: 'text', text: content.markdown }];
  }

  if (content.html) {
    return [{ type: 'html', text: content.html }];
  }
  
  if (content.text) {
    return [{ type: 'text', text: content.text }];
  }
  
  return [];
}

export default {
  formatContent
};