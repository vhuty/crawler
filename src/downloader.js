import { request } from 'undici';

export class Downloader {
  /**
   * @param {URL} url
   */
  async fetchPage(url) {
    try {
      const { body, statusCode } = await request(url);

      if (statusCode === 200) {
        return await body.text();
      }

      // TODO: Handle redirects
      console.info(`Received status: ${statusCode}, skipping...`);
    } catch (error) {
      console.info(`Failed to fetch: ${url.href}, reason: ${error.message}`);
    }

    return "";
  }
}