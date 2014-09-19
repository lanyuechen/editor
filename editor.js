/**
 * 2014-06-26 by Lanyuechen
 */
var myEditor = function(m){
    var container = '';         //编辑器容器
    var toolbar = '';           //工具栏容器
    var content = '';           //编辑区容器
    var editor = '';            //编辑器id（iframe）
    var files = {};             //用于保存即将上传的文件数组

    //默认工具栏
    var tools = [
        {"bold":"B","italic":"I","underline":"U","strikethrough":"S"},
        {"fontname":"Fn","fontsize":"Fs","fontcolor":"Fc","backcolor":"Bc"},
        {"justifyleft":"L","justifycenter":"C","JustifyRight":"R"},
        {"indent":"Li","outdent":"Ri"},
        {"insertunorderedlist":"ul","insertorderedlist":"ol"},
        {"createlink":"L","unlink":"uL"},
        {"undo":"U","redo":"R"},
        {"insertimage":"pic"},
        {"code":"<>","submit":"ok"}
    ];
    //默认字体     
    var fontNames = [
        'Serif', 'Sans', 'Arial', 'Arial Black', 'Courier', 'Courier New', 
        'Comic Sans MS', 'Helvetica', 'Impact', 'Lucida Grande', 'Lucida Sans',
        'Tahoma', 'Times', 'Times New Roman', 'Verdana'
    ];
    //默认字体颜色，如果没有设置背景颜色，则背景颜色与字体颜色相同
    var fontColors = [
        'aqua', 'black', 'blue', 'fuchsia', 'gray', 'green', 'lime', 'maroon', 
        'navy', 'olive', 'orange', 'purple', 'red', 'silver', 'teal', 'white', 'yellow'
    ];
    var backColors = fontColors;
    //默认字体大小
    var fontSizes = {"1":"特小","2":"偏小","3":"适中","4":"偏大","5":"特大"};

    var init = function() {
        initData();
        initClass();
        initEditor();
        initToolbar();
        addEvent();
        init_upload();
    };

    var initData = function() {
        container = document.getElementById(m.container);
        toolbar = document.getElementById(m.toolbar);
        content = document.getElementById(m.content);
        editor = document.getElementById(m.editor);
        tools = m.tools ? m.tools : tools;
        fontNames = m.fontnames ? m.fontnames : fontNames;
        fontSizes = m.fontSizes ? m.fontSizes : fontSizes;
        fontColors = m.fontColors ? m.fontColors : fontColors;
        backColors = m.backColors ? m.backColors : fontColors;
    };

    var initClass = function() {
        container.setAttribute('class', 'E-container');
        content.setAttribute('class', 'E-content');
        toolbar.setAttribute('class', 'E-toolbar');
        editor.setAttribute('class', 'E-editor');
    }

    //初始化编辑器
    var initEditor = function() {
        var doc = editor.contentDocument || editor.contentWindow.document; // W3C || IE
        doc.designMode="on";
        doc.contentEditable= true;
        var str = '<html><head><style>body{ margin:3px; word-wrap:break-word; word-break: break-all; }</style></head><body>start input word...</body></html>';
        doc.open();
        doc.write(str);
        doc.close();
    };

    //初始化工具栏
    var initToolbar = function() {
        var html ='';
        for(var i=0; i<tools.length; i++) {
            html += '<div class="E-group">';
            for(k in tools[i]) {
                html += fmtTool(k, tools[i][k]);
            }
            html += '</div>';
        }
        html += '<div style="clear:both;"></div>';
        toolbar.innerHTML = html;
    };

    var fmtTool = function(tool, name) {
        var html = '<div class="E-dropdown"><a class="E-drop" act="'+tool+'" href="javascript:;">'+name+'</a>';
        switch(tool) {
            case 'fontname':
                html += '<ul tar="fontname">' + getFontName() + '</ul></div>';
                break;
            case 'fontsize':
                html += '<ul tar="fontsize">' + getFontSize() + '</ul></div>';
                break;
            case 'fontcolor':
                html += '<ul tar="fontcolor">' + getFontColor() + '</ul></div>';
                break;
            case 'backcolor':
                html += '<ul tar="backcolor">' + getBackColor() + '</ul></div>';
                break;
            case 'createlink':
                html += '<ul tar="createlink" class="E-box"><input class="E-val" type="text" value="http://"><a rec="createlink" arg="E-val" href="javascript:;">确定</a></ul></div>';
                break;
            case 'insertimage':
                html += '<ul tar="insertimage" class="E-box2"><a act="inserturl" href="javascript:;">输入链接</a><a act="insertimage" href="javascript:;">本地上传';
                html += '<input id="E-files-upload" type="file" multiple="multiple"/></a></ul>';
                html += '<ul tar="inserturl" class="E-box"><input class="E-val" type="text" value="http://"><a rec="insertimage" arg="E-val" href="javascript:;">确定</a></ul></div>';
                break;
            case 'code':
                html = '<a fun="code" href="javascript:;">'+name+'</a>';
                break;
            case 'submit':
                html = '<a fun="submit" href="javascript:;">'+name+'</a>';
                break;
            default:
                html = '<a com="'+tool+'" href="javascript:;">'+name+'</a>';
        }
        return html;
    }

    var getFontName = function() {
        var html = '';
        for(var i=0; i<fontNames.length; i++) {
            html += '<li><a href="javascript:;" com="fontname" arg="'+fontNames[i]+'" style="font-family:\''+ fontNames[i] +'\'">'+ fontNames[i] + '</a></li>';
        }
        return html;
    };

    var getFontSize = function() {
        var html = '';
        for(k in fontSizes) {
            var height = (k-3)*5+30;
            html += '<li><a href="javascript:;" com="fontsize" arg="'+k+'" style="height:'+height+'px;line-height:'+height+'px;"><font size="'+k+'">'+fontSizes[k]+'</font></a></li>';
        }
        return html;
    };

    var getFontColor = function() {
        var html = '';
        for(var i=0; i<fontColors.length; i++) {
            html += '<li><a href="javascript:;" com="forecolor" arg="'+fontColors[i]+'" style="color:'+ fontColors[i] +'">'+ fontColors[i] + '</a></li>';
        }
        return html;
    };

    var getBackColor = function() {
        var html = '';
        for(var i=0; i<backColors.length; i++) {
            html += '<li><a href="javascript:;" com="backcolor" arg="'+backColors[i]+'" style="background:'+ backColors[i] +'">'+ backColors[i] + '</a></li>';
        }
        return html;
    };

    var uploadFile = function(id, file) {
        var xhr;
        
        // Uploading - for Firefox, Google Chrome and Safari
        xhr = new XMLHttpRequest();
        
        xhr.open("post", "upload.php", true);
        
        // Set appropriate headers
        xhr.setRequestHeader("Content-Type", "multipart/form-data");
        xhr.setRequestHeader("X-File-Name", file.name);
        xhr.setRequestHeader("X-File-Size", file.size);
        xhr.setRequestHeader("X-File-Type", file.type);
        xhr.setRequestHeader("X-File-Id", id);

        // Send the file (doh)
        xhr.send(file);

        // File uploaded
        xhr.onreadystatechange = function(e) {
            if (xhr.readyState == 4) {
                if (xhr.status == 200) {
                    var res = xhr.responseText;
                    console.log(res);
                    res = eval('('+res+')');
                    var img = editor.contentWindow.document.getElementById(res.id);
                    img.setAttribute('src', res.src);
                    img.removeAttribute('id');
                    delete(files[res.id]);
                } else {
                    var res = xhr.responseText;
                    console.log(res);  
                }
            }
        };
    };

    var preview = function(file){
        var reader;
    
        if (typeof FileReader !== "undefined" && (/image/i).test(file.type)) {
            reader = new FileReader();
            reader.onload = (function (evt) {
                var src = evt.target.result;
                exec('insertimage', src);
                var id = new Date().getTime() + '';
                id = id.substr(id.length-7, 7);
                var img = editor.contentWindow.document.getElementsByTagName('img');
                for(k in img){
                    if(img[k].getAttribute('src') == src){
                        var img_id = img[k].getAttribute('id');
                        console.log('img_id='+img_id);
                        if(img_id && img_id in files){
                            id = img_id;
                        }else{
                            img[k].setAttribute('id',id);
                            files[id] = file;
                            break;
                        }
                    }
                }
            });
            reader.readAsDataURL(file);
        }
    };

    var init_upload = function() {
        var filesUpload = document.getElementById("E-files-upload");
        filesUpload.addEventListener("change", function () {
            for (var i=0;i<this.files.length;i++) {
                preview(this.files[i]);
            };
        }, false);
    };

    var exec = function(cmd, arg) {
        var win = editor.contentWindow;
        win.document.execCommand(cmd, false, arg);
        win.focus();
    };

    var addEvent = function() {
        var a = toolbar.getElementsByTagName('a');
        for(var i=0; i<a.length; i++){
            if(a[i].getAttribute('com')){
                a[i].onclick = function(){
                    exec(this.getAttribute('com'), this.getAttribute('arg'));
                }
            }else if(a[i].getAttribute('act')){
                a[i].onclick = function(){
                    var ul = toolbar.getElementsByTagName('ul');
                    for(var j = 0; j<ul.length; j++){
                        if(ul[j].getAttribute('tar') === this.getAttribute('act')){
                            ul[j].style.display = 'block';
                        }else{
                            ul[j].style.display = 'none';
                        }
                    }
                }
            }else if(a[i].getAttribute('rec')){
                a[i].onclick = function(){
                    exec(this.getAttribute('rec'), this.previousSibling.value)
                }
            }else if(a[i].getAttribute('fun')){
                a[i].onclick = function(){
                    eval(this.getAttribute('fun')+'()');
                }
            }
        }
        editor.contentWindow.onfocus = function(){
            var ul = toolbar.getElementsByTagName('ul');
            for(var j = 0; j<ul.length; j++){
                ul[j].style.display = 'none';
            }
        }
    };

    var code = function() {
        var doc = editor.contentDocument || editor.contentWindow.document; // W3C || IE
        var html = doc.body.innerHTML;
        if(html.substr(0,5) !== '<xmp>'){
            html = '<xmp>' + html + '</xmp>';
        }else{
            html = html.substring(5,html.length - 6);
        }
        doc.body.innerHTML = html;
    };

    var submit = function() {
        var img = editor.contentWindow.document.getElementsByTagName('img');
        for(var i = 0; i<img.length; i++){
            var id = img[i].getAttribute('id');
            console.log('id='+id);
            if(id in files){
                uploadFile(id, files[id]);
            }
        }
    };
    init();
};