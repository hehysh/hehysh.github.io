(function() {
  'use strict';
  if (window.__atcLoaderReady) return;
  window.__atcLoaderReady = true;
  let loading;
  let sequence = 0;

  function prepareCards() {
    // Older Hexo database entries may still contain the previous button wrapper.
    document.querySelectorAll('.post-body .atc-card[role="button"]').forEach(card => {
      card.setAttribute('role', 'group');
      card.removeAttribute('tabindex');
      card.setAttribute('aria-label', '附件：' + (card.dataset.atcName || '文件'));
    });
  }

  function loadViewer() {
    if (!loading) {
      loading = new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = window.ATTACHMENT_CONFIG.viewerScriptUrl;
        script.onload = resolve;
        script.onerror = () => {
          script.remove();
          loading = null;
          reject(new Error('Attachment viewer unavailable'));
        };
        document.head.appendChild(script);
      });
    }
    return loading;
  }

  document.addEventListener('click', event => {
    if (window.__atcAttachmentReady) return;
    const card = event.target.closest('.post-body .atc-card');
    if (!card || card.classList.contains('atc-card-error') || event.target.closest('.atc-btn-download')) return;
    event.preventDefault();
    const current = ++sequence;
    document.querySelectorAll('.atc-card[aria-busy]').forEach(node => node.removeAttribute('aria-busy'));
    card.setAttribute('aria-busy', 'true');
    const error = card.querySelector('.atc-load-error');
    if (error) error.remove();
    loadViewer().then(() => {
      if (current !== sequence || !card.isConnected) return;
      card.removeAttribute('aria-busy');
      const button = card.querySelector('.atc-btn-view');
      if (button) button.click();
    }).catch(() => {
      if (current !== sequence || !card.isConnected) return;
      card.removeAttribute('aria-busy');
      const error = document.createElement('span');
      error.className = 'atc-load-error';
      error.setAttribute('role', 'status');
      error.textContent = '预览器加载失败，点击重试，或下载原文件。';
      card.appendChild(error);
    });
  });

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', prepareCards);
  else prepareCards();
  document.addEventListener('pjax:success', prepareCards);
  document.addEventListener('pjax:send', () => { sequence++; });
})();
