import echarts from 'echarts';
import { subscribes, publish } from '../../../frame/core/arbiter';
import $ from 'jquery';

let ports = null;
let data_mapJson = null;
$.ajax({ dataType: 'json', url: '../homePort.json', async: false, success: (res) => ports = res });
$.ajax({ dataType: 'json', url: '../data.json', async: false, success: (res) => data_mapJson = res.filter((obj) => obj.name === 'GIS管网')[0] || {} });

subscribes({
    sub: 'home_worldMap', // 首页世界地图
    func: (res) => {
        return ports;
    },
}, {
        sub: 'map_view_init',   //第二页地图
        func: (ops) => {
            console.log(data_mapJson)
            return data_mapJson.data.filter((obj) => obj.key === 'demo')[0];
        }
    }, {
        sub: 'map_view_pie',   //出入境旅客统计饼状图
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
        }
    }
);