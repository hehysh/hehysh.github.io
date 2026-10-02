/* global NexT, CONFIG */
(function() {
  let loading;
  let styles;
  let sequence = 0;

  function prepareImages() {
    document.querySelectorAll('.post-body :not(a) > img').forEach(image => {
      const src = image.dataset.src || image.getAttribute('src');
      if (!src) return;
      const link = document.createElement('a');
      link.className = 'fancybox fancybox.image';
      link.href = src;
      link.dataset.fancybox = image.closest('.post-gallery') ? 'gallery' : image.closest('.group-picture') ? 'group' : 'default';
      link.rel = link.dataset.fancybox;
      image.before(link);
      link.appendChild(image);
      const title = image.title || image.alt;
      if (!title) return;
      link.title = title;
      // Fancybox accepts HTML captions; encode authored text before handing it over.
      const caption = document.createElement('p');
      caption.className = 'image-caption';
      caption.textContent = title;
      link.dataset.caption = caption.innerHTML;
      if (!link.nextElementSibling || !link.nextElementSibling.matches('figcaption')) link.appendChild(caption);
    });
  }

  function loadStyles() {
    if (!styles) {
      styles = new Promise((resolve, reject) => {
        const { url, integrity } = CONFIG.fancybox.style;
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = url;
        if (integrity) {
          link.integrity = integrity;
          link.crossOrigin = 'anonymous';
        }
        link.onload = resolve;
        link.onerror = () => {
          link.remove();
          styles = null;
          reject(new Error('Image viewer stylesheet unavailable'));
        };
        document.head.appendChild(link);
      });
    }
    return styles;
  }

  function loadViewer() {
    if (!loading) {
      const scripts = NexT.utils.getScript(CONFIG.fancybox.jquery, { condition: Boolean(window.jQuery) })
        .then(() => NexT.utils.getScript(CONFIG.fancybox.script, { condition: Boolean(window.jQuery.fancybox) }));
      loading = Promise.all([scripts, loadStyles()]).catch(error => {
        loading = null;
        throw error;
      });
    }
    return loading;
  }

  document.addEventListener('page:loaded', prepareImages);
  document.addEventListener('click', event => {
    const link = event.target.closest('a.fancybox, a[data-fancybox]');
    if (!link || event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    // Fancybox installs its own delegated handler after loading; open only once.
    event.stopImmediatePropagation();
    const current = ++sequence;
    link.setAttribute('aria-busy', 'true');
    loadViewer().then(() => {
      if (current !== sequence || !link.isConnected) return;
      const group = link.dataset.fancybox || link.rel;
      const links = group ? [...document.querySelectorAll('a.fancybox, a[data-fancybox]')]
        .filter(item => (item.dataset.fancybox || item.rel) === group) : [link];
      window.jQuery.fancybox.open(links, { loop: true, hash: false }, links.indexOf(link));
    }).catch(() => {
      // Keep the original image accessible even if the CDN is unavailable.
      if (current === sequence && link.isConnected) location.assign(link.href);
    }).finally(() => link.removeAttribute('aria-busy'));
  });
  document.addEventListener('pjax:send', () => { sequence++; });
})();
