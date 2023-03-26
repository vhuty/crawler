import { EventEmitter } from 'node:events';

export class Crawler extends EventEmitter {
  /**
   * @param {import('./parser').Parser} parser
   * @param {import('./downloader').Downloader} downloader
   */
  constructor(parser, downloader) {
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

    const { maxNestingLevel = 5, maxLinksPerPage = 100 } = options;

    if (this.nestingLevel > maxNestingLevel) {
      console.info(`Max nesting level (${maxNestingLevel}) reached, terminating...`);

      return;
    }

    const childUrls = [];

    for (const seedUrl of seedUrls) {
      if (!this.processedUrls.includes(seedUrl.href)) {
        const seedPage = await this.downloader.fetchPage(seedUrl);

        this.processedUrls.push(seedUrl.href);
        this.emit('message', `Processing URL: ${seedUrl.href}, level: ${this.nestingLevel}`);
        console.info(`Processing URL: ${seedUrl.href}, level: ${this.nestingLevel}`);

        const urls = this.parser.parseUrls(seedPage, seedUrl);
        childUrls.push(...urls.slice(0, maxLinksPerPage - 1));
      } else {
        console.info(`Already processed: ${seedUrl.href}`);
      }
    }

    console.log(`Processed at the level: ${this.nestingLevel} - ${seedUrls.length}`);
    this.nestingLevel += 1;

    return this.crawl(childUrls);
  }
}
