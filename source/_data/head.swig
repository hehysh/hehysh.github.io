<script> 
 (function(){
        if('{{ page.password }}'){
            if (prompt('请输入文章密码') !== '{{ page.password }}'){
                alert('密码错误！');
                history.back();
            }
        }
    })();
</script>
<script async defer data-website-id="77f05f81-e104-43c7-8856-9b5277b33330" src="https://umami-good.vercel.app/umami.js"></script>