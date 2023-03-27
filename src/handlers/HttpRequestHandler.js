import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const mimeTypes = {
  html: 'text/html',
  js: 'text/javascript',
  css: 'text/css',
  svg: 'image/svg+xml',
};

export class HttpRequestHandler {
  async loadFile(req, res) {
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
  }
}