/**
 * Generic database client for sending data and files to an external database service.
 * Supports any backend (SQL, vector DB, etc.) accessible via HTTP APIs.
 */

export interface DatabaseClientOptions {
  /** Base URL of the database service API */
  apiBaseUrl: string;
  /** Optional API key for authentication */
  apiKey?: string;
}

export class DatabaseClient {
  private readonly apiBaseUrl: string;
  private readonly apiKey?: string;

  constructor(options: DatabaseClientOptions) {
    this.apiBaseUrl = options.apiBaseUrl.replace(/\/$/, '');
    this.apiKey = options.apiKey;
  }

  private buildHeaders(extra?: Record<string, string>): Headers {
    const headers = new Headers(extra);
    if (this.apiKey) {
      headers.set('Authorization', `Bearer ${this.apiKey}`);
    }
    return headers;
  }

  /**
   * Send JSON serializable data to the database service.
   * @param data Data object to persist
   * @param endpoint API path for data persistence (default: `/data`)
   */
  async saveData(data: unknown, endpoint = '/data'): Promise<void> {
    const res = await fetch(`${this.apiBaseUrl}${endpoint}`, {
      method: 'POST',
      headers: this.buildHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Failed to save data: ${res.status} ${text}`);
    }
  }

  /**
   * Send a binary or text file to the database service.
   * @param content File content as ArrayBuffer or string
   * @param filename Name of the file
   * @param endpoint API path for file upload (default: `/files`)
   */
  async saveFile(
    content: ArrayBuffer | string,
    filename: string,
    endpoint = '/files'
  ): Promise<void> {
    const form = new FormData();
    const blob = typeof content === 'string' ? new Blob([content]) : new Blob([content]);
    form.append('file', blob, filename);

    const res = await fetch(`${this.apiBaseUrl}${endpoint}`, {
      method: 'POST',
      headers: this.buildHeaders(),
      body: form,
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Failed to save file: ${res.status} ${text}`);
    }
  }
}

export default DatabaseClient;
