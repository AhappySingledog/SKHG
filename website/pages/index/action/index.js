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
    }
);