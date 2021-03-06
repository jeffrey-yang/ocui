/** 
* @file CSV文件预览与标记 
* @author Elvis Xiao
* @version 0.1 
*/ 


/**
* CSV文件预览与标记
* @class FileView
* @constructor
* @param {object} options 配置变量对象：<br /> container为容器对象<br />canEdit：csv是否允许编辑状态<br />maxHeight：最大高度<br />heads：指定头部列
* @example
* var fileView = new FileView({
    container: '#container',
    maxHeight: 400
})
*/
var FileView = function(options){
    /** @memberof FileView */

    /**@property {function} csv 读取csv文件的第三方库文件*/
    this.csv = require('./asset/csv');

    /**@property {object} ele - 最外层Jquery对象*/
    this.ele = null;

    /**@property {object} _dataList - 根据CSV内容，格式化后的Model集合 */
    this._dataList = [];

    /**@property {boolean} canEdit - 生成后的表格是否允许编辑 */
    this.canEdit = true;

    /**@property {number} maxHeight - 容器最大高度，超过此高度后将出现滚动条 */
    this.maxHeight = 800;

    /**@property {object} config - 初始化配置文件<br>
    *container: 容器选择器<br>
    *canEdit: csv是否可编辑<br>
    *maxHeight: 最大允许的高度，超出后会出现滚动条<br>
    *heads：指定头部列名
    */

    this.config = {
        container: 'body',
        canEdit: true,
        maxHeight: 800,
        heads: []
    };

    for(var key in options){
        if(this.config.hasOwnProperty(key)){
            this.config[key] = options[key];
        }
    }

    var self = this;

    /** 
    * @method _render 初始化界面
    * @memberof FileView 
    * @instance
    */
    self._render = function(){
        self.ele = $('<div class="zUploader"></div>');
        var uploadList = $('<div class="zUploaderList"></div>');
        uploadList.append(self._renderNoFile());
        self.ele.append(uploadList);
        self.ele.appendTo(self.config.container);
    }

    /** 
    * @method _renderNoFile 没有文件时，显示的界面
    * @memberof FileView 
    * @instance */
    self._renderNoFile = function(){
        var div = $('<div class="zUploaderNoFile" style="padding:15px 0 0 0;"></div>');
        div.append('<span class="zUploaderFileBtn "><input type="file" accept=".csv" /><span class="zUploaderBtnText">点击选择文件</span></div>');
        div.append('<p>或将文件拖到这里, 暂仅支持CSV格式</p>');

        return div;
    }

    /**
    * 绑定容器中的相关事件
    * @method _bindEvent
    * @memberof FileView 
    * @instance 
    */
    self._bindEvent = function(){
        self.ele.on('change', '.zUploaderFileBtn input[type="file"]', function(){
            self._readFilesToTable(this.files[0]);
        });

        self.ele.find('.zUploaderNoFile')[0].addEventListener("drop", function(e){
            $(this).css('border', '3px dashed #e6e6e6');
            e.preventDefault();
            self._readFilesToTable(e.dataTransfer.files[0]);
        })
        self.ele.on('dragenter', '.zUploaderNoFile', function(e){
            e.preventDefault();
            $(this).css('border', '3px dashed #aaa');
        }).on('dragleave', '.zUploaderNoFile', function(e){
            e.preventDefault();
            $(this).css('border', '3px dashed #e6e6e6');
        });
        $(document).on({
            dragleave: function(e){e.preventDefault();},
            drop: function(e){e.preventDefault();},
            dragenter: function(e){e.preventDefault();},
            dragover: function(e){e.preventDefault();},
        })

        self.ele.on('blur', '.zFileTable tbody td input', function(){
            var val = this.value;
            var ele = $(this);
            var td = ele.parent();
            var index = td.attr('data-index');

            var indexArr = index.split(',');
            var i = indexArr[0];
            var j = indexArr[1];
            self._dataList[i][j] = val;
        })
    }

    /**
    * 读取CSV文件内容
    * @method readCsv
    * @param {object} file - 需要读取的文件对象
    * @param {function} cb - 文件读取完成后的回调函数
    * @memberof FileView 
    * @instance
    */
    self.readCsv = function(file, cb){
        var reader = new FileReader();
        reader.onload = function(e){
            $('input[type="file"]').replaceWith($('<input type="file" accept=".csv">'));
            var content = reader.result;
            self._formatFileContent(content);
            cb();
        }
        
        reader.readAsText(file);
    }
    
    /**
    * 将CSV文件内容写成格式化的Model对象数组，并存入_dataList变量中 
    * @method _formatFileContent 
    * @param {string} content - 需要读取的文件内容
    * @memberof FileView
    * @instance
    */
    self._formatFileContent = function(content){
        var models = self.csv.parse(content);
        var firstItem = models[0];
        var keys = [];
        for(var key in firstItem){
            keys.push(key);
        }
        self._dataList = [];
        self._dataList.push(keys);
        for(var i = 0; i < models.length; i++){
            var item = models[i];
            var datas = [];
            for(var key in item){
                datas.push(item[key]);
            }
            self._dataList.push(datas);
        }
    }

    /**
    * 根据文件内容生成用Table展示出来
    * @method _readFilesToTable
    * @param {object} file - 需要读取的文件对象
    * @memberof FileView
    * @instance
    */
    self._readFilesToTable = function(file){
        self.readCsv(file, function(){
            $('.zFileTableContainer').remove();
            var tableContainer = $('<div class="zFileTableContainer"><table class="zFileTable"></table></div>');
            if(self.config.maxHeight){
                tableContainer.css('max-height', self.config.maxHeight + 'px');
            }
            var ret = tableContainer.find('.zFileTable');
            if(self._dataList && self._dataList.length > 0){
                var keys = self._dataList[0];
                var keysLen = keys.length;
                var thead = $('<thead></thead>');
                var tbody = $('<tbody></tbody>');
                var theadTr = $('<tr><th></th></tr>').appendTo(thead);
                for(var i = 0; i < keysLen; i++){
                    theadTr.append('<th>' + keys[i] + '</th>');
                }

                for(var i = 1; i < self._dataList.length; i++){
                    var item = self._dataList[i];
                    var tr = $('<tr><td>' + i + '</td></tr>');
                    for(var j = 0; j < keysLen; j++){
                        tr.append('<td data-val="true", data-index="' + i + ',' + j + '">' + $.trim(item[j]) + '</td>');
                    }
                    tbody.append(tr);
                }
                ret.append(thead);
                ret.append(tbody);
            }
            var uploadList = self.ele.find('.zUploaderList');
            uploadList.find('.zFileTable').remove();
            tableContainer.appendTo(uploadList);

            self.setEditTable(ret);
        })
    }
    
    /**
    * 将Table设置为编辑状态
    * @method setEditTable 
    * @param {object} table - Jquery对象
    * @memberof FileView
    * @instance
    * @example
    * fileView.config.canEdit = true;
    * fileView.setEditTable(fileView.ele.find('table'))
    */
    self.setEditTable = function(table){
        if(self.config.canEdit === true){
            table.find('tbody td[data-val]').each(function(){
                var td = $(this);
                var text = td.html();
                td.html('<span class="tdSpan">' + text + '</span><input class="tdIpt" type="text" value="' + text + '" />');
            });           
        }
    }

    /**
    * 获取格式化后的数据
    * @method getDataList 
    * @return {object} models - 对象数组
    * @memberof FileView
    * @instance
    * @example
    * var dataList = fileView.getDataList()
    */
    self.getDataList = function(){
        var models = [];
        if (!self._dataList || self._dataList.length === 0){
            return null;
        }

        var keys = self._dataList[0];
        if(self.config.heads && self.config.heads.length > 0){
            if(self.config.heads.length > keys.length){
                self.config.heads = self.config.heads.slice(0, keys.length);
            }
            keys = keys.slice(self.config.heads.length);
            keys = self.config.heads.concat(keys);
        }
        var keyLength = keys.length;
        for (var i = 1; i < self._dataList.length; i++){
            var line = self._dataList[i];
            var one = {};
            for (var j = 0; j < keyLength; j++){
                one[keys[j]] = $.trim(line[j]);
            }
            models.push(one);
        }

        return models;
    }

    /**
    * 标记表格中某些格
    * @method mark 
    * @param {object} msgList - 对象数组：{row: 1, col: 1} 
    * @memberof FileView
    * @instance
    * @example
    //标记坐标为（0，0），（3，2）的格子
    *fileView.mark([{row:0, col:0}, {row:3, col:2}]);
    */
    self.mark = function(msgList){
        var length = msgList.length;
        for(var i = 0; i < length; i++){
            var msgItem = msgList[i];
            var dataIndex = msgItem.row + ',' + msgItem.col;
            var td = self.ele.find('tbody td[data-index="' + dataIndex + '"]');
            td.addClass('zFileTableMark').attr('title', msgItem.msg);
        }
    }

    /**
    * 清除表格中某些格
    * @method clearMark 
    * @memberof FileView
    * @instance
    * @example
    * fileView.clearMark();
    */
    self.clearMark = function(){
        self.ele.find('tbody .zFileTableMark').removeAttr('title').removeClass('zFileTableMark');
    }

    self._render();
    self._bindEvent();
}


module.exports = FileView;

