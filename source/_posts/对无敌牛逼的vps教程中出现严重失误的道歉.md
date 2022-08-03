---
title: 对《无敌牛逼的vps》教程中出现严重失误的道歉
abbrlink: 12449
date: 2022-07-30 14:21:22
tags:
categories:
---
如题
<!-- more -->
---
# xssh仓库的秘密
前几天发了个嫖vps的教程，本意是为了补足原教程的不足，自己开了个补完教程
**结果我第一个教程就翻车了**
昨天用Railway的时候，就发现我的账号被标记为不安全，理由是我的账号“太新（刚注册的那种）或有不合法的仓库”，太新是不可能的，我的老GitHub账号开了大概一年了
那就只有不合法的仓库了，我检查了半天也没发现哪个仓库不合法
思来想去也许是Railway不想让我嫖了，于是找个理由把我号封了
后来才发现属实是以小人之心度君子之腹了
因为我在今天早上接到了GitHub发过来的信件
---
> Access to the ***（我的老GitHub号）/xssh repository has been disabled by GitHub staff due to a terms of service violation. You may contact us for more information or to request a review of this decision:
https://support.github.com/contact?subject=TOS+Review%3A+Hehysh1%2Fxssh&amp;tags=tos-vru
You may review our terms of service here:
https://docs.github.com/articles/github-terms-of-service

---

原来如此，原来是xssh仓库有问题，怪不得Railway报错
这个所谓的xxsh仓库就是之前嫖Okteto服务器时需要clone的仓库
结合之前我开了一个新号嫖Okteto，什么都没干却直接被封了
情况渐渐就明朗了起来
看一下之前Okteto给我的信件
---

>Hey there,
Your account has been permanently banned because you deployed https://github.com/Hehysh1/xssh.
This goes against our terms of service, as described on https://www.okteto.com/legal - please see Prohibited Actions - #15 "Use our Services to operate an "open proxy" or any other form of Internet proxy service that is capable of forwarding requests to any End User or third party-supplied Internet host."
Thanks,
The Okteto Support Team

---

其中提到了我违反了第十五条：不能搭建代理
当时我以为这个代理是VPN，现在想来应该是那个xssh仓库有问题
以下是我的猜测：
Okteto本身是不提供ssh服务的，我认为Okteto本身类似于GitHub Actions，你把GitHub Repo交给Okteto，他提供服务器来帮你运转Repo，的确和GitHub Actions很像但是xssh仓库提供了一种方式直接打通了Okteto服务器的ssh服务，结合教程中需要Ngrok服务，应该是搭建了一种代理，或者是内网穿透的隧道，以达到连接Okteto服务器的效果
看来Okteto和GitHub Actions遭受的经历也极其相像，GitHub Actions遭到有人使用ssh脚本白嫖大量服务器，还被黑客拿来挖矿。Okteto也是一样的，我估计也有人用它来挖矿了，毕竟有root权限
这次教程原地翻车给我留下了很大的震撼，看来以后学别人的教程还是要检查一下
这次只是封仓库，万一下次封号了呢？
这里也给遭到我教程影响的朋友们道个歉
---
# 船新的教程
溜了溜了，准备鼓捣下一个教程，搭建无敌美观还实用Umami来分析你网站的流量
这两天都在鼓捣Umami
希望这次不会翻车，接到这次的教程后我特意检查了很多遍，而且Umami官方也在官方文档里面留下了一件部署办法，经过了各大托管商的审查，应该是没什么问题的
另外我的博客的Umami界面已经搭建好了，真的无敌美观
档里面留下了一件部署办法，经过了各大托管商的审查，应该是没什么问题的
另外我的博客的Umami界面已经搭建好了，真的无敌美观
档里面留下了一件部署办法，经过了各大托管商的审查，应该是没什么问题的
另外我的博客的Umami界面已经搭建好了，真的无敌美观
档里面留下了一件部署办法，经过了各大托管商的审查，应该是没什么问题的
另外我的博客的Umami界面已经搭建好了，真的无敌美观
放一下连接🔗：
https://umami-shier.up.railway.app/share/n6l7iIbn/Blog