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
<script async defer data-website-id="15ade081-0a74-4816-8b4b-df3719e3e6d0" src="https://umami-hehysh.vercel.app/umami.js"></script>