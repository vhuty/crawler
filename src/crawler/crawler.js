import { EventEmitter } from 'node:events';

const CRAWL_FINISH_REASON = {
  ALL_AVAIL_PROCESSED: 'ALL_AVAIL_PROCESSED',
  MAX_LEVEL_REACHED: 'MAX_LEVEL_REACHED',
};

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
   * @param {object} [options]
   * @param {number} [options.maxNestingLevel]
   * @param {number} [options.maxLinksPerPage]
   */
  async crawl(seedUrls, options = {}) {
    const { maxNestingLevel = 3, maxLinksPerPage = 20 } = options;

    const childUrls = [];
    let levelProcessed = 0;
    
    for await (const page of this.downloader.batchDownloadPages(seedUrls)) {
      const { content, url } = page;

      this.processedUrls.push(url.href);
      levelProcessed += 1;
      
      const links = this.parser.parseLinks(content, url).slice(0, maxLinksPerPage - 1);
      childUrls.push(...links.filter((link) => !this.processedUrls.includes(link.href)));

      this.emit('progress', {
        currentUrl: url.href,
        levelProcessed,
        levelTotal: seedUrls.length,
        nestingLevel: this.getNestingLevel(),
        totalProcessed: this.getTotalProcessed(),
        metrics: this.downloader.getMetrics(),
      });
    }

    console.log(`Processed at level ${this.nestingLevel}:`, seedUrls.length);

    if (!childUrls.length) {
      console.info('All available URLs processed, terminating...');

      return {
        finishReason: CRAWL_FINISH_REASON.ALL_AVAIL_PROCESSED,
        nestingLevel: this.getNestingLevel(),
        totalProcessed: this.getTotalProcessed(),
        metrics: this.downloader.getMetrics(),
      };
    };

    if (this.nestingLevel >= maxNestingLevel) {
      console.info(`Max nesting level (${maxNestingLevel}) reached, terminating...`);

      return {
        finishReason: CRAWL_FINISH_REASON.MAX_LEVEL_REACHED,
        nestingLevel: this.getNestingLevel(),
        totalProcessed: this.getTotalProcessed(),
        metrics: this.downloader.getMetrics(),
      };
    }

    this.nestingLevel += 1;
    return this.crawl(childUrls, options);
  }

  getTotalProcessed() {
    return this.processedUrls.length;
  }

  getNestingLevel() {
    return this.nestingLevel;
  }
}
