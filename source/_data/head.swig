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
<script async defer data-website-id="f96a0dc1-fec2-4e40-b224-4d4d6bd472fe" src="https://umami-gray.vercel.app/$TRACKER_SCRIPT_NAME.js"></script>