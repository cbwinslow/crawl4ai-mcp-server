/**
 * Format Utils Tests
 *
 * Unit tests for the response formatting utility functions.
 */

import { formatContent } from '../../../src/utils/format-utils';
import { MCPContent } from '../../../src/types';

describe('Format Utils', () => {
  describe('formatContent', () => {
    it('should pass through content already in MCP format', () => {
      const mcpContent: MCPContent[] = [
        { type: 'text', text: 'Already formatted' }
      ];
      
      const result = formatContent(mcpContent);
      
      expect(result).toBe(mcpContent);
    });
    
    it('should format string content', () => {
      const result = formatContent('Simple string');
      
      expect(result).toEqual([
        { type: 'text', text: 'Simple string' }
      ]);
    });
    
    it('should handle primitive types', () => {
      expect(formatContent(123)).toEqual([
        { type: 'text', text: '123' }
      ]);
      
      expect(formatContent(true)).toEqual([
        { type: 'text', text: 'true' }
      ]);
      
      expect(formatContent(null)).toEqual([
        { type: 'text', text: 'null' }
      ]);
    });
    
    it('should handle research results with summary and sources', () => {
      const content = {
        results: {
          summary: 'Research summary',
          sources: [
            { url: 'https://example.com/1' },
            { url: 'https://example.com/2' }
          ]
        }
      };
      
      const result = formatContent(content);
      
      expect(result).toEqual([
        { type: 'text', text: 'Research summary' },
        { type: 'text', text: '\nSources:\n- https://example.com/1\n- https://example.com/2' }
      ]);
    });
    
    it('should handle research results with simple string sources', () => {
      const content = {
        results: {
          summary: 'Research summary',
          sources: [
            'https://example.com/1',
            'https://example.com/2'
          ]
        }
      };
      
      const result = formatContent(content);
      
      expect(result).toEqual([
        { type: 'text', text: 'Research summary' },
        { type: 'text', text: '\nSources:\n- https://example.com/1\n- https://example.com/2' }
      ]);
    });
    
    it('should handle research results without sources', () => {
      const content = {
        results: {
          summary: 'Research summary'
        }
      };
      
      const result = formatContent(content);
      
      expect(result).toEqual([
        { type: 'text', text: 'Research summary' }
      ]);
    });
    
    it('should handle string research results', () => {
      const content = {
        results: 'Simple research result'
      };
      
      const result = formatContent(content);
      
      expect(result).toEqual([
        { type: 'text', text: 'Simple research result' }
      ]);
    });
    
    it('should handle URL mapping results', () => {
      const content = {
        urls: [
          'https://example.com/1',
          'https://example.com/2',
          'https://example.com/3'
        ]
      };
      
      const result = formatContent(content);
      
      expect(result).toEqual([
        { 
          type: 'text', 
          text: 'URLs discovered:\n- https://example.com/1\n- https://example.com/2\n- https://example.com/3'
        }
      ]);
    });
    
    it('should handle content with markdown property', () => {
      const content = {
        markdown: '# Heading\n\nContent with **bold** text'
      };
      
      const result = formatContent(content);
      
      expect(result).toEqual([
        { type: 'text', text: '# Heading\n\nContent with **bold** text' }
      ]);
    });
    
    it('should handle content with html property', () => {
      const content = {
        html: '<h1>Heading</h1><p>Content with <strong>bold</strong> text</p>'
      };
      
      const result = formatContent(content);
      
      expect(result).toEqual([
        { type: 'html', text: '<h1>Heading</h1><p>Content with <strong>bold</strong> text</p>' }
      ]);
    });
    
    it('should handle content with text property', () => {
      const content = {
        text: 'Simple text content'
      };
      
      const result = formatContent(content);
      
      expect(result).toEqual([
        { type: 'text', text: 'Simple text content' }
      ]);
    });
    
    it('should default to JSON for complex objects', () => {
      const content = {
        complex: true,
        nested: {
          value: 42
        }
      };
      
      const result = formatContent(content);
      
      expect(result).toEqual([
        { type: 'json', text: JSON.stringify(content, null, 2) }
      ]);
    });
  });
});