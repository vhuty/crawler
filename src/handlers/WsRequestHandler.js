import { Crawler } from '../crawler.js';
import { Downloader } from '../downloader.js';
import { Parser } from '../parser.js';

export class WsRequestHandler {
  async handleConnection(socket, req) {
    if (!req.url) {
      socket.close(1011);
      return;
    }
  
    const url = new URL(req.url, `http://${req.headers.host}`);
    const seedUrlQuery = url.searchParams.get('seedUrl');
  
    if (!seedUrlQuery) {
      socket.send('Seed URL is not specified');
      socket.close(1008);
      return;
    }
  
    let seedUrl;
    try {
      seedUrl = new URL(seedUrlQuery);
    } catch {
      socket.send('Seed URL is invalid');
      socket.close(1008);
      return;
    }
  
    const parser = new Parser(new Downloader());
    const crawler = new Crawler(parser);
  
    return crawler.crawl([seedUrl]);
  }
}