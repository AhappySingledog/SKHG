$(function () {
    window.dojo.require('esri.layers.FeatureLayer');
    window.dojo.require('esri.geometry.Circle');
    window.dojo.require('esri.tasks.IdentifyTask');
    window.dojo.require('esri.tasks.IdentifyParameters');
    window.require([
        'dijit/dijit',
        'esri/map',
        'esri/dijit/Popup',
        'esri/toolbars/edit',
        'esri/toolbars/draw',
        'dojo/domReady!',
    ], function (dijit, mapclass, popup, edit, draw) {
        $(document.body).children().first().css({ backgroundColor: '#fff' });
        window.mapWnd = window;
        window.map = new mapclass('map', {
            infoWindow: new popup(null, window.dojo.create('div')),
            autoResize: true,
        });
        window.map.id = 'gtop';
        window.dojo.addClass(window.map.infoWindow.domNode, 'myTheme');
        window.map.tileZoomEnabled = false;
        window.dojo.connect(window.map, 'onLoad', onLoadHandler);
        $.ajax({ dataType: 'json', url: '../data.json', async: false, success: function(obj) {
            var ups = getQueryParams();
            var data_cfg = obj.filter(function(obj) {return obj.name === 'GIS管网'; })[0] || {};
            var ztt = (data_cfg.data || []).filter(function(obj) {return obj.key === 'demo'})[0] || {};
            var zt = (ztt.data || []).filter(function(obj) {return obj.key === ups.map})[0] || {};
            var layers = zt.mapServer || [];
            layers.forEach(function(layer, i) {
                window.mapLayer.appendAMap(layer.type, { url: layer.url }, 50 * (i + 1));
            });
        }});
    });

    function getQueryParams() {
        var url = window.location.search.substr(1);
        return url.split('&').map(function(a) {return a.split('=');}).reduce(function(a, b) {a[b[0]] = b[1] || ''; return a; }, {});
    }

    function onLoadHandler() {
        $('.esriAttribution').hide();
        var $logBtn = $('.logo-med');
        $logBtn && $logBtn.hide();
        window.map.hideZoomSlider();
        // extentCenterAndScale(3609, -2387, 7559);
    }

    function extentCenterAndScale(x, y, scale) {
        var level = 10;
        var lods = window.map.__tileInfo.lods;
        for (var i = 0; i < lods.length; i++) {
            if (Math.abs(scale - lods[i].scale) < 50) {
                level = i;
                break;
            }
        }
        var location = new esri.geometry.Point({
            x: x,
            y: y,
            spatialReference: window.map.spatialReference,
        });
        window.map.centerAndZoom(location, level);
    }
});