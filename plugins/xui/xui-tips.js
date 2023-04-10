(function (win,$) {
    if(!$) {
        throw new Error('XuiTips 插件需要jQuery支持');
        return;
    }

    var index=0;
    var dialogs = [];

    //创建元素
    function createEle (title, content, time, hasX, closeCall, data) {
        var box = $("<div class='xui-dialog'>");
        box.attr('xui-dialog-id', index++);
        var titleE = $("<div class='xui-dialog-title'></div>");
        var contentE = $("<div class='xui-dialog-content'></div>")
        var x = $("<i class='xui-dialog-x'></i>");
        titleE.text(title);
        contentE.text(content);
        hasX && box.append(x) && x.on('click', function () {
            closeCall(box.attr('xui-dialog-id'),data);
        });
        if(time != false) {
            setTimeout(function () {
                XuiTips.close(box.attr('xui-dialog-id'));
            },time);
        }
        box.append(titleE).append(contentE);
        return box;
    }

    //构造函数
    var XuiTips = function (options) {
        if(!options || typeof options != 'object' ) {
            console.error("参数错误");
            return;
        }
        options = $.extend(
            {
                title: '提示',
                text: '这是一条提示',
                time:2000,
                closeBtn:true,
                close: function (i) {
                    XuiTips.close(i);
                }
            },options);
        var ele = createEle(options.title, options.text, options.time, options.closeBtn, options.close,options.data);
        $("body").append(ele);
        ani(ele);
        dialogs.push({ele: ele, height: ele.outerHeight()});
    }

    //元素动画
    function ani(ele) {
        var top = (function () {
            var height = 50;
            dialogs.forEach(function (item) {
                height += (item.height +20);
            });
            return height;
        })();
        ele.css('top', top+"px");
        setTimeout(function () {
            ele.css('right', '20px');
        },50);
    }

    //关闭弹窗
    XuiTips.close = function (i) {
        if(i) {
            $("[xui-dialog-id="+i+"]").css("opacity",0);
            setTimeout(function () {
                $("[xui-dialog-id="+i+"]").remove();
                dialogs.forEach(function (dialog,dialogidx) {
                    if(dialog.ele.attr('xui-dialog-id') == i) {
                        dialogs.splice(dialogidx,1);
                    }
                });
                //更新弹窗位置
                dialogs.forEach(function (dialog,dialogidx) {
                    var top = 50;
                    for(var j=0;j<dialogidx;j++) {
                        top += (dialogs[j].height +20);
                        if(top == 0) top=20;
                    }
                    dialog.ele.css("top", top);
                });
            },300);
        }
        else {
            $("[xui-dialog-id]").css("opacity",0);
            setTimeout(function () {
                $("[xui-dialog-id]").remove();
                dialogs=[];
            },300);
        }
    }

    win.XuiTips = XuiTips;
})(window,$);
