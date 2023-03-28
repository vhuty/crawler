document.addEventListener('DOMContentLoaded', () => {
  const $formCrawler = document.getElementById('form-crawler');
  const $inputUrl = document.getElementById('input-url');
  const $progressCrawler = document.getElementById('progress-crawler');
  const $progressBarCrawler = document.getElementById('progress-bar-crawler');
  const $spanNestingLevel = document.getElementById('span-nesting-level');
  
  $formCrawler.addEventListener('submit', (event) => {
    event.preventDefault();

    const url = new URL(window.location.href);
    url.protocol = 'ws';
    url.searchParams.append('seedUrl', $inputUrl.value);

    const ws = new WebSocket(url.href);
    ws.onmessage = (message) => {
      const { processed, level, total } = JSON.parse(message.data);

      updateProgressBar(processed, total);
      $spanNestingLevel.textContent = level;
    };

    ws.onclose = stopProgressBar;
  });

  function updateProgressBar(currentValue, maxValue) {
    $progressCrawler.setAttribute('aria-valuemax', maxValue);
    $progressCrawler.setAttribute('aria-valuenow', currentValue);

    const progressPercent = Math.trunc(currentValue * 100 / maxValue);
    $progressBarCrawler.setAttribute('style', `width: ${progressPercent}%`);
    $progressBarCrawler.textContent = `${progressPercent}%`;
  }

  function stopProgressBar() {
    $progressBarCrawler.classList.remove('progress-bar-animated');
    $progressBarCrawler.classList.add('text-bg-secondary');
  }
});
