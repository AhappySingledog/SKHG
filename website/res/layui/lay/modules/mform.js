/**
 @Name：layui.mform 表单组件
 @Author：XiaoMei
 @License：MIT    
 */

layui.define(['jquery', 'form', 'layedit', 'laydate', 'layer'], function (exports) {
    var $ = layui.$, form = layui.form, layedit = layui.layedit, laydate = layui.laydate, layer = layui.layer,
        keys = ['sub', 'svn', 'path', 'data', 'xpath', 'update'], cdx = 1,
        mcfg = { svn: 'NET_SERVER', sub: 'webAction' };
        
    /**
     * 空函数
     */
    function noop() { };

    /**
     * 切分字符串
     * @param {any} str
     * @param {any} charStr
     */
    function strFilter(str, charStr) { return str.split(charStr).filter(function (x) { return x; }) }

    /**
     * 扩展属性
     * @param {any} obj
     * @param {any} key
     * @param {any} val
     */
    function xtend(obj, key, val) { if (val) obj[key] = val; return obj; }

    /**
     * 补齐缺少
     * @param {any} obj
     * @param {any} key
     * @param {any} val
     */
    function etend(obj, key, val) { if (!obj[key]) obj[key] = val || {}; return obj; }

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
     * @param {any} xpath
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
     */
    function result(query, data, xpath, errors) {
        if (typeof query.update === 'function') return query.update(data) || [];
        if (xpath) {
            if (typeof xpath === 'string')
                return getSuperValue(data, xpath);
            if (Array.isArray(xpath))
                return xpath.map(function (path) { return getSuperValue(data, path) });
            else
                return Object.keys(xpath).reduce(function (a, b) { return a[b] = getSuperValue(data, xpath[b]), a; }, {});
        }
        return errors.invork(data), [];
    }

    /**
     * 排序
     * @param {any} items
     * @param {any} key
     */
    function groupBy(items, key) {
        var helper = {
            items: [],ref: {},
            get: function (obj) {
                var val = "_" + obj;
                if (this.ref[val] == null) {
                    this.ref[val] = this.items.length;
                    this.items.push({ key: obj, group: [] });
                }
                return this.ref[val];
            },
            add: function (obj) { return this.items[this.get(obj[key])].group.push(obj), this; }
        }
        return items.reduce(function(a, b) { return a.add(b); }, helper).items;
    }

    /**
     * 回调事件
     */
    function Callback() {
        var callbacks = [];

        this.add = function (func) { if (typeof func === 'function') callbacks.push(func); }

        this.del = function (func) {
            callbacks = callbacks.filter(function (x) { return x !== func });
        }

        this.invork = function (arg) {
            callbacks.forEach(function (func) { func(arg) });
        }
    }

    /**
     * 初始化Alis
     * @param {any} alis
     */
    function initAlis(alis) {
        var obj = alis.values.reduce(function (a, b) { return a["_alis_" + b.dbval] = b.dispval, a; }, {});
        return { name: alis.name, values: alis.values, getAlis: function (val) { return obj["_alis_" + val] || val; } };
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
    function getDatas(query, errors) {
        return publish(query.sub || mcfg.sub,
            {
                svn: query.svn || mcfg.svn,
                path: query.path,
                data: getParams(query.data, $.extend({}, query)) || { f: 'json' }
            }).then(function (res) { return result(query, res[0], query.xpath, errors); });
    }

    /**
     * 验证类型
     * @param {any} fd
     */
    function getVerify(fd) {//数据库没有提供多余字段用于校验，好扯淡啊
        var arr = [];
        if ((fd.NULLABLE != null && fd.NULLABLE != 1) || (fd.nullable != null && fd.nullable != 1))
            arr.push('required');
        if (fd.DISPTYPE == 5 || fd.disptype == 5 || fd.DISPTYPE == 15 || fd.disptype == 15)
            arr.push('date');//日期
        //arr.push('identity');//身份证
        //arr.push('number');//数字
        //arr.push('url');//网址
        //arr.push('email');//email
        //arr.push('phone');//手机号
        return arr.join('|');
    }

    /**
     * 获取表单的字段
     * @param {any} fds
     * @param {any} datas
     */
    function getFields(fds, datas) {
        var unVisable = fds.unVisable || []; //不显示字段
        var wd = fds.width || '50%'; //默认长度
        var extend = fds.config || {}; //扩展配置
        var flds = (datas || []).filter(function(data) {
            return (data.VISIBLE != null && data.VISIBLE == "1") || (data.visible != null && data.visible == "1");
        }).map(function(data) {
            return {
                field: data.NAME || data.name,
                title: data.ALIAS || data.alias,
                width: wd,
                edite: true,
                disptype: data.DISPTYPE || data.disptype || 1,
                verify: getVerify(data),
                group: (data.INSERTRULE || data.insertrule || 1) * 1,
                fidx: (data.UPDATERULE || data.updaterule || data.FINDEX || data.findex) * 1
            };
        }).filter(function(data) { return !unVisable.some(function(field) { return field === data.field }) }); //过滤不显示内容
        flds = flds.concat((fds.fields || []).map(function (x) { return etend(etend(x, 'fidx', 1000), 'group', 1);})); //添加补充项 同时未定义排序项设默认值1000, 分组为1;
        Object.keys(extend).forEach(function (key) { (extend[key] || []).forEach(function (cfg) { flds.filter(function (fd) { return fd.field === cfg.field }).forEach(function (fd) { fd[key] = cfg.value; }); }); }); //扩展补充项目
        return groupBy(flds, 'group').map(function (item) { return item.group = item.group.sort(function(x, y) { return x.fidx < y.fidx ? -1 : (x.fidx > y.fidx ? 1 : 0); }), item;});
    }

    /**
     * 别名处理 支持异步then
     * @param {any} fds
     * @param {any} datas
     */
    function getAlis(fds, datas) {
        function init(items) {
            var alis = (datas || []).map(function (data) { return { name: data.NAME || data.name, values: (data.values || []).map(function (val) { return { dbval: val.DISPVAL || val.dispval, dispval: val.DBVAL || val.dbval } }) } }).concat(items || []).filter(function (data) { return data.values.length > 0; }).map(initAlis);
            return {
                then: function (func) {
                    func.call(this, function (fname, fval) {
                        var obj = alis.filter(function (a) { return a.name === fname })[0];
                        if (arguments.length > 1) return obj && obj.getAlis(fval) || fval;
                        return obj && [].concat(obj.values) || [];
                    });

                }
            }
        }

        if (fds.alis) {
            if (typeof fds.alis.then == 'function')
                return fds.alis.then(init);
            if (typeof fds.alis == 'function')
                return init(fds.alis());
        }
        return init(fds.alis);
    }

    /**
     * 表单构造器
     * @param {any} $target
     * @param {any} fields
     * @param {any} afunc
     * @param {any} ops
     */
    function FormHelper($target, fields, afunc, ops) {
        var enable = ops.enable, icon = ['&#xe643;', '&#xe63f;'];

        function getReq(fd) {
            return  enable && fd.verify.split('|').some(function (x) { return x === 'required'}) ?  '<span style="color: red">*</span>' : '';
        }

        function getDisabled(fd) {
            return fd.edite && enable ? '' : ' disabled ';
        }

        function getItem(fd) {
            var $item = $('<div class="layui-form-item" style="margin-bottom: 4px !important; width:' + fd.width + '"/>');
            $('<label class="layui-form-label" style="width:' + (ops.left - 8) + 'px !important">' + fd.title + getReq(fd) + ':</label>').appendTo($item);
            $('<div class="layui-input-block" style="margin-left:' + ops.left + 'px !important"/>').appendTo($item).append(getItemDef(fd));
            return $item;
        }

        function getInput(fd, props) {
            var prs = xtend(props || {}, 'lay-verify', fd.verify);
            var $input = fd.edite && enable ? $('<input type="text" autocomplete="off" class="layui-input" placeholder="请输入' + fd.title + '" name="' + fd.field + '"/>'):
                $('<input type="text" autocomplete="off" class="layui-input" disabled name="' + fd.field + '"/>');
            Object.keys(prs).forEach(function (key) { $input.attr(key, prs[key]);});
            return $input;
        }

        function getPassWord(fd, props) {
            var prs = xtend(props || {}, 'lay-verify', fd.verify);
            var $input = fd.edite && enable ? $('<input type="password" autocomplete="off" class="layui-input" placeholder="请输入' + fd.title + '" name="' + fd.field + '"/>') :
                $('<input type="password" autocomplete="off" class="layui-input" disabled name="' + fd.field + '"/>');
            Object.keys(prs).forEach(function (key) { $input.attr(key, prs[key]); });
            return $input;
        }

        function getRadio(fd, props) {
            var prs = xtend(props || {}, 'lay-verify', fd.verify);
            return afunc(fd.field).map(function (val) {
                var $input = $('<input type="radio" name="' + fd.field + '" value="' + val.dbval + '" title="' + val.dispval + '"' + getDisabled(fd) + '/>');
                Object.keys(prs).forEach(function (key) { $input.attr(key, prs[key]); });
                return $input;
            });
        }

        function getCheckbox(fd, props) {
            var prs = xtend(props || {}, 'lay-verify', fd.verify);
            return afunc(fd.field).map(function (val) {
                var $input = $('<input type="checkbox" name="' + fd.field + '[' + val.dbval + ']" value="' + val.dbval + '" title="' + val.dispval + '"' + getDisabled(fd) + '/>');
                Object.keys(prs).forEach(function (key) { $input.attr(key, prs[key]); });
                return $input;
            });
        }

        function getSelect(fd, props) {
            var prs = xtend(props || {}, 'lay-verify', fd.verify);
            var $select = $('<select name="' + fd.field + '" ' + getDisabled(fd) + '/>');
            $select.append($('<option value=""></option>'));
            afunc(fd.field).forEach(function (val) { $select.append($('<option value="' + val.dbval + '">' + val.dispval + '</option>')); });
            Object.keys(prs).forEach(function (key) { $select.attr(key, prs[key]); });
            return $select;
        }

        function getGeometry(fd) {
            return $('<div class="geo"/>').append([
                $('<input type="text" name="' + fd.field + '_X" placeholder="请输入X坐标" lay-verify="number" autocomplete="off" class="layui-input" ' + getDisabled(fd) + '>'),
                $('<span style="line-height: 30px; margin:0 4px">-</span>'),
                $('<input type="text" name="' + fd.field + '_Y" placeholder="请输入Y坐标" lay-verify="number" autocomplete="off" class="layui-input" ' + getDisabled(fd) + '>')
            ]);
        }

        function getTextArea(fd, props) {
            var prs = xtend(props || {}, 'lay-verify', fd.verify);
            var $textArea = fd.edite && enable ? $('<textarea autocomplete="off" class="layui-textarea" placeholder="请输入' + fd.title + '的内容" name="' + fd.field + '"/>') :
                $('<textarea autocomplete="off" class="layui-textarea" disabled name="' + fd.field + '"/>');
            Object.keys(prs).forEach(function (key) { $textArea.attr(key, prs[key]); });
            return $textArea;
        }

        /**
         * 表单内容模块
         * @param {any} fd
         */
        function getItemDef(fd) {
            switch (fd.disptype * 1) {
                case 2: return getInput(fd, { 'lay-verify': 'number'});//数值
                case 3: return getSelect(fd);//下拉
                case 4: return getGeometry(fd); //空间类型
                case 5: return getInput(fd, { placeholder: (enable ? 'yyyy-MM-dd HH:mm:ss' : ''), dt: 'datetime' });//数值//日期类型
                case 6: return getTextArea(fd);//文本域
                case 7: return getRadio(fd);//单选框
                case 8: return getCheckbox(fd, { 'lay-skin':'primary'});//原始复选框
                case 9: return getCheckbox(fd);//复选框
                case 10: return getPassWord(fd);//密码
                default: return getInput(fd);//文本
            }
        }

        /**
         * 设置表单内容模块
         * @param {any} fd
         */
        function setItemDef(fd, val) {
            switch (fd.disptype * 1) {
                case 3:
                    $target.find('[name=' + fd.field + ']').val(val);
                    var $next = $target.find('[name=' + fd.field + ']').next();
                    $next.find('input').val(afunc(fd.field, val));
                    if (enable)
                        $next.find('[lay-value=' + val + ']').trigger('click');
                    break;
                case 4: break; //空间类型
                case 7:
                    if (enable)
                        $target.find('[name=' + fd.field + '][value=' + val + ']').next().trigger('click');
                    else {
                        $target.find('[name=' + fd.field + ']').each(function () {
                            var $my = $(this);
                            if ($my.val() === val) {
                                this.checked = true;
                                $my.next().find('.layui-icon').html(icon[0]);
                            } else {
                                this.checked = false;
                                $my.next().find('.layui-icon').html(icon[1]);
                            }
                        });
                    }
                    break;//单选框
                case 8: break;//原始复选框
                case 9: break;//复选框
                default:
                    $target.find('[name=' + fd.field + ']').val(val); break;//文本
            }
        }

        /**
         * 绘制
         * @returns {} 
         */
        this.render = function () {
            var lf = $target.attr("lay-filter") || ("form_lay_filter_" + cdx++);
            $target.attr("lay-filter", lf).addClass("layui-form").empty();
            fields.forEach(function (field) {
                var $group = $('<div class="group"/>').appendTo($target);
                field.group.map(function (item) { $group.append(getItem(item)) });
            });

            form.render(null, lf);
            $target.find('input[lay-verify*=date]').each(function () {
                laydate.render({ elem: this, theme: 'grid', type: $(this).attr('dt') });
            });
        }
          
        /**
         * 设置表单内容
         * @param {} data 
         * @returns {} 
         */
        this.setValues = function (data) {
            fields.forEach(function (field) {
                field.group.map(function (fld) {
                    setItemDef(fld, data[fld.field]);
                });
            });
        }
    }

    /**
     * 核心函数
     * @param {any} target
     * @param {any} config
     */
    function Core(target, config) {
        var self = this,
            $win = $(window),
            options = config || {},
            tableName = options.tableName,
            fds = options.fds || {},
            fquery = $.extend({ loading: false }, fds.query),
            dquery = $.extend({ loading: false }, options.query),
            errors = new Callback(),
            completed = noop,
            fcompleted = noop,
            $target = $(target);

        /**
         * 初始化
         * @param {any} ops
         * @param {any} flds
         * @param {any} alis
         */
        function initMform(ops, flds, alis) {
            alis.then(function(afunc) {
                var mform = new FormHelper($target, flds, afunc, ops);
                self.refresh = function() {
                    if (arguments.length > 0) {
                        mform.setValues(arguments[0]);
                        completed();
                    } else {
                        var data = xtend($.extend({}, dquery)),
                            offset = {
                                top: $target.offset().top + $target.height() / 2 - 35 - $win.scrollTop(),
                                left: $target.offset().left + $target.width() / 2 - 90 - $win.scrollLeft()
                            },
                            idx = $target.is(':visible') && dquery.loading ? layer.msg('正在读取数据', { icon: 16, shade: 0.03, offset: [offset.top + 'px', offset.left + 'px'], fixed: true, time: 0 }) : -1; 
                        getDatas(data, errors).then(function(res) { layer.close(idx); mform.setValues(res); completed(); });
                    };
                };
                mform.render();
                fcompleted();
                if (Object.keys(dquery).length > 1) self.refresh();
            });
        }

        /**
         * 页面刷新
         */
        this.refresh = noop;

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
        this.render = function(ops) {
            var cfg = $.extend({ enable: true, left: 185 }, mcfg.render, ops);
            $target.addClass("layui-form").empty();
            var idx = $target.is(':visible') && fquery.loading ? layer.msg('正在读取数据格式', { icon: 16, shade: 0.03, fixed: true, time: 0 }) : -1;
            getDatas($.extend({ path: 'GetFlds', xpath: 'data', data: { tname: tableName } }, fquery), errors).then(function (res) { layer.close(idx); initMform(cfg, getFields(fds, res), getAlis(fds, res)) });
            return this;
        }

        /**
         * 只能render 一次
         * @param {} ops 
         * @returns {} 
         */
        this.renderOnce = function(ops) {
            this.renderOnce = function() { return this; };
            return this.render(ops);
        }

        /**
         * 关联表
         * @param {} tname 
         * @returns {} 
         */
        this.refTable = function(tname) {
            return tableName = tname, this;
        }

        /**
         * 设置不显示字段
         * @param {} items 
         * @param {} splitChar 
         * @returns {} 
         */
        this.unVisable = function(items, splitChar) { //不显示字段
            return fds.unVisable = (fds.unVisable || []).concat(Array.isArray(items) ? items : strFilter(items, splitChar || ',')), this;
        }

        /**
         * 固有字段
         * @param {} fields 
         * @returns {} 
         */
        this.fields = function(fields) {
            return fds.fields = (fds.fields || []).concat(Array.isArray(fields) ? fields : [fields]), this;
        }

        /**
         * 设置别名
         * @param {} alis 
         * @param {} splits 结构[;:,-] 代表 [field1:1-A,2-B,3-C;field2:1-X,2-Y,3-Z;...]
         * @returns {} 
         */
        this.setAlis = function (alis, splits) {
            splits = splits || [];
            return fds.alis = (fds.alis || []).concat(Array.isArray(alis)
                ? alis
                : strFilter(alis, splits[0] || ';').map(function(item) {
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
            return fds.width = width, this;
        }

        /**
         * 设置配置项目
         * @param {} cfg 
         * @returns {} 
         */
        this.setFieldConfig = function(cfg) {
            var fdscfg = etend(fds, 'config');
            return Object.keys(cfg).map(function(key) {
                var obj = cfg[key];
                fdscfg.config[key] = Array.isArray(obj)
                    ? obj.map(function(item) { return { field: item[0], value: item[1] } })
                    : Object.keys(obj).map(function(item) { return { field: item, value: obj[item] } });
            }), this;
        }

        /**
         * 设置字段定义参数
         * @param {} key 
         * @param {} obj 
         * @returns {} 
         */
        this.setFieldVal = function(key, obj) {
            if (typeof key === 'string') return fds[key] = obj, this;
            return $.extend(cls, key), this;
        }

        /**
         * 设置验证规则
         * @param {} key 
         * @param {} obj 
         * @returns {} 
         */
        this.setVerify = function(key, obj) {
            if (typeof key === 'string')
                return this.setVerify(etend({}, key, obj));
            return Object.keys(key).forEach(function(k) {
                fquery.config[k] = typeof key[k] === 'string' ? key[k].split(',').map(function(x) { return x.split('-'); }) : key[k];
            }), this;
        }

        /**
         * 设置字段请求服务
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
        this.setFiledReq = function(key, obj) {
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
         * 设置请求数据参数函数
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
        this.setDataReq = function(key, obj) {
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
        this.completed = function(func) {
            return completed = func, this;
        }
        
        /**
         * 获取表单数据
         * @returns {} 
         */
        this.submit = (function () {
            var submit = function() {
                var ft = $target.attr("lay-filter");
                if (ft) {
                    var afunc = arguments[0];
                    submit = function () { return afunc = arguments[0], true}
                    return form.on('submit('+ ft + ')', function (data) { return afunc.call(null, data.field), false; }), true;
                }
                return false;;
            }
            return function (func) { if (submit(func)) $target.trigger('submit'); return this; }
        })();
    }

    form.config.verify.date = function (val, target) {
        if (val && target.required) return /^(\\d{4})[-\\/](\\d{1}|0\\d{1}|1[0-2])([-\\/](\\d{1}|0\\d{1}|[1-2][0-9]|3[0-1]))*$/.test(val) ? '日期格式不正确' : false;
        return false;
    }
    form.config.verify.number =  function(val, target) {
        if (val && target.required) return /^\d+$/.test(val) ? '只能填写数字' : false;
        return false;
    }
    layui.mform = function (target, config) { return new Core(target, config); };
    layui.mform.config = function (config) { $.extend(mcfg, config); }
    exports("mform", layui.mform);
});