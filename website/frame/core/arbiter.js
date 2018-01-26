import _ from 'lodash';
import arbiter from 'promissory-arbiter';

/**
 * 订阅
 * @param {any} option
 */
function subscribe(...option) {
    return arbiter.subscribe(...option);
}

/**
 * 取消订阅
 * @param {any} option
 */
function unsubscribe(...option) {
    return arbiter.unsubscribe(...option);
}

/**
 * 恢复订阅
 * @param {any} option
 */
function resubscribe(...option) {
    return arbiter.resubscribe(...option);
}

/**
 * 取消权值
 * @param {any} option
 */
function removePersisted(...option) {
    return arbiter.removePersisted(...option);
}

/**
 * 修改默认为异步调用
 * @param {any} topic
 * @param {any} subscriptions
 * @param {any} options
 * @param {any} context
 */
function publish(topic, subscriptions, options, context) {
    return arbiter.publish(topic, subscriptions, _.assign({ sync: true }, options), context);
}

/**
 * 多订阅
 * @param {any} datas
 */
function subscribes(...datas) {
    datas.forEach((data) => {
        if (_.isArray(data)) {subscribes(...data);}           
        else {subscribe(data.sub, data.func, data.ops, data.context);}            
    });
}

(function () {
    // 加载控制
    let once = {};
    subscribe('importOnce', (ops) => {
        const {token, scribes = {}} = ops;
        if (!once[token]) {
            once[token] = true;
            if (Array.isArray(scribes)) {subscribes(scribes)}
            else {
                Object.keys(scribes).map((key) => {
                    if (Array.isArray(scribes[key])) {subscribes(scribes[key])}
                    else {
                        const {sub, func, ops, context} = scribes[key];
                        subscribe(sub, func, ops, context);
                    }
                });
            }
        }
    });
    
    // 提供全局缓存
    const storage = window.localStorage;
    subscribes([
        { sub: 'setStorage', func: (ops) => storage.setItem(ops.key, JSON.stringify(ops)) },
        { sub: 'getStorage', func: (ops) => JSON.parse(storage.getItem(ops) || '{}') },
        { sub: 'delStorage', func: (ops) => storage.removeItem(ops) },
    ]);
    // 获取浏览器版本
    let browser = {
        versions: (() => {
            const u = navigator.userAgent;
            return {
                android: u.indexOf('Android') > -1 || u.indexOf('Linux') > -1,
                iPhone: u.indexOf('iPhone') > -1,
                iPad: u.indexOf('iPad') > -1,
                iPod: u.indexOf('iPod') > -1,
            };
        })(),
        language: (navigator.browserLanguage || navigator.language).toLowerCase(),
    }

    subscribes([
        { sub: 'getVersions', func: () => browser.versions },
        { sub: 'isIOS', func: () => browser.versions.iPhone || browser.versions.iPad || browser.versions.iPod },
        { sub: 'isAndroid', func: () => browser.versions.android },
    ]);
})();


export { publish, subscribe, subscribes, unsubscribe, resubscribe, removePersisted };