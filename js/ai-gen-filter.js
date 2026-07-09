(function () {
  var COOKIE_NAME = 'ai_gen_consent';

  /* ---------- Cookie 工具 ---------- */
  function getCookie(name) {
    var match = document.cookie.match(new RegExp('(?:^|;\\s*)' + name + '=([^;]*)'));
    return match ? decodeURIComponent(match[1]) : null;
  }
  function setCookie(name, value, days) {
    document.cookie = name + '=' + encodeURIComponent(value) +
      '; path=/; max-age=' + days * 86400;
  }

  /* ---------- 路径规范化 ---------- */
  function normalize(href) {
    try {
      return new URL(href, location.origin).pathname;
    } catch (e) {
      return href;
    }
  }

  var aiPaths = (window.AI_GEN_POSTS || []).map(normalize);
  if (!aiPaths.length) return;

  /* ---------- 判断当前是否为首页（含首页分页 /page/N/） ---------- */
  function isHomePage() {
    var root = window.SITE_ROOT || '/';
    var path = location.pathname;
    // 首页：/  或  /page/2/ 这类首页分页
    return path === root ||
           new RegExp('^' + root.replace(/\//g, '\\/') + 'page\\/\\d+\\/?$').test(path);
  }

  /* ---------- 仅在首页隐藏 AI-gen 文章条目 ---------- */
  function hideAIGenPostsOnHome() {
    if (!isHomePage()) return; // 归档页、标签页、文章页一律不处理

    document.querySelectorAll('a[href]').forEach(function (a) {
      if (aiPaths.indexOf(normalize(a.getAttribute('href'))) !== -1) {
        var block = a.closest('.post-block, article');
        if (block) block.style.display = 'none';
      }
    });
  }

  /* ---------- 弹窗 ---------- */
  function showModal() {
    var overlay = document.createElement('div');
    overlay.id = 'ai-gen-modal';
    overlay.style.cssText =
      'position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,.55);' +
      'display:flex;align-items:center;justify-content:center;';
    overlay.innerHTML =
      '<div style="background:#fff;max-width:420px;width:90%;border-radius:8px;' +
      'padding:28px 24px;text-align:center;box-shadow:0 8px 30px rgba(0,0,0,.25);">' +
        '<h3 style="margin:0 0 12px;font-size:18px;color:#333;">内容展示确认</h3>' +
        '<p style="margin:0 0 8px;color:#555;line-height:1.7;">' +
          '你是否能够接受 AI-generated 文本的展示？</p>' +
        '<p style="margin:0 0 8px;color:#999;font-size:13px;">' +
          '选择"否"仅会在首页隐藏相关文章，归档页与直链访问不受影响。</p>' +
        '<p style="margin:0 0 20px;color:#999;font-size:13px;">' +
          '提示：如需更改选项，清除本站 Cookie 即可。</p>' +
        '<button id="ai-gen-yes" style="margin:0 8px;padding:8px 26px;border:none;' +
          'border-radius:4px;background:#409eff;color:#fff;cursor:pointer;">是</button>' +
        '<button id="ai-gen-no" style="margin:0 8px;padding:8px 26px;border:1px solid #ccc;' +
          'border-radius:4px;background:#fff;color:#555;cursor:pointer;">否</button>' +
      '</div>';
    document.body.appendChild(overlay);

    document.getElementById('ai-gen-yes').onclick = function () {
      setCookie(COOKIE_NAME, 'yes', 365);
      overlay.remove();
    };
    document.getElementById('ai-gen-no').onclick = function () {
      setCookie(COOKIE_NAME, 'no', 365);
      overlay.remove();
      hideAIGenPostsOnHome();
    };
  }

  /* ---------- 主流程 ---------- */
  function main() {
    var consent = getCookie(COOKIE_NAME);
    if (consent === 'no') {
      hideAIGenPostsOnHome();
    } else if (!consent) {
      showModal();
    }
    // consent === 'yes' 则正常展示，无任何处理
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', main);
  } else {
    main();
  }

  // 兼容 NexT pjax：页面切换后重新判断
  document.addEventListener('pjax:success', function () {
    if (getCookie(COOKIE_NAME) === 'no') hideAIGenPostsOnHome();
  });
})();
