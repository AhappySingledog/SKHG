import echarts from 'echarts';
import { subscribes, publish } from '../../../frame/core/arbiter';
import $ from 'jquery';

let ports = null;
let data_mapJson = null;
let truck = null;
$.ajax({ dataType: 'json', url: '../homePort.json', async: false, success: (res) => ports = res });
$.ajax({ dataType: 'json', url: '../datajson.json', async: false, success: (res) => data_mapJson = res });
$.ajax({ dataType: 'json', url: '../outcar.json', async: false, success: (res) => truck = res });

const x_PI = 3.14159265358979324 * 3000.0 / 180.0;
const PI = 3.1415926535897932384626;
const a = 6378245.0;
const ee = 0.00669342162296594323;

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
    return { lng: gg_lng, lat: gg_lat };
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
    return { lng: mglng, lat: mglat };
};

function bd2wgs84(lng, lat) {
    let p1 = bd09togcj02(lng, lat);
    let p2 = gcj02towgs84(p1.lng, p1.lat);
    return { lng: p2.lng, lat: p2.lat };
}

const time = 3;
let getLine = (data) => {
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

subscribes(
    {
        sub: 'home_worldMap', // 首页世界地图
        func: (res) => {
            let data = [
                [113.888, 22.478],
                [114.48194, 21.611726],
                [114.629118, 20.50644],
                [114.629118, 19.323176],
                [114.555529, 18.482644],
                [114.48194, 17.778991],
                [114.040405, 15.722823],
                [113.819637, 14.579129],
                [113.304513, 13.068926],
                [112.347854, 9.875375],
                [111.538373, 7.238442],
                [110.581713, 4.364215],
                [110.140178, 3.329329],
                [109.698643, 2.81145],
                [109.404286, 2.293339],
                [108.594805, 1.034361],
                [108.374037, 0.29351],
                [107.932502, -0.595566],
                [107.417378, -2.002886],
                [107.2702, -2.743144],
                [107.049432, -3.261055],
                [106.828665, -3.556886],
                [106.534308, -3.556886],
                [106.239951, -3.408982],
                [105.872005, -2.854146],
                [105.614443, -2.44709],
                [105.246497, -2.150969],
                [104.988935, -1.817764],
                [104.584194, -1.077102],
                [104.142659, -0.410347],
                [103.921892, 0.182375],
                [103.627535, 0.626907],
                [103.333178, 0.997322],
                [102.891643, 1.515828],
                [102.192546, 2.034209],
                [101.272681, 2.700445],
                [100.205638, 3.551195],
                [99.285773, 4.511946],
                [97.924373, 5.582024],
                [94.833627, 7.642463],
                [92.184416, 8.522593],
                [87.621887, 8.815524],
                [85.267033, 8.376041],
                [82.176287, 7.201695],
                [80.262968, 6.024258],

                [80.24687, 5.987419],
                [80.198577, 5.950577],
                [80.152584, 5.925247],
                [80.095093, 5.902218],
                [80.0445, 5.886098],
                [79.961712, 5.858462],
                [79.860527, 5.83543],

                [79.855928, 5.833127],
                [79.487982, 5.980511],
                [78.531322, 6.348793],
                [77.133128, 6.716808],
                [76.02929, 7.158053],
                [74.631095, 7.892488],
                [73.600847, 8.625603],
                [72.644187, 9.137934],
                [71.54035, 9.64952],
                [69.553442, 10.16032],
                [67.345766, 10.743079],
                [65.579625, 11.3247],
                [64.034252, 11.615066],
                [62.562469, 11.68761],
                [60.796328, 11.977593],
                [58.80942, 12.122466],
                [56.822512, 12.484299],
                [53.731766, 12.701155],
                [51.965626, 12.773398],
                [49.463593, 12.773398],
                [47.182329, 12.411973],
                [43.355691, 12.484299],
                [43.061334, 12.773398],
                [42.840567, 13.062163],
                [42.031085, 13.998251],
                [41.515961, 14.787332],
                [41.221604, 15.430798],
                [40.927248, 16.214513],
                [40.191356, 17.348816],
                [39.455464, 18.476061],
                [38.94034, 19.874594],
                [38.204448, 20.984544],
                [37.10061, 23.179253],
                [35.555237, 25.805392],
                [33.034807, 28.634027],
                [32.648464, 29.281269],
                [32.53808, 29.635502],
                [32.482888, 29.940421],
                [32.482888, 30.132517],
                [32.455292, 30.236412],
                [32.409299, 30.29231],
                [32.344909, 30.380083],
                [32.289717, 30.507612],
                [32.262121, 30.666786],
                [32.243724, 31.016037],
                [32.243724, 31.19018],
            ];
            let czml = [{
                id: "document",
                name: "CZML Path",
                version: "1.0",
                clock: {
                    interval: "2012-08-04T10:00:00Z/2032-08-04T15:00:00Z",
                    currentTime: "2012-08-04T10:00:00Z",
                    multiplier: 10
                }
            }, {
                id: "path",
                name: "",
                description: "",
                availability: "2012-08-04T10:00:00Z/2032-08-04T15:00:00Z",
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
                                rgba: [230, 33, 41, 255]
                            }
                        }
                    },
                    width: 80,
                    leadTime: 0,
                    trailTime: 9999999999999999999999999999,
                    resolution: 5
                },
                position: {
                    epoch: "2012-08-04T10:00:00Z",
                    cartographicDegrees: getLine(data)
                }
            }];
            return { ports: ports, czml: czml };
        },
    }, {
        sub: 'home_right_t',   // 首页右侧table
        func: (ops) => {
            let flds = [
                { name: 'name', title: '港口名称' },
                { name: 'position', title: '港口位置' },
                { name: 'teu', title: '港口年吞吐量' },
                { name: 'time', title: '招商运营时间' },
            ];
            let datas = [
                { name: '八所港', position: '八所港', teu: '235 TEU', time: 1982 },
                { name: '北海港', position: '北海港', teu: '345 TEU', time: 1983 },
                { name: '八所港', position: '八所港', teu: '235 TEU', time: 1982 },
                { name: '北海港', position: '北海港', teu: '345 TEU', time: 1983 },
                { name: '八所港', position: '八所港', teu: '235 TEU', time: 1982 },
                { name: '北海港', position: '北海港', teu: '345 TEU', time: 1983 },
                { name: '八所港', position: '八所港', teu: '235 TEU', time: 1982 },
                { name: '北海港', position: '北海港', teu: '345 TEU', time: 1983 },
                { name: '八所港', position: '八所港', teu: '235 TEU', time: 1982 },
                { name: '北海港', position: '北海港', teu: '345 TEU', time: 1983 },
                { name: '八所港', position: '八所港', teu: '235 TEU', time: 1982 },
                { name: '北海港', position: '北海港', teu: '345 TEU', time: 1983 },
                { name: '八所港', position: '八所港', teu: '235 TEU', time: 1982 },
                { name: '北海港', position: '北海港', teu: '345 TEU', time: 1983 },
                { name: '八所港', position: '八所港', teu: '235 TEU', time: 1982 },
            ];
            return { flds: flds, datas: datas };
        },
    }, {
        sub: 'home_right_e',   // 首页右侧echarts
        func: (ops) => {
            let month = ['17/02', '17/03', '17/04', '17/05', '17/06','17/07','17/08','17/09','17/10','17/11','17/12','18/01'];
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
                    }
                }, {
                    text: '征收金额(亿元)',
                    x: '56%',
                    y: '1%',
                    textAlign: 'center',
                    textStyle: {
                        color: '#52BEFC',
                        fontSize: 35,
                    }
                }, {
                    text: '通关效率(小时)',
                    x: '6%',
                    y: '51%',
                    textAlign: 'center',
                    textStyle: {
                        color: '#FFB84E',
                        fontSize: 35,
                    }
                }, {
                    text: '查验时效(小时)',
                    x: '56%',
                    y: '51%',
                    textAlign: 'center',
                    textStyle: {
                        color: '#FFB84E',
                        fontSize: 35,
                    }
                }],
                grid: [
                    { x: '4%', y: '7%', width: '44%', height: '39%' },
                    { x2: '2%', y: '7%', width: '44%', height: '39%' },
                    { x: '4%', y2: '4%', width: '44%', height: '39%' },
                    { x2: '2%', y2: '4%', width: '44%', height: '39%' }

                ],
                tooltip: {
                    formatter: '{a}: ({c})'
                },
                xAxis: [
                    {
                        gridIndex: 0,
                        axisLine: {
                            lineStyle: {
                                color: '#fff'
                            }
                        },
                        axisLabel: {
                            formatter: '{value}',
                            fontSize: 20,
                        },
                        data: month
                    },
                    {
                        gridIndex: 1,
                        axisLine: {
                            lineStyle: {
                                color: '#fff'
                            }
                        },
                        axisLabel: {
                            formatter: '{value}',
                            fontSize: 20,
                        },
                        data: month
                    },
                    {
                        gridIndex: 2,
                        axisLine: {
                            lineStyle: {
                                color: '#fff'
                            }
                        },
                        axisLabel: {
                            formatter: '{value}',
                            fontSize: 20,
                        },
                        data: month
                    },
                    {
                        gridIndex: 3,
                        axisLine: {
                            lineStyle: {
                                color: '#fff'
                            }
                        },
                        axisLabel: {
                            formatter: '{value}',
                            fontSize: 20,
                        },
                        data: month
                    }
                ],
                yAxis: [
                    {
                        gridIndex: 0,
                        axisLabel: {
                            formatter: '{value}',
                            fontSize: 30,
                        },
                        axisLine: {
                            lineStyle: {
                                color: '#fff'
                            }
                        }
                    },
                    {
                        gridIndex: 1,
                        axisLabel: {
                            formatter: '{value}',
                            fontSize: 30,
                        },
                        axisLine: {
                            lineStyle: {
                                color: '#fff'
                            }
                        }
                    },
                    {
                        gridIndex: 2,
                        axisLabel: {
                            formatter: '{value}',
                            fontSize: 30,
                        },
                        axisLine: {
                            lineStyle: {
                                color: '#fff'
                            }
                        }
                    },
                    {
                        gridIndex: 3,
                        axisLabel: {
                            formatter: '{value}',
                            fontSize: 30,
                        },
                        axisLine: {
                            lineStyle: {
                                color: '#fff'
                            }
                        }
                    }
                ],
                series: [
                    {
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
                                }
                            }
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
                                }
                            }
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
                                }
                            }
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
                                }
                            }
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
                                }
                            }
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
                                }
                            }
                        },
                    }
                ]
            };
            return option;
        },
    }, {
        sub: 'map_view_init',   // 第二页地图
        func: (ops) => {
            return data_mapJson;
        },
    }, {
        sub: 'map_view_pie',   // 出入境旅客统计饼状图
        func: (ops) => {
            let data = ((data_mapJson.data.filter((a) => a.key === 'demo')[0] || {}).value || []);
            let data1 = data.map((d) => { return { name: d.name + '_', value: d.value } });
            return {
                color: ['#FFBD19', '#089CEF'],
                tooltip: {
                    trigger: 'item',
                    formatter: "{a} <br/>{b}: {c} ({d}%)"
                },
                legend: {
                    itemWidth: 100,
                    itemHeight: 100,
                    textStyle: {
                        fontSize: 50
                    },
                    orient: 'vertical',
                    x: 'left',
                    data: [{
                        name: '入境',
                        textStyle: {
                            color: '#ffffff'
                        },

                    }, {
                        name: '出境',
                        textStyle: {
                            color: '#ffffff'
                        }
                    }],
                },
                series: [
                    {
                        name: '访问来源',
                        type: 'pie',
                        radius: ['40%', '55%'],
                        label: {
                            normal: {
                                fontSize: 50,
                                formatter: '{b}\n{d}%',
                                padding: 100,
                                width: 200,
                            }
                        },
                        data: [
                            { value: 39.05, name: '入境' },
                            { value: 60.95, name: '出境' },
                        ]
                    }
                ]
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
            var max = 7000;
            var size = '100%';
            var initcolor = '#30979C';

            var color = initcolor;
            var dataStyle = {
                normal: {
                    label: {
                        show: false
                    },
                    labelLine: {
                        show: false
                    },
                    shadowBlur: 40,
                    shadowColor: 'rgba(40, 40, 40, 0.5)'
                }
            };
            var placeHolderStyle = {
                normal: {
                    color: 'rgba(44,59,70,0)', //未完成的圆环的颜色
                    label: {
                        show: false
                    },
                    labelLine: {
                        show: false
                    }
                }
            };

            return {
                title: {
                    text: value,
                    x: 'center',
                    y: '35%',
                    textStyle: {
                        fontWeight: 'normal',
                        color: 'white',
                        fontSize: parseInt(size) * 0.6
                    },
                    subtext: 'TEU',
                    subtextStyle: {
                        fontWeight: 'normal',
                        color: 'white',
                        fontSize: parseInt(size) * 0.4
                    }
                },
                color: ['#fff', '#313443', '#fff'],
                tooltip: {
                    show: false,
                    formatter: "{a} <br/>{b} : {c} ({d}%)"
                },
                legend: {
                    show: false,
                    itemGap: 12,
                    data: ['01', '02']
                },
                toolbox: {
                    show: false,
                    feature: {
                        mark: {
                            show: true
                        },
                        dataView: {
                            show: true,
                            readOnly: false
                        },
                        restore: {
                            show: true
                        },
                        saveAsImage: {
                            show: true
                        }
                    }
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
                                    color: color
                                }, {
                                    offset: 1,
                                    color: color
                                }]),
                            },
                        },
                    }, {
                        value: max - value,
                        name: 'invisible',
                        itemStyle: placeHolderStyle
                    }

                    ]
                }, {
                    name: 'Line 2',
                    type: 'pie',
                    animation: false,
                    clockWise: false,
                    radius: ['66%', '70%'],
                    itemStyle: dataStyle,
                    hoverAnimation: false,
                    tooltip: {
                        show: false
                    },
                    data: [{
                        value: 0,
                        name: '02',
                        itemStyle: {
                            normal: {
                                color: color,
                            },
                        }
                    }]
                }]
            }
        }
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
            var max = 3000;
            var size = '100%';
            var initcolor = '#F26D12';

            var color = initcolor;
            var dataStyle = {
                normal: {
                    label: {
                        show: false
                    },
                    labelLine: {
                        show: false
                    },
                    shadowBlur: 40,
                    shadowColor: 'rgba(40, 40, 40, 0.5)'
                }
            };
            var placeHolderStyle = {
                normal: {
                    color: 'rgba(44,59,70,0)', //未完成的圆环的颜色
                    label: {
                        show: false
                    },
                    labelLine: {
                        show: false
                    }
                }
            };

            return {
                title: {
                    text: value,
                    x: 'center',
                    y: '35%',
                    textStyle: {
                        fontWeight: 'normal',
                        color: 'white',
                        fontSize: parseInt(size) * 0.6
                    },
                    subtext: 'TEU',
                    subtextStyle: {
                        fontWeight: 'normal',
                        color: 'white',
                        fontSize: parseInt(size) * 0.4
                    }
                },
                color: ['#fff', '#313443', '#fff'],
                tooltip: {
                    show: false,
                    formatter: "{a} <br/>{b} : {c} ({d}%)"
                },
                legend: {
                    show: false,
                    itemGap: 12,
                    data: ['01', '02']
                },
                toolbox: {
                    show: false,
                    feature: {
                        mark: {
                            show: true
                        },
                        dataView: {
                            show: true,
                            readOnly: false
                        },
                        restore: {
                            show: true
                        },
                        saveAsImage: {
                            show: true
                        }
                    }
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
                                    color: color
                                }, {
                                    offset: 1,
                                    color: color
                                }]),
                            },
                        },
                    }, {
                        value: max - value,
                        name: 'invisible',
                        itemStyle: placeHolderStyle
                    }

                    ]
                }, {
                    name: 'Line 2',
                    type: 'pie',
                    animation: false,
                    clockWise: false,
                    radius: ['66%', '70%'],
                    itemStyle: dataStyle,
                    hoverAnimation: false,
                    tooltip: {
                        show: false
                    },
                    data: [{
                        value: 0,
                        name: '02',
                        itemStyle: {
                            normal: {
                                color: color,
                            },
                        }
                    }]
                }]
            }
        }
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
            var max = 100;
            var size = '100%';
            var initcolor = '#F26D12';

            var color = initcolor;
            var dataStyle = {
                normal: {
                    label: {
                        show: false
                    },
                    labelLine: {
                        show: false
                    },
                    shadowBlur: 40,
                    shadowColor: 'rgba(40, 40, 40, 0.5)'
                }
            };
            var placeHolderStyle = {
                normal: {
                    color: 'rgba(44,59,70,0)', //未完成的圆环的颜色
                    label: {
                        show: false
                    },
                    labelLine: {
                        show: false
                    }
                }
            };

            return {
                title: {
                    text: value + '%',
                    x: 'center',
                    y: '35%',
                    textStyle: {
                        fontWeight: 'normal',
                        color: '#67F8B3',
                        fontSize: parseInt(size) * 1
                    },
                    subtext: names,
                    subtextStyle: {
                        fontWeight: 'normal',
                        color: 'white',
                        fontSize: parseInt(size) * 0.8
                    }
                },
                color: ['#fff', '#313443', '#fff'],
                tooltip: {
                    show: false,
                    formatter: "{a} <br/>{b} : {c} ({d}%)"
                },
                legend: {
                    show: false,
                    itemGap: 12,
                    data: ['01', '02']
                },
                toolbox: {
                    show: false,
                    feature: {
                        mark: {
                            show: true
                        },
                        dataView: {
                            show: true,
                            readOnly: false
                        },
                        restore: {
                            show: true
                        },
                        saveAsImage: {
                            show: true
                        }
                    }
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
                            "normal": {
                                "color": "#5886f0",
                                "borderColor": new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                                    offset: 0,
                                    color: '#00a2ff'
                                }, {
                                    offset: 1,
                                    color: '#70ffac'
                                }]),
                                "borderWidth": 25
                            },
                        },
                    }, {
                        value: max - value,
                        name: 'invisible',
                        itemStyle: placeHolderStyle
                    }

                    ]
                }, {
                    name: 'Line 2',
                    type: 'pie',
                    animation: false,
                    clockWise: false,
                    radius: ['89%', '90%'],
                    itemStyle: dataStyle,
                    hoverAnimation: false,
                    tooltip: {
                        show: false
                    },
                    data: [{
                        value: value - min,
                        name: '01',
                        itemStyle: {
                            "normal": {
                                "color": "#03A4FD",
                                "borderColor": new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                                    offset: 0,
                                    color: '#00a2ff'
                                }, {
                                    offset: 1,
                                    color: '#69FAB1'
                                }]),
                                "borderWidth": 1
                            },
                        },
                    }, {
                        value: max - value,
                        name: 'invisible',
                        itemStyle: placeHolderStyle
                    }

                    ]
                }]
            }
        }
    }, {
        /** 驳船显示 */
        sub: 'vessel_GetListAsync',
        func: (ops) => {
            return publish('webAction', { svn: 'QUERY_KHSJ', path: '/api/Vessel/GetListAsync' }, ).then((res) => {
                let data = JSON.parse(res);
                return data;
            })

        }
    }, {
        /** 大船显示 */
        sub: 'barge_GetListAsync',
        func: (ops) => {
            return publish('webAction', { svn: 'QUERY_KHSJ', path: '/api/Barge/GetListAsync' }).then((res) => {
                let data = JSON.parse(res);
                return data;
            })
        }
    }, {
        /** 外拖拖车 */
        sub: 'truck_GetListAsync',
        func: (ops) => {
            return truck;
        }
    }, {
        /** 业务数据-雷达图 */
        sub: 'home_right_e_ldt',
        func: (ops) => {
            let option = {
                color: ['#FD5633', '#38BDFF'],
                tooltip: {
                    textStyle: {
                        fontSize: 40,
                    }
                },
                legend: {
                    top: '2%',
                    itemWidth: 50,
                    itemHeight: 30,
                    itemGap: 30,
                    textStyle: {
                        fontSize: 45,
                        color: 'white'
                    },
                    data: ['2017年12月', '2018年1月']
                },
                radar: [
                    {
                        indicator: [
                            { name: '入库税款（亿元）', max: 15 },
                            { name: '报关单量（万票）', max: 20 },
                            { name: '查验时效-进口（小时）', max: 20 },
                            { name: '查验时效-出口（小时）', max: 10 },
                            { name: '通关时效-进口（小时）', max: 40 },
                            { name: '通关时效-出口（小时）', max: 5 }
                        ],
                        center: ['50%', '52%'],
                        //radius: 200,
                        startAngle: 90,
                        splitNumber: 4,
                        //shape: 'circle',
                        name: {
                            formatter: '{value}',
                            textStyle: {
                                color: 'white',
                                fontSize: 40
                            }
                        },
                        splitArea: {
                            areaStyle: {
                                color: ['rgba(173, 245, 164, 0.2)',
                                    'rgba(173, 245, 164, 0.4)', 'rgba(173, 245, 164, 0.6)',
                                    'rgba(173, 245, 164, 0.8)', 'rgba(173, 245, 164, 1)'],
                                shadowColor: 'rgba(0, 0, 0, 0.3)',
                                shadowBlur: 10
                            }
                        },
                        axisLine: {
                            lineStyle: {
                                color: 'rgba(255, 255, 255, 0.5)'
                            }
                        },
                        splitLine: {
                            lineStyle: {
                                color: 'rgba(255, 255, 255, 0.5)'
                            }
                        }
                    },
                ],
                series: [{
                    name: '业务数据',
                    type: 'radar',
                    // areaStyle: {normal: {}},
                    symbolSize: 30,
                    label: {
                        fontSize: 50,
                    },
                    data: [
                        {
                            value: [14.2, 14.3, 3.59, 1.41, 18.45, 1],
                            name: '2017年12月',
                            lineStyle: {
                                width: 30
                            },
                            symbolSize: 30,
                        },
                        {
                            value: [11.4, 14.1, 2.69, 1.85, 19.55, 0.88],
                            name: '2018年1月',
                            lineStyle: {
                                width: 30
                            },
                            symbolSize: 30,
                        }
                    ]
                }]
            };
            return option;
        }
    }
);