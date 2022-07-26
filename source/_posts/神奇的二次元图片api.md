---
title: 神奇的二次元图片api
abbrlink: 55523
date: 2022-05-10 17:23:27
tags:
categories: 技术
---
 又是美好的一天，正在刷着卷子，突然叮咚一声来了条微信消息。
<!-- more -->
>圆：兄弟啊，我这有个r18网站，要不来看看？

>我：什么还有这种好事速速发给我

>圆：https://arcxingye.github.io/r18/

一看这gayhub（划掉）网址就充满了浓浓的rick气息，但是着实是妙，没想到写着卷子居然有这种东西来诱惑我，我怎么可能会被这种东西诱惑呢？？
————于是打开了浏览器
输入地址，回车。一个充满二次元气息的界面出现在我眼前。神奇的是每次刷新背景都不同。二次元背景上有一个小提示框：“请选择：未满18岁/已满18岁。”
————果断选择已满18岁。好家伙，果然被rickroll了，我就说怎么会有这种好事，赶紧下载国家反诈APP（划掉）
试着回退，点击“未满18岁”，进入了一个叫星夜小游戏的网站，在里面溜达一圈发现了一个神秘链接，点进去，发现是arcxingye.io，试着找到这位兄台的Github主页，在里面发现了之前那个r18（伪）网站的源码，翻了一圈，找到了我比较感兴趣的实现每次刷新都会变的二次元背景的具体代码。
```
        .overlay {
            z-index: 2;
            display: flex;
            align-items: center;
            justify-content: center;
            background-image: url(https://iw233.cn/api.php?sort=mp);
            background-repeat: no-repeat;
            background-size: cover;
            background-position: center 0;
        }
```
找到关于```background-image```的代码，得到网址
[```https://iw233.cn/api.php?sort=mp```](https://iw233.cn/api.php?sort=mp)
*tips：上面链接可以直接点*
ok，我现在把他输入浏览器试试
非常好，这个网址的确可以稳定的产出优质二次元图，每一次刷新都会有一张新的，真不戳！
同时还顺便找到了Rick叔的视频，在这篇文章的结尾，让我们一起RickRoll起来！
Never Gonna Give You Up~~
[```https://vdse.bdstatic.com/192d9a98d782d9c74c96f09db9378d93.mp4```](https://vdse.bdstatic.com/192d9a98d782d9c74c96f09db9378d93.mp4)
*tips:上面链接可以直接点*

---
2022/7/25日更新
之前的二次元图片api已挂，可点如下链接获取新的
https://dev.iw233.cn/API/index.php
请支持原作者