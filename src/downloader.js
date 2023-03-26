import { fetch } from 'undici';

export class Downloader {
  /**
   * @param {URL} url
   */
  async fetchPage(url) {
    try {
      const response = await fetch(url);

      if (response.ok) {
        return await response.text();
      }

      // TODO: Handle redirects
      console.info(`Received status: ${response.status}, skipping...`);
    } catch (error) {
      console.info(`Failed to fetch: ${url.href}, reason: ${error.message}`);
    }

    return "";
  }
}