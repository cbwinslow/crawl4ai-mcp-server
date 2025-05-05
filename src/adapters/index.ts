/**
 * API Adapter
 *
 * Configures and exports the Crawl4AI adapter instance.
 */

import Crawl4AIAdapter from './crawl4ai-adapter';

// Create and export singleton adapter instance
const adapter = new Crawl4AIAdapter();
export default adapter;
