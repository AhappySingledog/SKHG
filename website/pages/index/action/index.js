import echarts from 'echarts';
import { subscribes, publish } from '../../../frame/core/arbiter';
import $ from 'jquery';

let ports = null;
let data_mapJson = null;
$.ajax({ dataType: 'json', url: '../homePort.json', async: false, success: (res) => ports = res });
$.ajax({ dataType: 'json', url: '../portTest.json', async: false, success: (res) => data_mapJson = res });

subscribes(
    {
        sub: 'home_worldMap', // 首页世界地图
        func: (res) => {
            return ports;
        },
    }, {
        sub: 'home_right_t',   // 首页右侧table
        func: (ops) => {
            let flds = [
                {name: 'name', title: '港口名称'},
                {name: 'position', title: '港口位置'},
                {name: 'teu', title: '港口年吞吐量'},
                {name: 'time', title: '招商运营时间'},
            ];
            let datas = [
                {name: '八所港', position: '八所港', teu: '235 TEU', time: 1982},
                {name: '北海港', position: '北海港', teu: '345 TEU', time: 1983},
                {name: '八所港', position: '八所港', teu: '235 TEU', time: 1982},
                {name: '北海港', position: '北海港', teu: '345 TEU', time: 1983},
                {name: '八所港', position: '八所港', teu: '235 TEU', time: 1982},
                {name: '北海港', position: '北海港', teu: '345 TEU', time: 1983},
                {name: '八所港', position: '八所港', teu: '235 TEU', time: 1982},
                {name: '北海港', position: '北海港', teu: '345 TEU', time: 1983},
                {name: '八所港', position: '八所港', teu: '235 TEU', time: 1982},
                {name: '北海港', position: '北海港', teu: '345 TEU', time: 1983},
                {name: '八所港', position: '八所港', teu: '235 TEU', time: 1982},
                {name: '北海港', position: '北海港', teu: '345 TEU', time: 1983},
                {name: '八所港', position: '八所港', teu: '235 TEU', time: 1982},
                {name: '北海港', position: '北海港', teu: '345 TEU', time: 1983},
                {name: '八所港', position: '八所港', teu: '235 TEU', time: 1982},
            ];
            return {flds: flds, datas: datas};
        },
    }, {
        sub: 'home_right_e',   // 首页右侧echarts
        func: (ops) => {
            let builderJson = {
                "all": 10887,
                "charts": {
                    "map": 3237,
                    "lines": 2164,
                    "bar": 7561,
                    "line": 7778,
                    "pie": 7355,
                    "scatter": 2405,
                    "candlestick": 1842,
                    "radar": 2090,
                    "heatmap": 1762,
                    "treemap": 1593,
                    "graph": 2060,
                    "boxplot": 1537,
                    "parallel": 1908,
                    "gauge": 2107,
                    "funnel": 1692,
                    "sankey": 1568
                },
                "components": {
                    "geo": 2788,
                    "title": 9575,
                    "legend": 9400,
                    "tooltip": 9466,
                    "grid": 9266,
                    "markPoint": 3419,
                    "markLine": 2984,
                    "timeline": 2739,
                    "dataZoom": 2744,
                    "visualMap": 2466,
                    "toolbox": 3034,
                    "polar": 1945
                },
                "ie": 9743
            };
            let downloadJson = {
                "echarts.min.js": 17365,
                "echarts.simple.min.js": 4079,
                "echarts.common.min.js": 6929,
                "echarts.js": 14890
            };
            let themeJson = {
                "dark.js": 1594,
                "infographic.js": 925,
                "shine.js": 1608,
                "roma.js": 721,
                "macarons.js": 2179,
                "vintage.js": 1982
            };
            let waterMarkText = 'ECHARTS';
            let canvas = document.createElement('canvas');
            let ctx = canvas.getContext('2d');
            canvas.width = canvas.height = 100;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.globalAlpha = 0.08;
            ctx.font = '20px Microsoft Yahei';
            ctx.translate(50, 50);
            ctx.rotate(-Math.PI / 4);
            ctx.fillText(waterMarkText, 0, 0);
            let option = {
                tooltip: {},
                title: [{
                    text: '各渠道投诉占比',
                    x: '12%',
                    y: '0%',
                    textAlign: 'center',
                }, {
                    text: '各级别投诉占比',
                    x: '12%',
                    y: '50%',
                    textAlign: 'center',
                }, {
                    text: '投诉原因TOP10',
                    x: '50%',
                    y: '0%',
                    textAlign: 'center',
                }],
                grid: [{
                    top: 50,
                    width: '50%',
                    bottom: '0%',
                    right: 10,
                    containLabel: true,
                }],
                xAxis: [{
                    type: 'value',
                    max: builderJson.all,
                    splitLine: {
                        show: false,
                    }
                }],
                yAxis: [{
                    type: 'category',
                    data: Object.keys(builderJson.charts),
                    axisLabel: {
                        interval: 0,
                        rotate: 30
                    },
                    splitLine: {
                        show: false
                    }
                }],
                series: [{
                    type: 'pie',
                    radius: [0, '30%'],
                    center: ['25%', '25%'],
                    data: Object.keys(downloadJson).map(function (key) {
                        return {
                            name: key.replace('.js', ''),
                            value: downloadJson[key]
                        }
                    })
                }, {
                    type: 'pie',
                    radius: [0, '30%'],
                    center: ['25%', '75%'],
                    data: Object.keys(themeJson).map(function (key) {
                        return {
                            name: key.replace('.js', ''),
                            value: themeJson[key]
                        }
                    })
                }]
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
                color : ['#FFBD19','#089CEF'],
                tooltip: {
                    trigger: 'item',
                    formatter: "{a} <br/>{b}: {c} ({d}%)"
                },
                legend: {
                    itemWidth : 100,
                    itemHeight: 100,
                    textStyle : {
                        fontSize : 50
                    },
                    orient: 'vertical',
                    x: 'left',
                    data: [{
                        name: '入境',
                        textStyle: {
                            color: '#ffffff'
                        },
                        
                        },{
                        name: '出境',
                        textStyle: {
                            color: '#ffffff'
                        }}],
                },
                series: [
                    {
                        name: '访问来源',
                        type: 'pie',
                        radius: ['40%', '55%'],
                        label: {
                            normal: {
                                fontSize : 50,
                                formatter: '{b}\n{d}%',
                                padding : 100,
                                width : 200,
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
    }
);