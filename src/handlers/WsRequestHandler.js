import { Crawler } from '../crawler.js';
import { Downloader } from '../downloader.js';
import { Parser } from '../parser.js';

export class WsRequestHandler {
  /**
   * @param {import('ws').WebSocket} socket
   * @param {import('http').IncomingMessage} req
   */
  async handleConnection(socket, req) {
    if (!req.url) {
      socket.close(1011);
      return;
    }
  
    const url = new URL(req.url, `http://${req.headers.host}`);
    const seedUrlQuery = url.searchParams.get('seedUrl');
  
    if (!seedUrlQuery) {
      socket.send('Seed URL is not specified');
      socket.close(1003);
      return;
    }
  
    let seedUrl;
    try {
      seedUrl = new URL(seedUrlQuery);
    } catch {
      socket.send('Seed URL is invalid');
      socket.close(1003);
      return;
    }
  
    const downloader = new Downloader();
    const parser = new Parser();
    const crawler = new Crawler(downloader, parser);

    crawler.on('progress', (data) => {
      socket.send(JSON.stringify(data));
    });
  
    const result = await crawler.crawl([seedUrl]);
    socket.close(1000, result);
  }
}