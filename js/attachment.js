/*!
 * 附件卡片交互与沉浸式附件预览器
 *
 * - 事件全部委托在 document 上，因此 PJAX / 动态插入的卡片也能直接工作
 * - Markdown 经由本地 marked 渲染，输出必须先过 DOMPurify 再插入 DOM
 * - 预览器挂载在 body 下，层级高于 NexT 正文、侧栏与常规组件
 */
(function () {
  'use strict';

  if (window.__atcAttachmentReady) return;
  window.__atcAttachmentReady = true;

  var CONFIG = window.ATTACHMENT_CONFIG || {};
  var ROOT = CONFIG.root || '/';
  var MARKED_URL = CONFIG.markedUrl || joinRoot('lib/attachment/marked.js');
  var PURIFY_URL = CONFIG.purifyUrl || joinRoot('lib/attachment/purify.min.js');
  var VIEWER_CSS_URL = CONFIG.viewerCssUrl || joinRoot('css/attachment-viewer.css');

  // 纯文本预览的体积上限，超出后只提示下载，避免卡死页面
  var TEXT_LIMIT = 2 * 1024 * 1024;

  function joinRoot(path) {
    return ROOT.replace(/\/+$/, '') + '/' + path.replace(/^\/+/, '');
  }

  // ---------------------------------------------------------------- //
  // 工具
  // ---------------------------------------------------------------- //

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  function formatBytes(bytes) {
    if (!isFinite(bytes) || bytes < 0) return '';
    if (bytes < 1024) return bytes + ' B';
    var units = ['KB', 'MB', 'GB'];
    var value = bytes / 1024;
    var i = 0;
    while (value >= 1024 && i < units.length - 1) {
      value /= 1024;
      i++;
    }
    return (value >= 10 ? Math.round(value) : Math.round(value * 10) / 10) + ' ' + units[i];
  }

  var scriptCache = {};

  function loadScript(src) {
    if (scriptCache[src]) return scriptCache[src];
    scriptCache[src] = new Promise(function (resolve, reject) {
      var node = document.createElement('script');
      node.src = src;
      node.async = true;
      node.onload = function () { resolve(); };
      node.onerror = function () {
        delete scriptCache[src];
        reject(new Error('资源加载失败：' + src));
      };
      document.head.appendChild(node);
    });
    return scriptCache[src];
  }

  function ensureMarkdownLibs() {
    var jobs = [];
    if (typeof window.marked === 'undefined') jobs.push(loadScript(MARKED_URL));
    if (typeof window.DOMPurify === 'undefined') jobs.push(loadScript(PURIFY_URL));
    return Promise.all(jobs).then(function () {
      if (typeof window.marked === 'undefined' || typeof window.DOMPurify === 'undefined') {
        throw new Error('Markdown 渲染库未能正确加载');
      }
    });
  }

  // ---------------------------------------------------------------- //
  // 预览器
  // ---------------------------------------------------------------- //

  var viewer = null;
  var viewerStyles = null;
  var openSequence = 0;

  function ensureViewerStyles() {
    if (!viewerStyles) {
      viewerStyles = new Promise(function (resolve, reject) {
        var link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = VIEWER_CSS_URL;
        link.onload = resolve;
        link.onerror = function () {
          viewerStyles = null;
          link.remove();
          reject(new Error('预览器样式加载失败'));
        };
        document.head.appendChild(link);
      });
    }
    return viewerStyles;
  }

  function buildViewer() {
    var root = el('div', 'atc-viewer');
    root.setAttribute('role', 'dialog');
    root.setAttribute('aria-modal', 'true');
    root.setAttribute('aria-label', '附件预览');

    var backdrop = el('div', 'atc-backdrop');
    var win = el('div', 'atc-window');

    var bar = el('div', 'atc-bar');
    var info = el('div', 'atc-bar-info');
    var name = el('div', 'atc-bar-name');
    var sub = el('div', 'atc-bar-sub');
    info.appendChild(name);
    info.appendChild(sub);

    var actions = el('div', 'atc-bar-actions');

    var download = document.createElement('a');
    download.className = 'atc-bar-btn atc-bar-download';
    download.setAttribute('download', '');
    download.setAttribute('rel', 'noopener');
    download.setAttribute('aria-label', '下载附件');
    download.innerHTML = '<i class="fa fa-download" aria-hidden="true"></i>'
      + '<span class="atc-btn-text">下载</span>';

    var close = document.createElement('button');
    close.type = 'button';
    close.className = 'atc-bar-btn atc-bar-close';
    close.setAttribute('aria-label', '关闭预览');
    close.innerHTML = '<i class="fa fa-times" aria-hidden="true"></i>';

    actions.appendChild(download);
    actions.appendChild(close);
    bar.appendChild(info);
    bar.appendChild(actions);

    var body = el('div', 'atc-body');

    win.appendChild(bar);
    win.appendChild(body);
    root.appendChild(backdrop);
    root.appendChild(win);
    document.body.appendChild(root);

    backdrop.addEventListener('click', closeViewer);
    close.addEventListener('click', closeViewer);

    return {
      root: root, window: win, bar: bar, body: body,
      name: name, sub: sub, download: download, close: close,
      lastFocus: null, scrollY: 0, open: false, token: 0
    };
  }

  function getViewer() {
    if (!viewer || !document.body.contains(viewer.root)) {
      viewer = buildViewer();
    }
    return viewer;
  }

  function setState(body, opts) {
    body.className = 'atc-body';
    body.textContent = '';

    var wrap = el('div', 'atc-state' + (opts.error ? ' atc-state-error' : ''));
    var icon = el('div', 'atc-state-icon');
    icon.innerHTML = '<i class="fa ' + (opts.icon || 'fa-file') + '" aria-hidden="true"></i>';
    wrap.appendChild(icon);
    wrap.appendChild(el('div', 'atc-state-title', opts.title));
    if (opts.desc) wrap.appendChild(el('div', 'atc-state-desc', opts.desc));

    if (opts.url) {
      var box = el('div', 'atc-state-actions');
      var link = document.createElement('a');
      link.className = 'atc-state-btn';
      link.href = opts.url;
      link.setAttribute('download', '');
      link.setAttribute('rel', 'noopener');
      link.innerHTML = '<i class="fa fa-download" aria-hidden="true"></i>'
        + '<span>' + (opts.action || '下载文件') + '</span>';
      box.appendChild(link);
      wrap.appendChild(box);
    }

    body.appendChild(wrap);
  }

  function openViewer(data) {
    var sequence = ++openSequence;
    document.querySelectorAll('.atc-card[aria-busy]').forEach(function (card) { card.removeAttribute('aria-busy'); });
    var oldError = data.card.querySelector('.atc-load-error');
    if (oldError) oldError.remove();
    data.card.setAttribute('aria-busy', 'true');
    ensureViewerStyles().then(function () {
      if (sequence === openSequence && document.body.contains(data.card)) displayViewer(data);
    }).catch(function () {
      if (sequence !== openSequence || !document.body.contains(data.card)) return;
      var message = el('span', 'atc-load-error', '预览暂不可用，请重试或下载附件。');
      message.setAttribute('role', 'status');
      data.card.querySelector('.atc-meta').appendChild(message);
    }).finally(function () {
      if (sequence === openSequence) data.card.removeAttribute('aria-busy');
    });
  }

  function displayViewer(data) {
    var v = getViewer();
    var token = ++v.token;

    v.name.textContent = data.name;
    v.sub.textContent = data.size ? data.label + ' · ' + data.size : data.label;
    v.download.href = data.url;
    v.download.setAttribute('download', '');

    if (!v.open) {
      v.lastFocus = document.activeElement;
      v.scrollY = window.pageYOffset || document.documentElement.scrollTop || 0;
      document.documentElement.classList.add('atc-locked');
      v.root.style.display = '';
      v.open = true;
      // 下一帧再加 class，保证过渡动画生效
      requestAnimationFrame(function () { v.root.classList.add('atc-open'); });
      document.addEventListener('keydown', onKeydown, true);
    }

    v.close.focus();
    setState(v.body, { icon: 'fa-spinner fa-pulse', title: '正在载入…' });

    render(v, data, token);
  }

  function closeViewer() {
    openSequence++;
    document.querySelectorAll('.atc-card[aria-busy]').forEach(function (card) { card.removeAttribute('aria-busy'); });
    var v = viewer;
    if (!v || !v.open) return;

    v.open = false;
    v.token++;
    v.root.classList.remove('atc-open');
    document.removeEventListener('keydown', onKeydown, true);
    document.documentElement.classList.remove('atc-locked');
    window.scrollTo(0, v.scrollY);

    var focusBack = v.lastFocus;
    v.lastFocus = null;

    window.setTimeout(function () {
      if (v.open) return;
      v.root.style.display = 'none';
      v.body.className = 'atc-body';
      v.body.textContent = '';
    }, 220);

    // 关闭后把焦点还给触发预览的元素
    if (focusBack && document.body.contains(focusBack) && focusBack.focus) {
      focusBack.focus();
    }
  }

  function onKeydown(e) {
    var v = viewer;
    if (!v || !v.open) return;

    if (e.key === 'Escape' || e.key === 'Esc' || e.keyCode === 27) {
      e.preventDefault();
      e.stopPropagation();
      closeViewer();
      return;
    }

    if (e.key === 'Tab' || e.keyCode === 9) {
      trapFocus(e, v);
    }
  }

  // 把 Tab 焦点限制在浮层内部
  function trapFocus(e, v) {
    var focusable = v.window.querySelectorAll(
      'a[href], button:not([disabled]), iframe, [tabindex]:not([tabindex="-1"])'
    );
    var list = Array.prototype.filter.call(focusable, function (node) {
      return node.offsetWidth > 0 || node.offsetHeight > 0 || node === document.activeElement;
    });
    if (!list.length) return;

    var first = list[0];
    var last = list[list.length - 1];

    if (!v.window.contains(document.activeElement)) {
      e.preventDefault();
      first.focus();
      return;
    }
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  // ---------------------------------------------------------------- //
  // 各类型预览
  // ---------------------------------------------------------------- //

  function render(v, data, token) {
    var alive = function () { return v.open && v.token === token; };

    switch (data.kind) {
      case 'markdown':
        return renderMarkdown(v, data, alive);
      case 'text':
      case 'code':
        return renderPlain(v, data, alive);
      case 'pdf':
        return renderPdf(v, data);
      case 'image':
        return renderImage(v, data, alive);
      case 'office':
        return setState(v.body, {
          icon: 'fa-file-word',
          title: '该格式暂不支持网页预览',
          desc: (data.label || '此文件') + '需要下载后使用本地办公软件打开。',
          url: data.url
        });
      default:
        return setState(v.body, {
          icon: 'fa-file',
          title: '该格式暂不支持网页预览',
          desc: '可以下载后在本地打开此文件。',
          url: data.url
        });
    }
  }

  function fetchText(url) {
    return fetch(url, { credentials: 'same-origin' }).then(function (res) {
      if (!res.ok) {
        var err = new Error('HTTP ' + res.status);
        err.status = res.status;
        throw err;
      }
      var len = parseInt(res.headers.get('content-length') || '', 10);
      if (isFinite(len) && len > TEXT_LIMIT) {
        var big = new Error('文件过大');
        big.oversize = true;
        big.size = len;
        throw big;
      }
      return res.text().then(function (text) {
        return { text: text, bytes: isFinite(len) ? len : null };
      });
    });
  }

  function failState(v, data, err) {
    if (err && err.oversize) {
      setState(v.body, {
        icon: 'fa-file',
        title: '文件较大，已跳过在线预览',
        desc: '该文件约 ' + formatBytes(err.size) + '，直接下载查看会更快。',
        url: data.url
      });
      return;
    }

    var desc;
    if (err && err.status === 404) {
      desc = '服务器返回 404，附件路径可能已经变更或文件尚未上传。';
    } else if (err && err.status) {
      desc = '服务器返回 HTTP ' + err.status + '，请稍后重试。';
    } else {
      desc = '网络请求失败，请检查网络连接后重试。';
    }

    setState(v.body, {
      icon: 'fa-exclamation-triangle',
      title: '附件读取失败',
      desc: desc,
      url: data.url,
      error: true,
      action: '直接下载'
    });
  }

  function updateSizeFromBytes(v, data, bytes) {
    if (data.size || !bytes) return;
    var pretty = formatBytes(bytes);
    if (pretty) v.sub.textContent = data.label + ' · ' + pretty;
  }

  function renderPlain(v, data, alive) {
    fetchText(data.url).then(function (res) {
      if (!alive()) return;
      updateSizeFromBytes(v, data, res.bytes || res.text.length);
      v.body.className = 'atc-body';
      v.body.textContent = '';
      // 使用 textContent 写入，天然免疫 HTML 注入
      var pre = el('pre', 'atc-plain', res.text);
      v.body.appendChild(pre);
    }).catch(function (err) {
      if (!alive()) return;
      failState(v, data, err);
    });
  }

  function renderMarkdown(v, data, alive) {
    Promise.all([fetchText(data.url), ensureMarkdownLibs()]).then(function (out) {
      if (!alive()) return;
      var res = out[0];
      updateSizeFromBytes(v, data, res.bytes || res.text.length);

      var html = window.marked.parse(res.text, { gfm: true, breaks: false });

      // Marked 输出必须经过 DOMPurify 清理后才允许进入 DOM
      var fragment = window.DOMPurify.sanitize(html, {
        RETURN_DOM_FRAGMENT: true,
        ADD_ATTR: ['target', 'rel']
      });

      var holder = el('div', 'atc-markdown');
      holder.appendChild(fragment);
      resolveRelativeUrls(holder, data.url);

      v.body.className = 'atc-body';
      v.body.textContent = '';
      v.body.appendChild(holder);
    }).catch(function (err) {
      if (!alive()) return;
      if (err && /marked|DOMPurify|资源加载失败/.test(String(err.message || ''))) {
        setState(v.body, {
          icon: 'fa-exclamation-triangle',
          title: 'Markdown 渲染组件加载失败',
          desc: '未能加载本地 marked / DOMPurify，请确认 lib/attachment 下的文件已正确部署。',
          url: data.url,
          error: true,
          action: '直接下载'
        });
        return;
      }
      failState(v, data, err);
    });
  }

  // Markdown 中的相对图片与相对链接，以该 Markdown 文件所在目录为基准解析
  function resolveRelativeUrls(holder, mdUrl) {
    var base;
    try {
      base = new URL(mdUrl, window.location.href);
    } catch (err) {
      return;
    }

    var absolutize = function (value) {
      if (!value) return null;
      var trimmed = value.trim();
      // 锚点、协议地址、协议相对地址与 data: 保持原样
      if (/^#/.test(trimmed)) return null;
      if (/^[a-z][a-z0-9+.-]*:/i.test(trimmed)) return null;
      if (/^\/\//.test(trimmed)) return null;
      try {
        return new URL(trimmed, base).href;
      } catch (err) {
        return null;
      }
    };

    Array.prototype.forEach.call(holder.querySelectorAll('img[src]'), function (img) {
      var next = absolutize(img.getAttribute('src'));
      if (next) img.setAttribute('src', next);
      img.setAttribute('loading', 'lazy');
    });

    Array.prototype.forEach.call(holder.querySelectorAll('a[href]'), function (a) {
      var href = a.getAttribute('href') || '';
      if (/^#/.test(href.trim())) {
        // 页内锚点：在预览器内部滚动，不改变宿主页面地址
        a.addEventListener('click', function (e) {
          e.preventDefault();
          var id = decodeURIComponent(href.trim().slice(1));
          if (!id) return;
          var target = holder.querySelector('#' + (window.CSS && CSS.escape
            ? CSS.escape(id)
            : id.replace(/[^\w-]/g, '\\$&')));
          if (target && target.scrollIntoView) {
            target.scrollIntoView({ block: 'start' });
          }
        });
        return;
      }
      var next = absolutize(href);
      if (next) a.setAttribute('href', next);
      a.setAttribute('target', '_blank');
      a.setAttribute('rel', 'noopener noreferrer');
    });
  }

  function renderPdf(v, data) {
    v.body.className = 'atc-body atc-body-flush';
    v.body.textContent = '';
    var frame = document.createElement('iframe');
    frame.className = 'atc-frame';
    frame.src = data.url;
    frame.title = data.name;
    v.body.appendChild(frame);
  }

  function renderImage(v, data, alive) {
    v.body.className = 'atc-body atc-body-flush';
    v.body.textContent = '';
    var wrap = el('div', 'atc-image-wrap');
    var img = document.createElement('img');
    img.alt = data.name;
    img.onerror = function () {
      if (!alive()) return;
      failState(v, data, {});
    };
    img.src = data.url;
    wrap.appendChild(img);
    v.body.appendChild(wrap);
  }

  // ---------------------------------------------------------------- //
  // 事件委托
  // ---------------------------------------------------------------- //

  function dataFromCard(card) {
    return {
      card: card,
      url: card.getAttribute('data-atc-url') || '',
      name: card.getAttribute('data-atc-name') || '附件',
      ext: card.getAttribute('data-atc-ext') || '',
      kind: card.getAttribute('data-atc-kind') || 'binary',
      label: card.getAttribute('data-atc-label') || '文件',
      size: card.getAttribute('data-atc-size') || ''
    };
  }

  document.addEventListener('click', function (e) {
    var card = e.target.closest ? e.target.closest('.post-body .atc-card') : null;
    if (!card || card.classList.contains('atc-card-error')) return;
    // 下载按钮保持默认行为
    if (e.target.closest('.atc-btn-download')) return;

    e.preventDefault();
    openViewer(dataFromCard(card));
  });

  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Enter' && e.key !== ' ' && e.key !== 'Spacebar' && e.keyCode !== 13 && e.keyCode !== 32) return;

    var target = e.target;
    if (!target || !target.closest) return;
    // 内部按钮交给浏览器原生行为处理，避免重复触发
    if (target.closest('.atc-btn')) return;

    var card = target.closest('.post-body .atc-card');
    if (!card || card !== target || card.classList.contains('atc-card-error')) return;

    e.preventDefault();
    openViewer(dataFromCard(card));
  });

  // PJAX 场景：离开当前页面时先收起浮层，避免遮罩残留
  document.addEventListener('pjax:send', closeViewer);
})();
