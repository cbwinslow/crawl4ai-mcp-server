/**
 * Jest Global Setup
 *
 * This file contains global setup configuration for Jest tests.
 */

// Mock console methods to reduce noise in test output
// Comment these out when debugging tests
global.console.log = jest.fn();
global.console.info = jest.fn();
global.console.warn = jest.fn();
// Keep error logging for test debugging
// global.console.error = jest.fn();

// Add environment variables needed for tests
process.env.CRAWL4AI_API_KEY = 'test-api-key';
process.env.CRAWL4AI_API_URL = 'http://localhost:11235';

// Reset mocks after each test
afterEach(() => {
  jest.resetAllMocks();
});