const LINK_REG_EXP = /<a\s+(?:[^>]*?\s+)?href=(["'])(.*?)\1/g;

export class Parser {
  constructor(downloader) {
    this.downloader = downloader;
  }

  /**
   * @param {URL} url
   * @returns {Promise<URL[]>}
   */
  async parsePageLinks(url) {
    const html = await this.downloader.fetchPage(url);

    const urls = [];

    if (!html.length) {
      return urls;
    }

    for (let [, , href] of html.matchAll(LINK_REG_EXP)) {
      try {
        urls.push(new URL(href, url));
      } catch {
        console.info(`Invalid URL: ${href}`);
      }
    }

    return urls;
  };
}