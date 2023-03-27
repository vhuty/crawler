import { createServer } from 'node:http';
import { WebSocketServer } from 'ws';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import { Crawler } from './crawler.js';
import { Downloader } from './downloader.js';
import { Parser } from './parser.js';

const mimeTypes = {
  html: 'text/html',
  js: 'text/javascript',
  css: 'text/css',
  svg: 'image/svg+xml',
};

const server = createServer(async (req, res) => {
  const { url } = req;

  try {
    if (!url) {
      throw new Error('Url is not specified');
    }

    const path = resolve(`static${url}`);
    const file = await readFile(path, 'utf-8');
    const contentType = mimeTypes[url.split('.').pop()];

    res.writeHead(200, { 'Content-Type': contentType });
    res.end(file);
  } catch (error) {
    res.statusCode = 404;
    res.end();
  }
});

const port = Number(process.env.PORT);
server.listen(port);

const ws = new WebSocketServer({ server });

ws.on('connection', async (socket, req) => {
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
});
