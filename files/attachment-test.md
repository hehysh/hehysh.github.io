# 附件预览器测试文档

这是一个用于验证 `{% attachment %}` 标签与沉浸式附件预览器的示例 Markdown 文件。
它本身位于 `source/files/` 目录下，并通过 `skip_render` 保持原样输出，
因此可以被前端 `fetch` 到原始文本后由本地 marked 渲染。

## 一、基础排版

普通段落文字，包含 **粗体**、*斜体*、~~删除线~~ 与 `行内代码`。

> 引用块：海压竹枝低复举，风吹山角晦还明。
> 第二行引用内容。

---

## 二、列表

无序列表：

- 第一项
- 第二项
  - 嵌套项 A
  - 嵌套项 B
- 第三项

有序列表：

1. 准备附件文件，放进 `source/files/`
2. 在文章里写下 `attachment` 标签
3. 执行 `hexo clean && hexo g`

任务列表：

- [x] 卡片渲染
- [x] 浮层预览
- [ ] 更多格式支持

## 三、表格

| 扩展名 | 预览方式 | 强调色 |
| ------ | -------- | ------ |
| md     | 本地 marked 渲染 | 主题链接色 |
| pdf    | iframe 内嵌      | 柔和红色   |
| xlsx   | 提示下载         | 柔和绿色   |
| pptx   | 提示下载         | 柔和橙色   |
| py     | 纯文本安全显示   | 柔和紫色   |
| png    | 图片预览         | 青蓝色     |

## 四、代码块

```js
// 预览器会把 Markdown 交给 marked 渲染，再由 DOMPurify 清理
const html = marked.parse(text, { gfm: true });
const safe = DOMPurify.sanitize(html, { RETURN_DOM_FRAGMENT: true });
```

```bash
hexo clean && hexo generate
```

## 五、相对路径解析

下面的图片使用相对路径 `../img/meng.png` 书写。
预览器会以本文件所在目录 `/files/` 为基准解析，最终指向 `/img/meng.png`：

![相对路径图片测试](../img/meng.png)

下面是一个相对链接，同样以 `/files/` 为基准解析：

[返回站点首页](../index.html)

外部链接则保持原样：[Hexo 官网](https://hexo.io/)

## 六、安全性验证

以下内容用于确认 DOMPurify 已经生效——脚本不会被执行，
危险属性会被剥离，只留下安全的文本或元素：

<script>window.__atcXssProbe = true;</script>

<img src="x" onerror="window.__atcXssProbe = true;">

<a href="javascript:window.__atcXssProbe=true">这是一个危险链接</a>

如果预览正常且控制台没有异常，说明清理链路工作正常。
