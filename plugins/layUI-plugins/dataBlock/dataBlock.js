/**
 * 数据块块
 * 
 */

layui.define(['jquery'], function(exports){ //此处 mod1 为你的任意扩展模块
  let $ = layui.jquery;
  let index = 0;


  /**
   * 数据块
   */
  class DataBlock {

    constructor(index, def, dataConfig) {
      this.index = index;
      this.el = def.el;
      this.title = def.title;
      this.data = def.data;
      this.loading = def.loading;
      this.dataConfig = dataConfig;
    }

    getData(data) {
      return this.data;
    }
    setData(data) {
      this.data = data;
      this.render();
    }
    getTitle(title) {
      return this.title;
    }
    setTitle(title) {
      this.title = title;
      this.render();
    }
    getLoading(loading) {
      return this.loading;
    }
    setLoading(loading) {
      this.loading = loading;
      this.render();
    }

    render() {
      const that = this;
      let html = `
      <div class="data-block">
        <div class="data-block__title">${this.title}</div>
        <div class="data-block__content-warp data-block__content-warp--${this.index} swiper-container">
          <div class="swiper-wrapper">
            ${ (()=> that.data.map((item, index) => that.renderData(item.data, item, index)).join('') )() }
          </div>
        </div>
        ${(()=> {
          if(that.loading) {
            return `
              <div class="data-block__loding-shade">
              </div>
              <div class="data-block__loding"></div>
            `
          }
          return '';
        })()}
      </div>
      `;


      $(this.el).html(html);

      // 初始化swiper
      this.swiper = new Swiper (`.swiper-container.data-block__content-warp--${this.index}`, {
        slidesPerView: 'auto',
        spaceBetween: 0, // slide间距
        freeMode: true, // 补贴和边缘
        noSwiping:true, // 设置文字部分不能滑动（可以复制）
      });

      // 計算分割綫位置
      setTimeout(function(){

        let slides = $(that.el).find('.swiper-slide').each(function() {

          let prevSlide = $(this).prev('.swiper-slide');
          // 有前一个兄弟元素
          if(prevSlide.length) {

            // 取最后一个data-block__data-wrap，因为单个swiper-slide有可能会有多个data-block__data-wrap
            let $lastDataWrap = $(prevSlide[0]).find('.data-block__data-wrap').last();

            let lastDataWrapWidth = $lastDataWrap.outerWidth();

            // 数据大小
            let prevSlideDataWidth = $lastDataWrap.find('.data-block__data').outerWidth();

            let computedStyle = window.getComputedStyle($lastDataWrap[0]);

            let paddingLeft = parseInt(computedStyle.getPropertyValue('padding-left'));
            let textAlign = computedStyle.getPropertyValue('text-align');
            

            let $beforeEl = $(this).find('.data-block__data-wrap-before');

            /**
             * 两种计算方式
             * 方式一 左对齐
             * 方式二 居中对齐
             */
            if( 'left' === textAlign) {
              $beforeEl.css({
                left: - (lastDataWrapWidth - prevSlideDataWidth - paddingLeft )/2
              });
            } else if( 'center' === textAlign ) {
              $beforeEl.css({
                left: - (lastDataWrapWidth/2 - prevSlideDataWidth/2 - paddingLeft )/2
              });
            }

            

          }

        });

      },0)


      return this;
    }
    renderData(data, source, index) {
      let that = this;
      let onlyL1 = 1 === data.filter(item => 1 == item[that.dataConfig.level]).length;
      let html = `
        <div class="swiper-slide swiper-no-swiping">
          <div class="data-block__data-wrap">
          ${index > 0 ? '<div class="data-block__data-wrap-before"></div>' : ''}
            <ul class="data-block__data ${ onlyL1 ? 'data-block__data--only-one-level-1' : ''}">
              ${ ( () => data.map(item => that.renderItem(item)).join('') )() }
            </ul>
          </div>
          ${(()=> {
            if(source.addition) {
              onlyL1 = 1 === source.addition.filter(item => 1 == item[that.dataConfig.level]).length;
              return `
              <div class="data-block__data-wrap">
                <ul class="data-block__data data-block__data--addition ${ onlyL1 ? 'data-block__data--only-one-level-1' : ''}">
                  ${ ( () => source.addition.map(item => that.renderItem(item)).join('') )() }
                </ul>
              </div>`
            } else {
              return '';
            }
          })()}
        </div>
      `;
      return html;
    }
    renderItem(item) {
      // 自定义渲染内容
      if(item.custom && item.render) return item.render(item);
      let html = `<li class="data-block__data-item data-block__data-item--v${item[this.dataConfig.level]}  ${item[this.dataConfig.class] || ''} ${this.renderItemIncrement(item)}">
        <span class="data-block__label swiper-no-swiping">
          ${item[this.dataConfig.label]} ${item[this.dataConfig.lableInfo] ? `<i class="iconfont icon-tishixinxi" title="${item[this.dataConfig.lableInfo]}"></i>` : ''}
        </span>
        <span class="data-block__value swiper-no-swiping">
          ${item[this.dataConfig.value]} 
          ${item.openOrientation ? this.renderOrientation(item) : ''}
        </span>
      </li>`;
      return html
    }
    /**
     * 渲染增量 class
     * @param {*} item 
     * @returns 
     */
    renderItemIncrement(item) {
      let incrementClass = '';
      if(parseFloat(item.increment || 0) > 0) {
        incrementClass = 'data-block__data-item--increment-up';
      } else if( parseFloat(item.increment || 0) < 0 ) {
        incrementClass = 'data-block__data-item--increment-down';
      }
      return incrementClass;
    }
    /**
     * 渲染增量方位箭头
     */
    renderOrientation(item) {
      let iconOrientation = '';
      if(parseFloat(item.increment || 0) > 0) {
        iconOrientation = '<i class="iconfont icon-zengchang"></i>';
      } else if( parseFloat(item.increment || 0) < 0 ) {
        iconOrientation = '<i class="iconfont icon-xiadie"></i>';
      }
      return iconOrientation;
    }
  }



  

  exports('dataBlock', function(options = {}) {

    let defaultOptions = {
      title: '标题',
      data: []
    };

    let defaultDataConfig = {
      label: 'label',
      value: 'value',
      level: 'level',
      lableInfo: 'lableInfo',
      // 增量（0正常，负数红色，正数绿色）
      increment: 'increment',
      // 开启方位（上下箭头）
      openOrientation: 'openOrientation',
      // 自定义class
      class: 'class',
    };

    defaultOptions = Object.assign({}, defaultOptions, options);

    if(!options.el) {
      console.error('dataBlock, 需要绑定一个el，例如 #id');
    }

    if(options.title) {
      defaultOptions.title = options.title;
    }

    if(options.data) {
      defaultOptions.data = options.data;
    }

    if(options.dataConfig) {
      defaultDataConfig.dataConfig = Object.assign({}, defaultDataConfig, options.dataConfig);
    }
    
    let dataBlock = new DataBlock(index++, defaultOptions, defaultDataConfig);

    dataBlock.render();

    $(window).resize(function(){
      dataBlock.render();
    });

    return dataBlock;
  });


});