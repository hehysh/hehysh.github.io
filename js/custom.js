
function randomPost() {
  fetch('/sitemap.xml').then(res => res.text()).then(str => (new window.DOMParser()).parseFromString(str, "text/xml")).then(data => {
      let ls = data.querySelectorAll('url loc');
      let locationHref,locSplit;
      do {
          locationHref = ls[Math.floor(Math.random() * ls.length)].innerHTML
          locSplit = locationHref.split('/')[3] || ''
      } while (locSplit == '' || locSplit == 'tags');
      //若所有文章都如 https://…….com/posts/2022/07/…… 格式，主域名后字符是 posts，则循环条件改为：
      //while (locSplit !== 'posts');
      location.href = locationHref
  })
}