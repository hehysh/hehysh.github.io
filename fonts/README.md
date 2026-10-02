# 博客字体资源

这里的 WOFF2 是可直接部署的静态资源，正常 `hexo generate` 不需要 Python 或字体处理工具。

## 文楷

- 来源：`lxgw-wenkai-webfont@1.7.0` 的常规字重分片。
- 原字体版权：Copyright 2021–2023 LXGW；Copyright 2020 The Klee Project Authors。字体文件保留上游版权元数据。
- 许可：字体使用 SIL Open Font License 1.1（`OFL.txt`）；上游 webfont 包的 MIT 许可见 `WEBFONT-LICENSE.txt`。
- 改动：选取当前首页与交互文案的字形，保留 OpenType 排版表，合并为 1,206 字符的 WOFF2；内部名称改为 Qingque WenKai Core。
- 文件：`wenkai-core-7f21c0bc6a7f.woff2`，255,560 字节。
- `../css/blog-fonts.css` 将这些字符路由到本地字体；其他字符仍使用固定版本的 CDN 分片。新增文章不需要重新裁剪才能正常显示。

## 图标

- 来源：Font Awesome Free 6.1.1，使用该版本的原始 TTF 生成 WOFF2 子集。
- 许可：`FONT-AWESOME-LICENSE.txt`，包含字体、图标与样式的许可条款。
- 改动：保留博客及主题引用的图标，内部字体名称改为 Qingque Icons；不修改图案。
- Brands：2,928 字节；Regular：2,452 字节；Solid：4,624 字节。
- `../css/blog-icons.css` 保留上游全部图标类、旧版字体别名及 CDN 回退。未被本地子集覆盖的图标仍可使用。

## 手动更新（不是构建步骤）

工具位于仓库 `tools/subset-wenkai.py` 和 `tools/subset-icons.py`，依赖 `fonttools[woff]`。本次处理工具只安装在临时目录，没有加入博客依赖。

文楷输入 CSS：
`https://cdn.jsdelivr.net/npm/lxgw-wenkai-webfont@1.7.0/lxgwwenkai-regular.css`

按 CSS 中的文件名下载需要的 `files/*.woff2`。字符清单保存在 `tools/wenkai-characters.txt`。工具会合并所提供分片中覆盖清单的字符，为未覆盖字符保留上游回退。

```sh
python3 tools/subset-wenkai.py --css /tmp/regular.css --parts /tmp/wenkai-parts --characters tools/wenkai-characters.txt
```

图标输入 CSS：
`https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.1.1/css/all.min.css`

图标 TTF：
`https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.1.1/webfonts/` 下的 `fa-brands-400.ttf`、`fa-regular-400.ttf`、`fa-solid-900.ttf`。图标类清单保存在 `tools/icon-classes.txt`。

```sh
python3 tools/subset-icons.py --css /tmp/all.min.css --fonts /tmp/icon-ttf --classes tools/icon-classes.txt
```

输出文件名包含内容哈希。更新清单并重新处理后，应一起保留对应 CSS、字体及许可证；发布新 CSS 后再处理不再引用的旧字体文件，避免浏览器缓存中的旧 CSS 失效。
