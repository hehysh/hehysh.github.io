---
title: 【已翻车】Goorm服务器自定义域名大致思路版
abbrlink: 36990
date: 2022-07-31 03:52:27
tags:
categories:
---
最近一直在研究新嫖到的goorm vps
状态很不错，装了一些比较轻量的服务上去
但是不能自定义域名
直到最近装了一个叫做kuma的网站监控服务....
<!-- more -->
---
# 简略：大致思路版教程
**以下操作可能有封号风险，我瞄了一圈Goorm的服务条款，没说不允许打隧道，但还是有些风险，我于7月31日的10:48搭建完毕，截止发文还没被封号**
***本教程已翻车，可以退了，当然如果你能进行改进并且使翻车的概率更小，那么本思路或许能提供帮助***
先说说我的情况吧，我装的是kuma，理论上其他服务也可以
如果你装的是其他服务，请务必记录下它在localhost上的端口
比如kuma就装在goorm的vps服务上，3001端口
所以对于服务器，它的地址是http://localhost:3001
在官方文档里找到了一个kuma官方强力推荐的反向代理服务，使用它可以把kuma服务放到外网上，而且可以自定义域名！！！
我之前搭建了这个服务，目前是成功的，地址monitor.hehysh.eu.org
首先你得有个cloudflare账号
其实就是cloudflare的Cloudflare Tunnels，地址：https://dash.teams.cloudflare.com/
进去之后点击左边的Access，然后选Tunnels
随后Create a new tunnels
然后跟着cloudflare的指引做
第二步要输入的指令选debian系统，无cloudflared（崭新的goorm vps就是这样的）
直接进入goorm的面板（宝塔面板也行）
一套指令梭哈下来
等到下面显示了成功，点击next进入第三步
一共有两个填域名的地方，上面填你想要的自定义域名，注意要有cloudflare的Nameserver，托管在Cloudflare上的才可以，我的hehysh.eu.org本来就在cloudflare上面所以直接跳过
后面的/随意，kuma服务不支持path所以我没填，如果你打隧道是为了别的服务你可以随意
下面的原地址注意了，前面选http，然后后面填localhost：xxx
xxx是端口
然后就完事了，进入你的域名，成功自定义域名！！！！