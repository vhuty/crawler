import { join } from 'node:path';
import { writeFile, mkdir } from 'node:fs/promises';

export class CrawlerStorage {
  constructor() {
    this.root = process.cwd();
  }

  async createIndex(seedUrl) {
    const dirname = `${seedUrl.host}-${Date.now()}`;
    this.dirPath = join(this.root, 'index', dirname);

    await mkdir(this.dirPath);
    console.log('Created index at:', this.dirPath);
  }

  async saveResult(seedUrl, result) {
    if (!this.dirPath) {
      throw new Error('Index is not created');
    }

    return writeFile(
      join(this.dirPath, 'result.json'),
      JSON.stringify({ seedUrl, ...result })
    );
  }
}
