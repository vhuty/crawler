import { join } from 'node:path';
import { writeFile, mkdir } from 'node:fs/promises';

export class CrawlerStorage {
  constructor() {
    this.root = process.cwd();
  }

  async createIndex(url) {
    const dirname = `${url.host}-${Date.now()}`;
    this.dirPath = await mkdir(join(this.root, 'index', dirname));
    console.log('Created index at:', this.dirPath);
  }

  async saveResult(result) {
    if (!this.dirPath) {
      throw new Error('Index is not created');
    }

    return writeFile(
      join(this.dirPath, 'result.json'),
      JSON.stringify(result)
    );
  }
}
