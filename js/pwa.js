(function () {
  'use strict';

  const script = document.currentScript;
  const root = script && script.dataset.root || '/';
  const status = document.getElementById('pwa-status');
  const notice = document.getElementById('pwa-notice');
  const install = document.getElementById('pwa-install');
  const enable = document.getElementById('pwa-enable');
  const update = document.getElementById('pwa-update');
  const help = document.getElementById('pwa-install-help');
  const list = document.getElementById('pwa-pages');
  const standalone = window.matchMedia('(display-mode: standalone)');
  const controlledAtLoad = Boolean(navigator.serviceWorker && navigator.serviceWorker.controller);
  let registration;
  let starting = false;
  let installPrompt;
  let reloading = false;
  let currentCached = false;
  let appNavigation;
  let saving;
  const dismissalKey = 'qingque-pwa-dismissed-update:' + root;
  const enabledKey = 'qingque-pwa-enabled:' + root;
  let optedIn = false;
  try { optedIn = localStorage.getItem(enabledKey) === 'yes'; } catch (_) {}
  let dismissedVersion = '';
  let waitingWorker;
  let waitingVersion = '';
  let offlineDismissed = false;
  let noticeKind = '';
  let noticeText;
  try { dismissedVersion = localStorage.getItem(dismissalKey) || ''; } catch (_) {}

  if (notice) {
    noticeText = document.createElement('span');
    const close = document.createElement('button');
    close.type = 'button';
    close.className = 'pwa-notice-close';
    close.textContent = '×';
    close.setAttribute('aria-label', '关闭提示');
    close.title = '关闭提示';
    close.addEventListener('click', () => {
      if (noticeKind === 'update') {
        dismissedVersion = waitingVersion;
        try { localStorage.setItem(dismissalKey, dismissedVersion); } catch (_) {}
      } else if (noticeKind === 'offline') {
        offlineDismissed = true;
      }
      connection();
    });
    notice.replaceChildren(noticeText, close);
  }

  function navigation() {
    if (appNavigation) return;
    appNavigation = document.createElement('nav');
    appNavigation.className = 'pwa-app-nav';
    appNavigation.setAttribute('aria-label', '应用导航');
    const back = document.createElement('button');
    back.type = 'button';
    back.textContent = '返回';
    back.addEventListener('click', () => {
      if (history.length > 1) history.back();
      else location.assign(root);
    });
    appNavigation.appendChild(back);
    for (const [path, label] of [['', '首页'], ['offline/', '离线阅读']]) {
      const link = document.createElement('a');
      link.href = root + path;
      link.textContent = label;
      appNavigation.appendChild(link);
    }
    document.body.appendChild(appNavigation);
  }

  function setStatus(message) {
    if (status) status.textContent = message;
  }

  function connection() {
    if (!notice) return;
    // Back/forward navigation can restore an older page from the browser cache.
    try { dismissedVersion = localStorage.getItem(dismissalKey) || dismissedVersion; } catch (_) {}
    const waiting = registration && registration.waiting;
    const showUpdateNotice = waiting && waiting === waitingWorker && waitingVersion &&
      dismissedVersion !== waitingVersion;
    noticeKind = !navigator.onLine ? (offlineDismissed ? '' : 'offline') :
      showUpdateNotice ? 'update' : '';
    notice.hidden = !noticeKind;
    noticeText.textContent = noticeKind === 'offline' ? '当前离线 · 可以继续阅读已缓存的页面' :
      noticeKind === 'update' ? '离线内容有更新，点击“更新并重新打开”即可使用。' : '';
  }

  function installed() {
    const active = standalone.matches || navigator.standalone === true;
    document.documentElement.classList.toggle('pwa-standalone', active);
    if (active) navigation();
    if (active && help) help.textContent = '正在以主屏幕应用运行。联网阅读后，页面会保存在此应用中供离线访问。';
    if (active && install) install.hidden = true;
    return active;
  }

  function message(type, worker, extra, timeoutMs = 10000) {
    return new Promise((resolve, reject) => {
      if (!worker) return reject(new Error('Worker not ready'));
      const channel = new MessageChannel();
      const timeout = setTimeout(() => {
        channel.port1.close();
        reject(new Error('Worker timeout'));
      }, timeoutMs);
      channel.port1.onmessage = event => {
        clearTimeout(timeout);
        channel.port1.close();
        resolve(event.data);
      };
      worker.postMessage(Object.assign({ type }, extra), [channel.port2]);
    });
  }

  function worker() {
    return registration && registration.active || navigator.serviceWorker.controller;
  }

  function decodeTitle(value) {
    // Decode HTML entities without parsing arbitrary markup into the document.
    return String(value).replace(/&(#x[\da-f]+|#\d+|amp|lt|gt|quot|apos|nbsp);/gi, (match, entity) => {
      const named = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' };
      if (entity[0] !== '#') return named[entity.toLowerCase()] || match;
      const code = entity[1].toLowerCase() === 'x' ? parseInt(entity.slice(2), 16) : Number(entity.slice(1));
      return code > 0 && code <= 0x10ffff ? String.fromCodePoint(code) : match;
    });
  }

  async function refreshPages() {
    try {
      const data = await message('LIST_PAGES', worker());
      if (data.error) throw new Error(data.error);
      if (list) {
        list.replaceChildren();
        for (const page of data.pages) {
          const item = document.createElement('li');
          const link = document.createElement('a');
          link.href = page.url;
          link.textContent = decodeTitle(page.title);
          item.appendChild(link);
          list.appendChild(item);
        }
        if (!data.pages.length) list.textContent = '尚无缓存页面，请联网后打开想阅读的文章。';
      }
      const pageReady = data.pages.some(page => page.url === location.pathname.replace(/index\.html$/, ''));
      currentCached = currentCached || pageReady;
      setStatus((navigator.onLine ? '离线阅读已就绪' : '当前处于离线状态') +
        ' · ' + data.pages.length + ' 个页面可离线打开。' +
        (!list && currentCached ? '本页已缓存。' : ''));
    } catch (_) {
      setStatus('暂时无法读取离线缓存。请检查浏览器是否允许网站存储，联网后重试。');
    }
  }

  function saveCurrent() {
    if (saving) return saving;
    saving = cacheCurrent().finally(() => { saving = null; });
    return saving;
  }

  async function cacheCurrent() {
    if (list || !navigator.onLine || controlledAtLoad || currentCached) return refreshPages();
    try {
      // Resources loaded before the first worker claimed this page need seeding too.
      // The worker only accepts generated, local asset URLs from this list.
      const assets = window.performance && performance.getEntriesByType ?
        performance.getEntriesByType('resource').map(entry => entry.name) : [];
      const data = await message('CACHE_CURRENT', worker(), { assets });
      currentCached = data.cached;
    } catch (_) { /* Cached pages remain readable when a network request times out. */ }
    await refreshPages();
  }

  function showUpdate() {
    const waiting = registration.waiting;
    if (update) update.hidden = !waiting;
    if (waiting !== waitingWorker) {
      waitingWorker = waiting;
      waitingVersion = '';
      if (waiting) {
        // Resolve the version before showing the notice, so a dismissed update
        // does not flash again on every page. Older workers have no version API.
        message('GET_VERSION', waiting, undefined, 1500)
          .then(data => data.version || 'legacy')
          .catch(() => 'legacy')
          .then(version => {
            if (registration.waiting !== waiting) return;
            waitingVersion = version;
            connection();
          });
      }
    }
    connection();
  }

  connection();
  installed();
  if (standalone.addEventListener) standalone.addEventListener('change', installed);
  window.addEventListener('offline', () => { connection(); if (registration) refreshPages(); });
  window.addEventListener('online', () => {
    offlineDismissed = false;
    connection();
    if (registration) {
      registration.update().catch(() => {});
      saveCurrent();
    } else if (optedIn || installed()) {
      start();
    }
  });
  window.addEventListener('pageshow', () => { connection(); if (registration) refreshPages(); });

  window.addEventListener('beforeinstallprompt', event => {
    // No inline installation instructions: keep the browser's native prompt.
    if (!install) return;
    event.preventDefault();
    installPrompt = event;
    if (install && !installed()) install.hidden = false;
  });
  window.addEventListener('appinstalled', () => {
    installPrompt = null;
    if (install) install.hidden = true;
    if (help) help.textContent = '已添加到设备，可以从主屏幕打开。';
  });
  if (install) install.addEventListener('click', async () => {
    if (!installPrompt) return;
    install.disabled = true;
    try {
      await installPrompt.prompt();
      await installPrompt.userChoice;
    } catch (_) { /* The browser can dismiss an install request. */ }
    installPrompt = null;
    install.hidden = true;
    install.disabled = false;
  });
  if (enable) enable.addEventListener('click', () => {
    optedIn = true;
    try { localStorage.setItem(enabledKey, 'yes'); } catch (_) {}
    start();
  });
  if (update) update.addEventListener('click', () => {
    if (!registration || !registration.waiting) return;
    reloading = true;
    update.disabled = true;
    registration.waiting.postMessage({ type: 'SKIP_WAITING' });
  });
  const retry = document.getElementById('pwa-retry');
  if (retry) retry.addEventListener('click', () => location.reload());
  const details = document.getElementById('pwa-tools');
  if (details) details.addEventListener('toggle', () => {
    if (details.open && registration) refreshPages();
  });

  if (!('serviceWorker' in navigator) || !window.isSecureContext) {
    if (enable) enable.disabled = true;
    setStatus('当前环境不支持离线阅读，请使用 HTTPS 或本机 localhost 访问。');
    return;
  }

  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (reloading) return location.reload();
    saveCurrent();
  });

  async function start() {
    if (!('serviceWorker' in navigator) || !window.isSecureContext) return;
    if (starting || registration) return;
    starting = true;
    setStatus('正在准备离线阅读，首次使用需要联网…');
    try {
      registration = await navigator.serviceWorker.register(root + 'sw.js', {
        scope: root, updateViaCache: 'none'
      });
      if (enable) enable.hidden = true;
      showUpdate();
      function trackInstalling() {
        const incoming = registration.installing;
        if (!incoming) return;
        incoming.addEventListener('statechange', () => {
          if (incoming.state === 'installed') showUpdate();
          if (incoming.state === 'redundant' && !registration.active) {
            setStatus('离线资源准备失败，请联网后刷新重试。');
          }
        });
      }
      registration.addEventListener('updatefound', trackInstalling);
      trackInstalling();
      // ready resolves only after the first successful installation.
      navigator.serviceWorker.ready.then(() => saveCurrent()).catch(() => {});
    } catch (_) {
      registration = null;
      setStatus('离线阅读暂不可用，请联网后重试。浏览器限制网站存储也可能导致此问题。');
    } finally {
      starting = false;
    }
  }

  // New visitors opt in. Existing workers still receive fixes and migrations.
  const resume = () => {
    if (optedIn || navigator.serviceWorker.controller || installed()) start();
    else setStatus('可按需启用离线阅读，保存访问过的页面。');
  };
  if (document.readyState === 'complete') resume();
  else window.addEventListener('load', resume, { once: true });
})();
