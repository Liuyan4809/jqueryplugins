layui.define(['laytpl', 'form'], function(exports) {
    "use strict";
    var $ = layui.jquery,
        layer = parent.layer === undefined ? layui.layer : parent.layer,
        form = layui.form,
        PROVINCE = 'province',
        CITY = 'city',
        PROVINCEID = 'provinceSel',
        CITYID = 'citySel',
        PROVINCE_TIPS = '请选择省',
        CITY_TIPS = '请选择市',
        pickerType = {
            province: 1, //省
            city: 2, //市
        },
        DATA = [];
    var Picker = function() {
        //默认设置
        this.config = {
            elem: undefined, //存在的容器 支持类选择器和ID选择器  e.g: [.class]  or  [#id]
            codeConfig: undefined, //初始值 e.g:{ code:440104,type:3 } 说明：code 为代码，type为类型 1：省、2：市、3：区/县
            data: undefined, //数据源，需要特定的数据结构,
            canSearch: false, //是否支持搜索
        };
        this.v = '1.0.0';
        //渲染数据
    };
    Picker.fn = Picker.prototype;
    //设置
    Picker.fn.set = function(options) {
        var that = this;
        if (options.data)
            DATA = options.data;
        $.extend(true, that.config, options);
        return that;
    };
    //渲染
    Picker.fn.render = function() {
        var that = this;
        var config = that.config,
            $elem = $(config.elem),
            getDatas = function(type, parentCode, selectCode) {
                if (DATA.length === 0)
                    throw new Error('PICKER ERROR:请设置数据源.');
                var data = [];
                var result = [];
                for (var i = 0; i < DATA.length; i++) {
                    var element = DATA[i];
                    if (element.parentCode == parentCode)
                        data.push(element);
                }
                for (var i = 0; i < data.length; i++) {
                    var e = data[i];
                    if (e.type == type) {
                        var isSelected = selectCode == e.code;
                        result.push({
                            code: e.code,
                            name: e.name,
                            isSelected: isSelected
                        });
                    }
                }
                return result;
            },
            getAreaCodeByCode = function(options) {
                if (DATA.length === 0)
                    throw new Error('PICKER ERROR:请设置数据源.');
                var data = DATA;
                var result = undefined;
                for (var i = 0; i < data.length; i++) {
                    var e = data[i];
                    if (e.type != options.type)
                        continue;
                    if (e.code == options.code) {
                        result = e;
                        break;
                    }
                }
                return result !== undefined ? result.path : result;
            },
            //外围模板
            tempContent = function(vid) {
                return '<form class="layui-form">' +
                    '<div class="layui-form-item" data-action="picker_' + vid + '">' +

                    '</div>' +
                    '</form>';
            },
            //拼接地区信息
            temp = function(filterName, tipInfo,id) {
            console.log(filterName,tipInfo)
                var html = '<div class="layui-input-inline" data-action="' + filterName + '">';
                if (config.canSearch) {
                    html += '<select id="'+id+'" name="' + filterName + '" lay-filter="' + filterName + '" lay-search>';
                } else {
                    html += '<select id="'+id+'" name="' + filterName + '" lay-filter="' + filterName + '">';
                }
                html += '<option value="">' + tipInfo + '</option>';
                html += '{{# layui.each(d, function(index, item){ }}';
                html += '{{# if(item.isSelected){ }}';
                html += '<option value="{{ item.code }}" selected>{{ item.name }}</option>';
                html += '{{# }else{ }}';
                html += '<option value="{{ item.code }}">{{ item.name }}</option>';
                html += '{{# }; }}';
                html += '{{#  }); }}';
                html += '</select>';
                html += '</div>';
                return html;
            },
            renderData = function(type, $picker, parentCode, selectCode, init) {
                var tempHtml = '';
                var filter = '';
                init = init === undefined ? true : init;
                var pickerFilter = {
                    province: PROVINCE + that.config.vid,
                    city: CITY + that.config.vid,
                };
                switch (type) {
                    case pickerType.province:
                        tempHtml = temp(pickerFilter.province, PROVINCE_TIPS,PROVINCEID);
                        filter = pickerFilter.province;
                        break;
                    case pickerType.city:
                        tempHtml = temp(pickerFilter.city, CITY_TIPS,CITYID);
                        filter = pickerFilter.city;
                        break;
                }
                if(type == "3"){
                    return;
                }
                layui.laytpl(tempHtml).render(getDatas(type, parentCode, selectCode), function(html) {
                    if (!init) {
                        var $has = $picker.find('div[data-action=' + filter + ']');
                        if ($has.length > 0) {
                            var $prev = $has.prev();
                            $prev.next().remove();
                            $prev.after(html);
                        } else {
                            $picker.append(html);
                        }
                    } else {
                        $picker.append(html);
                    }
                    form.on('select(' + filter + ')', function(data) {
                        switch (data.elem.name) {
                            case pickerFilter.province:
                                renderData(pickerType.city, $picker, data.value, undefined, false);
                                break;
                            case pickerFilter.city:

                                break;
                        }
                    });
                    form.render('select');
                });
            };
        config.vid = new Date().getTime();
        $elem.html(tempContent(config.vid));
        var $picker = $elem.find('div[data-action=picker_' + config.vid + ']');
        //如果需要初始化
        if (config.codeConfig) {
            //2018.9.12 处理历史地区为空的数据
            if(config.codeConfig.code == 0){
                renderData(pickerType.province, $picker, null, undefined, true);
                return;
            }
            var path = getAreaCodeByCode(config.codeConfig);
            var pType = config.codeConfig.type;
            var pCode = config.codeConfig.code;
            var arrPath = [];
            for (var i = 0; i < path.split(',').length; i++) {
                var e = path.split(',')[i];
                arrPath.push(e);
            }
            switch (pType) {
                case pickerType.province:
                    //渲染省
                    renderData(pickerType.province, $picker, null, arrPath[0]);
                    break;
                case pickerType.city:
                    //渲染省
                    renderData(pickerType.province, $picker, null, arrPath[0]);
                    //渲染市
                    renderData(pickerType.city, $picker, arrPath[0], arrPath[1]);
                    break;
            }
        } else {
            renderData(pickerType.province, $picker, null, undefined, true);
        }
    };

    exports('picker', Picker);
});