(function() {
  'use strict';
  const label = document.getElementById('momk');
  if (!label) return;
  const birthday = Date.UTC(2022, 3, 20);
  let visible = !window.IntersectionObserver;
  let timer;

  function update() {
    const elapsed = Math.max(0, Math.floor((Date.now() - birthday) / 1000));
    const days = Math.floor(elapsed / 86400);
    const hours = Math.floor(elapsed / 3600) % 24;
    const minutes = Math.floor(elapsed / 60) % 60;
    const seconds = elapsed % 60;
    label.textContent = '这个快乐的小窝已经在互联网上飘荡了' + days + '天' + hours + '小时' + minutes + '分' + seconds + '秒，真是太不容易了';
  }

  function refresh() {
    clearInterval(timer);
    if (!visible || document.hidden) return;
    update();
    timer = setInterval(update, 1000);
  }

  // Fill once, then tick only while the footer is on screen in an active tab.
  update();
  if (window.IntersectionObserver) {
    const observer = new IntersectionObserver(entries => {
      visible = entries.some(entry => entry.isIntersecting);
      refresh();
    });
    observer.observe(label);
  }
  document.addEventListener('visibilitychange', refresh);
  window.addEventListener('pagehide', () => clearInterval(timer));
  window.addEventListener('pageshow', refresh);
  refresh();
})();
