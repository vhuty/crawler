import { EventEmitter } from 'node:events';

export class Crawler extends EventEmitter {
  /**
   * @param {import('./parser').Parser} parser
   * @param {import('./downloader').Downloader} downloader
   */
  constructor(downloader, parser) {
    super();

    this.parser = parser;
    this.downloader = downloader;

    this.nestingLevel = 1;
    this.processedUrls = [];
  }

  /**
   * @param {URL[]} seedUrls
   */
  async crawl(seedUrls, options = {}) {
    if (!seedUrls.length) {
      console.info('All available URLs processed, terminating...');

      return;
    };

    const { maxNestingLevel = 5, maxLinksPerPage = 50, chunkSize = 5 } = options;

    if (this.nestingLevel > maxNestingLevel) {
      console.info(`Max nesting level (${maxNestingLevel}) reached, terminating...`);

      return;
    }

    const childUrls = [];

    for (let i = 0; i < seedUrls.length; i += chunkSize) {
      const urlsChunk = seedUrls.slice(i, i + chunkSize);
      const urlsPerPages = await Promise.all(urlsChunk.map((url) => this.parser.parsePageLinks(url)));
      const allUrls = urlsPerPages.flatMap((links) => links.slice(0, maxLinksPerPage - 1));
      childUrls.push(...allUrls.filter((link) => !this.processedUrls.includes(link)));

      this.emit('progress', {
        total: seedUrls.length,
        processed: i + urlsChunk.length,
        level: this.nestingLevel,
        metrics: {
          fastest: this.downloader.fastestLoad,
          slowest: this.downloader.slowestLoad,
          avg: this.downloader.avgLoad,
        },
      });
    }

    console.log(`Processed at the level: ${this.nestingLevel} - ${seedUrls.length}`);
    this.nestingLevel += 1;

    return this.crawl(childUrls);
  }
}
