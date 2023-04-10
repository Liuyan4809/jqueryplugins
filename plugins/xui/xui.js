/* xui-v0.1 
 * 
 * */
!function ($, win) {
	"use strict";
	//底层方法
	function isArray (a) {
		return a instanceof Array;
	}
	function isObject (o) {
		return typeof o == "object";
	}
	function isFn (f) {
		return f instanceof Function;
	}
	function isStr (str) {
		return typeof str == "string";
	}
	function isNum (n) {
		return typeof n == "number";
	}
	function isJqDom (o) {
		return o instanceof $;
	}
	function isDom (o) {
		return o instanceof HTMLElement || o instanceof HTMLCollection;
	}
	function toNumTrue (s) {
		return !isNaN(Number(s));
	}
	function deepCopy (obj) {
		return $.extend(true, {}, obj);
	}
	function distinct (arr) {
		arr.forEach(function (v, i, a) {
			a.forEach(function (item, i, a) {
				if(v === item) {
					a.splice(i, 1);
				}
			});
		});
		return arr;
	}
	function arrFunc (obj, fn, type) {
		type = type || "forEach";
		return Array.prototype[type].call(obj, fn);
	}
	function eachObj (obj, fn) {
		var keys = Object.keys(obj);
		keys.forEach(function (item) {
			fn(obj[item], item, obj);
		});
	}
	function removeSpace (str) {
		return str.replace(/\s+/g, "");
	}
	//使jquery友好
	$.fn._val = $.prototype.val;
	$.fn.val = function  (args) {
		if(args !== undefined) {
			this._val(arguments[0]);
			if(this.attr(init[0])) {
				if(!this.parents("form")[0]) return this;
                this.parents("form")[0].instance.verify(this, true);
			}
			return this;
		}
		else {return this._val()}
	};
	//表单值转 对象
	$.fn.serializeObject = function ()  {    
        var o = {};    
        var a = this.serializeArray();    
        $.each(a, function() {    
            if (o[this.name]) {    
                if (!o[this.name].push) {    
                    o[this.name] = [ o[this.name] ];    
                }    
                o[this.name].push(this.value || '');    
            } else {    
                o[this.name] = this.value || '';    
            }    
        });    
        return o;    
    }   
	//预定义字段
	var init = ['xui-verify', 'xui-err', 'xui-name', 'xui-ban', 'xui-bubble', 'xui-linkEle'];
	
	//校验者
	var verifier = {
		required: function (value, elem, args) {
			value = removeSpace(value);
			var reg = /[\S]+/;
			if(!reg.test(value)) return "必填项！";
		},
		phone: function (value, elem){return handleReg(value, elem, /^1\d{10}$/, "格式不正确！")},
		email: function (value, elem){return handleReg(value, elem, /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/, "格式不正确！")},
		url: function (value, elem){return handleReg(value, elem, /(^#)|(^http(s*):\/\/[^\s]+\.[^\s]+)/, "格式不正确！")} ,
		date: function (value, elem){return handleReg(value, elem, /^(\d{4})[-\/](\d{1}|0\d{1}|1[0-2])([-\/](\d{1}|0\d{1}|[1-2][0-9]|3[0-1]))*$/, "格式不正确！")},
		identity: function (value, elem){return handleReg(value, elem, /(^\d{15}$)|(^\d{17}(x|X|\d)$)/, "格式不正确！")},
		number: function(value) {
			value = removeSpace(value);
			if(value == "") return;
			if(isNaN(Number(value))) return "应为数字！";
		},
		box: function (value, elem) {
			var name = elem[0].name;
			var elems = $(elem[0]).parents("form").find("[name=" + name + "]");
			if(!arrFunc(elems, function (item) {
				return item.checked;
			}, "some")) return "至少选择一项！";
		},
		byte: function (value, elem, args) {
			value = removeSpace(value);
			var count = 0, length = 0;
			if(args.length == 0) {
				args = 300;
				count = 300;
				for(var i=0;i<value.length;i++){
					value.charCodeAt(i) > 127? length+=3 : length+=1;
				}
				if(length > count) return "输入过长！";
			}else if(args.length == 1){
				count = args[0];
				for(var i=0;i<value.length;i++){
					value.charCodeAt(i) > 127? length+=3 : length+=1;
				}
				if(length > count) return "输入过长！";
			}else if(args.length == 2){
				var max = Math.max(args[0], args[1]);
				var min = Math.min(args[0], args[1]);
				for(var i=0;i<value.length;i++){
					value.charCodeAt(i) > 127? length+=3 : length+=1;
				}
				if(length < min || length > max) return "输入过长或过短！";
			}else throw new Error("校验参数不对");
		},
		min: function (value, elem, args) {
			value = removeSpace(value);
			if(args.length <= 1) {
				value = Number(value);
				if(isNaN(value)) {
					return "应为数字！";
				}
				return value >= args[0]? false : "应不小于" + args[0] + "！";
			}else throw new Error("校验参数不对");
		},
		max: function (value, elem, args) {
			value = removeSpace(value);
			if(args.length <= 1) {
				value = Number(value);
				if(isNaN(value)) {
					return "应为数字！";
				}
				return value <= args[0]? false : "应不大于" + args[0] + "！";
			}else throw new Error("校验参数不对");
		},
		float: function (value, elem, args) {
			var nValue = Number(value);
			args[0] = args[0] || 2;
			if(args.length <= 1) {
				var reg = eval("/^\\s*-?[0-9]*\\.?[0-9]{1," + args[0] + "}\\s*$/");
				return reg.test(value)? undefined : "应保留" + args[0] +"位小数！";
			}else throw new Error("校验参数不对");
		},
		int: function (value, elem, args) {
			value = removeSpace(value);
			value = Number(value);
			if(isNaN(value)) {
				return "应为数字！";
			}
		 	if(Math.round(value) != value){
	 			return "应为整数！";
		 	}
		},
		file: function (value, elem, args) {
			if(!args ||  !args[0]) args = [1]; 
			if(!elem[0].files[args[0] - 1]) return "至少选择" + args[0] + "个文件";
		}
	};
	function handleReg (value, elem, reg, errtxt) {
		value = removeSpace(value);
	 	if(value == "") return;
		if(!reg.test(value)) {
			return errtxt;
		}
	}
	
	//构造主方法 
	var Xui = function (conf) {
		var instance = this;
		//获取需要渲染的表单
		var form = $(conf.el);
		instance.elem = form[0];
		form[0].instance = instance;
		
		//设置实例的配置项
		instance.config = {};
		instance.config.verifier = $.extend(true, {}, Xui.verifier, conf.verifier);
		
		//禁用带有禁用属性的元素
		if(form.find("[" + init[3] + "]")[0]) {
			instance.banEle(form.find("[" + init[3] + "]"));
		}
		//获取校验元素 并绑定事件校验
		form.on("input", "["+init[0]+"]", function () {
			if(!this.name) return;
			instance.verify(form.find("[name=" + this.name + "]"), true);
		});
		form.on("change", "input[type=file]", function () {
			if(!this.name) return;
			instance.verify(form.find("[name=" + this.name + "]"), true);
		});
		form.on("keydown", "["+init[0]+"]", function (e) {
			var getTextareaAttr = $(this).attr('wrap');
			if (getTextareaAttr){
				return;
			}
			if(e.keyCode == 13) e.preventDefault();
		});
	}
	
	//类共有属性
	Xui.body = $(".layui-body")[0]? ".layui-body" : "body";
	Xui.verifier = verifier;
	
	//类添加全局校验
	Xui.configVerifier = function (conf) {
		eachObj(conf, function (item, key, obj) {
			if(!isFn(item)) {
				delete obj[key];
			}
		});
		this.verifier = $.extend(true, this.verifier, conf);
	}
	
	//校验主方法
	Xui.prototype.verify = verify;
	Xui.verify = verify;
	function verify (elems, focus) {
		var instance = this
			,form = $(instance.elem || "form")
			,verifyResult = true;
		
		//获取需要校验的元素
		if(!elems) elems = form.find("["+init[0]+"][name]");
		else elems = $(elems);
		//通过结果给元素增加或去掉报错的类选择器  class
		elems.each(function () {
			if(verifn(this) && verifn(this)[0]) {
				$(this).addClass(init[1]);
				verifyResult = false;
			}else {
				$(this).removeClass(init[1]);
			}
		});
		
		//查找xui-bubble属性 判断气泡是否显示
		(function () {
			var bubbleEles = $("[" + init[4] + "]", form);
			bubbleEles.each(function () {
				var str = removeSpace($(this).attr(init[4]));
				var bubbleName = str.split(",")[0];
				var bubbleDir = str.split(",")[1];
				var bindEles = form.find("[name=" + bubbleName + "]");
				var resultArr = arrFunc(bindEles, function (item) {
					if(!$(item).hasClass("xui-err")) return false;
					return verifn(item);
				}, "map");
				for(var i=0;i<resultArr.length;i++){
					if(resultArr[i] == false ) {
						resultArr.splice(i,1);
						i--;
					} 
				}
				var result = [];
				for (var i=0;i<resultArr.length;i++) {
					result = result.concat(resultArr[i]);
				}
				//如果有错 
				if(result.length > 0 && result.some(function (item) {
					return item != false;
				})) {
					//生成气泡
					instance.toggleBubble("show", $(this), result[0]);
				}else {
					//如果没错 而元素有报错 则去掉报错
                    if(bindEles.hasClass("xui-err")) bindEles.removeClass("xui-err");
					//这层操作是为了防止校验条件转换时 元素来不及更新class
					if($(this).hasClass(init[1])) $(this).removeClass(init[1]);
					//隐藏气泡
					instance.toggleBubble("hide", $(this));
				}
			});
		})();
		
		//如果有报错元素则聚焦到第一个报错元素
		if(!focus) {
			(function fn (i) {
				if(form.find("." + init[1])[i]) {
					if(form.find("." + init[1]).eq(i).css("display") != "none") {
						form.find("." + init[1]).eq(i).focus();
					}else {
						i++;
						fn(i)
					}
				} 
			})(0);
		}
		
		return verifyResult;
		function verifn (ele) {
			//校验需要校验的元素
			var that = $(ele);
			var veriResult = [];//校验结果 保存报错的种类 如果没有就是没报错
			
			//过滤掉被禁用的元素 也就是 不校验   否则正常校验
 			if($(that).attr(init[3]) == undefined) {
				if(typeof(that.attr(init[0])) == "undefined" || typeof(that.attr("name")) == "undefined") {
					return;
				}
				//获取校验规则 返回一个数组 存储 一个装有校验函数名 和传入参数 的对象
				var veriCollection = removeSpace(that.attr(init[0]));
				veriCollection = (function  (str) {
					return str.split("|").map(function (item) {
						//获取小括号的位置
						var idx = item.indexOf("(")>=0? item.indexOf("(") : undefined;
						var args = !idx? undefined : item.substring(idx + 1, item.length-1).split(",").map(function (_item) {
							return toNumTrue(_item)? Number(_item) : _item;
						});
						return {
							fn: item.substring(0, idx),
							args: args
						}
					})
				})(veriCollection);
				
				//获得校验结果
				var verifier = that.parents("form")[0].instance.config.verifier;
				veriCollection.forEach(function (thisVer) {
					//如果有这个校验函数
					if(verifier[thisVer.fn]){
						var value = that.val();
						//获取当前元素的报错结果
						var result = verifier[thisVer.fn](value, that, thisVer.args);
						//给元素设置一个属性保存校验的种类
						if(that[0][init[1]] == undefined) that[0][init[1]] = {};
						if(typeof(result) !== "string") {
							that[0][init[1]][thisVer.fn] = false;
						}else {
							that[0][init[1]][thisVer.fn] = true;
						}
						var flag = false;
						for(var i in that[0][init[1]]) {
							//如果有至少一项校验的种类true
							if(that[0][init[1]][i]) {
								//说明有错误
								flag = true;
							}
						}
						//添加报错结果 如果有的话
						if(isStr(result)) veriResult.push(result);
					}
					else  return console.error("没有定义校验函数 '" + thisVer.fn + "'");
				});
			}
			return veriResult;
		}
	}
	//提交表单
	Xui.prototype.submit = function () {
		
	}
	//生成/隐藏气泡位置
	Xui.prototype.toggleBubble = toggleBubble;
	Xui.toggleBubble = toggleBubble;
	function toggleBubble (handle, ele, errtxt) {
		var instance = this;
		ele.each(function () {
			if(handle == "show") {
				//判断气泡层级是否应在layer之上
				var targetBody = $(Xui.body);
				if($(this).parents(".layui-layer")[0]) {
					var flag = 1;
					//是否存在layer
					var _layer = layer || layui && layui.layer;
					if(_layer) {
						var layidx = ++_layer.index + 19891014 
					}
					targetBody = $(this).parents(".layui-layer").find(".layui-layer-content")[0];
				}
				//先判断该元素有没有已存在的吹泡
				var isBinded = this[init[5]];
				if(isBinded) {
					$(this[init[5]]).text(errtxt);
					//判断气泡层级是否应在layer之上
					if(flag) {
						if(_layer) {
							$(this[init[5]]).css("z-index", layidx);
						}
						this[init[5]].targetBody = targetBody;
					}
					if(!$(this[init[5]]).parents(targetBody)) $(this[init[5]]).appendTo(this[init[5]].targetBody);
					instance.adjust($(this[init[5]]));
				}else {
					var bubble = $('<div class="' + init[4] + '"></div>');
					bubble[0].targetBody = $(Xui.body);
					this[init[5]] = bubble[0];
					bubble[0][init[5]] = this;
					bubble.text(errtxt);
					//判断气泡层级是否应在layer之上
					if(flag) {
						if(_layer) {
							bubble.css("z-index", layidx);
						}
						bubble[0].targetBody = targetBody;
					}
					bubble.appendTo(bubble[0].targetBody);
					instance.adjust(bubble);
				}
			}else if(handle == "hide"){
				$(this[init[5]]).remove();
				this[init[5]] = undefined;
			}
		});
	}
	//判断位置 附着元素
	Xui.prototype.adjust = adjust;
	Xui.adjust = adjust;
	function adjust (ele) {
		var dir;
		if(!ele) ele = $("." + init[4]);
		ele.each(function () {
			var clingEle = $(this[init[5]]);
			this.targetBody =
			clingEle.parents(".layui-layer")[0]? 
				clingEle.parents(".layui-layer").find(".layui-layer-content")[0] :  $(Xui.body)[0];
			//如果气泡的目标容器不存在了 则删除气泡
			if(!$(this.targetBody).parents("html")[0] || !clingEle.parents("html")[0]) {
				$(this).remove();
				return;
			}else {
				//重定位元素父元素
				if(this.parentNode !== this.targetBody) {
					$(this).appendTo($(this.targetBody));
				}
			}
			//获取方向
			dir = removeSpace(clingEle.attr(init[4])).split(",")[1] || "r";
			//如果当前元素是隐藏的  附着元素改为下一个
			if(clingEle.css("display") == "none") {
				clingEle = clingEle.next();
			}
			var clingElePosi = relPosiTo(clingEle,$(this.targetBody)),
				top = clingElePosi.top, //附着元素距离滚动元素上距离
				left = clingElePosi.left,  //附着元素距离滚动元素左
				pW = $(this.targetBody).outerWidth(), //滚动元素宽
				pH = $(this.targetBody).outerHeight(), //滚动元素高
				cW = clingEle.outerWidth(), //附着元素宽
				cH = clingEle.outerHeight(), //附着元素高
				bW = $(this).outerWidth(), //吹泡元素宽
				bH = $(this).outerHeight(), //吹泡元素高
				offset = 15; //偏移值
			var resultPosi = {
				tl: {left: left, top: top - offset - bH }, //上左
				tr: {left: left + cW - bW, top: top - offset - bH }, //上右
				bl: {left: left, top: top + offset + cH }, //下左
				br: {left: left + cW - bW, top: top + offset + cH }, //下右
				lt: {left: left - bW - offset, top: top}, //左上
				lb: {left: left - bW - offset, top: top + cH - bH}, //左下
				rt: {left: left + cW + offset, top: top}, //右上
				rb: {left: left + cW + offset, top: top + cH - bH}, //右下
				r: {left: left + cW + offset, top: top}, //右中
				l: {left: left - bW - offset , top: top}, //左中
				t: {left: left + cW/2 - bW/2, top: top - offset - bH }, //上中
				b: {left: left + cW/2 - bW/2, top: top + offset + cH }, //下中
			}
			for(var i in resultPosi) {
				$(this).removeClass(i);
			}
			$(this).addClass("xui-" + dir);
			$(this).css({
				top: resultPosi[dir].top + "px",
				left: resultPosi[dir].left + "px",
			});
		});
		//判断传入元素距离另一个元素的最上边和最左边的距离
		function relPosiTo (ele, boxEle) {
			ele = $(ele).eq(0);
			if(!boxEle) boxEle = $(".layui-body")[0]? $(".layui-body") : $("body");
			var scrollH = {
				top: boxEle[0].scrollTop + ele.offset().top - boxEle.offset().top,
				left: boxEle[0].scrollLeft + ele.offset().left - boxEle.offset().left
			};
			return scrollH;
		}
	}
	//禁用元素使整个元素排除在校验之外 或者解除禁用
	Xui.prototype.banEle = banEle;
	//类方法 全局禁用
	Xui.banEle = banEle;
	function banEle (ele, handle) {
		var instance = this;
		ele = $(ele);
		//禁用
		if(!handle) {
			ele.each(function () {
				if(!this.name) return;
				$(this).attr(init[3], "");
				this[init[2]] = this["name"];
				$(this).removeAttr("name");
			});
			instance.verify(ele);
		}
		//启用
		else {
			ele.each(function () {
				if(!this[init[2]]) return;
				$(this).removeAttr(init[3]);
				this["name"] = this[init[2]];
				this[init[2]] = null;
			});
		}
	}
	
	//获取表单json
	Xui.prototype.getJSON = function () {
		return $(this.elem).serializeObject();
	}
	win.Xui = Xui;
}(jQuery, this);
