---
title: Umami+Kuma搭建教程二合一
abbrlink: 46701
date: 2022-08-03 12:40:20
tags:
categories:
---
呼～最近做的事可真多啊
最近顺手搭了几个挺实用的服务
像是Umami，Kuma，还有还在搭建的论坛
还顺手把一年前就注册好但一直没怎么用的hehysh.eu.org用上了
~其实这么久没用主要还是嫌它太长了~
但是发现有一个一级域名总比没有好
于是就把它用上了
现在我已经完成了域名的统一，你可以在[分站](https://www.hehysh.eu.org/sec-site/)里找到所有的分站以及它们的域名，真的贼多
freenom的域名不建议用，真的，因为一有流量就给你收走了
还是eu.org香
接下来稍微填一下之前的坑
<!-- more -->
---
# Umami
Umami是一个无敌美丽而且十分轻量的网站流量统计
我强烈建议你部署在Railway上
因为真的真的很方便
只需要你按一下Deploy on Railway的按钮，再填写一个变量HASH_SALT就可以迅速的搭建好了
你可以查看[我的umami统计](https://umami.hehysh.eu.org)以确定是否需要它
我给的建议是配合官方文档和另一位朋友写的教程食用（官方文档的作用是查找错误以及在官方文档里找到Deploy on Railway按钮）
[官方文档](https://umami.is/docs/getting-started)（进去之后往下翻，有一个Deploy on Railway的按钮）
[另一位朋友的教程](https://reorx.com/blog/deploy-umami-for-personal-website/)
我查阅了许多教程，最后成功的组合就是官方文档+另一位朋友的教程
搭建中没遇到什么问题，如果有的话，那就是Railway提示我的账号又问题
删了个有问题的仓库就好了
另：假如没有机器（安装在电脑上麻烦的一批），可以随便找个ide，机器与Umami没有关联，仅仅作为激活环境使用
gitpod.io就不错，在GitHub账号上建立一个只有readme.md的仓库，然后进入gitpod.io，注册账号，建立新workspace，选择之前建好的仓库，进入workspace。瞧！你现在有了一台机器可以方便的激活Railway的数据库了！
而且全程只需要浏览器和GitHub号，贼方便
---
# Kuma
Kuma是一个无敌美丽而且轻量的网站监测
可以监控网站是否404，链接速度怎么样
你可以看[我搭建好的Kuma](https://montior.hehysh.eu.org)，以确定你是否需要它
接下来，开始搭建吧！
首先你需要一台vps
如果没有可以看LYX的[Goorm vps白嫖](https://yisous.xyz/posts/14740f7c)
好，你现在有了一台vps，接下来就要开始部署Kuma了
官方文档写的十分详细，我只参照了官方文档就搭建完毕了
[官方文档-how to install](https://uptime.kuma.pet/docs/🔧-How-to-Install)
好，你现在搭建好了，Kuma已经运行在localhost:3001上了
可惜goorm的vps不支持映射端口自定义域名
没关系，少年啊，你有听过一个叫内网穿透的东西吗？
没错，这个问题已经解决啦，你可以看[这篇文章](https://www.hehysh.eu.org/posts/36990.html#more)
不过前提条件是你得有个域名，而且要挂在cloudflare上
如果条件不满足的话就去找其他内网穿透或者就用goorm的吧