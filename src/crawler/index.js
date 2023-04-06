import { parentPort, workerData } from 'node:worker_threads';

import { Crawler } from '../crawler/crawler.js';
import { Downloader } from '../crawler/downloader.js';
import { Parser } from '../crawler/parser.js';
import { CrawlerStorage } from './storage.js';

(async () => {
  const storage = new CrawlerStorage();
  const downloader = new Downloader(storage);
  const parser = new Parser();
  const crawler = new Crawler(downloader, parser);

  const { seedUrlHref, maxNestingLevel, maxLinksPerPage } = workerData;

  const seedUrl = new URL(seedUrlHref);
  await storage.createIndex(seedUrl);

  crawler.on('progress', (data) => {
    parentPort?.postMessage({ data });
  });

  parentPort?.on('message', async (event) => {
    if (event === 'exit') {
      const result = {
        finishReason: 'MANUAL',
        nestingLevel: crawler.getNestingLevel(),
        totalProcessed: crawler.getTotalProcessed(),
        metrics: downloader.getMetrics(),
      };

      await storage.saveResult(seedUrl, result);

      process.exit();
    }
  });

  console.log('Processing URL:', seedUrl.href);
  const result = await crawler.crawl([seedUrl], {
    maxNestingLevel,
    maxLinksPerPage,
  });

  await storage.saveResult(seedUrl, result);
  parentPort?.postMessage({ result });
  parentPort?.close();
})();
