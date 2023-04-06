import { join } from 'node:path';
import { writeFile, mkdir } from 'node:fs/promises';

export class CrawlerStorage {
  constructor() {
    this.RESULT_FILENAME = 'result.json';
    this.root = process.cwd();
  }

  async createIndex(seedUrl) {
    this.dirPath = join(this.root, 'index', this.getSlugFromUrl(seedUrl));

    await mkdir(this.dirPath);
    console.log('Created index at:', this.dirPath);
  }

  async savePage(seedUrl, content) {
    if (!this.dirPath) {
      throw new Error('Index is not created');
    }

    const filename = `${this.getSlugFromUrl(seedUrl)}.html`;
    const filePath = join(this.dirPath, filename);

    return writeFile(filePath, content, 'utf-8');
  }

  async saveResult(seedUrl, result) {
    if (!this.dirPath) {
      throw new Error('Index is not created');
    }

    return writeFile(
      join(this.dirPath, this.RESULT_FILENAME),
      JSON.stringify({ seedUrl, ...result })
    );
  }

  getSlugFromUrl(seedUrl) {
    return `${seedUrl.host}-${Date.now()}`;
  }
}
