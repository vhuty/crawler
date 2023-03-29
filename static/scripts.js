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

  const $spanStatusSuccess = document.getElementById('span-status-success');
  const $spanStatusRedirect = document.getElementById('span-status-redirect');
  const $spanStatusClientError = document.getElementById('span-status-client-error');
  const $spanStatusServerError = document.getElementById('span-status-server-error');

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
        statuses,
      } = JSON.parse(message.data);

      updateProgressBar(levelProcessed, levelTotal);
      updateMetrics(metrics);
      updateStatuses(statuses);

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

  function updateStatuses(statuses) {
    const {
      success,
      redirects,
      clientErrors,
      serverErrors,
    } = statuses;

    $spanStatusSuccess.textContent = success;
    $spanStatusRedirect.textContent = redirects;
    $spanStatusClientError.textContent = clientErrors;
    $spanStatusServerError.textContent = serverErrors;
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
