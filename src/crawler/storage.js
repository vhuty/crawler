import { createClient } from 'redis';

const client = createClient();
await client.connect();

export class CrawlerStorage {
  async saveResult(url, result) {
    await client.SET(url.href, JSON.stringify(result));
  }
}
