document.addEventListener('DOMContentLoaded', () => {
  const $formCrawler = document.getElementById('form-crawler');

  const $buttonCrawl = document.getElementById('button-crawl');
  const $inputUrl = document.getElementById('input-url');
  const $inputMaxNestingLevel = document.getElementById('input-max-nesting-level');
  const $inputMaxLinksPerPage = document.getElementById('input-max-links-per-page');

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
  const $spanStatusClientError = document.getElementById(
    'span-status-client-error'
  );
  const $spanStatusServerError = document.getElementById(
    'span-status-server-error'
  );

  let isCrawling = false;
  let ws;

  $formCrawler.addEventListener('submit', (event) => {
    event.preventDefault();

    if (isCrawling) {
      $buttonCrawl.textContent = 'Start';
      $buttonCrawl.classList.replace('btn-outline-danger', 'btn-primary');
      $inputUrl.removeAttribute('disabled');

      ws.close();
      isCrawling = false;

      return;
    }

    isCrawling = true;

    $buttonCrawl.textContent = 'Stop';
    $buttonCrawl.classList.replace('btn-primary', 'btn-outline-danger');
    $inputUrl.setAttribute('disabled', '');

    const url = new URL('/crawler', window.location.href);
    url.protocol = 'ws';
    url.searchParams.append('seedUrl', $inputUrl.value);
    url.searchParams.append('maxNestingLevel', $inputMaxNestingLevel.value);
    url.searchParams.append('maxLinksPerPage', $inputMaxLinksPerPage.value);

    ws = new WebSocket(url);
    ws.onmessage = (message) => {
      const {
        currentUrl,
        levelProcessed,
        levelTotal,
        nestingLevel,
        totalProcessed,
        metrics,
      } = JSON.parse(message.data);

      updateProgressBar(levelProcessed, levelTotal);
      updateMetrics(metrics);

      $currentUrl.textContent = currentUrl;
      $spanTotalCrawled.textContent = totalProcessed;
      $spanNestingLevel.textContent = nestingLevel;
    };

    ws.onclose = (event) => {
      $buttonCrawl.textContent = 'Start';
      $buttonCrawl.classList.replace('btn-outline-danger', 'btn-primary');
      $inputUrl.removeAttribute('disabled');

      stopProgressBar(event.wasClean);
      setTimeout(() => window.open('/index/', '_blank'), 500);
    };
  });

  function updateMetrics(metrics) {
    const {
      statuses: { success, redirects, clientErrors, serverErrors },
      speed: { fastest, slowest, avg },
    } = metrics;

    $itemAvgLoad.textContent = `Average: ${avg}ms`;
    $itemFastestLoad.textContent = `Fastest: ${fastest}ms`;
    $itemSlowestLoad.textContent = `Slowest: ${slowest}ms`;

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
    $progressBarCrawler.textContent = `${progressPercent}% (${currentValue} of ${maxValue})`;
  }

  function stopProgressBar(finished) {
    if (finished) $progressBarCrawler.classList.remove('progress-bar-animated');
    else $progressBarCrawler.classList.add('text-bg-secondary');
  }
});
