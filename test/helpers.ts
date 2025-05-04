/**
 * Test Helpers
 *
 * Utility functions and mocks to assist with testing.
 */

import { jest } from '@jest/globals';
import axios from 'axios';
import { mock } from 'jest-mock-extended';
import { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

/**
 * Creates a mocked Axios response
 */
export function mockAxiosResponse<T>(data: T, status = 200): any {
  return {
    data,
    status,
    statusText: status === 200 ? 'OK' : 'Error',
    headers: {},
    config: {}
  };
}

/**
 * Creates a mocked Axios error
 */
export function mockAxiosError<T>(
  message: string,
  code?: string,
  response?: Partial<AxiosResponse<T>>
): Error {
  const error = new Error(message) as any;
  error.isAxiosError = true;
  if (code) error.code = code;
  if (response) error.response = { 
    status: response.status || 400,
    data: response.data || { error: message },
    statusText: response.statusText || 'Error',
    headers: response.headers || {},
    config: response.config || {}
  };
  error.toJSON = () => ({ message, name: 'AxiosError' });
  return error;
}

/**
 * Mock Axios instance factory
 */
export function createMockAxiosInstance() {
  const instance = mock<AxiosInstance>();
  
  // Default implementation for get and post
  instance.get.mockImplementation(async (url): Promise<any> => {
    return mockAxiosResponse({ success: true, url });
  });
  
  instance.post.mockImplementation(async (url, data): Promise<any> => {
    return mockAxiosResponse({ success: true, url, data });
  });
  
  return instance;
}

// Mock the entire Axios module
export function mockAxios(): void {
  jest.mock('axios', () => ({
    create: jest.fn(() => createMockAxiosInstance()),
    defaults: {
      headers: {
        common: {}
      }
    }
  }));
}

/**
 * Creates a deep copy of an object
 */
export function deepCopy<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Creates a spy on console.error
 */
export function spyOnConsoleError() {
  // Reset the mock to prevent interference between tests
  const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
  return spy;
}

/**
 * Provides type checking for expects
 */
export function expectType<T>(value: T): T {
  return value;
}