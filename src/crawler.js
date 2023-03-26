import { EventEmitter } from 'node:events';

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export class Crawler extends EventEmitter {
  /**
   * @param {import('./parser').Parser} parser
   * @param {import('./downloader').Downloader} downloader
   */
  constructor(parser, downloader, maxNestingLevel = 4) {
    super();

    this.parser = parser;
    this.downloader = downloader;

    this.nestingLevel = 1;
    this.processedUrls = [];
  }

  /**
   * @param {URL[]} seedUrls
   */
  async crawl(seedUrls) {
    if (!seedUrls.length) return;

    const childUrls = [];

    for (const seedUrl of seedUrls) {
      if (!this.processedUrls.includes(seedUrl.href)) {
        const seedPage = await this.downloader.fetchPage(seedUrl);

        this.processedUrls.push(seedUrl.href);
        this.emit('message', `Processing URL: ${seedUrl.href}, level: ${this.nestingLevel}`);
        console.info(`Processing URL: ${seedUrl.href}, level: ${this.nestingLevel}`);

        childUrls.push(...this.parser.parseLinks(seedPage, seedUrl));
      } else {
        console.info(`Already processed: ${seedUrl.href}`);
      }
    }

    console.log(`Processed at the level: ${this.nestingLevel} - ${seedUrls.length}`);
    this.nestingLevel += 1;

    return this.crawl(childUrls);
  }
}
