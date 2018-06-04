/**
 @Name：layui.mtable 表格组件
 @Author：XiaoMei
 @License：MIT    
 */

layui.define(['jquery', 'table', 'layer'], function(exports) {
    var $ = layui.$, table = layui.table, layer = layui.layer,
        keys = ['sub', 'svn', 'path', 'data', 'xpath', 'update'],
        mcfg = { svn: 'ZS_SERVER', sub: 'getDataX', fieldXpath: 'fields', dataXpath: {data: 'features|attributes', count:'features.count' }, render: { size: 'sm', height: "full-120", page: true, limits: [30, 60, 90, 150, 300], limit: 60} };

    /**
    * 空函数
    */
    function noop() {};

    /**
    * 切分字符串
    * @param {any} str
    * @param {any} charStr
    */
    function strFilter(str, charStr) { return str.split(charStr).filter(function(x) { return x; }) }

    /**
    * 补齐缺少
    * @param {any} obj
    * @param {any} key
    */
    function etend(obj, key) { if (!obj[key]) obj[key] = {}; return obj; }

    /**
    * 获取匹配路径
    * @param {any} obj
    * @param {any} path
    */
    function getValue(obj, xpath) {
        return xpath.replace(/(\[|\])/g, '.').split('.').filter(function (x) { return x; }).reduce(function (o, key) { if (o && o[key]) { return o = o[key], o; } return null; }, obj);
    }

    /**
    * 获取匹配路径
    * @param {any} obj
    * @param {any} path
    */
    function getSuperValue(obj, xpath) {
        if (xpath.indexOf('|') >= 0) {
            var xps = xpath.split('|').filter(function (x) { return x; });
            var nobj = getValue(obj, xps.shift());
            return nobj.map(function (item) {
                return getSuperValue(item, xps.join('|'));
            });
        }
        return getValue(obj, xpath);
    }

    /**
     * 处理获取到的数据
     * @param {any} query
     * @param {any} data
     * @param {any} xpath
     * @param {any} errors
     */
    function result(query, data, xpath, errors) {
        if (typeof query.update === 'function') return query.update(data) || [];
        if (xpath) {
            if (typeof xpath === 'string')
                return getSuperValue(data, xpath);
            if (Array.isArray(xpath))
                return xpath.map(function (path) { return getSuperValue(data, path) });
            else
                return Object.keys(xpath).reduce(function (a, b) { return a[b] = getSuperValue(data, xpath[b]), a;}, {});
        }
        return errors.invork(data), [];
    }

    /**
    * 回调事件
    */
    function Callback() {
        var callbacks = [];

        this.add = function(func) { if (typeof func === 'function') callbacks.push(func); }

        this.del = function(func) {
            callbacks = callbacks.filter(function(x) { return x !== func });
        }

        this.invork = function(arg) {
            callbacks.forEach(function(func) { func(arg) });
        }
    }

    /**
    * 初始化Alis
    * @param {any} alis
    */
    function initAlis(alis) {
        var obj = alis.values.reduce(function (a, b) { return a["_alis_" + b.dbval] = b.dispval, a; }, {});
        return { name: alis.name, getAlis: function (val) { return obj["_alis_" + val] || val; } };
    }

    /**
    * 请求参数处理
    * @param {any} func
    * @param {any} data
    */
    function getParams(func, data) {
        if (typeof func === 'function') return func(data);
        if (typeof func === 'object') return func;
        return null;
    }

    /**
    * 获取数据处理
    * @param {any} query
    * @param {any} errors
    */
    function getDatas(query, data, errors) {
        return publish(query.sub || mcfg.sub,
            {
                svn: query.svn || mcfg.svn,
                path: query.path || 'table/' + query.tableName + '/query',
                data: query._data = (getParams(query.data, data) || data)
            }).then(function(res) { return result(query, res[0], query.xpath || mcfg.dataXpath, errors); });
    }

    /**
    * 获取字段映射处理
    * @param {any} query
    * @param {any} errors
    */
    function getFields(query, data, errors) {
        return publish(query.sub || mcfg.sub,
            {
                svn: query.svn || mcfg.svn,
                path: query.path || 'table/' + query.tableName,
                data: query._data = (getParams(query.data, data) || data)
            }).then(function(res) { return result(query, res[0], query.xpath || mcfg.fieldXpath, errors); });
    }

    /**
    * 获取table的列头
    * @param {any} cls
    * @param {any} datas
    */
    function getCls(cls, datas) {
        var unVisable = cls.unVisable || []; //不显示字段
        var fields = cls.fields || []; //添加显示字段
        var wd = cls.width || 120; //默认长度
        var extend = cls.config || {}; //扩展配置
        var flds = (datas || []).filter(function (data) { return (data.VISIBLE != null && data.VISIBLE == "1") || (data.visible != null && data.visible == "1")}).map(function(data) {return {field: data.NAME || data.name, title: data.ALIAS || data.alias, width: wd, fidx: (data.FINDEX || data.findex) * 1};}).filter(function(data) { return !unVisable.some(function(field) { return field === data.field }) }); //过滤不显示内容
        flds = flds.concat(fields.map(function(x) {if (!x.fidx && x.fidx != 0) x.fidx = 1000;return x;})); //添加补充项 同时未定义排序项设默认值1000;
        Object.keys(extend).forEach(function(key) {(extend[key] || []).forEach(function(cfg) {flds.filter(function(fd) { return fd.field === cfg.field }).forEach(function(fd) { fd[key] = cfg.value; });});}); //扩展补充项目
        return flds.sort(function(x, y) {return x.fidx < y.fidx ? -1 : (x.fidx > y.fidx ? 1 : 0);}); //添加项目 + 按索引排序
    }

    /**
    * 别名处理 支持异步then
    * @param {any} cls
    * @param {any} datas
    */
    function getAlis(cls, datas) {
        function init(items) {
            var alis = (datas || []).map(function (data) { return { name: data.NAME || data.name, values: data.values.map(function (val) { return { dbval: val.DISPVAL || val.dispval, dispval: val.DBVAL || val.dbval } }) } }).concat(items || []).filter(function (data) { return data.values.length > 0; }).map(initAlis);
            return {
                then: function (func) {
                    func.call(this, function (data) {
                        var vals = [].concat(data); //复制一个新的
                        alis.forEach(function (obj) { var key = obj.name; vals.forEach(function (val) { val["_" + key] = val[key]; val[key] = obj.getAlis(val[key]); }); });
                        return vals;
                    });
                }
            }
        }

        if (cls.alis) {
            if (typeof cls.alis.then == 'function')return cls.alis.then(init);
            if (typeof cls.alis == 'function')return init(cls.alis());
        }
        return init(cls.alis);
    }

    /**
    *
    * 核心函数
    * @param {any} target
    * @param {any} config
    */
    function Core(target, config) {
        var ckey, self = this,
            $win = $(window),
            $target = $(target),
            options = config || {},
            tableName = options.tableName,
            cls = options.cls || {},
            fquery = $.extend({ loading: false }, cls.query),
            dquery = $.extend({ loading: false }, options.query),
            fcompleted = noop,
            completed = noop,
            errors = new Callback();

        /**
        * 初始化
        * @param {any} ops
        * @param {any} cols
        * @param {any} alis
        * @param {any} init
        */
        function initMtable(ops, cols, alis, init) {
            var pgno = 1;
            var etable = table.render($.extend({}, ops, { even: true, elem: $target[0], cols: cols, jump: jump }));
            ckey = etable.config.index;

            function jump(obj, first) { if (!first) { pgno = obj.curr; etable.config.limit = obj.limit; self.refresh();}}

            alis.then(function (func) {
                function goPage(pg, limit) {
                    if (pg > 0) pgno = pg;
                    var $elme = $target.parent().find(".layui-table-view"),
                        rdata = { f: 'json', withCount: true, page: pgno, size: limit || ops.limit  },
                        offset = {
                            top: $elme.offset().top + $elme.height() / 2 - 35 - $win.scrollTop(),
                            left: $elme.offset().left + $elme.width() / 2 - 90 - $win.scrollLeft()
                        },
                        idx = $target.is(':visible') && dquery.loading ? layer.msg('正在读取数据内容', { icon: 16, shade: 0.03, offset: [offset.top + 'px', offset.left + 'px'], fixed: true, time: 0 }) : -1;
                    getDatas(dquery, rdata, errors).then(function (datas) { layer.close(idx); etable.renderData({ code: 0, msg: "", count: datas.count, data: func(datas.data) }, pgno, datas.count); completed();});
                }

                self.refresh = function (pg) { goPage(pg, etable.config.limit); };
                self.layout = function () { setTimeout(etable.refresh, 500); };
                fcompleted();
                if (init) self.refresh();
            });
        }

        /**
        * 页面刷新
        */
        this.refresh = noop;

        /**
         * 更新布局
         */
        this.layout = noop;

        /**
        * 错误数据
        * @param {} func 
        * @returns {} 
        */
        this.error = function(func) { return errors.add(func), this; }

        /**
        * render方法
        * @param {} ops 
        * @returns {} 
        */
        this.render = function (ops, init) {
            var cfg = $.extend({}, mcfg.render, ops);
            $target.empty();
            if (tableName || Object.keys(fquery).length > 0) {
                var idx = $target.is(':visible') && fquery.loading ? layer.msg('正在读取数据格式', { icon: 16, shade: 0.03, fixed: true, time: 0 }) : -1;
                getFields(fquery, { f: 'json' }, errors).then(function (res) { layer.close(idx); initMtable(cfg, [getCls(cls, res)], getAlis(cls, res), init)});
            } else
                initMtable(cfg, [getCls(cls)], getAlis(cls));
            return this;
        }

        /**
        * 只能render 一次
        * @param {} ops 
        * @returns {} 
        */
        this.renderOnce = function (ops, init) {
            this.renderOnce = function () { return this; };
            return this.render(ops, init).layout(), this;
        }

        /**
        * 关联表
        * @param {} tname 
        * @returns {} 
        */
        this.refTable = function(tname) {
            return fquery.tableName = dquery.tableName = tableName = tname, this;
        }

        /**
        * 设置不显示字段
        * @param {} items 
        * @param {} splitChar 
        * @returns {} 
        */
        this.unVisable = function(items, splitChar) { //不显示字段
            return cls.unVisable = (cls.unVisable || []).concat(Array.isArray(items) ? items : strFilter(items, splitChar || ',')), this;
        }

        /**
        * 固有字段
        * @param {} fields 
        * @returns {} 
        */
        this.fields = function(fields) {
            return cls.fields = (cls.fields || []).concat(Array.isArray(fields) ? fields : [fields]), this;
        }

        /**
        * 设置别名
        * @param {} alis 
        * @param {} splits 结构[;:,-] 代表 [field1:1-A,2-B,3-C;field2:1-X,2-Y,3-Z;...]
        * @returns {} 
        */
        this.setAlis = function(alis, splits) {
            return cls.alis = (cls.alis || []).concat(Array.isArray(alis) ? alis : strFilter(alis, splits[0] || ';').map(function (item) {
                var arr = strFilter(item, splits[1] || ':');
                return {
                    name: arr[0],
                    values: strFilter(arr[1], splits[2] || ',').map(function(keyval) {
                        var vals = strFilter(keyval, splits[3] || '-');
                        return { dbval: vals[0], dispval: vals[1] };
                    })
                }
            })), this;
        }

        /**
        * 默认字段长度
        * @param {} alis 
        * @param {} splits 
        * @returns {} 
        */
        this.defualtWidth = function(width) {
            return cls.width = width, this;
        }

        /**
        * 设置配置项目
        * @param {} cfg 
        * @returns {} 
        */
        this.setClsConfig = function (cfg) {
            var clscfg = etend(cls, 'config');
            return Object.keys(cfg).map(function(key) {
                var obj = cfg[key];
                clscfg.config[key] = Array.isArray(obj)
                    ? obj.map(function(item) { return { field: item[0], value: item[1] } })
                    : Object.keys(obj).map(function (item) { return { field: item, value: obj[item] } });
            }), this;
        }

        /**
        * 设置字段定义参数
        * @param {} key 
        * @param {} obj 
        * @returns {} 
        */
        this.setClsVal = function(key, obj) {
            if (typeof key === 'string') return cls[key] = obj, this;
            return $.extend(cls, key), this;
        }

        /**
        * 设置字段获取的相关参数
        * svn, path, data, success
        * @returns {} 
        */
        this.fieldReq = function() {
            return $.each(arguments, function(i, val) { fquery[keys[i]] = val; }), this;
        }

        /**
        * 设置字段获取的相关参数
        * @param {} key 
        * @param {} obj 
        * @returns {} 
        */
        this.setFiledReq = function (key, obj) {
            if (typeof key === 'string') return fquery[key] = obj, this;
            return $.extend(fquery, key), this;
        }

        /**
        * 更新来自请求获取的字段
        * @param {} suc 
        * @returns {} 
        */
        this.updateFieldData = function(suc) {
            return fquery.update = suc, this;
        }

        /**
        * 设置获取表格数据的相关参数
        * @returns {} 
        */
        this.dataReq = function() {
            return $.each(arguments, function(i, val) { dquery[keys[i]] = val; }), this;
        }

        /**
        * 设置获取表格数据的相关参数
        * @param {} obj 
        * @returns {} 
        */
        this.setDataReq = function (key, obj) {
            if (typeof key === 'string') return dquery[key] = obj, this;
            return $.extend(dquery, key), this;
        }

        /**
        * 更新来自服务端的请求
        * @param {} suc 
        * @returns {} 
        */
        this.updateData = function(suc) {
            return dquery.update = suc, this;
        }

        /**
        * 当行点击触发事件
        * @param {} func 
        * @returns {} 
        */
        this.rowClick = (function () {
            var click = noop, $table = $target.parent();
            $table.on('click', '.layui-table-view > .layui-table-main tr', function (el) {
                var idx = $(el.currentTarget).attr('data-index');
                $table.find('.layui-table-click').removeClass('layui-table-click');
                $table.find('[data-index=' + idx + ']').addClass('layui-table-click');
                click.call(self, table.cache[ckey][idx]);
            });
            return function(func) { return click = func, this;}
        })();

        /**
        * 获取选中项目
        * @returns {} 
        */
        this.getSelect = function() {
            return [].concat($target.parent().find('.layui-table-main .layui-table-click')).map(function(obj) {
                return table.cache[ckey][$(obj).attr('data-index')];
            });
        }

        /**
        * 工具点击
        */
        this.toolClick = (function () {
            var clicks = {}, $table = $target.parent();
            $table.on('click', '*[lay-event]', function (el) {
                var $el = $(el.currentTarget);
                var idx = $el.parents("tr").attr('data-index');
                click(clicks[$el.attr('lay-event')], table.cache[ckey][idx]);
            });
            function click(func, data) {
                if (typeof func === 'function') func.call(self, data);
            }
            return function (key, func) {
                if (typeof key === 'string' && typeof func === 'function')clicks[key] = func;
                else Object.keys(key).forEach(function(k) { if (typeof key[k] === 'function')clicks[k] = key[k]; });
                return this;
            }
        })();

        /**
         * 初始化完成字段
         * @param {} func 
         * @returns {} 
         */
        this.fieldCompleted = function (func) {
            return fcompleted = func, this;
        }

        /**
        * 完成
        * @param {} func 
        * @returns {} 
        */
        this.completed = function (func) { completed = func; return this; }
    }

    layui.mtable = function(target, config) { return new Core(target, config); };
    layui.mtable.config = function(config) { $.extend(mcfg, config); }
    layui.mtable.on = table.on;
    exports("mtable", layui.mtable);
});