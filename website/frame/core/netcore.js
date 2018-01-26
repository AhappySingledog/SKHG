import $ from 'jquery';
import _ from 'lodash';
import { subscribes, publish } from './arbiter';

/**
 * 数据操作对象
 */
const invokeCall = (f, args, context) => {if (typeof f === 'function') return f.call(context, args);},
    resolve = (callback) => (res) => invokeCall(callback, res[0]),
    reject = (callback) => (res) => invokeCall(callback, { error: '请求失败', desc: res[0] }),
    sPublish = (topic, options, callback = (res) => res) => publish(topic, options).then(resolve(callback), reject(callback)),
    lQuery = {
        name: 'layer',
        metas: {},
        fieldsCache: {},
        layeridValid: (layerid) => _.isNumber(layerid) || (layerid % 1 === 0),
        getMetas: (callback, svn, proxy) => {
            if (lQuery.metas[svn]) { invokeCall(callback, _.cloneDeep(lQuery.metas[svn])); }
            publish('webAction', { svn, path: 'metas', data: { f: 'json' } }).then((res) => {
                invokeCall(callback, _.cloneDeep(lQuery.metas[svn] = res[0].metainfo));
            }, reject(callback));
        },
        getLayerId: (dno, callback, svn, proxy) => lQuery.getMetas((meta) => {
            callback();
        }, svn, proxy),
        getField: (layerid, callback, svn, proxy) => {
            if (lQuery.layeridValid(layerid)) sPublish('webAction', { svn, path: layerid, data: { f: 'json' } }, callback);
        },
        getData: (layerid, parm, callback, svn, proxy) => {
            if (lQuery.layeridValid(layerid)) sPublish('webAction', { svn, proxy, type: 'post', path: layerid + '/query', data: _.merge({ f: 'json' }, parm) }, callback);
        },
        getIdentify: (parm, callback, svn, proxy) => {
            sPublish('webAction', { svn, proxy, type: 'post', path: 'identify', data: _.merge({ f: 'json' }, parm) }, callback);
        },
        append: (layerid, adds, callback, svn, proxy) => {
            if (lQuery.layeridValid(layerid)) sPublish('webAction', { svn, proxy, type: 'post', path: layerid + '/applyEdits', data: { f: 'json', adds: JSON.stringify(_.castArray(adds).map((obj) => { return { attributes: obj }}))} }, callback);
        },
        update: (layerid, updates, callback, svn, proxy) => {
            if (lQuery.layeridValid(layerid)) sPublish('webAction', { svn, proxy, type: 'post', path: layerid + '/applyEdits', data: { f: 'json', updates: JSON.stringify(_.castArray(updates).map((obj) => { return { attributes: obj } })) } }, callback);
        },
        del: (layerid, ids, callback, svn, proxy) => {
            if (lQuery.layeridValid(layerid)) sPublish('webAction', { svn, proxy, type: 'post', path: layerid + '/applyEdits', data: { f: 'json', deletes: ids } }, callback);
        },       
    },
    tQuery = {
        name: 'table',
        fieldsCache: {},
        getField: (name, callback, svn, proxy) => {
            if (name) {
                let table = svn + proxy + name;
                if (tQuery.fieldsCache[table]) { invokeCall(callback, _.cloneDeep(tQuery.fieldsCache[table])); }
                publish('webAction', { svn: svn, proxy: proxy, path: '/table/' + name, data: { f: 'json' } }).then((res) => {
                    invokeCall(callback, _.cloneDeep(tQuery.fieldsCache[table] = _(res[0].fields).sortBy('findex').value()));
                }, reject(callback));
            }
        },
        getData: (name, parm, callback, svn, proxy) => {
            if (name) sPublish('webAction', { svn, proxy, type: 'post', path: '/table/' + name + '/query', data: _.merge({ f: 'json' }, parm) }, callback);
        },
        append: (name, adds, callback, svn, proxy) => {
            if (name) sPublish('webAction', { svn, proxy, type: 'post', path: '/table/' + name + '/applyEdits', data: { f: 'json', adds: JSON.stringify(_.castArray(adds).map((obj) => { return { attributes: obj } })) } }, callback);
        },
        update: (name, updates, callback, svn, proxy) => {
            if (name) sPublish('webAction', { svn, proxy, type: 'post', path: '/table/' + name + '/applyEdits', data: { f: 'json', updates: JSON.stringify(_.castArray(updates).map((obj) => { return { attributes: obj } })) } }, callback);
        },
        del: (name, ids, callback, svn, proxy) => {
            if (name) sPublish('webAction', { svn, proxy, type: 'post', path: '/table/' + name + '/applyEdits', data: { f: 'json', deletes: ids } }, callback);
        },
    }, 
    Query = (ops) => ops.lx == 'l' ? lQuery : tQuery,
    queryKey = (ops) => ops.lx == 'l' ? ops.layerid : ops.tableName;

/**
 * 解析配置项
 * @param {any} data
 */
function getService(data) {
    let pys = data.proxy || [],
        svs = data.service || [],
        cfgs = svs.map((sv) => {
            return _.merge({}, sv, { proxyName: sv.proxy }, { proxy: pys.filter((y) => (y.name || '') === sv.proxy)[0] });
        });

    function combin(url1, url2) {
        if (url1 && url2) {
            let f1 = url1.lastIndexOf('/') + 1 === url1.length,
                f2 = url2.indexOf('/') === 0;
            if (f1 && f2) { return url1 + url2.substr(1); }
            else if (f1 || f2) { return url1 + url2; }
            else { return url1 + '/' + url2; }
        }
        return url1;
    }

    return function (key, path, proxy) {
        const cfg = cfgs.filter((x) => x.name === key)[0],
            pt = combin(cfg && cfg.url || key, path),
            py = proxy ? (pys.filter((y) => (y.name || '') === proxy)[0]) || { url: proxy } : cfg && cfg.proxy;
        return (py ? (py.url && py.url + '?') : '') + pt + (pt.indexOf('?') >= 0 ? '' : '?');
    }
}

/**
 * 核心模块
 * @param {*配置数据} data 
 */
function regedit(data) {
    const url = getService(data);
    subscribes(
        {
            sub: 'webAction',
            func: (opt) => new Promise((success, error) => {
                $.ajax({
                    url: url(opt.svn, opt.path, opt.proxy),
                    data: opt.data || {},
                    type: opt.type || 'get',
                    dataType: opt.dataType || 'jsonp',
                    jsonp: opt.jsonp || 'callback',
                    timeout: opt.timeout || 30000,
                    success: success,
                    error: error,
                });
            }),
        }, {
            sub: 'getFieldVal', /* 获取枚举织*/
            func: (opt) => new Promise((fulfill) => {
                tQuery.getField(opt.tableName, (result) => {
                    let resObject = {};
                    for (let i = 0; i < opt.fields.length; i++) {
                        for (let j = 0; j < result.length; j++) {
                            if (opt.fields[i] === result[j].name) {
                                resObject[opt.fields[i]] = [{ dbval: '--请选择--', dispval: '' }]
                                    .concat(result[j].values);
                            }
                        }
                    }
                    fulfill(resObject);
                }, opt.svn, opt.proxy);
            }),
        }, {
            sub: 'getField', /* 获取元数据 */
            func: (opt) => new Promise((fulfill) => tQuery.getField(opt && opt.tableName || opt, fulfill, opt.svn, opt.proxy)),
        }, {
            sub: 'getFldDbmeta', /* 获取枚举值 */
            func: (opt) => new Promise((fulfill) => {
                tQuery.getField(opt && opt.tableName || opt, (result) => {
                    fulfill({
                        items: _(result)
                            .filter((obj) => obj.values.length > 0)
                            .map((obj) => {
                                return { name: obj.name, alias: obj.alias, values: obj.values }
                            })
                            .value(),
                        containFld: (fld) => _.some(this.items, { name: fld }),
                        getDbVal: (fld, val) => {
                            let item = _.find(this.items, (obj) => obj.name == fld);
                            if (item) {
                                let vals = _.find(item.values, (obj) => obj.dbval == val);
                                return vals && vals.dispval || '';
                            }
                            return '';
                        },
                        getDispVal: (fld, val) => {
                            let item = _.find(this.items, (obj) => obj.name == fld);
                            if (item) {
                                let vals = _.find(item.values, (obj) => obj.dispval == val);
                                return vals && vals.dbval || '';
                            }
                            return '';
                        },
                    });
                }, opt.svn, opt.proxy);
            }),
        }, {
            sub: 'getData', /* 获取数据 */
            func: (opt) => new Promise((fulfill) => Query(opt).getData(queryKey(opt), opt.data, fulfill, opt.svn, opt.proxy)),
        }, {
            sub: 'appendData', /* 添加数据 */
            func: (opt) => new Promise((fulfill) => Query(opt).append(queryKey(opt), opt.attr, fulfill, opt.svn, opt.proxy)),
        }, {
            sub: 'updateData', /* 更新数据 */
            func: (opt) => new Promise((fulfill) => Query(opt).update(queryKey(opt), opt.attr, fulfill, opt.svn, opt.proxy)),
        }, {
            sub: 'delData', /* 删除数据*/
            func: (opt) => new Promise((fulfill) => Query(opt).del(queryKey(opt), opt.ids, fulfill, opt.svn, opt.proxy)),
        }, {
            sub: 'getMeta', /* 删除数据*/
            func: (opt) => new Promise((fulfill) => lQuery.getMetas(fulfill, opt.svn || opt, opt.proxy)),
        }, {
            sub: 'getWeather',
            func: (opt) => sPublish('webAction', { svn: 'sojson', path: 'weather/json.shtml', data: { city: opt }}),
        }
    );
}

$.ajax({ dataType: 'json', url: '../taskServices.json', async: false, success: regedit });