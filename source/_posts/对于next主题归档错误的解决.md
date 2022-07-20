---
title: 对于next主题归档错误的解决
tags: hexo博客搭建
categories: 技术
abbrlink: 36000
date: 2022-04-05 20:35:03
---
我们都知道next主题有个东西叫做categories，就是主页上显示的那个「分类」
但是在当前版本的next（也许最新的没有），有一个致命的bug，会导致他显示错误
**同时，这个bug也适用于除了```home主页```的其他所有在侧边栏显示的页面**
<!-- more -->
首先，当我们的博客还没有categories页面的时候，我们会使用这个命令来创建一个categories页面
```hexo new page "categories"```
接下来，在你的博客的根目录/source 下会出现一个文件夹categories，里面会有一个index.md文件，但是做完了这些还不够，你还需要去主题配置文件```你的博客根目录/theme/next/_config.yml```里找到一个menu配置，内容如下
```
    menu:
      home: / || home
      #about: /about/ || user
      #tags: /tags/ || tags
      #categories: /categories/ || th
      archives: /archives/ || archive
      #schedule: /schedule/ || calendar 
```
我们要使一个页面在侧边栏生效，就需要取消掉一个选项前面的```#```号。
比如说我们要改categories项，让他显示在侧边栏，就把它改成这样：
```
    menu:
      home: /|| home
      #about: /about/|| user
      #tags: /tags/|| tags
      categories: /categories/|| th
      archives: /archives/|| archive
      #schedule: /schedule/ || calendar
```
以此类推
但问题就出在这里，我们把其中的一个选项放大来看
```categories: /categories/ || th```
我们可以发现在/和||中间还隔着一个空格
还记得我们[上次说的](https://hehysh.github.io/2022/04/05/%E6%B5%8B%E8%AF%95/#more)吗？
在hexo中：冒号后面要加空格，在这里也出现了同样的问题
在老版本中，/和||中间隔着一个空格是完全没关系的，但到了新版本，他就会像冒号后面不加空格一样显示错误，虽然规则改了，但文件还没改，这就导致出现了致命的bug
具体错误会像这样，当你点击侧边栏界面是，页面会显示
```Cannot GET /%20```
其中%20是空格的意思，这就让我们确认了是空格导致的问题
我们把错误的内容改成这样⬇️
```
    menu:
      home: /||home
      about: /about/||user
      tags: /tags/||tags
      categories: /categories/||th
      archives: /archives/||archive
      #schedule: /schedule/||calendar
```
然后保存，再重新部署
over！搞定辣！