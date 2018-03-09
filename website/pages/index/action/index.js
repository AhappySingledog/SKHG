import echarts from 'echarts';
import { subscribes, publish } from '../../../frame/core/arbiter';
import $ from 'jquery';

let ports = null;
let data_mapJson = null;
let truck = null;
$.ajax({ dataType: 'json', url: '../homePort.json', async: false, success: (res) => ports = res });
$.ajax({ dataType: 'json', url: '../portTest.json', async: false, success: (res) => data_mapJson = res });
$.ajax({ dataType: 'json', url: '../outcar.json', async: false, success: (res) => truck = res });

const x_PI = 3.14159265358979324 * 3000.0 / 180.0;
const PI = 3.1415926535897932384626;
const a = 6378245.0;
const ee = 0.00669342162296594323;

function transformlat(lng, lat){
    var ret = -100.0 + 2.0 * lng + 3.0 * lat + 0.2 * lat * lat + 0.1 * lng * lat + 0.2 * Math.sqrt(Math.abs(lng));
    ret += (20.0 * Math.sin(6.0 * lng * PI) + 20.0 * Math.sin(2.0 * lng * PI)) * 2.0 / 3.0;
    ret += (20.0 * Math.sin(lat * PI) + 40.0 * Math.sin(lat / 3.0 * PI)) * 2.0 / 3.0;
    ret += (160.0 * Math.sin(lat / 12.0 * PI) + 320 * Math.sin(lat * PI / 30.0)) * 2.0 / 3.0;
    return ret;
}

function transformlng(lng, lat){
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
function bd09togcj02(bd_lon, bd_lat){
    var x = bd_lon - 0.0065;
    var y = bd_lat - 0.006;
    var z = Math.sqrt(x * x + y * y) - 0.00002 * Math.sin(y * x_PI);
    var theta = Math.atan2(y, x) - 0.000003 * Math.cos(x * x_PI);
    var gg_lng = z * Math.cos(theta);
    var gg_lat = z * Math.sin(theta);
    return {lng: gg_lng, lat: gg_lat};
}

/**
 * GCJ02 转换为 WGS84
 * @param lng
 * @param lat
 * @returns {*[]}
 */
function gcj02towgs84(lng, lat){
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
    return {lng: mglng, lat: mglat};
};

function bd2wgs84(lng, lat) {
    let p1 = bd09togcj02(lng, lat);
    let p2 = gcj02towgs84(p1.lng, p1.lat);
    return {lng: p2.lng, lat: p2.lat};
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

                [80.24687,5.987419],
                [80.198577,5.950577],
                [80.152584,5.925247],
                [80.095093,5.902218],
                [80.0445,5.886098],
                [79.961712,5.858462],
                [79.860527,5.83543],

                [79.855928,5.833127],
                [79.487982,5.980511],
                [78.531322,6.348793],
                [77.133128,6.716808],
                [76.02929,7.158053],
                [74.631095,7.892488],
                [73.600847,8.625603],
                [72.644187,9.137934],
                [71.54035,9.64952],
                [69.553442,10.16032],
                [67.345766,10.743079],
                [65.579625,11.3247],
                [64.034252,11.615066],
                [62.562469,11.68761],
                [60.796328,11.977593],
                [58.80942,12.122466],
                [56.822512,12.484299],
                [53.731766,12.701155],
                [51.965626,12.773398],
                [49.463593,12.773398],
                [47.182329,12.411973],
                [43.355691,12.484299],
                [43.061334,12.773398],
                [42.840567,13.062163],
                [42.031085,13.998251],
                [41.515961,14.787332],
                [41.221604,15.430798],
                [40.927248,16.214513],
                [40.191356,17.348816],
                [39.455464,18.476061],
                [38.94034,19.874594],
                [38.204448,20.984544],
                [37.10061,23.179253],
                [35.555237,25.805392],
                [33.034807,28.634027],
                [32.648464,29.281269],
                [32.53808,29.635502],
                [32.482888,29.940421],
                [32.482888,30.132517],
                [32.455292,30.236412],
                [32.409299,30.29231],
                [32.344909,30.380083],
                [32.289717,30.507612],
                [32.262121,30.666786],
                [32.243724,31.016037],
                [32.243724,31.19018],
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
                        polylineArrow : {
                            color : {
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
            let option = {
                title: {
                    text: '报警信息',
                    left: 60,
                    textStyle: {
                        color: 'white',
                        fontSize: 45,
                    }
                },
                tooltip: {
                    trigger: 'axis',
                    axisPointer: { // 坐标轴指示器，坐标轴触发有效
                        type: 'shadow' // 默认为直线，可选为：'line' | 'shadow'
                    }
                },
                legend: {
                    data: ['日', '月', '年',],
                    align: 'right',
                    itemGap: 50,
                    textStyle: {
                        color: 'white',
                        fontSize: 30,
                    }
                },
                grid: {
                    height: '88%',
                    left: '3%',
                    right: '4%',
                    bottom: '3%',
                    containLabel: true
                },
                xAxis: [{
                    type: 'category',
                    axisLabel: {
                        interval: 0,
                        rotate: 40,
                        fontSize: 30,
                    },
                    axisLine: {
                        lineStyle: {
                            color: '#fff'
                        }
                    },
                    data: ['监控视频故障', '空箱秤重', '调拨车辆', '超三个月场柜未放行', '海关未放行柜装船', '未申报靠泊', '贸货柜混堆异动', '未审批装卸', '车辆未上锁', '换装柜', '空车超重']
                }],
                yAxis: [{
                    type: 'value',
                    name: '/个',
                    nameTextStyle: {
                        fontSize: 30,
                    },
                    axisLabel: {
                        formatter: '{value}',
                        fontSize: 30,
                    },
                    axisLine: {
                        lineStyle: {
                            color: '#fff'
                        }
                    },
                }],
                series: [{
                    name: '日',
                    type: 'bar', itemStyle: {
                        normal: {
                            show: true,
                            color: '#f7da36',

                        }
                    },
                    data: [1, 2, 1, 2, 3, 2, 1, 4, 3, 1, 2]
                }, {
                    name: '月',
                    type: 'bar', itemStyle: {
                        normal: {
                            show: true,
                            color: '#4dbeff',

                        }
                    },
                    data: [3, 5, 4, 6, 8, 7, 10, 6, 8, 10, 9]
                }, {
                    name: '年',
                    type: 'bar', itemStyle: {
                        normal: {
                            show: true,
                            color: '#00B46B',

                        }
                    },
                    data: [18, 16, 20, 19, 22, 21, 24, 20, 26, 24, 29]
                },]
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
            return {
                color: ['#339A9F', '#ffffff'],
                tooltip: {
                    trigger: 'item',
                    formatter: "{a} <br/>{b}: {c} ({d}%)"
                },
                title: [{
                    text: '装船箱量',
                    x: '15%',
                    y: '70%',
                    textStyle: {
                        fontSize: '50',
                        fontWeight: 'bold',
                        color: ['#ffffff'],
                    }
                }, {
                    text: '卸船箱量',
                    x: '65%',
                    y: '70%',
                    textStyle: {
                        fontSize: '50',
                        fontWeight: 'bold',
                        color: ['#ffffff'],
                    }
                }],
                legend: {
                    orient: 'vertical',
                    x: 'left',
                    data: ['直达', '其他']
                },
                series: [
                    {
                        name: '访问来源',
                        type: 'pie',
                        silent: true,
                        avoidLabelOverlap: false,
                        selectedMode: 'single',
                        hoverAnimation: false,
                        legendHoverLink: false,
                        radius: ['56%', '60%'],
                        center: ['25%', '30%'],
                        startAngle: 90,
                        label: {
                            normal: {
                                show: false,
                            },
                        },
                        data: [
                            { value: 4029, name: '装船箱量' },
                            { value: 1971, name: '卸船箱量' }
                        ]
                    },
                    {
                        name: '访问来源',
                        type: 'pie',
                        silent: true,
                        hoverAnimation: false,
                        legendHoverLink: false,
                        radius: ['61%', '60%'],
                        center: ['25%', '30%'],
                        label: {
                            normal: {
                                show: true,
                                formatter: ['{c}', '{b|TEU}'].join('\n'),
                                rich: {
                                    b: {
                                        color: 'while',
                                        height: 70,
                                        fontSize: '40',
                                        fontWeight: 'bold'
                                    },
                                },
                                position: 'center',
                                color: ['#ffffff'],
                                textStyle: {
                                    height: 80,
                                    fontSize: '80',
                                    fontWeight: 'bold'
                                }
                            },
                        },
                        data: [
                            { value: 4028, name: '装船箱量' }
                        ]
                    },

                    {
                        name: '访问来源',
                        type: 'pie',
                        silent: true,
                        avoidLabelOverlap: false,
                        selectedMode: 'single',
                        hoverAnimation: false,
                        legendHoverLink: false,
                        radius: ['56%', '60%'],
                        center: ['75%', '30%'],
                        startAngle: 90,
                        label: {
                            normal: {
                                show: false,
                            },
                        },
                        data: [
                            { value: 2996, name: '卸船数量' },
                            { value: 3004, name: '装船数量' }
                        ]
                    },
                    {
                        name: '访问来源',
                        type: 'pie',
                        silent: true,
                        hoverAnimation: false,
                        legendHoverLink: false,
                        radius: ['61%', '60%'],
                        center: ['75%', '30%'],
                        label: {
                            normal: {
                                show: true,
                                formatter: ['{c}', '{b|TEU}'].join('\n'),
                                rich: {
                                    b: {
                                        color: 'while',
                                        height: 70,
                                        fontSize: '40',
                                        fontWeight: 'bold'
                                    },
                                },
                                position: 'center',
                                color: ['#ffffff'],
                                textStyle: {
                                    height: 80,
                                    fontSize: '80',
                                    fontWeight: 'bold'
                                }
                            },
                        },
                        data: [
                            { value: 2996, name: '卸船数量' }
                        ]
                    }



                ]
            }
        }
    }, {
        /** 进出闸口箱子斌状图 */
        sub: 'port_pie_zk',
        func: (ops) => {
            return {
                color: ['#ffffff', '#E15B01'],
                tooltip: {
                    trigger: 'item',
                    formatter: "{a} <br/>{b}: {c} ({d}%)"
                },
                title: [{
                    text: '进闸数量',
                    x: '15%',
                    y: '70%',
                    textStyle: {
                        fontSize: '50',
                        fontWeight: 'bold',
                        color: ['#ffffff'],
                    }
                }, {
                    text: '出闸数量',
                    x: '65%',
                    y: '70%',
                    textStyle: {
                        fontSize: '50',
                        fontWeight: 'bold',
                        color: ['#ffffff'],
                    }
                }],
                legend: {
                    orient: 'vertical',
                    x: 'left',
                    data: ['直达', '其他']
                },
                series: [
                    {
                        name: '12312312321',
                        type: 'pie',
                        silent: true,
                        avoidLabelOverlap: false,
                        selectedMode: 'single',
                        hoverAnimation: false,
                        legendHoverLink: false,
                        radius: ['56%', '60%'],
                        center: ['25%', '30%'],
                        startAngle: 0,
                        label: {
                            normal: {
                                show: false,
                            },
                        },
                        data: [
                            { value: 3322, name: '进闸数量' },
                            { value: 2678, name: '出闸数量' }
                        ]
                    },
                    {
                        name: '访问来源',
                        type: 'pie',
                        silent: true,
                        hoverAnimation: false,
                        legendHoverLink: false,
                        radius: ['61%', '60%'],
                        center: ['25%', '30%'],
                        label: {
                            normal: {
                                show: true,
                                formatter: ['{c}', '{b|TEU}'].join('\n'),
                                rich: {
                                    b: {
                                        color: 'while',
                                        height: 70,
                                        fontSize: '40',
                                        fontWeight: 'bold'
                                    },
                                },
                                position: 'center',
                                color: ['#ffffff'],
                                textStyle: {
                                    height: 80,
                                    fontSize: '80',
                                    fontWeight: 'bold'
                                }
                            },
                        },
                        data: [
                            { value: 3322, name: '出闸数量' }
                        ]
                    },


                    {
                        name: '访问来源',
                        type: 'pie',
                        silent: true,
                        avoidLabelOverlap: false,
                        selectedMode: 'single',
                        hoverAnimation: false,
                        legendHoverLink: false,
                        radius: ['56%', '60%'],
                        center: ['75%', '30%'],
                        startAngle: 0,
                        label: {
                            normal: {
                                show: false,
                            }
                        },
                        data: [
                            { value: 3360, name: '进闸箱数' },
                            { value: 2640, name: '出闸箱数' },
                            // {value:2996, name:'营销广告'},
                            // {value:3004, name:'搜索引擎'}
                        ]
                    },
                    {
                        name: '访问来源',
                        type: 'pie',
                        silent: true,
                        hoverAnimation: false,
                        legendHoverLink: false,
                        radius: ['61%', '60%'],
                        center: ['75%', '30%'],
                        label: {
                            normal: {
                                show: true,
                                formatter: ['{c}', '{b|TEU}'].join('\n'),
                                rich: {
                                    b: {
                                        color: 'while',
                                        height: 70,
                                        fontSize: '40',
                                        fontWeight: 'bold'
                                    },
                                },
                                position: 'center',
                                color: ['#ffffff'],
                                textStyle: {
                                    height: 80,
                                    fontSize: '80',
                                    fontWeight: 'bold'
                                }
                            },
                        },
                        data: [
                            { value: 2640, name: '出闸箱数' }
                        ]
                    },
                ]
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
    }
);