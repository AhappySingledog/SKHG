/**
 * Created by remote on 2017/5/27.
 */
var mapId = 'map_' + new Date().getMilliseconds();
var $map = null;
var map = null;
var $positionSpan = null;

var mapOper = null;
var mapDisplay = null;
var mapLayer = null;
var mapEdit = null;
var drawToolBar = null;
var mapcfg = null;

require([
    'esri/map',
    'esri/SpatialReference',
    'custom/mapOper',
    'custom/mapLayer',
    'custom/mapDisplay',
    'custom/DrawToolBar',
    'custom/mapEvent',
    'esri/geometry/Point',
    'esri/geometry/Extent',
    'esri/dijit/OverviewMap',
    'esri/dijit/Scalebar',
    'esri/dijit/Popup',
    'dojo/domReady!'
], function (Map,
             SpatialReference,
             MapOper,
             MapLayer,
             MapDisplay,
             DrawToolBar,
             MapEvent,
             Point,
             Extent,
             OverviewMap,
             Scalebar,
             Popup) {
    createMapContainer();

    //天地图比例尺
    var lods = [
            { "level": 15, "resolution": 4.291534423828125e-005, "scale": 18035.741763839724 },
            { "level": 16, "resolution": 2.1457672119140625e-005, "scale": 9017.8708819198619 },
            { "level": 17, "resolution": 1.0728836059570313e-005, "scale": 4508.9354409599309 },
            { "level": 18, "resolution": 5.3644180297851563e-006, "scale": 2254.4677204799655 },
            { "level": 19, "resolution": 2.9864180297851563E-6, "scale": 1255.0817275289144 },
            { "level": 20, "resolution": 1.4934180297851564E-6, "scale": 627.6287050411438},
            { "level": 21, "resolution": 7.941802978515629E-7, "scale": 333.7647878681856}
    ];

    /**
     * 请求和加载地图
     */
    function requestAndLoadMap(){
        $.ajax({ dataType: 'json', url: '../mapcfg.json', async: false, success: function(cfg) {
            mapcfg = cfg;

            map = new Map(mapId, { 
                lods:lods,
                autoResize: true,
                infoWindow: new Popup({
                    marginLeft: 100,
                    marginTop: 100
                }, dojo.create("div"))
            });

            map.on('load', function () {
                onMapLoadHandle();
            });
        
            mapOper = new MapOper(map);
            mapDisplay = new MapDisplay(map);
            mapLayer = new MapLayer(map);
            drawToolBar = new DrawToolBar(map, new MapEvent());

            loadLayers();
        }});
    }

    /**
     * 加载地图图层
     */
    function loadLayers(){
        var baseLayerInfoArr = mapcfg.map_base;
        var layer = null;
        var layerArr = [];
        baseLayerInfoArr.forEach(function (group) {
            if (group.visible === 1) {
                group.maps.forEach(function (layer) {
                    var type = layer.type;
                    layerArr.push({
                        type: type,
                        options: layer
                    });
                });
            }
        });

        if (layerArr.length !== 0) {
            mapLayer.appendMultipleMap(layerArr, function (esriLayerArr) {
                for (var i = 0; i < esriLayerArr.layers.length; i++) {
                    var lay = esriLayerArr.layers[i].layer;
                    var err = esriLayerArr.layers[i].error;
                    if (lay.group.split('_')[0] === 'n') {
                        if (!err) {
                            lay.getNode().style.zIndex = 1;
                        }
                    }
                }
            });
        }
    }

    /**
     * 创建地图容器，不能使用固定 id，在某些情况下会导致 id 重复
     * @return {void}
     */
    function createMapContainer() {
        $map = $('<div id=' + mapId + '></div>').css({ width: '100%', height: '100%'}).appendTo($('body'));
        var $spanContainer = $('<div></div>').css({ position: 'absolute',zIndex: 30,left: 10,bottom: 16, backgroundColor: 'none'}).appendTo($map);
        $positionSpan = $('<span></span>').css({ fontSize: '60px',fontFamily: 'Arial',fontWeight: 'bold'}).appendTo($spanContainer)
    }

    /**
     * 地图加载完成的回调处理
     * @return {void}
     */
    function onMapLoadHandle() {
        // 增加地图跳转
        if (typeof mapcfg.centerx === 'number' &&
            typeof mapcfg.centery === 'number' &&
            mapcfg.centery !== -1 &&
            mapcfg.centery !== -1
        ) {
            var centerPoint = new Point(mapcfg.centerx, mapcfg.centery, map.spatialReference);
            var level = (typeof mapcfg.initlevel === 'number' && mapcfg.initlevel !== -1) ? mapcfg.initlevel : 0;
            map.centerAndZoom(centerPoint, level).then(function () { 

            });
        }
        else if (mapcfg.extent) {
            if (typeof mapcfg.extent.xmin === 'number' &&
                typeof mapcfg.extent.xmax === 'number' &&
                typeof mapcfg.extent.ymin === 'number' &&
                typeof mapcfg.extent.ymax === 'number'
            ) {
                var extent = new Extent(mapcfg.extent.xmin,
                    mapcfg.extent.ymin, mapcfg.extent.xmax,
                    mapcfg.extent.ymax, map.spatialReference);
                map.setExtent(extent);
            }
        }
        // 隐藏默认的导航条
        map.hideZoomSlider();
        // 隐藏 logo esriControlsBR
        $('.esriControlsBR').hide();
        // 添加 logo
        $('<div></div>').css({
                height: 44,
                width: 50,
                position: 'absolute',
                right: 5,
                bottom: 5,
                zIndex: 30,
                cursor: 'pointer'
            }).on('click', function (e) {
                e.preventDefault();
                window.open('http://www.ecitychina.com', '_blank');
            }).appendTo($map);

        // 添加鹰眼
        if (mapcfg.overview) {
            var overview = new OverviewMap({
                map: map,
                visible: true,
                attachTo: 'bottom-left',
                width: 190, // 默认值是地图高度的 1/4th
                height: 150, // 默认值是地图高度的 1/4th
                opacity: 0.40, // 透明度 默认0.5
                maximizeButton: false, // 最大化,最小化按钮，默认false
                expandFactor: 3, // 概览地图和总览图上显示的程度矩形的大小之间的比例。默认值是2，这意味着概览地图将至少是两倍的大小的程度矩形。
                color: 'red', // 默认颜色为#000000
                showControl: true
            });
            // 开启
            overview.startup();
        }
        if (mapcfg.scale) {
            new Scalebar({
                map: map, // 必须的
                scalebarStyle: 'line',
                scalebarUnit: 'metric', // 指定比例尺单位,有效值是'english(英制)' or 'metric（公制）'.默认'english'
                attachTo: 'bottom-left'
            });
        }
        if (mapcfg.position) {
            map.on('mouse-move', function (evt) {
                var xPrefix = 'x';
                var yPrefix = 'y';
                if (mapcfg.positionPrefix) {
                    if (mapcfg.positionPrefix.x) {
                        xPrefix = mapcfg.positionPrefix.x;
                    }
                    if (mapcfg.positionPrefix.y) {
                        yPrefix = mapcfg.positionPrefix.y;
                    }
                }
                var px = evt.mapPoint.x.toString();
                var py = evt.mapPoint.y.toString();
                var xdotIndex = px.indexOf('.');
                var ydotIndex = py.indexOf('.');
                // 保留小数点后四位
                var html = '<span><b>' +
                    xPrefix + ':</b>' + px.substring(0, xdotIndex + 5) + '<br/><b>' +
                    yPrefix + ':</b>' + py.substring(0, ydotIndex + 5) + '</span>';
                $positionSpan.empty().html(html);
            })
        }

    }

    //地图加载
    requestAndLoadMap();
});