/**
* @file 基本的、单个UI元素
* @author Elvis
* @version 0.1 
*/

/**
* 基本的、单个UI元素
* @exports oc.ui
*/
var UI = {};

/**
* 开关Toggle button, 此方法会影响页面中所有.zToggleBtn, .zToggleBtnSm元素
* @param {string} on - 开关打开时显示的文字，默认值为“ON”
* @param {string} off - 开关关闭时显示的文字，默认值为“OFF”
**/
UI.toggleBtn = function(on, off){
    if(on === undefined){
        on = 'ON';
        off = 'OFF';
    }
    var self = this;
    $('.zToggleBtn, .zToggleBtnSm').each(function(){
        var ele = $(this);
        self.toggleOneBtn(ele, on, off);
    })
},

/**
* 开关Toggle button，此方法只影响传入的Jquery对象
* @param {object} btn - 需要设置的Jquery对象，为一个checkbox
* @param {string} on - 开关打开时显示的文字，默认值为“ON”
* @param {string} off - 开关关闭时显示的文字，默认值为“OFF”
**/
UI.toggleOneBtn = function(btn, on, off){
    var btnClass = 'zToggleBtn';
    btn.removeClass('zToggleBtn');
    if(btn.hasClass('zToggleBtnSm')){
        btn.removeClass('zToggleBtnSm');
        btnClass += ' zToggleBtnSm';
    }

    var isChecked = btn[0].checked;
    if(isChecked){
        btnClass += ' active';
    }
    var span = $('<span class="' + btnClass + '"><i class="zToggleBtnON">' + on + '</i><i class="zToggleBtnOFF">' + off + '</i>' +  btn[0].outerHTML + '</span>');
    btn.replaceWith(span);
    span.find('input').prop('checked', isChecked);

    span.off('change', 'input').on('change', 'input', function(){
        if(this.checked){
            $(this).parents('.zToggleBtn:eq(0)').addClass('active');
        }
        else{
            $(this).parents('.zToggleBtn:eq(0)').removeClass('active');
        }
    })
},

/**
* 根据输入信息自动补全的控件
* @param {object} ele - 作用的元素，为jquery对象或集合
* @param {object} array - 提示用的字符串数组
* @param {function} cb - 选择后的回调函数，会传入选择的值，与选择的li元素作为参数
* @param {boolean} prefix - 是否支持输入多个
* @example
* oc.ui.autoComplete('#ipt', ['A99999', 'A11111', 'B22222'], function(val, li){
    console.log(val);
}, true)
*/
UI.autoComplete = function(ele, array, cb, prefix){
    ele = $(ele);
    if(typeof array === 'function'){
        cb = array;
        array = null;
    }
    ele.off('keyup').off('keydown').off('blur');
    ele.on('keydown', function(e){
        var ipt = $(this);
        var ul = ipt.next('ul.zAutoComplete');
        if(e.keyCode === 13 && ul.find('li.active').length > 0){
            event.preventDefault();
            return false;
        }
    })
    ele.on('keyup', function(e){
        var ipt = $(this);
        var ul = ipt.next('ul.zAutoComplete');

        if(e.keyCode === 40){
            var focusLi = ul.find('li.active');
            if(focusLi.length === 0){
                ul.find('li:eq(0)').addClass('active');
            }
            else{
                var nextLi = focusLi.next('li');
                if(nextLi.length > 0){
                    nextLi.addClass('active');
                    focusLi.removeClass('active');
                }
            }

            return;
        }
        if(e.keyCode === 38){
            var focusLi = ul.find('li.active');
            if(focusLi.length === 0){
                return;
            }
            
            var prevLi = focusLi.prev('li');
            if(prevLi.length > 0){
                prevLi.addClass('active');
                focusLi.removeClass('active');
            }

            return;
        }

        if(e.keyCode === 13){
            var focusLi = ul.find('li.active');
            if(focusLi.length > 0){
                var slcVal = focusLi.html();
                var text = ipt.val();
                // val = val.replace(/.*;|.*,|.*\s/g, '');
                if(prefix){
                    var mathedArray = text.match(/(.|,|\s)*(;|,|\s)/);
                    text = '';
                    if(mathedArray && mathedArray.length > 0){
                        text = mathedArray[0];
                    }
                    ipt.val(text + slcVal);
                }
                else{
                    ipt.val(slcVal);
                }
                
                ul.remove();
                cb && cb(slcVal, ipt);
            }
            return;
        }
        
        var source = array;
        if(!array){
            var sourceString = ipt.attr('data-source');
            if(sourceString){
                source = eval(sourceString);
            }
            else{
                source = ipt.data('source');
            }
        }
        if(!source){
            return;
        }

        $('.zAutoComplete').remove();
        var val = $.trim(this.value);
        if(prefix){
            val = val.replace(/.*;|.*,|.*\s/g, '');
        }
        if(!val){

            return;
        }
        var matchedArray = source.filter(function(item){
            return item.toUpperCase().indexOf(val.toUpperCase()) > -1;
        });
        
        var len = matchedArray.length;
        if(len === 0) {

            return;
        }

        if(len > 8){
            len = 8;
        }

        var ul = $('<ul class="zAutoComplete"></ul>');
        for(var i = 0; i < len; i++){
            ul.append('<li tabindex="0">' + matchedArray[i] + '</li>');
        }
        var top = ipt.position().top + ipt.outerHeight();
        var left = ipt.position().left;
        ul.css({top: top, left: left}).on('click', 'li', function(){
            var slc = $(this).html();
            // ipt.val(slc);
            var text = ipt.val();
            if(prefix){
                var mathedArray = text.match(/(.|,|\s)*(;|,|\s)/);
                text = '';
                if(mathedArray && mathedArray.length > 0){
                    text = mathedArray[0];
                }
                // text = text.replace(text.replace(/.*;|.*,|.*\s/g, ''), '');
                ipt.val(text + slc);
            }
            else{
                ipt.val(slc);
            }
            $('.zAutoComplete').remove();
            cb && cb(slc, ipt);
        })
        .on('mouseenter', 'li', function(){
            ul.find('.active').removeClass('active');
            $(this).addClass('active');
        })
        
        ipt.after(ul);

    }).on('blur', function(){
        setTimeout(function(){
            $('.zAutoComplete').remove();
        }, 200);
    });
}

/**
* Checkbox控件
*/
UI.cbx = function(){
    $('.zCbx').off('change', 'input').on('change', 'input', function(){
        if(this.checked){
            $(this).parent().addClass('active');
        }
        else{
            $(this).parent().removeClass('active');
        }
    });
    return {
        check: function(ele){
            if(!ele.hasClass('zCbx')){
                if(ele.find('input:checkbox').length === 0){
                    return console.warn("zCkb does not contain a input:checkbox item");
                }
                ele.addClass('active').find('input:checkbox')[0].checked = true;
            }
        },
        unCheck: function(ele){
            if(ele.hasClass('zCbx')){
                if(ele.find('input:checkbox').length === 0){
                    return console.warn("zCkb does not contain a input:checkbox item");
                }
                ele.removeClass('active').find('input:checkbox')[0].checked = false;
            }
        }
    };
};


/**
* 将select变成多选框
* @param {function} cb - 点击确定之后的回调函数
*/
UI.multiSelect = function(cb){
    $("select.zMultiSelect").each(function(){
        var ele = $(this);
        var width = ele.outerWidth();
        var height = ele.outerHeight() + 'px';
        var name = ele.attr('name');
        if(name === undefined){
            name = '';
        }
        var zEle = $('<div class="zMultiSelect"><div class="zMultiSelectText"></div><div class="zMultiSelectMain"><ul></ul></div></div>');
        zEle.css('width', width);
        zEle.find('.zMultiSelectText').css({'height': height, 'line-height': height}).html(ele.attr('data-slc'));
        
        var lis = '';
        ele.find('option').each(function(i, item){
            lis += '<li><label class="zCbx"><input type="checkbox", name="' + name + '" value="' + item.value + '">' + item.innerHTML + '</label></li>';
        });
        lis += '<li><button class="btnPrimary btnXs" type="button">Confirm</button></li>';
        zEle.find('ul').html(lis);

        ele.replaceWith(zEle);
    });


    UI.cbx();
    var bindEvent = function(){
        var selectDiv = $(".zMultiSelect");
        // selectDiv.off('click', 'button').off('click', '.zMultiSelectText');
        
        selectDiv.on('click', '.zMultiSelectText', function(){
            var select  = $(this).parents('.zMultiSelect:eq(0)');
            if(!select.hasClass('active')){
                select.addClass('active').find('.zMultiSelectMain').show();
                var text = this.innerHTML;
                var textArr = text.split(';');
                select.find('.zCbx').removeClass('active').find('input:checkbox').attr('checked', false);
                for(var i in textArr){
                    var val = textArr[i];
                    var cbx = select.find('input:checkbox[value="' + val + '"]');
                    if(cbx.length > 0) {
                        cbx[0].checked = true;
                        cbx.parent().addClass('active');
                    }
                }
            }
            else{
                select.removeClass('active').find('.zMultiSelectMain').hide();
            }
        }).on('click', 'button', function(e){
            var select  = $(this).parents('.zMultiSelect:eq(0)');
            var main = $(this).parents('.zMultiSelectMain:eq(0)');
            var values = '';
            main.find('input:checked').each(function(){
                values += this.value + ';';
            });
            if(values){
                values = values.slice(0, -1);
            }
            select.removeClass('active').find('.zMultiSelectText').html(values);
            main.hide();
            e.stopPropagation();
            
            cb && cb(select);
        }).click(function(e){
            e.stopPropagation();
        });

        $('html').click(function(){
            selectDiv.removeClass('active').find('.zMultiSelectMain').hide();
        });
    } ;
    bindEvent();
}

/**
* PopOver提示框，支持上下左右自定义
* @param {object} btn - 作用对象，一般为btn，Jquery或者Jquery选择器
* @param {string} title - 标题
* @param {string} content - 内容
* @param {string} popPosition - 位置，默认为right，可选值为：right、left、top、bottom
*/
UI.popOver = function(btn, title, content, popPosition){
    btn = $(btn);
    
    if(btn.next('.zPopOver').length > 0){
        btn.next('.zPopOver').remove();
        return;
    }

    var ele = $('<div class="zPopOver zPopOver' + popPosition + '"></div>');
    ele.append('<div class="zPopOverTitle">' + title + '<i class="icon-close"></i></div>');
    ele.append('<div class="zPopOverContent">' + content + '</div>');
    btn = $(btn);
    var position = btn.position();
    btn.after(ele);

    //右边
    var left = position.left + btn.outerWidth() + 20;
    var top = position.top + btn.outerHeight() / 2 - ele.outerHeight() / 2 - 5;

    //左边
    if(popPosition === 'left'){
        left = position.left - ele.outerWidth() - 20;
    }
    else if(popPosition === 'top'){
        left = position.left - ele.outerWidth() / 2 + btn.outerWidth() / 2;
        top = position.top - ele.outerHeight() - 20;
    }
    else if(popPosition === 'bottom'){
        left = position.left - ele.outerWidth() / 2 + btn.outerWidth() / 2;
        top = position.top + btn.outerHeight() + 20;
    }

    ele.css({
        left: left,
        top: top
    })
    ele.on('click', '.zPopOverTitle i.icon-close', function(){
        ele.remove();
    })
}

/**
* 关闭PopOver提示框
* @param {object} btn - 作用对象或者popOver本身
*/
UI.popOverRemove = function(btn){
    var btn = $(btn);
    if(btn.hasClass('.zPopOver')){
        btn.remove();
    }
    else{
        btn.next('.zPopOver').remove();
    }
}

module.exports = UI;