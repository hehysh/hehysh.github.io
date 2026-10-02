/* global CONFIG */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  const doSaveScroll = () => {
    try {
      localStorage.setItem('bookmark' + location.pathname, window.scrollY);
    } catch (error) { /* Reading still works when storage is unavailable. */ }
  };

  const scrollToMark = () => {
    let top;
    try {
      top = localStorage.getItem('bookmark' + location.pathname);
    } catch (error) { return; }
    top = parseInt(top, 10);
    // If the page opens with a specific hash, just jump out
    if (!isNaN(top) && top > 0 && location.hash === '' && Math.abs(window.scrollY - top) > 1) {
      window.scrollTo({ top, behavior: 'instant' });
    }
  };
  // Register everything
  const init = function(trigger) {
    // Create a link element
    const link = document.querySelector('.book-mark-link');
    if (!link) return;
    // Scroll event
    window.addEventListener('scroll', () => link.classList.toggle('book-mark-link-fixed', window.scrollY === 0), { passive: true });
    // pagehide preserves the browser's back/forward cache.
    if (trigger === 'auto') {
      window.addEventListener('pagehide', doSaveScroll);
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) doSaveScroll();
      });
      document.addEventListener('pjax:send', doSaveScroll);
    }
    // Save the position by clicking the icon
    link.addEventListener('click', () => {
      doSaveScroll();
      if (link.animate && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        link.animate([
          { transform: 'translateY(0)' },
          { transform: 'translateY(-30px)', offset: 0.25 },
          { transform: 'translateY(-30px)', offset: 0.75 },
          { transform: 'translateY(0)' }
        ], { duration: 800, easing: 'ease-out' });
      }
    });
    scrollToMark();
    document.addEventListener('pjax:success', scrollToMark);
  };

  init(CONFIG.bookmark.save);
});
