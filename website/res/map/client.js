window._jscache = [];
// window._API_Path = 'http://10.1.0.177:8080/ecity_js_api1.0';
window._API_Path = 'http://172.19.1.246:8080/ecity_js_api1.0';
var _load = function () {
    var args = arguments;
    for (var i = 0; i < args.length; i++) {
        var url = window._API_Path + (args[i].indexOf('/') == 0 ? '' : '/') + args[i];
        _loadLocal(url);
    }
};

var _loadLocal = function (url) {
    if (!window._jscache[url]) {
        var content = null;
        if (url.indexOf('.css') > -1) {
            content = '<link type="text/css" rel="stylesheet" href="' + url + '"></link>';
        } else {
            content = '<script type="text/javascript" src="' + url + '"></script>';            
        }
        document.write(content);
        window._jscache[url] = 1;
    }
};

(function () {
    window._load('frame/js/jquery-1.9.1.min.js');
})();