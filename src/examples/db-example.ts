/** Example script demonstrating DatabaseClient usage */
import { DatabaseClient } from '../utils/database-client';

async function run() {
  const client = new DatabaseClient({
    apiBaseUrl: 'https://example-database.com/api',
    apiKey: 'YOUR_API_KEY',
  });

  await client.saveData({ message: 'hello world' });
  await client.saveFile('file-contents', 'example.txt');
}

run().catch(err => console.error('Database example failed', err));
