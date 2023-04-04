import { join } from 'node:path';
import { writeFile, mkdtemp } from 'node:fs/promises';

export class CrawlerStorage {
  constructor() {
    this.root = process.cwd();
    this.dirPrefix = `${Date.now()}-`;
  }

  async createIndex() {
    this.dirPath = await mkdtemp(join(this.root, 'index', this.dirPrefix));
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
