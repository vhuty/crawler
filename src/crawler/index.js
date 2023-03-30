import { parentPort, workerData } from 'node:worker_threads';

import { Crawler } from '../crawler/crawler.js';
import { Downloader } from '../crawler/downloader.js';
import { Parser } from '../crawler/parser.js';

(async () => {
  const downloader = new Downloader();
  const parser = new Parser();
  const crawler = new Crawler(downloader, parser);

  crawler.on('progress', (data) => {
    parentPort?.postMessage({ data });
  });

  const result = await crawler.crawl([new URL(workerData.seedUrl)]);
  parentPort?.postMessage({ result });
})();
