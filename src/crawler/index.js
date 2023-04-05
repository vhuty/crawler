import { parentPort, workerData } from 'node:worker_threads';

import { Crawler } from '../crawler/crawler.js';
import { Downloader } from '../crawler/downloader.js';
import { Parser } from '../crawler/parser.js';
import { CrawlerStorage } from './storage.js';

(async () => {
  const downloader = new Downloader();
  const parser = new Parser();
  const storage = new CrawlerStorage();
  const crawler = new Crawler(downloader, parser);

  const seedUrl = new URL(workerData.seedUrl);

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

  const result = await crawler.crawl([seedUrl]);
  await storage.saveResult(seedUrl, result);
  parentPort?.postMessage({ result });
})();
