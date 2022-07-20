<div class="site-author motion-element" itemprop="author" itemscope itemtype="http://schema.org/Person">
  {%- if theme.avatar.url %}
    <img class="site-author-image" itemprop="image" alt="{{ author }}"
      src="{{ url_for(theme.avatar.url) }}">
  {%- endif %}
  <p class="site-author-name" itemprop="name">{{ author }}</p>
  <div class="site-description" itemprop="description"><div id="binft"></div>  
  <script>
    var binft = function (r) {
      function t() {
        return b[Math.floor(Math.random() * b.length)]
      }  
      function e() {
        return String.fromCharCode(94 * Math.random() + 33)
      }
      function n(r) {
        for (var n = document.createDocumentFragment(), i = 0; r > i; i++) {
          var l = document.createElement("span");
          l.textContent = e(), l.style.color = t(), n.appendChild(l)
        }
        return n
      }
      function i() {
        var t = o[c.skillI];
        c.step ? c.step-- : (c.step = g, c.prefixP < l.length ? (c.prefixP >= 0 && (c.text += l[c.prefixP]), c.prefixP++) : "forward" === c.direction ? c.skillP < t.length ? (c.text += t[c.skillP], c.skillP++) : c.delay ? c.delay-- : (c.direction = "backward", c.delay = a) : c.skillP > 0 ? (c.text = c.text.slice(0, -1), c.skillP--) : (c.skillI = (c.skillI + 1) % o.length, c.direction = "forward")), r.textContent = c.text, r.appendChild(n(c.prefixP < l.length ? Math.min(s, s + c.prefixP) : Math.min(s, t.length - c.skillP))), setTimeout(i, d)
      }
      var l = "",
      o = ["𝖘𝖊𝖎𝖓 𝖟𝖚𝖒 𝖙𝖔𝖉𝖊", "向死而生，反求诸己","日日待明日,万事成蹉跎","丈夫志四海，万里犹比邻","还在看这里吗？","能不能别看了？","文章更精彩...."].map(function (r) {
      return r + ""
      }),
      a = 2,
      g = 1,
      s = 5,
      d = 75,
      b = ["rgb(110,64,170)", "rgb(150,61,179)", "rgb(191,60,175)", "rgb(228,65,157)", "rgb(254,75,131)", "rgb(255,94,99)", "rgb(255,120,71)", "rgb(251,150,51)", "rgb(226,183,47)", "rgb(198,214,60)", "rgb(175,240,91)", "rgb(127,246,88)", "rgb(82,246,103)", "rgb(48,239,130)", "rgb(29,223,163)", "rgb(26,199,194)", "rgb(35,171,216)", "rgb(54,140,225)", "rgb(76,110,219)", "rgb(96,84,200)"],
      c = {
        text: "",
        prefixP: -s,
        skillI: 0,
        skillP: 0,
        direction: "forward",
        delay: a,
        step: g
      };
      i()
      };
      binft(document.getElementById('binft'));
  </script></div>
</div>

{%- if theme.site_state %}
<div class="site-state-wrap motion-element">
  <nav class="site-state">
    {%- if config.archive_dir != '/' and site.posts.length > 0 %}
      <div class="site-state-item site-state-posts">
        {%- if theme.menu.archives %}
          <a href="{{ url_for(theme.menu.archives.split('||')[0] | trim) }}">
        {% else %}
          <a href="{{ url_for(config.archive_dir) }}">
        {%- endif %}
          <span class="site-state-item-count">{{ site.posts.length }}</span>
          <span class="site-state-item-name">{{ __('state.posts') }}</span>
        </a>
      </div>
    {%- endif %}

    {%- if site.categories.length > 0 %}
      {%- set categoriesPageQuery = site.pages.find({type: 'categories'}, {lean: true}) %}
      {%- set hasCategoriesPage = categoriesPageQuery.length > 0 %}
      <div class="site-state-item site-state-categories">
        {%- if hasCategoriesPage %}
          {%- if theme.menu.categories %}
            <a href="{{ url_for(theme.menu.categories.split('||')[0] | trim) }}">
          {% else %}
            <a href="{{ url_for(config.category_dir) + '/' }}">
          {%- endif %}
        {%- endif %}
        <span class="site-state-item-count">{{ site.categories.length }}</span>
        <span class="site-state-item-name">{{ __('state.categories') }}</span>
        {%- if hasCategoriesPage %}</a>{%- endif %}
      </div>
    {%- endif %}

    {%- if site.tags.length > 0 %}
      {%- set tagsPageQuery = site.pages.find({type: 'tags'}, {lean: true}) %}
      {%- set hasTagsPage = tagsPageQuery.length > 0 %}
      <div class="site-state-item site-state-tags">
        {%- if hasTagsPage %}
          {%- if theme.menu.tags %}
            <a href="{{ url_for(theme.menu.tags.split('||')[0] | trim) }}">
          {% else %}
            <a href="{{ url_for(config.tag_dir) + '/' }}">
          {%- endif %}
        {%- endif %}
        <span class="site-state-item-count">{{ site.tags.length }}</span>
        <span class="site-state-item-name">{{ __('state.tags') }}</span>
        {%- if hasTagsPage %}</a>{%- endif %}
      </div>
    {%- endif %}
  </nav>
</div>
{%- endif %}

{%- if theme.chat.enable and theme.chat.service !== '' %}
  <div class="sidebar-button motion-element">
  {%- if theme.chat.service == 'chatra' and theme.chatra.enable %}
    <a onclick="Chatra('openChat', true);">
  {%- endif %}
  {%- if theme.chat.service == 'tidio' and theme.tidio.enable %}
    <a onclick="tidioChatApi.open();">
  {%- endif %}
  {%- if theme.chat.icon %}<i class="{{ theme.chat.icon }}"></i>{%- endif %}
    {{ theme.chat.text }}
  </a>
  </div>
{%- endif %}

{%- if theme.social %}
  <div class="links-of-author motion-element">
    {%- for name, link in theme.social %}
      <span class="links-of-author-item">
      {%- set sidebarURL = link.split('||')[0] | trim %}
      {%- if theme.social_icons.enable %}
        {%- set sidebarIcon = '<i class="' + link.split('||')[1] | trim + ' fa-fw"></i>' %}
      {%- else %}
        {%- set sidebarIcon = '' %}
      {%- endif %}
      {%- if theme.social_icons.enable and theme.social_icons.icons_only %}
        {%- set sidebarText = '' %}
      {%- else %}
        {%- set sidebarText = name %}
      {%- endif %}
        {{ next_url(sidebarURL, sidebarIcon + sidebarText, {title: name + ' → ' + sidebarURL}) }}
      </span>
    {%- endfor %}
  </div>
{%- endif %}

{%- if theme.creative_commons.license and theme.creative_commons.sidebar %}
  <div class="cc-license motion-element" itemprop="license">
  {%- set ccImage = '<img src="' + url_for(theme.images + '/cc-' + theme.creative_commons.license + '.svg') + '" alt="Creative Commons">' %}
    {{ next_url(ccURL, ccImage, {class: 'cc-opacity'}) }}
  </div>
{%- endif %}

{# Blogroll #}
{%- if theme.links %}
  <div class="links-of-blogroll motion-element">
    <div class="links-of-blogroll-title">
      {%- if theme.links_settings.icon %}<i class="{{ theme.links_settings.icon }} fa-fw"></i>{%- endif %}
      {{ theme.links_settings.title }}
    </div>
    <ul class="links-of-blogroll-list">
      {%- for blogrollText, blogrollURL in theme.links %}
        <li class="links-of-blogroll-item">
          {{ next_url(blogrollURL, blogrollText, {title: blogrollURL}) }}
        </li>
      {%- endfor %}
    </ul>
  </div>
{%- endif %}
