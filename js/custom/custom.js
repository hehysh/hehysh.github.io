//阅读进度条
$(document).ready(function () {
    $(window).scroll(function(){
    $(".top-scroll-bar").attr("style", "width: " + ($(this).scrollTop() / ($(document).height() - $(this).height()) * 100) + "%; display: block;");
    var s=$(window).scrollTop();
    var a=$(document).height();
    var b=$(window).height();
    var result=parseInt(s/(a-b)*100);
    $(".top-scroll-bar").css("width",result+"%");
    if(result>=0&&result<=19)
    $(".top-scroll-bar").css("background","#cccccc");
    if(result>=20&&result<=39)
    $(".top-scroll-bar").css("background","#50bcb6");
    if(result>=40&&result<=59)
    $(".top-scroll-bar").css("background","#85c440");
    if(result>=60&&result<=79)
    $(".top-scroll-bar").css("background","#f2b63c");
    if(result>=80&&result<=99)
    $(".top-scroll-bar").css("background","#FF0000");
    if(result==100)
    $(".top-scroll-bar").css("background","#f58ca1");
    });
  });

// 折叠
$(document).ready(function(){
  $(document).on('click', '.fold_hider', function(){
    $('>.fold', this.parentNode).slideToggle();
    $('>:first', this).toggleClass('open');
  });
  //默认情况下折叠
  $("div.fold").css("display","none");
});