/**
 * Handler implementation for the crawl4ai_check_crawl_status tool
 * 
 * This handler processes requests to check the status of an asynchronous
 * crawl job previously initiated with the crawl4ai_crawl tool.
 */

import { z } from 'zod';
import { crawl4aiCheckCrawlStatusSchema } from '../tool-schemas/crawl4ai-check-crawl-status-schema';
import adapter from '../adapters';

/**
 * Format crawl status for MCP response
 * 
 * @param content Crawl status information from the adapter
 * @returns Formatted content for MCP response
 */
function formatCrawlStatusContent(content: any): Array<{ type: string, text: string }> {
  // If content is already in the correct format, return it
  if (Array.isArray(content) && content.every(item => 'type' in item && 'text' in item)) {
    return content;
  }

  // Handle structured content with crawl status details
  if (content && typeof content === 'object') {
    let textContent = '';
    
    // Add job ID if available
    if (content.id) {
      textContent += `Crawl Job ID: ${content.id}\n\n`;
    }
    
    // Add status information
    if (content.status) {
      textContent += `Status: ${content.status}\n`;
      
      // Add progress if available
      if (content.progress !== undefined) {
        textContent += `Progress: ${(content.progress * 100).toFixed(1)}%\n`;
      }
      
      // Add completion time if available
      if (content.completedAt) {
        textContent += `Completed: ${new Date(content.completedAt).toLocaleString()}\n`;
      } else if (content.startedAt) {
        textContent += `Started: ${new Date(content.startedAt).toLocaleString()}\n`;
      }
      
      // Add estimated completion time if available
      if (content.estimatedCompletionTime) {
        textContent += `Estimated completion: ${new Date(content.estimatedCompletionTime).toLocaleString()}\n`;
      }
    }
    
    // Add statistics if available
    if (content.stats) {
      textContent += '\nStatistics:\n';
      const stats = content.stats;
      
      if (stats.pagesProcessed !== undefined) textContent += `- Pages processed: ${stats.pagesProcessed}\n`;
      if (stats.pagesQueued !== undefined) textContent += `- Pages queued: ${stats.pagesQueued}\n`;
      if (stats.pagesSucceeded !== undefined) textContent += `- Pages succeeded: ${stats.pagesSucceeded}\n`;
      if (stats.pagesFailed !== undefined) textContent += `- Pages failed: ${stats.pagesFailed}\n`;
      if (stats.bytesProcessed !== undefined) textContent += `- Data processed: ${formatBytes(stats.bytesProcessed)}\n`;
    }
    
    // Add URLs if requested and available
    if (content.urls && Array.isArray(content.urls) && content.urls.length > 0) {
      textContent += '\nProcessed URLs:\n';
      
      // Limit the number of URLs shown to avoid overwhelming the response
      const maxUrlsToShow = 10;
      const urlsToShow = content.urls.slice(0, maxUrlsToShow);
      
      textContent += urlsToShow.map((url: any, index: number) => {
        if (typeof url === 'string') {
          return `${index + 1}. ${url}`;
        } else if (typeof url === 'object' && url.url) {
          return `${index + 1}. ${url.url} (${url.status || 'unknown status'})`;
        }
        return `${index + 1}. Unknown URL format`;
      }).join('\n');
      
      // Show message if more URLs are available
      if (content.urls.length > maxUrlsToShow) {
        textContent += `\n\n...and ${content.urls.length - maxUrlsToShow} more URLs (total: ${content.urls.length})`;
      }
    }
    
    // Add errors if available and requested
    if (content.errors && Array.isArray(content.errors) && content.errors.length > 0) {
      textContent += '\n\nErrors:\n';
      
      // Limit the number of errors shown
      const maxErrorsToShow = 5;
      const errorsToShow = content.errors.slice(0, maxErrorsToShow);
      
      textContent += errorsToShow.map((error: any, index: number) => {
        if (typeof error === 'string') {
          return `${index + 1}. ${error}`;
        } else if (typeof error === 'object') {
          return `${index + 1}. ${error.message || 'Unknown error'} ${error.url ? `(at ${error.url})` : ''}`;
        }
        return `${index + 1}. Unknown error format`;
      }).join('\n');
      
      // Show message if more errors are available
      if (content.errors.length > maxErrorsToShow) {
        textContent += `\n\n...and ${content.errors.length - maxErrorsToShow} more errors (total: ${content.errors.length})`;
      }
    }
    
    // Add results URL if available
    if (content.resultsUrl) {
      textContent += `\n\nResults available at: ${content.resultsUrl}`;
    }
    
    return [{ type: 'text', text: textContent }];
  }

  // Default fallback
  return [{ type: 'text', text: JSON.stringify(content, null, 2) }];
}

/**
 * Helper function to format bytes into human-readable format
 * 
 * @param bytes Number of bytes
 * @returns Human-readable string
 */
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Handler function for the crawl4ai_check_crawl_status tool
 * 
 * @param params Parameters from the MCP client request
 * @returns Current status of the crawl job
 */
export async function handleCrawl4aiCheckCrawlStatus(params: z.infer<typeof crawl4aiCheckCrawlStatusSchema>) {
  try {
    console.log('Checking crawl status for job:', params.id);
    
    // Extract id from params and use the rest as options
    const { id, ...options } = params;
    
    // Call the adapter to check the crawl status
    const response = await adapter.checkCrawlStatus(id as string, options);
    
    // Format the response for MCP protocol
    return {
      content: formatCrawlStatusContent(response)
    };
  } catch (error) {
    console.error('Error in crawl4ai_check_crawl_status:', error);
    
    return {
      content: [
        {
          type: 'text',
          text: `Error checking crawl status for job ${params.id}: ${error instanceof Error ? error.message : String(error)}`
        }
      ]
    };
  }
}