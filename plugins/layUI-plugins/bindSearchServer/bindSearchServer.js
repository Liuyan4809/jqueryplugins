;
(function($) {

  const // layui的常用变量
    DISABLED = 'layui-disabled',
    THIS = 'layui-this',
    CLASS = 'layui-form-select';


  /**
   * 获取layui原始的渲染DOM结构
   */
  function _getOriginal(placeholder,id) {
    let html = `
     <div class="layui-form-select search-server__${id}">
       <div class="layui-select-title">
         <input type="text" placeholder="${placeholder}" value="" class="layui-input">
         <i class="layui-edge"></i>
       </div>
       <dl class="layui-anim layui-anim-upbit">
         <dd lay-value="" class="layui-select-tips layui-this">${placeholder}</dd>
        </dl>
     </div>`;
     return html;
  }

  function Bob(that, options) {
    let g_showData = [], // 用于显示的数据
      // 默认配置
      g_default_option = {
        ele: that, // 绑定元素
        limit: 0, // 默认不做限制
        data: [], // 渲染的数据
        url: '', // 渲染的远程地址
        unique: 'id', // 唯一标识
        display: 'display', // 展示数据
        placeholder: '请选择' // 输入框的placeholder
      },
      $g_input, // 搜索输入框
      $g_target, // 渲染对象
      $g_title, // 渲染对象的title
      $g_anim; // 渲染对象的下拉容器


    let search = { // 注册查询方法
      local: function() { // 本地查询
        return function() {
          matching();
          renderData(g_showData);
        }
      },
      server: function(id) { // 服务器查询
        // 定时器索引
        let timeIndex = null;
        return function(e) {
          // 清空定时器
          clearTimeout(timeIndex);
          // 延时获取
          timeIndex = setTimeout(function() {
            // 获取服务器数据
            getData(g_default_option.url, $g_input.val()).then(function(data) {
              g_default_option.data = data;
              // 重新渲染
              renderData(data)
            });
          }, 1000);
        }
      }
    };

    // 初始化
    init(that, options);

    /**
     * 渲染原始layui框架
     */
    function init(that, options) {
      Object.assign(g_default_option, options);
      // 获取placeholder
      let placeholder = $(that.find('option')[0]).html() || g_default_option.placeholder;
      // 获取layui原始的渲染DOM结构
      let html = _getOriginal(placeholder,that.attr('id'));
      that.after(html);
      // 获取全局数据对象
      getGlobal(that);
      // 绑定事件
      bindEvent();
      // 重新渲染数据
      renderData(g_default_option.data);
    }

    /**
     * 绑定各种事件
     */
    function bindEvent() {
      $g_title.on('click', function() {
        $(document).find('.layui-form-select').not($g_target).removeClass('layui-form-selected');
        $g_target.toggleClass('layui-form-selected');
      });
      that.on('render', function() {
        Array.prototype.shift.call(arguments);
        g_default_option.data = arguments;
        // 重新渲染
        renderData(g_default_option.data);
      });
      // 绑定检索事件
      bindSearch();
      let fn = function(e) {
        let $t = $(e.target);
        // 设计下拉 - 主题
        if (!$t.closest('.search-server__'+that.attr('id')).length) {
          $g_target.removeClass('layui-form-selected');
        }
      }
      // 解绑事件
      $(document).off('click', fn);
      // 重新绑定
      $(document).on('click', fn);
    }


    /**
     * 设置全局数据
     */
    function getGlobal() {
      $g_target = that.next('.layui-form-select');
      $g_title = $g_target.find('.layui-select-title');
      $g_input = $g_title.find('.layui-input');
      $g_anim = $g_target.find('.layui-anim');
    }
    
    /**
     * 输入的检索匹配
     */
    function matching() {
      let val = $g_input.val();
      var re = new RegExp(val);
      g_showData = [];
      for (let i = 0, item; item = g_default_option.data[i++];) {
        if (re.test(item[g_default_option.display])) {
          g_showData.push(item);
        }
      }
    }

    /**
     * 绑定检索事件
     */
    function bindSearch() {
      // 解绑前一个渲染的输入事件
      $g_input.off('input');
      // 查看是否包含search属性
      if (g_default_option.url) {
        // 重新绑定输入事件 
        $g_input.on('input', search.server());
      } else {
        // 重新绑定输入事件
        $g_input.on('input', search.local());
      }
    }


    /**
     * 渲染数据
     * @param {Object} data
     */
    function renderData(data) {
      // 渲染的内容
      let content = renderOption(data);
      // 渲染服务端数据内容
      that.html(content.option);
      $g_anim.html(content.dd);
      // 绑定dd的点击选择事件
      bindDDclick();
    }


    /**
     * 绑定dd的点击选中事件
     * @param {Object} id 目标对象标识
     */
    function bindDDclick() {
      function fn() {
        var othis = $(this),
          value = othis.attr('lay-value');
        var input = $g_target.find('.layui-input');
        // 如果该选项被禁用则直接返回false
        if (othis.hasClass(DISABLED)) return false;
        if (othis.hasClass('layui-select-tips')) {
          input.val('');
          // 当点击下拉框"请选择"按钮时，初始化下拉框 start
          search.local()();
          // 当点击下拉框"请选择"按钮时，初始化下拉框 end
        } else {
          input.val(othis.text());
          othis.addClass(THIS);
        }
        othis.siblings().removeClass(THIS);
        that.val(value).removeClass('layui-form-danger').trigger('change', {
          value: value,
          display: othis.text()
        });
        hideDown(true,input);
        return false;
      }
      $g_target.find('.layui-anim dd').off('click', fn);
      $g_target.find('.layui-anim dd').on('click', fn);
    }

    //隐藏下拉
    function hideDown(choose, input) {
      $g_target.removeClass(CLASS + 'ed ' + CLASS + 'up');
      input.blur();
      $(document).find('.layui-form-select').removeClass('layui-form-selected');
      if (choose) return;
    }


    /**
     * 获取服务器数据
     * @param {Object} url 请求url地址
     * @param {Object} data 请求参数
     */
    function getData(url, data) {
      return new Promise(function(resolve, reject) {
        // 检索服务器数据
        $.ajax({
          type: "GET",
          url: url,
          data: data,
          dataType: 'json', // 服务器返回数据类型
          success: function(data) {
            resolve(data);
          }
        });
      });
    }

    /**
     * 渲染option
     * @param {Object} data 渲染数据
     */
    function renderOption(data) {
      let option = `<option value="">${g_default_option.placeholder}</option>`;
      let dd = `<dd lay-value="" class="layui-select-tips layui-this">${g_default_option.placeholder}</dd>`;
      for (let i = 0, len = data.length;
        (i < len) && (g_default_option.limit ? i < g_default_option.limit : true); i++) {
        option += `<option value="${data[i][g_default_option.unique]}">${data[i][g_default_option.display]}</option>`;
        dd += `<dd lay-value="${data[i][g_default_option.unique]}" class="">${data[i][g_default_option.display]}</dd>`;
      }
      return {
        option: option,
        dd: dd
      };
    }
  }



  $.fn.extend({
    "bindSearchServer": function(options) {
      new Bob(this, options);
      return this;
    }
  });
})(jQuery);
