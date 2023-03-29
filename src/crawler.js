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
   * @returns {Promise<string>}
   */
  async crawl(seedUrls, options = {}) {
    if (!seedUrls.length) {
      console.info('All available URLs processed, terminating...');

      return 'All available URLs processed, terminating...';
    };

    const { maxNestingLevel = 3, maxLinksPerPage = 20 } = options;

    if (this.nestingLevel > maxNestingLevel) {
      console.info(`Max nesting level (${maxNestingLevel}) reached, terminating...`);

      return `Max nesting level (${maxNestingLevel}) reached, terminating...`;
    }

    const childUrls = [];
    let levelProcessed = 0;
    
    for await (const { content, url } of this.downloader.batchFetchPages(seedUrls)) {
      this.processedUrls.push(url.href);
      levelProcessed += 1;
      
      const links = this.parser.parseLinks(content, url).slice(0, maxLinksPerPage - 1);
      childUrls.push(...links.filter((link) => !this.processedUrls.includes(link.href)));

      this.emit('progress', {
        levelProcessed,
        levelTotal: seedUrls.length,
        currentLevel: this.nestingLevel,
        totalProcessed: this.processedUrls.length,
        currentUrl: url.href,
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
