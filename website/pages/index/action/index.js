import echarts from 'echarts';
import { subscribes, publish } from '../../../frame/core/arbiter';
import $ from 'jquery';

let ports = null;
let truck = null;
let tableName = null;
$.ajax({ dataType: 'json', url: '../homePort.json', async: false, success: (res) => ports = res });
$.ajax({ dataType: 'json', url: '../outcar.json', async: false, success: (res) => truck = res });
$.ajax({ dataType: 'json', url: '../tableName.json', async: false, success: (res) => tableName = res });

const x_PI = 3.14159265358979324 * 3000.0 / 180.0;
const PI = 3.1415926535897932384626;
const a = 6378245.0;
const ee = 0.00669342162296594323;
let fonts = [40, 80];
let textStyle = [{
    color: 'white',
    fontSize: 30,
},
{
    color: 'white',
    fontSize: 80,
},
];
const bgColor = '#051658';
let axisStyle = [{
    axisLine: {
        lineStyle: {
            color: 'white',
        },
    },
    axisLabel: {
        color: 'white',
        fontSize: 15,
    },
}, {
    axisLine: {
        lineStyle: {
            color: 'white',
        },
    },
    axisLabel: {
        color: 'white',
        fontSize: 50,
    },
}];
let legendStyle = [{
    top: 10,
    itemGap: 50,
    itemWidth: 40,
    itemHeight: 20,
    textStyle: {
        color: 'white',
        fontSize: 20,
    },
},
{
    top: 20,
    itemGap: 50,
    itemWidth: 80,
    itemHeight: 40,
    textStyle: {
        color: 'white',
        fontSize: 40,
    },
},
];

let month = ['2017/04', '2017/05', '2017/06', '2017/07', '2017/08', '2017/09', '2017/10', '2017/11', '2017/12', '2018/01', '2018/02', '2018/03'];
let monthData = [11, 20, 35, 60, 24, 32, 24, 42, 41, 50, 48, 37];

function transformlat(lng, lat) {
    var ret = -100.0 + 2.0 * lng + 3.0 * lat + 0.2 * lat * lat + 0.1 * lng * lat + 0.2 * Math.sqrt(Math.abs(lng));
    ret += (20.0 * Math.sin(6.0 * lng * PI) + 20.0 * Math.sin(2.0 * lng * PI)) * 2.0 / 3.0;
    ret += (20.0 * Math.sin(lat * PI) + 40.0 * Math.sin(lat / 3.0 * PI)) * 2.0 / 3.0;
    ret += (160.0 * Math.sin(lat / 12.0 * PI) + 320 * Math.sin(lat * PI / 30.0)) * 2.0 / 3.0;
    return ret;
}

function transformlng(lng, lat) {
    var ret = 300.0 + lng + 2.0 * lat + 0.1 * lng * lng + 0.1 * lng * lat + 0.1 * Math.sqrt(Math.abs(lng));
    ret += (20.0 * Math.sin(6.0 * lng * PI) + 20.0 * Math.sin(2.0 * lng * PI)) * 2.0 / 3.0;
    ret += (20.0 * Math.sin(lng * PI) + 40.0 * Math.sin(lng / 3.0 * PI)) * 2.0 / 3.0;
    ret += (150.0 * Math.sin(lng / 12.0 * PI) + 300.0 * Math.sin(lng / 30.0 * PI)) * 2.0 / 3.0;
    return ret;
}

/**
 * 百度坐标系 (BD-09) 与 火星坐标系 (GCJ-02)的转换
 * 即 百度 转 谷歌、高德
 * @param bd_lon
 * @param bd_lat
 * @returns {*[]}
 */
function bd09togcj02(bd_lon, bd_lat) {
    var x = bd_lon - 0.0065;
    var y = bd_lat - 0.006;
    var z = Math.sqrt(x * x + y * y) - 0.00002 * Math.sin(y * x_PI);
    var theta = Math.atan2(y, x) - 0.000003 * Math.cos(x * x_PI);
    var gg_lng = z * Math.cos(theta);
    var gg_lat = z * Math.sin(theta);
    return {
        lng: gg_lng,
        lat: gg_lat,
    };
}

/**
 * GCJ02 转换为 WGS84
 * @param lng
 * @param lat
 * @returns {*[]}
 */
function gcj02towgs84(lng, lat) {
    var dlat = transformlat(lng - 105.0, lat - 35.0);
    var dlng = transformlng(lng - 105.0, lat - 35.0);
    var radlat = lat / 180.0 * PI;
    var magic = Math.sin(radlat);
    magic = 1 - ee * magic * magic;
    var sqrtmagic = Math.sqrt(magic);
    dlat = (dlat * 180.0) / ((a * (1 - ee)) / (magic * sqrtmagic) * PI);
    dlng = (dlng * 180.0) / (a / sqrtmagic * Math.cos(radlat) * PI);
    var mglat = lat + dlat;
    var mglng = lng + dlng;
    return {
        lng: mglng,
        lat: mglat,
    };
}

function bd2wgs84(lng, lat) {
    let p1 = bd09togcj02(lng, lat);
    let p2 = gcj02towgs84(p1.lng, p1.lat);
    return {
        lng: p2.lng,
        lat: p2.lat,
    };
}

let getLine = (data, time) => {
    let result = [];
    data.forEach((e, i) => {
        let p = bd2wgs84(e[0], e[1]);
        result.push(time * i);
        result.push(p.lng);
        result.push(p.lat);
        result.push(0);
    });
    return result;
}


var d = new Date();
var result = [];
for (var i = 0; i < 12; i++) {
    d.setMonth(d.getMonth() - 1);
    var m = d.getMonth() + 1;
    m = m < 10 ? '0' + m : m;
    result.push(d.getFullYear() + '年' + m + '月');
}

function newDats() {
    var data = [];
    for (var i = 1; i < 13; i++) {
        data.push(Math.floor(Math.random() * 100));
    }
    return data;
}

function sortNumber(a, b) {
    return a - b
}
subscribes({
    sub: 'home_worldMap', // 首页世界地图
    func: (res) => {
        let data = [
            [113.925169, 22.472022],
            [114.021754, 20.300999],
            [112.991506, 9.001349],
            [109.459225, 3.701967],
            [106.957192, -0.296315],
            [106.2213, -0.74084],
            [104.749517, 0.000046],
            [99.671863, 3.701967],
            [97.408995, 5.437421],
            [94.391839, 7.425008],
            [90.859558, 8.08564],
            [85.929082, 8.232301],
            [80.409893, 5.953459],
            [79.526823, 6.02714],
            [77.392736, 6.836931],
            [74.228401, 9.111081],
            [71.211245, 11.007342],
            [68.04691, 12.168292],
            [64.220272, 12.530061],
            [58.848261, 13.035672],
            [55.757515, 13.324127],
            [53.623429, 13.107818],
            [49.208078, 12.530061],
            [46.632456, 11.914755],
            [45.896564, 11.842272],
            [44.42478, 12.276876],
            [43.872861, 12.421584],
            [43.357737, 12.710754],
            [33.680759, 27.893371],
            [32.503332, 29.676182],
            [32.24577, 31.742612],
            [32.24577, 31.742612],
            [32.24577, 31.746542],
            [31.877824, 32.918052],
            [31.105137, 34.150629],
            [29.890916, 35.395451],
            [27.793624, 36.739733],
            [26.579402, 37.739952],
            [26.064278, 38.928206],
            [26.32184, 40.350574],
            [26.652992, 40.659529],
            [27.204911, 40.96705],
            [27.830419, 41.189798],
            [28.419132, 41.217588],
            [28.823873, 41.161996],
            [28.825022, 41.161996],
            [28.825022, 41.161996],
            [28.826172, 41.162865],
            [28.035089, 41.440345],
            [27.317594, 41.564823],
            [26.434524, 41.509529],
            [25.698632, 41.412651],
            [24.392424, 41.023679],
            [22.552694, 40.295127],
            [22.534297, 40.189386],
            [22.994229, 39.707942],
            [24.098067, 38.648318],
            [24.576397, 37.631206],
            [24.502808, 37.161492],
            [24.134862, 36.570185],
            [23.362175, 36.093824],
            [22.331927, 36.063954],
            [18.394905, 36.5108],
            [15.046597, 36.688815],
            [9.895354, 37.98154],
            [8.607543, 38.097945],
            [7.687678, 37.98154],
            [-5.852732, 35.944359],
            [-6.882981, 35.974275],
            [-8.207586, 36.243002],
            [-9.274629, 36.777667],
            [-10.047316, 37.689711],
            [-10.341673, 39.223087],
            [-10.599235, 40.52717],
            [-10.636029, 41.613166],
            [-10.120905, 43.059958],
            [-4.896073, 48.584448],
            [-0.591105, 50.311517],
            [1.506186, 51.082708],
            [9.748175, 58.227706],
            [10.410478, 58.881531],
            [11.072781, 58.957649],
            [12.489373, 56.347864],
            [13.298854, 55.18632],
            [14.07154, 54.858654],
            [16.555175, 54.699138],
            [20.161045, 54.270668],
            [27.814321, 53.968049],
            [27.814321, 53.968049],
        ];
        let data2 = [
            [113.925169, 22.477366],
            [113.618164, 25.017435],
            [112.919066, 28.290054],
            [110.809662, 32.63811],
            [108.878563, 34.435921],
            [106.716881, 35.541197],
            [103.775305, 36.104774],
            [101.77255, 36.628609],
            [98.015304, 38.076477],
            [94.188666, 39.970662],
            [90.803563, 41.868411],
            [87.584036, 43.844359],
            [85.450684, 44.826153],
            [82.286349, 45.451168],
            [79.416371, 46.680517],
            [71.910274, 49.633739],
            [62.490858, 52.417254],
            [56.015009, 53.659137],
            [48.508912, 54.093988],
            [40.119745, 54.093988],
            [34.085432, 54.180413],
            [27.683172, 54.007381],
            [27.683172, 54.007381],
        ];
        let data3 = [
            [108.932315, 34.366882],
            [110.468489, 35.495664],
            [111.498738, 36.125082],
            [112.70836, 36.912135],
            [113.582231, 37.478783],
            [114.538891, 38.099308],
            [115.826702, 38.880137],
            [117.086916, 39.267346],
            [117.086916, 39.267346],
            [117.086916, 39.267346],
        ];
        let czml = [{
            id: 'document',
            name: 'CZML Path',
            version: '1.0',
            clock: {
                interval: '2012-08-04T10:00:00Z/2032-08-04T15:00:00Z',
                currentTime: '2012-08-04T10:00:00Z',
                multiplier: 10,
            },
        }, {
            id: 'path',
            name: '',
            description: '',
            availability: '2012-08-04T10:00:00Z/2032-08-04T15:00:00Z',
            path: {
                material: {
                    // polylineOutline: {
                    //     color: {
                    //         rgba: [230, 33, 41, 255]
                    //     },
                    //     outlineColor: {
                    //         rgba: [230, 33, 41, 255]
                    //     },
                    //     outlineWidth: 0
                    // }
                    polylineArrow: {
                        color: {
                            rgba: [230, 33, 41, 255],
                        },
                    },
                },
                width: 80,
                leadTime: 0,
                trailTime: 9999999999999999999999999999,
                resolution: 5,
            },
            position: {
                epoch: '2012-08-04T10:00:00Z',
                cartographicDegrees: getLine(data, 3),
            },
        }, {
            id: 'path1',
            name: '',
            description: '',
            availability: '2012-08-04T10:00:00Z/2032-08-04T15:00:00Z',
            path: {
                material: {
                    // polylineOutline: {
                    //     color: {
                    //         rgba: [230, 33, 41, 255]
                    //     },
                    //     outlineColor: {
                    //         rgba: [230, 33, 41, 255]
                    //     },
                    //     outlineWidth: 0
                    // }
                    polylineArrow: {
                        color: {
                            rgba: [255, 156, 0, 255],
                        },
                    },
                },
                width: 80,
                leadTime: 0,
                trailTime: 9999999999999999999999999999,
                resolution: 5,
            },
            position: {
                epoch: '2012-08-04T10:00:00Z',
                cartographicDegrees: getLine(data2, 12),
            },
        }, {
            id: 'path2',
            name: '',
            description: '',
            availability: '2012-08-04T10:00:00Z/2032-08-04T15:00:00Z',
            path: {
                material: {
                    // polylineOutline: {
                    //     color: {
                    //         rgba: [230, 33, 41, 255]
                    //     },
                    //     outlineColor: {
                    //         rgba: [230, 33, 41, 255]
                    //     },
                    //     outlineWidth: 0
                    // }
                    polylineArrow: {
                        color: {
                            rgba: [255, 156, 0, 255],
                        },
                    },
                },
                width: 80,
                leadTime: 0,
                trailTime: 9999999999999999999999999999,
                resolution: 5,
            },
            position: {
                epoch: '2012-08-04T10:00:00Z',
                cartographicDegrees: getLine(data3, 10),
            },
        }];
        return {
            ports: ports,
            czml: czml,
        };
    },
}, {
        sub: 'home_right_t', // 首页右侧table
        func: (ops) => {
            let flds = [{
                name: 'name',
                title: '港口名称',
            },
            {
                name: 'position',
                title: '港口位置',
            },
            {
                name: 'teu',
                title: '港口年吞吐量',
            },
            {
                name: 'time',
                title: '招商运营时间',
            },
            ];
            let datas = [{
                name: '八所港',
                position: '八所港',
                teu: '235 TEU',
                time: 1982,
            },
            {
                name: '北海港',
                position: '北海港',
                teu: '345 TEU',
                time: 1983,
            },
            {
                name: '八所港',
                position: '八所港',
                teu: '235 TEU',
                time: 1982,
            },
            {
                name: '北海港',
                position: '北海港',
                teu: '345 TEU',
                time: 1983,
            },
            {
                name: '八所港',
                position: '八所港',
                teu: '235 TEU',
                time: 1982,
            },
            {
                name: '北海港',
                position: '北海港',
                teu: '345 TEU',
                time: 1983,
            },
            {
                name: '八所港',
                position: '八所港',
                teu: '235 TEU',
                time: 1982,
            },
            {
                name: '北海港',
                position: '北海港',
                teu: '345 TEU',
                time: 1983,
            },
            {
                name: '八所港',
                position: '八所港',
                teu: '235 TEU',
                time: 1982,
            },
            {
                name: '北海港',
                position: '北海港',
                teu: '345 TEU',
                time: 1983,
            },
            {
                name: '八所港',
                position: '八所港',
                teu: '235 TEU',
                time: 1982,
            },
            {
                name: '北海港',
                position: '北海港',
                teu: '345 TEU',
                time: 1983,
            },
            {
                name: '八所港',
                position: '八所港',
                teu: '235 TEU',
                time: 1982,
            },
            {
                name: '北海港',
                position: '北海港',
                teu: '345 TEU',
                time: 1983,
            },
            {
                name: '八所港',
                position: '八所港',
                teu: '235 TEU',
                time: 1982,
            },
            ];
            return {
                flds: flds,
                datas: datas,
            };
        },
    }, {
        sub: 'home_right_e', // 首页右侧echarts
        func: (ops) => {
            let month = ['17/02', '17/03', '17/04', '17/05', '17/06', '17/07', '17/08', '17/09', '17/10', '17/11', '17/12', '18/01'];
            let option = {
                color: ['#58DABC', '#52BEFC', '#FFB84E'],
                title: [{
                    text: '报关单量(万票)',
                    x: '6%',
                    y: '1%',
                    textAlign: 'center',
                    textStyle: {
                        color: '#58DABC',
                        fontSize: 35,
                    },
                }, {
                    text: '征收金额(亿元)',
                    x: '56%',
                    y: '1%',
                    textAlign: 'center',
                    textStyle: {
                        color: '#52BEFC',
                        fontSize: 35,
                    },
                }, {
                    text: '通关效率(小时)',
                    x: '6%',
                    y: '51%',
                    textAlign: 'center',
                    textStyle: {
                        color: '#FFB84E',
                        fontSize: 35,
                    },
                }, {
                    text: '查验时效(小时)',
                    x: '56%',
                    y: '51%',
                    textAlign: 'center',
                    textStyle: {
                        color: '#FFB84E',
                        fontSize: 35,
                    },
                }],
                grid: [{
                    x: '4%',
                    y: '7%',
                    width: '44%',
                    height: '39%',
                },
                {
                    x2: '2%',
                    y: '7%',
                    width: '44%',
                    height: '39%',
                },
                {
                    x: '4%',
                    y2: '4%',
                    width: '44%',
                    height: '39%',
                },
                {
                    x2: '2%',
                    y2: '4%',
                    width: '44%',
                    height: '39%',
                },

                ],
                tooltip: {
                    formatter: '{a}: ({c})',
                },
                xAxis: [{
                    gridIndex: 0,
                    axisLine: {
                        lineStyle: {
                            color: '#fff',
                        },
                    },
                    axisLabel: {
                        formatter: '{value}',
                        fontSize: 20,
                    },
                    data: month,
                },
                {
                    gridIndex: 1,
                    axisLine: {
                        lineStyle: {
                            color: '#fff',
                        },
                    },
                    axisLabel: {
                        formatter: '{value}',
                        fontSize: 20,
                    },
                    data: month,
                },
                {
                    gridIndex: 2,
                    axisLine: {
                        lineStyle: {
                            color: '#fff',
                        },
                    },
                    axisLabel: {
                        formatter: '{value}',
                        fontSize: 20,
                    },
                    data: month,
                },
                {
                    gridIndex: 3,
                    axisLine: {
                        lineStyle: {
                            color: '#fff',
                        },
                    },
                    axisLabel: {
                        formatter: '{value}',
                        fontSize: 20,
                    },
                    data: month,
                },
                ],
                yAxis: [{
                    gridIndex: 0,
                    axisLabel: {
                        formatter: '{value}',
                        fontSize: 30,
                    },
                    axisLine: {
                        lineStyle: {
                            color: '#fff',
                        },
                    },
                },
                {
                    gridIndex: 1,
                    axisLabel: {
                        formatter: '{value}',
                        fontSize: 30,
                    },
                    axisLine: {
                        lineStyle: {
                            color: '#fff',
                        },
                    },
                },
                {
                    gridIndex: 2,
                    axisLabel: {
                        formatter: '{value}',
                        fontSize: 30,
                    },
                    axisLine: {
                        lineStyle: {
                            color: '#fff',
                        },
                    },
                },
                {
                    gridIndex: 3,
                    axisLabel: {
                        formatter: '{value}',
                        fontSize: 30,
                    },
                    axisLine: {
                        lineStyle: {
                            color: '#fff',
                        },
                    },
                },
                ],
                series: [{
                    name: '报关单量',
                    data: [6.7, 13.9, 13, 11.9, 12.9, 13.8, 12.4, 13.7, 11.3, 13.9, 14.3, 14.1],
                    type: 'bar',
                    xAxisIndex: 0,
                    yAxisIndex: 0,
                    label: {
                        normal: {
                            show: true,
                            position: 'top',
                            formatter: (params) => {
                                if (params.value == 0) return '';
                                return params.value;
                            },
                        },
                    },
                },
                {
                    name: '征收金额',
                    data: [7.8, 9.9, 10.3, 10.6, 10.3, 9, 10.2, 10.4, 10.9, 11.3, 14.2, 11.4],
                    type: 'bar',
                    xAxisIndex: 1,
                    yAxisIndex: 1,
                    label: {
                        normal: {
                            show: true,
                            position: 'top',
                            formatter: (params) => {
                                if (params.value == 0) return '';
                                return params.value;
                            },
                        },
                    },
                },
                {
                    name: '通关效率-进口',
                    data: [0, 0, 5.78, 17.09, 19.12, 10.17, 8.66, 3.71, 0.98, 1.24, 3.59, 2.69],
                    type: 'bar',
                    xAxisIndex: 2,
                    yAxisIndex: 2,
                    label: {
                        normal: {
                            show: true,
                            position: 'top',
                            formatter: (params) => {
                                if (params.value == 0) return '';
                                return params.value;
                            },
                        },
                    },
                },
                {
                    name: '通关效率-出口',
                    data: [0, 0, 9.02, 8.49, 7.96, 7.78, 6.34, 2.78, 5.42, 6.07, 1.41, 1.85],
                    type: 'bar',
                    xAxisIndex: 2,
                    yAxisIndex: 2,
                    label: {
                        normal: {
                            show: true,
                            position: 'top',
                            formatter: (params) => {
                                if (params.value == 0) return '';
                                return params.value;
                            },
                        },
                    },
                },
                {
                    name: '查验时效-进口',
                    data: [0, 0, 32.73, 31.12, 30.33, 22.94, 21.58, 21.6, 70.45, 16.4, 18.45, 19.55],
                    type: 'bar',
                    xAxisIndex: 3,
                    yAxisIndex: 3,
                    label: {
                        normal: {
                            show: true,
                            position: 'top',
                            formatter: (params) => {
                                if (params.value == 0) return '';
                                return params.value;
                            },
                        },
                    },
                },
                {
                    name: '查验时效-出口',
                    data: [0, 0, 3.69, 2.42, 2.06, 1.3, 1.44, 1.46, 1.22, 0.96, 1, 0.88],
                    type: 'bar',
                    xAxisIndex: 3,
                    yAxisIndex: 3,
                    label: {
                        normal: {
                            show: true,
                            position: 'top',
                            formatter: (params) => {
                                if (params.value == 0) return '';
                                return params.value;
                            },
                        },
                    },
                },
                ],
            };
            return option;
        },
    }, {
        sub: 'map_view_pie', // 出入境旅客统计饼状图
        func: (ops) => {
            let data = ((data_mapJson.data.filter((a) => a.key === 'demo')[0] || {}).value || []);
            let data1 = data.map((d) => {
                return {
                    name: d.name + '_',
                    value: d.value,
                }
            });
            return {
                color: ['#FFBD19', '#089CEF'],
                tooltip: {
                    trigger: 'item',
                    formatter: '{a} <br/>{b}: {c} ({d}%)',
                },
                legend: {
                    itemWidth: 100,
                    itemHeight: 100,
                    textStyle: {
                        fontSize: 50,
                    },
                    orient: 'vertical',
                    x: 'left',
                    data: [{
                        name: '入境',
                        textStyle: {
                            color: '#ffffff',
                        },

                    }, {
                        name: '出境',
                        textStyle: {
                            color: '#ffffff',
                        },
                    }],
                },
                series: [{
                    name: '访问来源',
                    type: 'pie',
                    radius: ['40%', '55%'],
                    label: {
                        normal: {
                            fontSize: 50,
                            formatter: '{b}\n{d}%',
                            padding: 100,
                            width: 200,
                        },
                    },
                    data: [{
                        value: 39.05,
                        name: '入境',
                    },
                    {
                        value: 60.95,
                        name: '出境',
                    },
                    ],
                }],
            }
        },
    }, {

        /** 进出港口箱子饼状图 */
        sub: 'port_pie_gk',
        func: (ops) => {

            /**
             * 双层圆环图
             * param1    value值  
             * param2 3  最小最大值
             * param4   字体及圆环大颜色
             */

            var value = ops.value;
            var min = 0;
            var max = ops.value * 1.1;
            var size = '100%';
            var initcolor = '#30979C';

            var color = initcolor;
            var dataStyle = {
                normal: {
                    label: {
                        show: false,
                    },
                    labelLine: {
                        show: false,
                    },
                    shadowBlur: 40,
                    shadowColor: 'rgba(40, 40, 40, 0.5)',
                },
            };
            var placeHolderStyle = {
                normal: {
                    color: 'rgba(44,59,70,0)', // 未完成的圆环的颜色
                    label: {
                        show: false,
                    },
                    labelLine: {
                        show: false,
                    },
                },
            };

            return {
                title: {
                    text: value,
                    x: 'center',
                    y: '35%',
                    textStyle: {
                        fontWeight: 'normal',
                        color: 'white',
                        fontSize: parseInt(size) * 0.6,
                    },
                    subtext: 'TEU',
                    subtextStyle: {
                        fontWeight: 'normal',
                        color: 'white',
                        fontSize: parseInt(size) * 0.4,
                    },
                },
                color: ['#fff', '#313443', '#fff'],
                tooltip: {
                    show: false,
                    formatter: '{a} <br/>{b} : {c} ({d}%)',
                },
                legend: {
                    show: false,
                    itemGap: 12,
                    data: ['01', '02'],
                },
                toolbox: {
                    show: false,
                    feature: {
                        mark: {
                            show: true,
                        },
                        dataView: {
                            show: true,
                            readOnly: false,
                        },
                        restore: {
                            show: true,
                        },
                        saveAsImage: {
                            show: true,
                        },
                    },
                },
                series: [{
                    name: 'Line 1',
                    type: 'pie',
                    clockWise: false,
                    radius: ['58%', '68%'],
                    itemStyle: dataStyle,
                    hoverAnimation: true,
                    data: [{
                        value: value - min,
                        name: '01',
                        itemStyle: {
                            normal: {
                                color: new echarts.graphic.LinearGradient(0, 0, 1, 1, [{
                                    offset: 0,
                                    color: color,
                                }, {
                                    offset: 1,
                                    color: color,
                                }]),
                            },
                        },
                    }, {
                        value: max - value,
                        name: 'invisible',
                        itemStyle: placeHolderStyle,
                    },

                    ],
                }, {
                    name: 'Line 2',
                    type: 'pie',
                    animation: false,
                    clockWise: false,
                    radius: ['66%', '70%'],
                    itemStyle: dataStyle,
                    hoverAnimation: false,
                    tooltip: {
                        show: false,
                    },
                    data: [{
                        value: 0,
                        name: '02',
                        itemStyle: {
                            normal: {
                                color: color,
                            },
                        },
                    }],
                }],
            }
        },
    }, {

        /** 进出闸口箱子斌状图 */
        sub: 'port_pie_zk',
        func: (ops) => {

            /**
             * 双层圆环图
             * param1    value值  
             * param2 3  最小最大值
             * param4   字体及圆环大颜色
             */

            var value = ops.value;
            var min = 0;
            var max = 5000;
            var size = '100%';
            var initcolor = '#F26D12';

            var color = initcolor;
            var dataStyle = {
                normal: {
                    label: {
                        show: false,
                    },
                    labelLine: {
                        show: false,
                    },
                    shadowBlur: 40,
                    shadowColor: 'rgba(40, 40, 40, 0.5)',
                },
            };
            var placeHolderStyle = {
                normal: {
                    color: 'rgba(44,59,70,0)', // 未完成的圆环的颜色
                    label: {
                        show: false,
                    },
                    labelLine: {
                        show: false,
                    },
                },
            };

            return {
                title: {
                    text: value,
                    x: 'center',
                    y: '35%',
                    textStyle: {
                        fontWeight: 'normal',
                        color: 'white',
                        fontSize: parseInt(size) * 0.6,
                    },
                    subtext: 'TEU',
                    subtextStyle: {
                        fontWeight: 'normal',
                        color: 'white',
                        fontSize: parseInt(size) * 0.4,
                    },
                },
                color: ['#fff', '#313443', '#fff'],
                tooltip: {
                    show: false,
                    formatter: '{a} <br/>{b} : {c} ({d}%)',
                },
                legend: {
                    show: false,
                    itemGap: 12,
                    data: ['01', '02'],
                },
                toolbox: {
                    show: false,
                    feature: {
                        mark: {
                            show: true,
                        },
                        dataView: {
                            show: true,
                            readOnly: false,
                        },
                        restore: {
                            show: true,
                        },
                        saveAsImage: {
                            show: true,
                        },
                    },
                },
                series: [{
                    name: 'Line 1',
                    type: 'pie',
                    clockWise: false,
                    radius: ['58%', '68%'],
                    itemStyle: dataStyle,
                    hoverAnimation: true,
                    data: [{
                        value: value - min,
                        name: '01',
                        itemStyle: {
                            normal: {
                                color: new echarts.graphic.LinearGradient(0, 0, 1, 1, [{
                                    offset: 0,
                                    color: color,
                                }, {
                                    offset: 1,
                                    color: color,
                                }]),
                            },
                        },
                    }, {
                        value: max - value,
                        name: 'invisible',
                        itemStyle: placeHolderStyle,
                    },

                    ],
                }, {
                    name: 'Line 2',
                    type: 'pie',
                    animation: false,
                    clockWise: false,
                    radius: ['66%', '70%'],
                    itemStyle: dataStyle,
                    hoverAnimation: false,
                    tooltip: {
                        show: false,
                    },
                    data: [{
                        value: 0,
                        name: '02',
                        itemStyle: {
                            normal: {
                                color: color,
                            },
                        },
                    }],
                }],
            }
        },
    }, {

        /** 第二页右侧圆圈 */
        sub: 'port_pie_xl',
        func: (ops) => {

            /**
             * 双层圆环图
             * param1    value值  
             * param2    name值
             * param3 4  最小最大值
             * param5   字体及圆环大颜色
             */
            var value = ops.value.value;
            var names = ops.value.name;
            var min = 0;
            var max = value * 1.1;
            var size = '70%';
            var initcolor = '#F26D12';

            var color = initcolor;
            var dataStyle = {
                normal: {
                    label: {
                        show: false,
                    },
                    labelLine: {
                        show: false,
                    },
                    shadowBlur: 40,
                    shadowColor: 'rgba(40, 40, 40, 0.5)',
                },
            };
            var placeHolderStyle = {
                normal: {
                    color: 'rgba(44,59,70,0)', // 未完成的圆环的颜色
                    label: {
                        show: false,
                    },
                    labelLine: {
                        show: false,
                    },
                },
            };

            return {
                title: {
                    text: value + '小时',
                    x: 'center',
                    y: '35%',
                    textStyle: {
                        fontWeight: 'normal',
                        color: '#67F8B3',
                        fontSize: parseInt(size) * 1,
                    },
                    subtext: names,
                    subtextStyle: {
                        fontWeight: 'normal',
                        color: 'white',
                        fontSize: parseInt(size) * 0.8,
                    },
                },
                color: ['#fff', '#313443', '#fff'],
                tooltip: {
                    show: false,
                    formatter: '{a} <br/>{b} : {c} ({d}%)',
                },
                legend: {
                    show: false,
                    itemGap: 12,
                    data: ['01', '02'],
                },
                toolbox: {
                    show: false,
                    feature: {
                        mark: {
                            show: true,
                        },
                        dataView: {
                            show: true,
                            readOnly: false,
                        },
                        restore: {
                            show: true,
                        },
                        saveAsImage: {
                            show: true,
                        },
                    },
                },
                series: [{
                    name: 'Line 1',
                    type: 'pie',
                    clockWise: false,
                    radius: ['79%', '80%'],
                    itemStyle: dataStyle,
                    hoverAnimation: true,
                    data: [{
                        value: value - min,
                        name: '01',
                        itemStyle: {
                            'normal': {
                                'color': '#5886f0',
                                'borderColor': new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                                    offset: 0,
                                    color: '#00a2ff',
                                }, {
                                    offset: 1,
                                    color: '#70ffac',
                                }]),
                                'borderWidth': 25,
                            },
                        },
                    }, {
                        value: max - value,
                        name: 'invisible',
                        itemStyle: placeHolderStyle,
                    },

                    ],
                }, {
                    name: 'Line 2',
                    type: 'pie',
                    animation: false,
                    clockWise: false,
                    radius: ['89%', '90%'],
                    itemStyle: dataStyle,
                    hoverAnimation: false,
                    tooltip: {
                        show: false,
                    },
                    data: [{
                        value: value - min,
                        name: '01',
                        itemStyle: {
                            'normal': {
                                'color': '#03A4FD',
                                'borderColor': new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                                    offset: 0,
                                    color: '#00a2ff',
                                }, {
                                    offset: 1,
                                    color: '#69FAB1',
                                }]),
                                'borderWidth': 1,
                            },
                        },
                    }, {
                        value: max - value,
                        name: 'invisible',
                        itemStyle: placeHolderStyle,
                    },

                    ],
                }],
            }
        },
    }, {

        /** 驳船显示 */
        sub: 'vessel_GetListAsync',
        func: (ops) => {
            return publish('webAction', {
                svn: 'QUERY_KHSJ',
                path: '/api/Vessel/GetListAsync',
            }).then((res) => {
                let data = JSON.parse(res);
                return data;
            })

        },
    }, {

        /** 大船显示 */
        sub: 'barge_GetListAsync',
        func: (ops) => {
            return publish('webAction', {
                svn: 'QUERY_KHSJ',
                path: '/api/Barge/GetListAsync',
            }).then((res) => {
                let data = JSON.parse(res);
                return data;
            })
        },
    }, {

        /** 外拖拖车 */
        sub: 'truck_GetListAsync',
        func: (ops) => {
            return truck;
        },
    }, {

        /** 表格名称 */
        sub: 'tableName_find',
        func: (ops) => {
            return tableName;
        },
    }, {

        /** 业务数据-雷达图 */
        sub: 'home_right_e_ldt',
        func: (ops) => {
            let option = {
                color: ['#FD5633', '#38BDFF'],
                tooltip: {
                    textStyle: {
                        fontSize: 40,
                    },
                },
                legend: {
                    top: '2%',
                    itemWidth: 50,
                    itemHeight: 30,
                    itemGap: 30,
                    textStyle: {
                        fontSize: 45,
                        color: 'white',
                    },
                    data: ['2017年12月', '2018年1月'],
                },
                radar: [{
                    indicator: [{
                        name: '入库税款（亿元）',
                        max: 15,
                    },
                    {
                        name: '报关单量（万票）',
                        max: 20,
                    },
                    {
                        name: '查验时效-进口（小时）',
                        max: 20,
                    },
                    {
                        name: '查验时效-出口（小时）',
                        max: 10,
                    },
                    {
                        name: '通关时效-进口（小时）',
                        max: 40,
                    },
                    {
                        name: '通关时效-出口（小时）',
                        max: 5,
                    },
                    ],
                    center: ['50%', '52%'],
                    // radius: 200,
                    startAngle: 90,
                    splitNumber: 4,
                    // shape: 'circle',
                    name: {
                        formatter: '{value}',
                        textStyle: {
                            color: 'white',
                            fontSize: 40,
                        },
                    },
                    splitArea: {
                        areaStyle: {
                            color: ['rgba(173, 245, 164, 0.2)',
                                'rgba(173, 245, 164, 0.4)', 'rgba(173, 245, 164, 0.6)',
                                'rgba(173, 245, 164, 0.8)', 'rgba(173, 245, 164, 1)',
                            ],
                            shadowColor: 'rgba(0, 0, 0, 0.3)',
                            shadowBlur: 10,
                        },
                    },
                    axisLine: {
                        lineStyle: {
                            color: 'rgba(255, 255, 255, 0.5)',
                        },
                    },
                    splitLine: {
                        lineStyle: {
                            color: 'rgba(255, 255, 255, 0.5)',
                        },
                    },
                }],
                series: [{
                    name: '业务数据',
                    type: 'radar',
                    // areaStyle: {normal: {}},
                    symbolSize: 30,
                    label: {
                        fontSize: 50,
                    },
                    data: [{
                        value: [14.2, 14.3, 3.59, 1.41, 18.45, 1],
                        name: '2017年12月',
                        lineStyle: {
                            width: 30,
                        },
                        symbolSize: 30,
                    },
                    {
                        value: [11.4, 14.1, 2.69, 1.85, 19.55, 0.88],
                        name: '2018年1月',
                        lineStyle: {
                            width: 30,
                        },
                        symbolSize: 30,
                    },
                    ],
                }],
            };
            return option;
        },
    }, {

        /** 园区今日数量展示图 */
        sub: 'pire_right_yq_axis',
        func: (ops) => {
            var barData = [];
            for (var a in ops.value.list) {
                barData.push(ops.value.list[a].today)
            }
            if (ops.value.list.length < 9) {
                for (var b = ops.value.list.length; b < 9; b++) {
                    barData.push('');
                }
            }
            let yAxisMonth = ops.value.list.length;
            let heightWidth = ['100%', 70];
            let barDataTwo = [];
            let coordData2 = [];
            let coordData = [];
            for (let i = 0; i < barData.length; i++) {
                barDataTwo.push(Math.max.apply(Math, barData) + 5000);
                coordData.push({
                    'coord': [Number(barData[i]) - 1, i],
                });
                coordData2.push({
                    'coord': [Math.max.apply(Math, barData) + 5000, i],
                })
            }
            return {
                backgroundColor: '#051658',
                title: {
                    text: '',
                },
                legend: null,
                tooltip: {
                    trigger: 'axis',
                    axisPointer: {
                        type: 'none',
                    },
                    formatter: function (params) {
                        return params[0].name + '今日仓库库存: ' + params[0].value;
                    },
                },
                grid: {
                    containLabel: true,
                    top: '50px',
                    bottom: '0',
                    left: '0%',
                    right: '0',

                },
                yAxis: [{
                    data: yAxisMonth,
                    inverse: true,
                    axisLine: {
                        show: false,
                    },
                    axisTick: {
                        show: false,
                    },
                },
                {
                    data: yAxisMonth,
                    inverse: true,
                    axisLine: {
                        show: false,
                    },
                    axisTick: {
                        show: false,
                    },
                    axisLabel: {
                        show: false,
                    },
                },
                ],
                xAxis: [{
                    type: 'value',
                    splitLine: {
                        show: false,
                    },
                    axisLabel: {
                        show: false,
                    },
                    axisTick: {
                        show: false,
                    },
                    axisLine: {
                        show: false,
                    },
                }, {
                    type: 'value',
                    splitLine: {
                        show: false,
                    },
                    axisLabel: {
                        show: false,
                    },
                    axisTick: {
                        show: false,
                    },
                    axisLine: {
                        show: false,
                    },
                }],
                series: [{
                    z: 10,
                    xAxisIndex: 0,
                    yAxisIndex: 0,
                    name: 'XXX',
                    type: 'pictorialBar',
                    data: barData,
                    label: {
                        normal: {
                            show: true,
                            position: 'inside',
                            textStyle: {
                                fontSize: 50,
                                color: '#00ffff',
                            },
                        },
                    },
                    symbolRepeat: false,
                    symbolSize: heightWidth,
                    symbolOffset: [-16.5, 0],
                    itemStyle: {
                        normal: {
                            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                                offset: 0,
                                color: '#083e6d',
                            },
                            {
                                offset: 0.5,
                                color: '#0272f2',
                                opacity: 0.7,
                            }, {
                                offset: 1,
                                color: '#083e6d',
                                opacity: 0.5,
                            },
                            ], false),
                        },
                    },
                    symbolClip: true,
                    symbolPosition: 'end',
                    symbol: 'rect',
                    // symbol: 'path://M0 0 L0 60 L225 60 L300 0 Z',
                    markPoint: {
                        data: coordData,
                        symbolSize: [31, 70],
                        symbolOffset: [-0.5, 0],
                        z: 3,
                        label: {
                            normal: {
                                show: false,
                            },
                        },
                        symbolClip: true,
                        symbol: 'path://M 300 100 L 100 100 L 100 300 z',
                    },
                },
                {
                    z: 6,
                    xAxisIndex: 1,
                    yAxisIndex: 1,
                    animation: false,
                    name: 'XX',
                    type: 'pictorialBar',
                    data: barDataTwo,
                    barCategoryGap: '80%',
                    label: {
                        normal: {
                            show: false,
                            position: 'inside',
                            textStyle: {
                                fontSize: 12,
                                color: '#00ffff',
                            },
                        },
                    },
                    symbolRepeat: false,
                    symbolSize: heightWidth,
                    symbolOffset: [-16.5, 0],
                    itemStyle: {
                        normal: {
                            color: '#00abc5',
                            opacity: 0.085,
                        },
                    },
                    symbolClip: true,
                    symbol: 'rect',
                    markPoint: {
                        data: coordData2,
                        symbolSize: [33, 70],
                        symbolOffset: [-0.5, 0],
                        label: {
                            normal: {
                                show: false,
                            },
                        },
                        itemStyle: {
                            normal: {
                                color: '#00abc5',
                                opacity: 0.085,
                            },
                        },
                        symbolClip: true,
                        symbol: 'path://M 300 100 L 100 100 L 100 300 z',

                    },
                },
                ],
            }
        },
    }, {

        /** 散装码头柱形图 */
        sub: 'port_2_bar',
        func: (ops) => {

            var xData = [{
                'name': '船舶进港',
                'value': 2134,
            }, {
                'name': '船舶出港',
                'value': 1327,
            }];
            var yData = [{
                'name': '船舶进港',
                'value': 5212,
            }, {
                'name': '船舶出港',
                'value': 3213,
            }];
            return {
                backgroundColor: '#051658',
                grid: {
                    left: '0%',
                    right: '0%',
                    bottom: '5%',
                    top: '7%',
                    height: '85%',
                    containLabel: true,
                    z: 22,
                },
                tooltip: {
                    show: 'true',
                    trigger: 'item',
                    backgroundColor: 'rgba(0,0,0,0.7)', // 背景
                    padding: [8, 10], // 内边距
                    extraCssText: 'box-shadow: 0 0 3px rgba(255, 255, 255, 0.4);', // 添加阴影
                    formatter: function (params) {
                        return params.seriesName + ' ：  ' + params.value;
                    },
                },

                xAxis: {
                    type: 'category',
                    axisTick: {
                        show: false,
                    },
                    axisLine: {
                        show: true,
                        lineStyle: {
                            color: '#FFFFFF',
                        },
                    },
                    axisLabel: {
                        inside: false,
                        textStyle: {
                            color: '#fff',
                            fontWeight: 'normal',
                            fontSize: '58',
                        },
                    },
                    data: ['昨日', '今日'],
                },
                yAxis: {
                    type: 'value',
                    axisTick: {
                        show: false,
                    },
                    axisLine: {
                        show: true,
                        lineStyle: {
                            color: '#FFFFFF',
                        },
                    },
                    splitLine: {
                        show: true,
                        lineStyle: {
                            color: '#363e83 ',
                        },
                    },
                    axisLabel: {
                        textStyle: {
                            color: '#fff',
                            fontWeight: 'normal',
                            fontSize: '12',
                        },
                    },
                },
                series: [{
                    name: '出港船舶',
                    type: 'bar',
                    barWidth: '-30%',
                    itemStyle: {
                        normal: {
                            barBorderRadius: [30, 30, 0, 0],
                            color: new echarts.graphic.LinearGradient(
                                0, 0, 0, 1, [{
                                    offset: 0,
                                    color: '#00feff',
                                },
                                {
                                    offset: 0.5,
                                    color: '#027eff',
                                },
                                {
                                    offset: 1,
                                    color: '#0286ff',
                                },
                                ]
                            ),
                        },
                    },
                    barGap: '100%',
                    data: xData,
                }, {
                    name: '进港船舶',
                    type: 'bar',
                    barWidth: '28%',
                    itemStyle: {
                        normal: {
                            barBorderRadius: [30, 30, 0, 0],
                            color: new echarts.graphic.LinearGradient(
                                0, 0, 0, 1, [{
                                    offset: 0,
                                    color: '#00feff',
                                },
                                {
                                    offset: 0.5,
                                    color: '#027eff',
                                },
                                {
                                    offset: 1,
                                    color: '#0286ff',
                                },
                                ]
                            ),
                        },
                    },
                    barGap: '100%',
                    data: yData,
                }],


            }
        },
    }, {

        /** 近12个月码头提单申报情况 */
        sub: 'ICountimg_1',
        func: (ops) => {
            return {
                color: ['#0089fe', '#ffb900', '#00e4ff'],
                backgroundColor: bgColor,
                tooltip: {
                    textStyle: textStyle[ops ? 1 : 0],
                },
                angleAxis: {
                    type: 'category',
                    data: [{
                        value: month[0],
                        textStyle: textStyle[ops ? 1 : 0],
                    },
                    month[1],
                    month[2],
                    month[3],
                    month[4],
                    month[5],
                    month[6],
                    month[7],
                    month[8],
                    month[9],
                    month[10],
                    month[11],
                    ],
                    z: 10,
                },
                radiusAxis: {},
                polar: {},
                series: [{
                    type: 'bar',
                    data: monthData,
                    coordinateSystem: 'polar',
                    name: 'SCT',
                    stack: 'a',
                }, {
                    type: 'bar',
                    data: monthData,
                    coordinateSystem: 'polar',
                    name: 'CCT',
                    stack: 'a',
                }, {
                    type: 'bar',
                    data: monthData,
                    coordinateSystem: 'polar',
                    name: 'MCT',
                    stack: 'a',
                }],
                legend: {
                    show: true,
                    ...legendStyle[ops ? 1 : 0],
                    data: ['SCT', 'CCT', 'MCT'],
                },
            }
        },
    }, {

        /** 近12个月码头船舶进出港情况 */
        sub: 'ICountimg_2',
        func: (ops) => {
            return {
                color: ['#298aff', '#ffb900'],
                backgroundColor: bgColor,
                title: {
                    text: '雷达图',
                },
                tooltip: {
                    textStyle: textStyle[ops ? 1 : 0],
                },
                legend: {
                    ...legendStyle[ops ? 1 : 0],
                    data: ['红色', '绿色'],
                },
                radar: {
                    radius: '60%',
                    splitNumber: 8,
                    axisLine: {
                        lineStyle: {
                            color: '#fff',
                        },
                    },
                    splitLine: {
                        lineStyle: {
                            color: '#fff',
                        },
                    },
                    splitArea: {
                        areaStyle: {
                            color: 'rgba(127,95,132,.3)',
                            opacity: 1,
                            shadowBlur: 45,
                            shadowColor: 'rgba(0,0,0,.5)',
                            shadowOffsetX: 0,
                            shadowOffsetY: 15,
                        },
                    },
                    indicator: [{
                        name: '1月',
                        max: 150,
                    },
                    {
                        name: '2月',
                        max: 150,
                    },
                    {
                        name: '3月',
                        max: 150,
                    },
                    {
                        name: '4月',
                        max: 150,
                    },
                    {
                        name: '5月',
                        max: 150,
                    },
                    {
                        name: '6月',
                        max: 150,
                    },
                    {
                        name: '7月',
                        max: 150,
                    },
                    {
                        name: '8月',
                        max: 150,
                    },
                    {
                        name: '9月',
                        max: 150,
                    },
                    {
                        name: '10月',
                        max: 150,
                    },
                    {
                        name: '11月',
                        max: 150,
                    },
                    {
                        name: '12月',
                        max: 150,
                    },
                    ],
                    name: {
                        formatter: '{value}',
                        textStyle: textStyle[ops ? 1 : 0],
                    },
                },
                series: [{
                    name: '红色：旧，绿色：新',
                    type: 'radar',
                    symbolSize: 0,
                    areaStyle: {
                        normal: {
                            shadowBlur: 13,
                            shadowColor: 'rgba(0,0,0,.2)',
                            shadowOffsetX: 0,
                            shadowOffsetY: 10,
                            opacity: 1,
                        },
                    },
                    data: [{
                        value: [92, 130, 83, 55, 54, 48, 75, 56, 59, 103, 86, 58],
                        name: '红色',
                    }, {
                        value: [89, 83, 78, 63, 50, 52, 52, 40, 41, 60, 100, 134],
                        name: '绿色',
                    }],
                }],
                // backgroundColor: {
                //     type: 'radial',
                //     x: 0.4,
                //     y: 0.4,
                //     r: 0.35,
                //     bgColortops: [{
                //         offset: 0,
                //         color: '#895355' // 0% 处的颜色
                //     }, {
                //         offset: .4,
                //         color: '#593640' // 100% 处的颜色
                //     }, {
                //         offset: 1,
                //         color: '#39273d' // 100% 处的颜色
                //     }],
                //     globalCoord: false // 缺省为 false
                // }
            }
        },
    }, {

        /** 近12个月集装箱申报情况 */
        sub: 'ICountimg_3',
        func: (ops) => {
            return {
                color: ['#008fff', '#6113ff', '#00f9ff'],
                backgroundColor: bgColor,
                angleAxis: {
                    type: 'category',
                    data: [{
                        value: month[0],
                        textStyle: textStyle[ops ? 1 : 0],
                    },
                    month[1],
                    month[2],
                    month[3],
                    month[4],
                    month[5],
                    month[6],
                    month[7],
                    month[8],
                    month[9],
                    month[10],
                    month[11],
                    ],
                    z: 10,
                },
                radiusAxis: {},
                polar: {},
                tooltip: {
                    textStyle: textStyle[ops ? 1 : 0],
                },
                series: [{
                    type: 'bar',
                    data: monthData,
                    coordinateSystem: 'polar',
                    name: 'SCT',
                    stack: 'a',
                }, {
                    type: 'bar',
                    data: monthData,
                    coordinateSystem: 'polar',
                    name: 'CCT',
                    stack: 'a',
                }, {
                    type: 'bar',
                    data: monthData,
                    coordinateSystem: 'polar',
                    name: 'MCT',
                    stack: 'a',
                }],
                legend: {
                    show: true,
                    ...legendStyle[ops ? 1 : 0],
                    data: ['SCT', 'CCT', 'MCT'],
                },
            }
        },
    }, {

        /** 近12个月报关单量统计情况 */
        sub: 'ICountimg_4',
        func: (ops) => {
            var maxXData = ceshi(monthData);
            var maxyData = ceshi(monthData);

            function ceshi(val) {
                var data = [];
                for (var i in val) {
                    data.push(val[i] + Math.random() * 20);
                }
                return data;
            }
            return {
                backgroundColor: bgColor,
                title: {
                    text: '报关单量',
                    textStyle: {
                        color: '#00FFFF',
                        fontSize: 24,
                    },
                },
                legend: {
                    textStyle: textStyle[ops ? 1 : 0],
                    data: ['5349', '总关区'],
                },
                grid: {
                    left: '3%',
                    right: '4%',
                    bottom: '3%',
                    containLabel: true,
                },
                tooltip: {
                    show: 'true',
                    trigger: 'axis',
                    axisPointer: { // 坐标轴指示器，坐标轴触发有效
                        type: 'shadow', // 默认为直线，可选为：'line' | 'shadow'
                    },
                },
                yAxis: {
                    type: 'value',
                    axisTick: {
                        show: false,
                    },
                    ...axisStyle[ops ? 1 : 0],
                    splitLine: {
                        show: true,
                        lineStyle: {
                            color: '#aaa',
                        },
                    },
                },
                xAxis: [{
                    type: 'category',
                    axisTick: {
                        show: false,
                    },
                    data: result,
                    ...axisStyle[ops ? 1 : 0],
                }, {
                    type: 'category',
                    axisLine: {
                        show: false,
                    },
                    axisTick: {
                        show: false,
                    },
                    axisLabel: {
                        show: false,
                    },
                    splitArea: {
                        show: false,
                    },
                    splitLine: {
                        show: false,
                    },
                    data: result,
                },

                ],
                series: [{
                    name: '5349',
                    type: 'bar',
                    xAxisIndex: 1,
                    itemStyle: {
                        normal: {
                            show: true,
                            color: '#0167ff',
                            borderWidth: 0,
                            borderColor: '#333',
                        },
                    },
                    barWidth: '20%',
                    data: maxXData,
                }, {
                    name: '总关区',
                    type: 'bar',
                    xAxisIndex: 1,
                    itemStyle: {
                        normal: {
                            show: true,
                            color: '#0167ff',
                            borderWidth: 0,
                            borderColor: '#333',
                        },
                    },
                    barWidth: '20%',
                    barGap: '100%',
                    data: maxyData,
                }, {
                    name: '5349',
                    type: 'bar',
                    itemStyle: {
                        normal: {
                            show: true,
                            color: '#2fe384',
                            borderWidth: 0,
                            borderColor: '#333',
                        },
                    },
                    label: {
                        normal: {
                            show: true,
                            position: 'top',
                            textStyle: textStyle[ops ? 1 : 0],
                        },
                    },
                    barWidth: '20%',
                    data: monthData,
                }, {
                    name: '总关区',
                    type: 'bar',
                    barWidth: '20%',
                    itemStyle: {
                        normal: {
                            show: true,
                            color: '#008eff',
                            borderWidth: 0,
                            borderColor: '#333',
                        },
                    },
                    label: {
                        normal: {
                            show: true,
                            position: 'top',
                            textStyle: textStyle[ops ? 1 : 0],
                        },
                    },
                    barGap: '100%',
                    data: monthData,
                },

                ],
            }
        },
    }, {

        /** 近12个月征收税款统计情况 */
        sub: 'ICountimg_5',
        func: (ops) => {
            var data = newDats();
            var data1 = newDats();
            var data2 = newDats();
            return {
                color: ['#008eff', '#febd19', '#2fe384'],
                backgroundColor: bgColor,
                tooltip: {
                    trigger: 'axis',
                    axisPointer: {
                        type: 'cross',
                        crossStyle: {
                            color: '#999',
                        },
                    },
                },
                toolbox: {
                    feature: {
                        dataView: {
                            show: true,
                            readOnly: false,
                        },
                        magicType: {
                            show: true,
                            type: ['line', 'bar'],
                        },
                        restore: {
                            show: true,
                        },
                        saveAsImage: {
                            show: true,
                        },
                    },
                },
                legend: {
                    ...legendStyle[ops ? 1 : 0],
                    data: ['最新成交价', '征收税款'],
                },
                grid: {
                    left: '3%',
                    right: '4%',
                    bottom: '3%',
                    containLabel: true,
                },
                xAxis: [{
                    type: 'category',
                    data: result,
                    axisPointer: {
                        type: 'shadow',
                    },
                    ...axisStyle[ops ? 1 : 0],
                }],
                yAxis: [{
                    type: 'value',
                    name: ' ',
                    min: 0,
                    max: 120,
                    position: 'right',
                    axisLine: {
                        lineStyle: {
                            color: 'white',
                        },
                    },
                    axisLabel: {
                        color: 'white',
                        fontSize: 15,
                        formatter: '{value} %',
                    },
                }, {
                    type: 'value',
                    name: ' ',
                    min: 0,
                    max: 300,
                    position: 'left',
                    ...axisStyle[ops ? 1 : 0],
                }],
                series: [{
                    name: '征收税款',
                    type: 'bar',
                    data: data,
                },
                {
                    name: '环比',
                    type: 'line',
                    yAxisIndex: 1,
                    data: data1,
                }, {
                    name: '同比',
                    type: 'line',
                    yAxisIndex: 1,
                    data: data2,
                },
                ],
            }
        },
    }, {

        /** 近12个月通关效率统计图 */
        sub: 'ICountimg_6',
        func: (ops) => {
            return {
                backgroundColor: bgColor,
                color: ['#00a9fe'],
                title: {
                    text: '通关效率',
                    textStyle: {
                        color: ['#FFFFFF'],
                    },
                },
                tooltip: {
                    trigger: 'axis',
                    axisPointer: { // 坐标轴指示器，坐标轴触发有效
                        type: 'shadow', // 默认为直线，可选为：'line' | 'shadow'
                    },
                },
                grid: {
                    left: '3%',
                    right: '4%',
                    bottom: '3%',
                    containLabel: true,
                },
                xAxis: [{
                    type: 'category',
                    gridIndex: 0,
                    data: result,
                    axisTick: {
                        alignWithLabel: true,
                    },
                    ...axisStyle[ops ? 1 : 0],
                }],
                yAxis: [{
                    type: 'value',
                    gridIndex: 0,
                    splitLine: {
                        show: false,
                    },
                    axisTick: {
                        show: false,
                    },
                    min: 0,
                    max: 100,
                    axisLine: {
                        lineStyle: {
                            color: 'white',
                        },
                    },
                    axisLabel: {
                        color: 'white',
                        formatter: '{value} %',
                    },
                }],
                series: [{
                    name: '通关效率',
                    type: 'bar',
                    barWidth: '50%',
                    itemStyle: {
                        normal: {
                            color: '#00a9fe',
                        },
                    },
                    data: monthData,
                }],
            }
        },
    }, {

        /** 近12个月的查验时效统计情况 */
        sub: 'ICountimg_7',
        func: (ops) => {
            return {
                backgroundColor: bgColor,
                color: ['#3a5bff'],
                title: {
                    text: '查验时效',
                    textStyle: {
                        color: ['#FFFFFF'],
                    },
                },
                tooltip: {
                    trigger: 'axis',
                    axisPointer: { // 坐标轴指示器，坐标轴触发有效
                        type: 'shadow', // 默认为直线，可选为：'line' | 'shadow'
                    },
                },
                grid: {
                    left: '3%',
                    right: '4%',
                    bottom: '3%',
                    containLabel: true,
                },
                xAxis: [{
                    type: 'category',
                    gridIndex: 0,
                    data: result,
                    axisTick: {
                        alignWithLabel: true,
                    },
                    ...axisStyle[ops ? 1 : 0],
                }],
                yAxis: [{
                    type: 'value',
                    gridIndex: 0,
                    splitLine: {
                        show: false,
                    },
                    axisTick: {
                        show: false,
                    },
                    min: 0,
                    max: 100,
                    axisLine: {
                        lineStyle: {
                            color: 'white',
                        },
                    },
                    axisLabel: {
                        color: 'white',
                        formatter: '{value} %',
                    },
                }],
                series: [{
                    name: '查验时效',
                    type: 'bar',
                    barWidth: '50%',
                    itemStyle: {
                        normal: {
                            color: '#5069e7',
                        },
                    },
                    data: monthData,
                }],
            }
        },
    }, {

        /** 近12个月船舶申报情况 */
        sub: 'ICountimg_8',
        func: (ops) => {
            return {
                color: ['#2e82ff', '#48d602', '#0084ff', '#ffb900', '#00e4ff'],
                backgroundColor: bgColor,
                tooltip: {
                    trigger: 'axis',
                    axisPointer: { // 坐标轴指示器，坐标轴触发有效
                        type: 'shadow', // 默认为直线，可选为：'line' | 'shadow'
                    },
                },
                legend: {
                    data: ['船代三', '船代二', '船代一', '船代进境总量', '其他船代进境量'],
                    ...legendStyle[ops ? 1 : 0],
                },
                grid: {
                    left: '3%',
                    right: '4%',
                    bottom: '3%',
                    containLabel: true,
                },
                xAxis: [{
                    type: 'category',
                    data: result,
                    ...axisStyle[ops ? 1 : 0],
                }],
                yAxis: [{
                    type: 'value',
                    ...axisStyle[ops ? 1 : 0],
                }],
                series: [{
                    name: '船代进境总量',
                    type: 'bar',
                    data: monthData,
                },
                {
                    name: '船代一',
                    type: 'bar',
                    stack: '船代',
                    data: monthData,
                },
                {
                    name: '船代二',
                    type: 'bar',
                    stack: '船代',
                    data: monthData,
                },
                {
                    name: '船代三',
                    type: 'bar',
                    stack: '船代',
                    data: monthData,
                },
                {
                    name: '其他船代进境量',
                    type: 'bar',
                    data: monthData,
                },
                ],
            }
        },
    }, {

        /** 近12个月船代申报提单情况 */
        sub: 'ICountimg_9',
        func: (ops) => {
            return {
                color: ['#2e82ff', '#48d602', '#0084ff', '#ffb900', '#00e4ff'],
                backgroundColor: bgColor,
                tooltip: {
                    trigger: 'axis',
                    axisPointer: { // 坐标轴指示器，坐标轴触发有效
                        type: 'shadow', // 默认为直线，可选为：'line' | 'shadow'
                    },
                },
                legend: {
                    data: ['船代三', '船代二', '船代一', '船代进境总量', '其他船代进境量'],
                    ...legendStyle[ops ? 1 : 0],
                },
                grid: {
                    left: '3%',
                    right: '4%',
                    bottom: '3%',
                    containLabel: true,
                },
                xAxis: [{
                    type: 'category',
                    data: result,
                    ...axisStyle[ops ? 1 : 0],
                }],
                yAxis: [{
                    type: 'value',
                    ...axisStyle[ops ? 1 : 0],
                }],
                series: [{
                    name: '船代进境总量',
                    type: 'bar',
                    data: monthData,
                },
                {
                    name: '船代一',
                    type: 'bar',
                    stack: '船代',
                    data: monthData,
                },
                {
                    name: '船代二',
                    type: 'bar',
                    stack: '船代',
                    data: monthData,
                },
                {
                    name: '船代三',
                    type: 'bar',
                    stack: '船代',
                    data: monthData,
                },
                {
                    name: '其他船代进境量',
                    type: 'bar',
                    data: monthData,
                },
                ],
            }
        },
    }, {

        /** 近12个月报关行录单情况 */
        sub: 'ICountimg_10',
        func: (ops) => {
            var result = result;
            var datas = [5000, 6000, 3000, 4523, 5870, 3654, 6521];
            // 亮色图片
            var uploadedDataURL1 = ' '; // 黄色五角星
            var uploadedDataURL2 = ' '; // 灰色五角星
            var grayBar = [1, 1, 1, 1, 1, 1, 1];
            var paiming = [7, 6, 5, 4, 3, 2, 1];
            var zongjine = [7000, 7000, 7000, 7000, 7000, 7000, 7000];
            var baifenbi = [];
            for (let i in datas) {
                baifenbi.push(datas[i] / zongjine[i])
            }
            var city = ['船代7', '船代6', '船代5', '船代4', '船代3', '船代2', '船代1'];
            return {
                backgroundColor: bgColor,
                title: {
                    text: '本月报关行录入提单排名统计图',
                    left: 'center',
                },
                color: ['#2e82ff'], // 进度条颜色
                /* grid: {
                     left: '-10%',  //如果离左边太远就用这个......
                     //right: '14%',
                     bottom: '5%',
                     top: '5%',
                     containLabel: true
                 },*/
                xAxis: [{
                    show: false,
                },
                // 由于下边X轴已经是百分比刻度了,所以需要在顶部加一个X轴,刻度是金额,也隐藏掉
                {
                    show: false,
                },
                ],
                yAxis: {
                    type: 'category',
                    axisLabel: {
                        show: false, // 让Y轴数据不显示
                    },
                    itemStyle: {

                    },
                    axisTick: {
                        show: false, // 隐藏Y轴刻度
                    },
                    axisLine: {
                        show: false, // 隐藏Y轴线段
                    },
                    data: city,
                },
                series: [
                    // 背景色--------------------我是分割线君------------------------------//
                    {
                        show: true,
                        type: 'bar',
                        barGap: '-100%',
                        barWidth: '25%', // 统计条宽度 
                        itemStyle: {
                            normal: {
                                barBorderRadius: 15,
                                color: 'rgba(102, 102, 102,0.5)',
                            },
                        },
                        z: 1,
                        data: grayBar,
                    },
                    // 蓝条--------------------我是分割线君------------------------------//
                    {
                        show: true,
                        type: 'bar',
                        barGap: '-100%',
                        barWidth: '25%', // 统计条宽度
                        itemStyle: {
                            normal: {
                                barBorderRadius: 20, // 统计条弧度
                            },
                        },
                        max: 1,
                        label: {
                            normal: {
                                show: true,
                                // 百分比格式
                                formatter: function (data) {
                                    return (baifenbi[data.dataIndex] * 100).toFixed(1) + '%';
                                },
                            },
                        },
                        labelLine: {
                            show: false,
                        },
                        z: 2,
                        data: baifenbi,
                    },
                    // 数据条--------------------我是分割线君------------------------------//
                    {
                        show: true,
                        type: 'bar',
                        xAxisIndex: 1, // 代表使用第二个X轴刻度!!!!!!!!!!!!!!!!!!!!!!!!
                        barGap: '-100%',
                        barWidth: '25%', // 统计条宽度
                        itemStyle: {
                            normal: {
                                barBorderRadius: 20,
                                color: 'rgba(22,203,115,0.05)',
                            },
                        },
                        label: {
                            normal: {
                                show: true,
                                // label 的position位置可以是top bottom left,right,也可以是固定值
                                // 在这里需要上下统一对齐,所以用固定值
                                position: [0, '-100%'],
                                rich: { // 富文本
                                    black: { // 自定义颜色
                                        color: '#000',
                                    },
                                    start2: {
                                        backgroundColor: { // 这里可以添加你想自定义的图片
                                            image: uploadedDataURL2,
                                        },
                                    },
                                    start1: {
                                        backgroundColor: {
                                            image: uploadedDataURL1,
                                        },
                                    },
                                    green: {
                                        color: '#70DDA7',
                                    },
                                    yellow: {
                                        color: '#FEC735',
                                    },
                                },
                                formatter: function (data) {
                                    // 富文本固定格式{colorName|这里填你想要写的内容}
                                    return paiming[data.dataIndex] == 1 ? '{start1|}{yellow|第' + paiming[data.dataIndex] + '名:' + city[data.dataIndex] + '}' + '{black|                                                                         总金额:}{yellow|' + zongjine[data.dataIndex] + '}{black|,录入提单量:}' + '{green|' + datas[data.dataIndex] + '}' : '{start2|}{black|第' + paiming[data.dataIndex] + '名:' + city[data.dataIndex] + '}' + '{black|                                                                         总金额:}{yellow|' + zongjine[data.dataIndex] + '}{black|,录入提单量:}' + '{green|' + datas[data.dataIndex] + '}';
                                },
                            },
                        },
                        data: zongjine,
                    },

                ],
            }
        },
    }, {

        /** 近12个月海关查验情况 */
        sub: 'ICountimg_11',
        func: (ops) => {
            var x = newDats();
            var y = newDats();
            return {
                backgroundColor: bgColor,
                legend: {
                    bottom: 20,
                    ...legendStyle[ops ? 1 : 0],
                    data: ['查验箱量', '查验放行箱量'],
                },
                grid: {
                    left: '3%',
                    right: '4%',
                    bottom: '10%',
                    containLabel: true,
                },
                tooltip: {
                    show: 'true',
                    trigger: 'axis',
                    axisPointer: { // 坐标轴指示器，坐标轴触发有效
                        type: 'shadow', // 默认为直线，可选为：'line' | 'shadow'
                    },
                },
                xAxis: {
                    type: 'value',
                    axisTick: {
                        show: false,
                    },
                    ...axisStyle[ops ? 1 : 0],
                    splitLine: {
                        show: false,
                    },
                },
                yAxis: [{
                    type: 'category',
                    axisTick: {
                        show: false,
                    },
                    ...axisStyle[ops ? 1 : 0],
                    data: result,
                },
                {
                    type: 'category',
                    axisLine: {
                        show: false,
                    },
                    axisTick: {
                        show: false,
                    },
                    axisLabel: {
                        show: false,
                    },
                    splitArea: {
                        show: false,
                    },
                    splitLine: {
                        show: false,
                    },
                    data: result,
                },

                ],
                series: [{
                    name: '查验放行箱量',
                    type: 'bar',
                    yAxisIndex: 1,

                    itemStyle: {
                        normal: {
                            show: true,
                            color: '#189053',
                            barBorderRadius: 50,
                            borderWidth: 0,
                            borderColor: '#333',
                        },
                    },
                    barGap: '0%',
                    barCategoryGap: '50%',
                    data: x,
                },
                {
                    name: '查验箱量',
                    type: 'bar',
                    itemStyle: {
                        normal: {
                            show: true,
                            color: '#2e82ff',
                            barBorderRadius: 50,
                            borderWidth: 0,
                            borderColor: '#333',
                        },
                    },
                    barGap: '0%',
                    barCategoryGap: '50%',
                    data: y,
                },
                ],
            }
        },
    }, {

        /** 近12个月集装箱申报情况 */
        sub: 'ICountimg_12',
        func: (ops) => {
            var data = newDats();
            var data1 = newDats();
            var data2 = newDats();
            return {
                color: ['#008eff', '#febd19', '#2fe384'],
                backgroundColor: bgColor,
                tooltip: {
                    trigger: 'axis',
                    axisPointer: {
                        type: 'cross',
                        crossStyle: {
                            color: '#999',
                        },
                    },
                },
                toolbox: {
                    feature: {
                        dataView: {
                            show: true,
                            readOnly: false,
                        },
                        magicType: {
                            show: true,
                            type: ['line', 'bar'],
                        },
                        restore: {
                            show: true,
                        },
                        saveAsImage: {
                            show: true,
                        },
                    },
                },
                legend: {
                    data: ['最新成交价', '征收税款'],
                    ...legendStyle[ops ? 1 : 0],
                },
                grid: {
                    left: '3%',
                    right: '4%',
                    bottom: '3%',
                    containLabel: true,
                },
                xAxis: [{
                    type: 'category',
                    data: result,
                    axisPointer: {
                        type: 'shadow',
                    },
                    ...axisStyle[ops ? 1 : 0],
                }],
                yAxis: [{
                    type: 'value',
                    name: ' ',
                    min: 0,
                    max: 120,
                    position: 'right',
                    axisLabel: {
                        formatter: '{value} %',
                        color: 'white',
                    },
                    axisLine: {
                        lineStyle: {
                            color: 'white',
                        },
                    },
                }, {
                    type: 'value',
                    name: ' ',
                    min: 0,
                    max: 300,
                    position: 'left',
                    ...axisStyle[ops ? 1 : 0],
                }],
                series: [{
                    name: '征收税款',
                    type: 'bar',
                    data: data,
                },
                {
                    name: '环比',
                    type: 'line',
                    yAxisIndex: 1,
                    data: data1,
                }, {
                    name: '同比',
                    type: 'line',
                    yAxisIndex: 1,
                    data: data2,
                },
                ],
            }
        },
    }, {

        /** 近12个月集装箱申报情况 */
        sub: 'ICountimg_13',
        func: (ops) => {
            var data1 = newDats();
            var data2 = newDats();
            return {
                color: ['#6113ff', '#2e82ff'],
                backgroundColor: bgColor,
                title: {
                    text: '园区车辆情况',
                },
                tooltip: {
                    trigger: 'axis',
                },
                legend: {
                    data: ['进闸车辆', '出闸车辆'],
                    ...legendStyle[ops ? 1 : 0],
                },
                toolbox: {
                    show: true,
                    feature: {
                        dataView: {
                            show: true,
                            readOnly: false,
                        },
                        magicType: {
                            show: true,
                            type: ['line', 'bar'],
                        },
                        restore: {
                            show: true,
                        },
                        saveAsImage: {
                            show: true,
                        },
                    },
                },
                calculable: true,
                grid: {
                    left: '3%',
                    right: '4%',
                    bottom: '3%',
                    containLabel: true,
                },
                xAxis: [{
                    type: 'category',
                    data: result,
                    ...axisStyle[ops ? 1 : 0],
                }],
                yAxis: [{
                    type: 'value',
                    ...axisStyle[ops ? 1 : 0],
                }],
                series: [{
                    name: '出闸车辆',
                    type: 'bar',
                    data: data1,
                    markPoint: {
                        data: [{
                            type: 'max',
                            name: '最大值',
                        },
                        {
                            type: 'min',
                            name: '最小值',
                        },
                        ],
                    },
                    markLine: {
                        data: [{
                            type: 'average',
                            name: '平均值',
                        }],
                    },
                },
                {
                    name: '进闸车辆',
                    type: 'bar',
                    data: data2,
                    markPoint: {
                        data: [{
                            name: '年最高',
                            value: 182.2,
                            xAxis: 7,
                            yAxis: 183,
                        },
                        {
                            name: '年最低',
                            value: 2.3,
                            xAxis: 11,
                            yAxis: 3,
                        },
                        ],
                    },
                    markLine: {
                        data: [{
                            type: 'average',
                            name: '平均值',
                        }],
                    },
                },
                ],
            }
        },
    }, {

        /** 近12个月集装箱申报情况 */
        sub: 'ICountimg_14',
        func: (ops) => {
            var data = [];
            for (var i = 1; i < 13; i++) {
                data.push(Math.floor(Math.random() * 500));
            }

            var datas = [];
            for (var i = 1; i < 13; i++) {
                datas.push(-(Math.floor(Math.random() * 500)));
            }

            return {
                color: ['#0167ff', '#ff4e4c'],
                backgroundColor: bgColor,
                legend: {
                    data: ['入库', '出库'],
                    x: '43%',
                    ...legendStyle[ops ? 1 : 0],
                },
                grid: {
                    left: '3%',
                    right: '4%',
                    bottom: '3%',
                    containLabel: true,
                },
                xAxis: [{
                    type: 'value',
                    ...axisStyle[ops ? 1 : 0],
                }],
                yAxis: [{
                    type: 'category',
                    axisTick: {
                        show: false,
                    },
                    data: result,
                    ...axisStyle[ops ? 1 : 0],
                }],
                series: [{
                    name: '出库',
                    type: 'bar',
                    stack: '总量',
                    label: {
                        normal: {
                            show: true,
                            position: 'right',
                        },
                    },
                    data: data,
                }, {
                    name: '入库',
                    type: 'bar',
                    stack: '总量',
                    label: {
                        normal: {
                            show: true,
                            position: 'left',
                        },
                    },
                    data: datas,
                }],
            }
        },
    }, {

        /** 近12个月集装箱申报情况 */
        sub: 'ICountimg_15',
        func: (ops) => {
            return {
                backgroundColor: bgColor,
                title: {
                    text: '进出口备案制清单数',
                },
                tooltip: {
                    trigger: 'axis',
                    axisPointer: {
                        type: 'shadow',
                    },
                    formatter: '{a} <br/>{b} : {c}',
                },
                grid: {
                    left: '3%',
                    right: '4%',
                    bottom: '3%',
                    containLabel: true,
                },
                xAxis: {
                    type: 'value',
                    boundaryGap: [0, 0.01],
                    ...axisStyle[ops ? 1 : 0],
                },
                yAxis: {
                    type: 'category',
                    data: result,
                    ...axisStyle[ops ? 1 : 0],
                },
                series: [{
                    name: '2016年占比',
                    type: 'bar',
                    data: monthData,
                    itemStyle: {
                        normal: {
                            barBorderRadius: [0, 15, 15, 0],
                            color: '#008fff',
                        },
                    },
                }],
            }
        },
    });