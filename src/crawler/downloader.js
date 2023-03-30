import { fetch } from 'undici';

export class Downloader {
  constructor() {
    this.fastestLoad = Infinity;
    this.slowestLoad = 0;
    this.avgLoad = 0;

    this.successfulResponses = 0;
    this.redirectionResponses = 0;
    this.clientErrors = 0;
    this.serverErrors = 0;

    this.chunkSize = 5;
  }

  /**
   * @param {URL} url
   */
  async fetchPage(url) {
    try {
      const start = Date.now();
      const response = await fetch(url);
      const duration = Date.now() - start;

      this._updateMetrics(duration, response.status);

      if (response.ok) {
        return {
          content: await response.text(),
          url,
        }
      }

      // TODO: Handle redirects
      console.info(`Received status: ${response.status}, skipping...`);
    } catch (error) {
      console.info(`Failed to fetch: ${url.href}, reason: ${error.message}`);
    }

    return { content: "", url };
  }

  /**
   * @param {URL[]} urls
   */
  async *batchFetchPages(urls) {
    for (let i = 0; i < urls.length; i += this.chunkSize) {
      const chunk = urls.slice(i, i + this.chunkSize);
      const pages = await Promise.all(chunk.map(this.fetchPage, this));
      for (const page of pages) yield page;
    }
  }

  _updateMetrics(duration, status) {
    this.fastestLoad = duration < this.fastestLoad ? duration : this.fastestLoad;
    this.slowestLoad = duration > this.slowestLoad ? duration : this.slowestLoad;
    this.avgLoad = (this.fastestLoad + this.slowestLoad) / 2;

    switch (~~(status / 100)) {
      case 5: this.serverErrors += 1; break;
      case 4: this.clientErrors += 1; break;
      case 3: this.redirectionResponses += 1; break;
      case 2: this.successfulResponses += 1; break;
    }
  }
}
