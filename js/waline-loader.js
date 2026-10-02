/* global NexT, CONFIG */
(function() {
  'use strict';
  if (window.__walineLoaderReady) return;
  window.__walineLoaderReady = true;
  let assets;
  let css;
  let instance;
  let observer;
  let sequence = 0;

  function loadCSS(url) {
    if (!css) {
      css = new Promise((resolve, reject) => {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = url;
        link.onload = resolve;
        link.onerror = () => {
          link.remove();
          css = null;
          reject(new Error('Comment stylesheet unavailable'));
        };
        document.head.appendChild(link);
      });
    }
    return css;
  }

  function loadAssets(config) {
    if (!assets) {
      assets = Promise.all([
        loadCSS(config.cssUrl),
        NexT.utils.getScript(config.libUrl, { condition: Boolean(window.Waline) })
      ]).catch(error => {
        assets = null;
        throw error;
      });
    }
    return assets;
  }

  function loadCounts(config, current) {
    if (!config.commentCount) return;
    const counters = [...document.querySelectorAll('.waline-comment-count[data-path]')];
    const paths = [...new Set(counters.map(node => node.dataset.path))];
    if (!paths.length) return;
    const url = new URL('comment', config.serverURL.replace(/\/?$/, '/'));
    url.searchParams.set('type', 'count');
    url.searchParams.set('url', paths.join(','));
    url.searchParams.set('lang', config.lang || 'zh-CN');
    fetch(url, { credentials: 'omit' }).then(response => {
      if (!response.ok) throw new Error('Comment count unavailable');
      return response.json();
    }).then(result => {
      const data = Array.isArray(result) || typeof result === 'number' ? result : result && result.data;
      const counts = typeof data === 'number' ? [data] : data;
      if (current !== sequence || !Array.isArray(counts)) return;
      counters.forEach(node => {
        const count = counts[paths.indexOf(node.dataset.path)];
        if (Number.isInteger(count) && count >= 0) node.textContent = String(count);
      });
    }).catch(() => { /* Links to the comment section remain usable. */ });
  }

  function init() {
    const current = ++sequence;
    const config = CONFIG.waline;
    if (!config || !config.serverURL) return;
    if (observer) observer.disconnect();
    if (instance) {
      instance.destroy();
      instance = null;
    }
    loadCounts(config, current);
    const container = document.querySelector(config.el);
    // Home, archive and tag pages need counts only, never the full client.
    if (!container) return;

    let loading = false;
    function mount() {
      if (loading || current !== sequence || !container.isConnected) return;
      loading = true;
      container.textContent = '正在加载评论…';
      loadAssets(config).then(() => {
        if (current !== sequence || !container.isConnected) return;
        container.textContent = '';
        instance = window.Waline.init(Object.assign({}, config, {
          el: container,
          comment: false,
          commentCount: false
        }));
      }).catch(() => {
        if (current !== sequence || !container.isConnected) return;
        container.textContent = '评论暂时无法加载。';
        const retry = document.createElement('button');
        retry.type = 'button';
        retry.textContent = '重试';
        retry.addEventListener('click', mount);
        container.appendChild(retry);
      }).finally(() => { loading = false; });
    }
    if (!CONFIG.comments.lazyload || !window.IntersectionObserver) {
      mount();
    } else {
      observer = new IntersectionObserver(entries => {
        if (!entries.some(entry => entry.isIntersecting)) return;
        observer.disconnect();
        mount();
      }, { rootMargin: '200px' });
      observer.observe(container);
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
  document.addEventListener('pjax:success', init);
  document.addEventListener('pjax:send', () => {
    sequence++;
    if (observer) observer.disconnect();
  });
})();
