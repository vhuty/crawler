document.addEventListener('DOMContentLoaded', () => {
  const $formCrawler = document.getElementById('form-crawler');

  const $buttonCrawl = document.getElementById('button-crawl');
  const $inputUrl = document.getElementById('input-url');
  const $progressCrawler = document.getElementById('progress-crawler');
  const $progressBarCrawler = document.getElementById('progress-bar-crawler');
  const $spanNestingLevel = document.getElementById('span-nesting-level');

  const $itemAvgLoad = document.getElementById('item-avg-load');
  const $itemFastestLoad = document.getElementById('item-fastest-load');
  const $itemSlowestLoad = document.getElementById('item-slowest-load');

  const $currentUrl = document.getElementById('div-current-url');
  const $spanTotalCrawled = document.getElementById('span-total-crawled');

  $formCrawler.addEventListener('submit', (event) => {
    event.preventDefault();
    $buttonCrawl.setAttribute('disabled', '');
    $inputUrl.setAttribute('disabled', '');

    const url = new URL(window.location.href);
    url.protocol = 'ws';
    url.searchParams.append('seedUrl', $inputUrl.value);

    const ws = new WebSocket(url.href);
    ws.onmessage = (message) => {
      const {
        levelProcessed,
        levelTotal,
        currentLevel,
        totalProcessed,
        currentUrl,
        metrics,
      } = JSON.parse(message.data);

      updateProgressBar(levelProcessed, levelTotal);
      updateMetrics(metrics);
      $currentUrl.textContent = currentUrl;
      $spanTotalCrawled.textContent = totalProcessed;
      $spanNestingLevel.textContent = currentLevel;
    };

    ws.onclose = (event) => stopProgressBar(event.wasClean);
  });

  function updateMetrics(metrics) {
    const { fastest, slowest, avg } = metrics;

    $itemAvgLoad.textContent = `Average: ${avg}ms`;
    $itemFastestLoad.textContent = `Fastest: ${fastest}ms`;
    $itemSlowestLoad.textContent = `Slowest: ${slowest}ms`;
  }

  function updateProgressBar(currentValue, maxValue) {
    $progressCrawler.setAttribute('aria-valuemax', maxValue);
    $progressCrawler.setAttribute('aria-valuenow', currentValue);

    const progressPercent = Math.trunc((currentValue * 100) / maxValue);
    $progressBarCrawler.setAttribute('style', `width: ${progressPercent}%`);
    $progressBarCrawler.textContent = `${progressPercent}%`;
  }

  function stopProgressBar(finished) {
    if (finished) $progressBarCrawler.classList.remove('progress-bar-animated');
    else $progressBarCrawler.classList.add('text-bg-secondary');
  }
});
