/**
 * 封神榜
 * 
 */


layui.define(['jquery'], function(exports){ //此处 mod1 为你的任意扩展模块
  let $ = layui.jquery;
  let index = 0;

  class RankingList {
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
        <div class="ranking-list">
          <table class="ranking-list_table">
            ${that.data.map((item, i) => that.renderTr(item.data, i, item)).join('')}
          </table>
          ${(()=> {
            if(that.loading) {
              return `
                <div class="ranking-list_loding-shade">
                </div>
                <div class="ranking-list__loding"></div>
              `
            }
            return '';
          })()}
        </div>
        
      `;

      $(this.el).html(html);

      return this;
    }
    renderTr(data, i, item) {
      let that = this;
      let tr;
      switch (i) {
        case 0:
          tr = `<tr class="ranking-list-item">
            <td>
            <div class="cell">
            <div class="cell-item">
            <svg class="icon svg-icon ranking-list-medal" aria-hidden="true">
                <use xlink:href="#icon-jinpai"></use>
              </svg>
              ${item.title}
              ${item.isNew ? 
              `<svg class="icon svg-icon ranking-list-item-new" aria-hidden="true">
                <use xlink:href="#icon-xin"></use>
              </svg>` : ''}
              </div>
              </div>
            </td>
            ${data.map(item => that.renderTd(item)).join('')}
          </tr>`;
          break;
        case 1:
          tr = `<tr class="ranking-list-item">
          <td>
            <div class="cell">
            <div class="cell-item">
            <svg class="icon svg-icon ranking-list-medal" aria-hidden="true">
              <use xlink:href="#icon-yinpai"></use>
            </svg>
            ${item.title}
            ${item.isNew ? 
              `<svg class="icon svg-icon ranking-list-item-new" aria-hidden="true">
                <use xlink:href="#icon-xin"></use>
              </svg>` : ''}
              </div>
              </div>
            </td>
            ${data.map(item => that.renderTd(item)).join('')}
          </tr>`;
          break;
        case 2:
          tr = `<tr class="ranking-list-item">
            <td>
              <div class="cell">
              <div class="cell-item">
              <svg class="icon svg-icon ranking-list-medal" aria-hidden="true">
                <use xlink:href="#icon-tongpai"></use>
              </svg>
              ${item.title}
              ${item.isNew ? 
                `<svg class="icon svg-icon ranking-list-item-new" aria-hidden="true">
                  <use xlink:href="#icon-xin"></use>
                </svg>` : ''}
                </div>
              </div>
            </td>
            ${data.map(item => that.renderTd(item)).join('')}
          </tr>`;
          break;
        default:
          tr = `<tr class="ranking-list-item">
            <td>
              <div class="cell">
              <div class="cell-item">
              <i class="ranking-list-item-index">${i+1}</i>
              ${item.title}
              ${item.isNew ? 
              `<svg class="icon svg-icon ranking-list-item-new" aria-hidden="true">
                <use xlink:href="#icon-xin"></use>
              </svg>` : ''}
              </div>
              </div>
            </td>
            ${data.map(item => that.renderTd(item)).join('')}
          </tr>`;
          break;
      }
      return tr;
    }
    renderTd(item) {
      let that = this;
      let td = `<td>
        <div class="cell">
          ${item.map(item => {
            return `<div class="cell-item">
              ${item.label?`<span class="ranking-list__label">${item.label}</span>`:''}
              ${item.value?`<span class="ranking-list__value ${that.renderItemIncrement(item)}">${item.value}${item.openOrientation ? this.renderOrientation(item) : ''}</span>`:''}
            </div>`;
          }).join('')}
        </div>
      </td>`;
      return td;
    }
    /**
     * 渲染增量
     */
    renderItemIncrement(item) {
      let incrementClass = '';
      if(parseFloat(item.increment || 0) > 0) {
        incrementClass = 'increment-up';
      } else if( parseFloat(item.increment || 0) < 0 ) {
        incrementClass = 'increment-down';
      }
      return incrementClass;
    }
    /**
     * 渲染增量方位箭头
     */
     renderOrientation(item) {
      let iconOrientation = '';
      if(parseFloat(item.increment || 0) > 0) {
        iconOrientation = `
        <svg class="icon svg-icon" aria-hidden="true">
          <use xlink:href="#icon-zengchang"></use>
        </svg>`;
      } else if( parseFloat(item.increment || 0) < 0 ) {
        iconOrientation = `
        <svg class="icon svg-icon" aria-hidden="true">
          <use xlink:href="#icon-xiadie"></use>
        </svg>`;
      }
      return iconOrientation;
    }
  }



  

  exports('rankingList', function(options = {}) {

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
    
    let dataBlock = new RankingList(index++, defaultOptions, defaultDataConfig);

    dataBlock.render();

    return dataBlock;
  });


});