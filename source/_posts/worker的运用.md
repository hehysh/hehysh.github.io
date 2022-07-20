---
title: cloudflare免费制作镜像站
tags: cloudflare
abbrlink: 4057
date: 2022-04-17 19:02:54
---
我发现了一个超级大宝贝儿————cloudflare
它慷慨的为我们提供了许多免费的服务，其中就有制作镜像站这一个。
<!-- more -->
因为本博客还没上线图片功能，所以...之后会上线的！
我们先到cloudflare到官网：www.cloudflare.com注册一个账号。
注册好了在左边栏里选workers，然后在下拉出的选项里选概述
选好了吗？好了，我们来创建一个workerworker，我们直接选免费计划...
cloudflare worker免费计划有一天十万次请求，这是什么概念？这意味着一般人用绰绰有余，约等于完全免费！
然后我们在worker的概述上点击蓝色按钮：快速编辑！然后你会进到一个类似于代码编辑器的地方
你将会看到页面被分割成了两半，我们能看到左半部分有代码，不用管它，把代码全部删掉，让左边栏空出来。接下来，我们复制以下的代码到左边栏里。
（*不会吧不会吧，还有人不知道点击一下代码块，代码块的右上角就会浮现出一个小小的一件复制按钮*）
```
// 反代目标网站.
const upstream = 'google.com'

// 反代目标网站的移动版.
const upstream_mobile = 'google.com'

// 访问区域黑名单（按需设置）.
const blocked_region = ['TK']

// IP地址黑名单（按需设置）.
const blocked_ip_address = ['0.0.0.0', '127.0.0.1']

// 路径替换.
const replace_dict = {
'$upstream': '$custom_domain',
'//archiveofourown.org': ''
}

addEventListener('fetch', event => {
event.respondWith(fetchAndApply(event.request));
})

async function fetchAndApply(request) {

const region = request.headers.get('cf-ipcountry').toUpperCase();
const ip_address = request.headers.get('cf-connecting-ip');
const user_agent = request.headers.get('user-agent');

let response = null;
let url = new URL(request.url);
let url_host = url.host;

if (url.protocol == 'http:') {
    url.protocol = 'https:'
    response = Response.redirect(url.href);
    return response;
}

if (await device_status(user_agent)) {
    var upstream_domain = upstream;
} else {
    var upstream_domain = upstream_mobile;
}

url.host = upstream_domain;

if (blocked_region.includes(region)) {
    response = new Response('Access denied: WorkersProxy is not available in your region yet.', {
        status: 403
    });
} else if(blocked_ip_address.includes(ip_address)){
    response = new Response('Access denied: Your IP address is blocked by WorkersProxy.', {
        status: 403
    });
} else{
    let method = request.method;
    let request_headers = request.headers;
    let new_request_headers = new Headers(request_headers);

    new_request_headers.set('Host', upstream_domain);
    new_request_headers.set('Referer', url.href);

    let original_response = await fetch(url.href, {
        method: method,
        headers: new_request_headers
    })

    let original_response_clone = original_response.clone();
    let original_text = null;
    let response_headers = original_response.headers;
    let new_response_headers = new Headers(response_headers);
    let status = original_response.status;

    new_response_headers.set('cache-control' ,'public, max-age=14400')
    new_response_headers.set('access-control-allow-origin', '*');
    new_response_headers.set('access-control-allow-credentials', true);
    new_response_headers.delete('content-security-policy');
    new_response_headers.delete('content-security-policy-report-only');
    new_response_headers.delete('clear-site-data');

    const content_type = new_response_headers.get('content-type');
    if (content_type.includes('text/html') && content_type.includes('UTF-8')) {
        original_text = await replace_response_text(original_response_clone, upstream_domain, url_host);
    } else {
        original_text = original_response_clone.body
    }

    response = new Response(original_text, {
        status,
        headers: new_response_headers
    })
}
return response;
}

async function replace_response_text(response, upstream_domain, host_name) {
let text = await response.text()

var i, j;
for (i in replace_dict) {
    j = replace_dict[i]
    if (i == '$upstream') {
        i = upstream_domain
    } else if (i == '$custom_domain') {
        i = host_name
    }
    
    if (j == '$upstream') {
        j = upstream_domain
    } else if (j == '$custom_domain') {
        j = host_name
    }

    let re = new RegExp(i, 'g')
    text = text.replace(re, j);
}
return text;
}


async function device_status (user_agent_info) {
var agents = ["Android", "iPhone", "SymbianOS", "Windows Phone", "iPad", "iPod"];
var flag = true;
for (var v = 0; v < agents.length; v++) {
    if (user_agent_info.indexOf(agents[v]) > 0) {
        flag = false;
        break;
    }
}
return flag;
}
```
其中：
```const upstream``` = '反代目标网站'
```const upstream_mobile``` = '反代目标网站的移动版'
```const blocked_region``` = 访问区域黑名单（按需设置）
```const blocked_ip_address``` = ['IP地址黑名单（按需设置）', '127.0.0.1']