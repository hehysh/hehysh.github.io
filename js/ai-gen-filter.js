(function () {
  'use strict';

  // PJAX 或重复载入脚本时只注册一次事件。
  if (window.aiGenFilterInitialized) return;
  window.aiGenFilterInitialized = true;

  var COOKIE_NAME = 'ai_gen_consent';
  var consent = getConsent();
  var home = null;
  var posts = [];
  var groups = [];
  var preference = null;
  var emptyMessage = null;
  var nextPostId = 0;

  function getConsent() {
    try {
      var match = document.cookie.match(new RegExp('(?:^|;\\s*)' + COOKIE_NAME + '=([^;]*)'));
      var value = match ? decodeURIComponent(match[1]) : null;
      return value === 'yes' || value === 'no' ? value : null;
    } catch (e) {
      return null;
    }
  }

  function saveConsent(value) {
    // Cookie 不可用时，本次浏览中的切换仍然生效。
    consent = value;
    document.documentElement.setAttribute('data-ai-gen-consent', value);
    try {
      document.cookie = COOKIE_NAME + '=' + value + '; path=/; max-age=31536000; SameSite=Lax';
    } catch (e) { /* 浏览器可能禁用了 Cookie。 */ }
    groups.forEach(function (group) { group.expanded = false; });
    applyPreference();
  }

  function normalize(href) {
    try {
      return new URL(href, location.href).pathname;
    } catch (e) {
      return href;
    }
  }

  function renderGroup(group) {
    var hidden = consent === 'no' || !group.expanded;
    group.element.hidden = consent === 'no';
    group.button.setAttribute('aria-expanded', String(!hidden));
    group.button.querySelector('.ai-gen-group-action').textContent = group.expanded ? '收起' : '展开';
    group.posts.forEach(function (post) {
      post.element.classList.toggle('ai-gen-post-expanded', !hidden);
      post.element.classList.toggle('ai-gen-post-hidden', hidden);
    });
  }

  function createGroup(run) {
    if (run.length < 2) return;

    var element = document.createElement('section');
    element.className = 'ai-gen-ui ai-gen-group';
    element.innerHTML =
      '<button class="ai-gen-group-toggle" type="button" aria-expanded="false">' +
        '<span class="ai-gen-group-info">' +
          '<span class="ai-gen-group-label"></span>' +
          '<span class="ai-gen-group-titles"></span>' +
        '</span>' +
        '<span class="ai-gen-group-action">展开</span>' +
      '</button>';

    var button = element.querySelector('button');
    button.querySelector('.ai-gen-group-label').textContent = run.length + ' 篇连续的 AI-gen 文章';
    button.querySelector('.ai-gen-group-titles').textContent = run.map(function (post) {
      return post.title;
    }).join(' / ');
    button.setAttribute('aria-controls', run.map(function (post) {
      if (!post.element.id) post.element.id = 'ai-gen-post-' + (++nextPostId);
      return post.element.id;
    }).join(' '));

    var group = { element: element, button: button, posts: run, expanded: false };
    button.addEventListener('click', function () {
      group.expanded = !group.expanded;
      renderGroup(group);
      window.dispatchEvent(new Event('resize'));
    });
    home.insertBefore(element, run[0].element);
    groups.push(group);
  }

  function prepareHome() {
    // NexT 的首页标记也适用于分页、子目录和自定义分页路径。
    var container = document.querySelector('.main-inner.index.posts-expand');
    if (!container) {
      home = null;
      posts = [];
      groups = [];
      return;
    }

    var blocks = Array.prototype.filter.call(container.children, function (element) {
      return element.classList.contains('post-block');
    });
    if (container === home && blocks.length === posts.length && blocks.every(function (block, i) {
      return block === posts[i].element;
    })) return;

    home = container;
    groups = [];
    // 新生成的首页直接复用静态结构，初始化不再改变首屏布局。
    if (home.querySelector('.ai-gen-preference') && blocks.every(function (block) {
      return block.hasAttribute('data-ai-gen');
    })) {
      posts = blocks.map(function (block) {
        return { element: block, isAI: block.getAttribute('data-ai-gen') === 'true' };
      });
      preference = home.querySelector('.ai-gen-preference');
      emptyMessage = home.querySelector('.ai-gen-empty');
      preference.querySelector('button').addEventListener('click', showModal);
      home.querySelectorAll('.ai-gen-group').forEach(function (element) {
        var id = element.getAttribute('data-ai-gen-group');
        var button = element.querySelector('button');
        var group = {
          element: element, button: button, expanded: false,
          posts: posts.filter(function (post) { return post.element.getAttribute('data-ai-gen-group') === id; })
        };
        button.addEventListener('click', function () {
          group.expanded = !group.expanded;
          renderGroup(group);
          window.dispatchEvent(new Event('resize'));
        });
        groups.push(group);
      });
      return;
    }
    home.querySelectorAll('.ai-gen-ui').forEach(function (element) { element.remove(); });
    var aiPaths = (window.AI_GEN_POSTS || []).map(normalize);
    posts = blocks.map(function (block) {
      // 只依据文章自己的永久链接识别，避免正文引用 AI 文章导致误隐藏。
      var link = block.querySelector('article > link[itemprop="mainEntityOfPage"]') ||
        block.querySelector('.post-title-link');
      var title = block.querySelector('.post-title');
      return {
        element: block,
        isAI: !!link && aiPaths.indexOf(normalize(link.getAttribute('href'))) !== -1,
        title: title ? title.textContent.trim() : '未命名文章'
      };
    });

    preference = document.createElement('aside');
    preference.className = 'ai-gen-ui ai-gen-preference';
    preference.setAttribute('aria-label', 'AI-gen 阅读偏好');
    preference.innerHTML = '<span class="ai-gen-preference-status" role="status"></span>' +
      '<button type="button" class="ai-gen-text-button">显示设置</button>';
    preference.querySelector('button').addEventListener('click', showModal);
    home.insertBefore(preference, blocks[0] || home.firstChild);

    var run = [];
    posts.forEach(function (post) {
      if (post.isAI) {
        run.push(post);
      } else {
        createGroup(run);
        run = [];
      }
    });
    createGroup(run);

    emptyMessage = document.createElement('p');
    emptyMessage.className = 'ai-gen-ui ai-gen-empty';
    emptyMessage.textContent = '本页文章均带有 AI-gen 标签。可更改显示设置，或通过分页继续浏览。';
    preference.insertAdjacentElement('afterend', emptyMessage);
  }

  function applyPreference() {
    if (!home) return;
    var aiCount = posts.filter(function (post) { return post.isAI; }).length;
    posts.forEach(function (post) {
      post.element.classList.toggle('ai-gen-post-hidden', consent === 'no' && post.isAI);
    });
    groups.forEach(renderGroup);
    if (!preference.querySelector('.ai-gen-status-shown')) {
      preference.querySelector('.ai-gen-preference-status').textContent = consent === 'no'
        ? 'AI-gen 文章已隐藏 · 本页 ' + aiCount + ' 篇'
        : 'AI-gen 文章已显示 · 连续文章默认折叠';
    }
    emptyMessage.hidden = !(consent === 'no' && aiCount > 0 && aiCount === posts.length);
    window.dispatchEvent(new Event('resize'));
  }

  function showModal() {
    if (document.getElementById('ai-gen-modal')) return;
    var dialog = document.createElement('dialog');
    dialog.id = 'ai-gen-modal';
    dialog.className = 'ai-gen-ui ai-gen-dialog';
    dialog.setAttribute('aria-labelledby', 'ai-gen-dialog-title');
    dialog.setAttribute('aria-describedby', 'ai-gen-dialog-description ai-gen-dialog-note');
    dialog.innerHTML =
      '<button type="button" class="ai-gen-dialog-close" aria-label="暂不设置，关闭">×</button>' +
      '<p class="ai-gen-dialog-kicker">晴雀堂 · 阅读偏好</p>' +
      '<h2 id="ai-gen-dialog-title">要在首页显示 AI-gen 文章吗？</h2>' +
      '<p id="ai-gen-dialog-description">部分文章的主体内容由 AI 生成，已标记为 AI-gen。你可以按自己的阅读习惯选择是否显示。</p>' +
      '<p id="ai-gen-dialog-note" class="ai-gen-dialog-note">选择显示时，连续的 AI-gen 文章仍会默认折叠，点击即可展开。隐藏仅影响首页及其分页，归档、标签页和文章直链仍可访问。</p>' +
      '<div class="ai-gen-dialog-actions">' +
        '<button id="ai-gen-yes" type="button" class="ai-gen-button ai-gen-button-primary">显示 AI-gen 文章</button>' +
        '<button id="ai-gen-no" type="button" class="ai-gen-button">隐藏 AI-gen 文章</button>' +
      '</div>' +
      '<p class="ai-gen-dialog-hint">选择会保存在此浏览器中，之后可在首页「显示设置」中修改。</p>';

    dialog.querySelector('.ai-gen-dialog-close').addEventListener('click', function () { dialog.close(); });
    ['yes', 'no'].forEach(function (value) {
      var button = dialog.querySelector('#ai-gen-' + value);
      if (value === (consent || 'yes')) button.autofocus = true;
      button.addEventListener('click', function () {
        saveConsent(value);
        dialog.close();
      });
    });
    dialog.addEventListener('close', function () {
      document.documentElement.classList.remove('ai-gen-modal-open');
      dialog.remove();
    });
    document.body.appendChild(dialog);
    // 原生 dialog 提供焦点约束、Escape 关闭和关闭后的焦点恢复。
    dialog.showModal();
    document.documentElement.classList.add('ai-gen-modal-open');
  }

  function main() {
    if (!(window.AI_GEN_POSTS || []).length) return;
    prepareHome();
    applyPreference();
    if (!consent) showModal();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', main, { once: true });
  } else {
    main();
  }
  document.addEventListener('pjax:success', main);
})();
