import { Env } from '../index';

interface CrawlParams {
  url: string;
  maxDepth?: number;
  maxPages?: number;
}

interface CrawlResponse {
  id: string;
  status: 'queued' | 'in_progress' | 'completed' | 'failed';
  url: string;
  startedAt: string;
  completedAt?: string;
  pagesProcessed?: number;
  error?: string;
}

interface ListCrawlsParams {
  domain?: string;
  limit?: number;
}

/**
 * Creates a new web crawl job
 */
export async function createCrawl(params: CrawlParams, env: Env): Promise<CrawlResponse> {
  const { url, maxDepth = parseInt(env.MAX_CRAWL_DEPTH), maxPages = parseInt(env.MAX_CRAWL_PAGES) } = params;
  
  // Generate a unique ID for this crawl
  const id = crypto.randomUUID();
  const startedAt = new Date().toISOString();
  
  // Store the crawl job in KV
  const crawlJob: CrawlResponse = {
    id,
    status: 'queued',
    url,
    startedAt,
  };
  
  await env.CRAWL_DATA.put(`crawl:${id}`, JSON.stringify(crawlJob));
  
  // In a real implementation, we would trigger a crawler here
  // For now, we just return the job information
  
  return crawlJob;
}

/**
 * Gets crawl data by ID
 */
export async function getCrawlById(params: { id: string }, env: Env): Promise<CrawlResponse | null> {
  const { id } = params;
  
  const crawlData = await env.CRAWL_DATA.get(`crawl:${id}`);
  if (!crawlData) {
    return null;
  }
  
  return JSON.parse(crawlData);
}

/**
 * Lists all crawls, optionally filtered by domain
 */
export async function listCrawls(params: ListCrawlsParams, env: Env): Promise<CrawlResponse[]> {
  const { domain, limit = 10 } = params;
  
  // For now, we'll return a mock response
  // In a real implementation, we would list keys from KV with a prefix
  
  return [{
    id: 'mock-id',
    status: 'completed',
    url: 'https://example.com',
    startedAt: new Date().toISOString(),
    completedAt: new Date().toISOString(),
    pagesProcessed: 5
  }];
}