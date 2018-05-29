import '../less';
import 'animate.css';
import React from 'react';
import ReactDOM from 'react-dom';
import $ from 'jquery';
import echarts from 'echarts';
import { publish } from '../../../frame/core/arbiter';
import { Table } from '../../../frame/componets/index';

// tip组件
export default class AgingControl extends React.Component {
    state = {
        layer: 'sy'
    }
    componentWillReceiveProps() {

    }
    componentDidMount() {
        this.update = () => {
            publish('getData', { svn: 'skhg_stage', tableName: 'imap_scct_sxfx_01', data: { where: "category='E' and EFFECTDATE LIKE to_char(sysdate,'yyyy')||'%'" } }).then((res) => {
                let data = res[0].features.map((e) => e.attributes.DATAA);
                for (let i = 0; i < 12 - data.length; i++) {
                    data.push(0);
                }
                let ops = {
                    calculable: true,
                    xAxis: [
                        {
                            type: 'category',
                            axisLabel: {
                                textStyle: {
                                    color: '#fff',
                                    fontSize: 50
                                }
                            },
                            axisLine: {
                                lineStyle: {
                                    color: '#1890ff',
                                    width: 5
                                }
                            },
                            data: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
                        }
                    ],
                    yAxis: [
                        {
                            type: 'value',
                            name: '天',
                            nameTextStyle:{
                                fontSize:50  
                            },
                            axisLabel: {
                                textStyle: {
                                    color: '#fff',
                                    fontSize: 50
        
                                }
                            },
                            axisLine: {
                                lineStyle: {
                                    color: '#1890ff',
                                    width: 5
                                }
                            },
                            boundaryGap: [0, 0.1]
                        }
                    ],
                    series: [
                        {
                            name: '去年完成值',
                            type: 'line',
                            data: [7.038750, 7.038750, 7.038750, 7.038750, 7.038750, 7.038750, 7.038750, 7.038750, 7.038750, 7.038750, 7.038750, 7.038750],
                            symbolSize: 15,
                            itemStyle: {
                                normal: {
                                    color: "#70e100",
                                    lineStyle: {
                                        width: 6,
                                        color: "#70e100"
                                    }
                                }
                            },
                            markLine: {
                                data: [
                                    { type: 'average', name: '平均值' }
                                ]
                            },
                        },
                        {
                            name: '目标值',
                            type: 'line',
                            data: [6.5, 6.5, 6.5, 6.5, 6.5, 6.5, 6.5, 6.5, 6.5, 6.5, 6.5, 6.5],
                            symbolSize: 15,
                            itemStyle: {
                                normal: {
                                    color: "#f00",
                                    lineStyle: {
                                        width: 6,
                                        type : 'dotted',
                                        color: "#f00"
                                    }
                                }
                            },
                            markLine: {
                                data: [
                                    { type: 'average', name: '平均值' }
                                ]
                            },
                        },
                        {
                            name: '城北所',
                            type: 'bar',
                            stack: 'sum',
                            barWidth: '60%',
                            barCategoryGap: '50%',
                            data: data.map((e, i) => {
                                return {
                                    name: (i + 1) + '月',
                                    value: e,
                                    itemStyle: {
                                        normal: {
                                            color: e < 6.5 ? '#1890ff' : e < 7.038750 ? '#dbcf01' : '#f00',
                                            label: {
                                                textStyle: {
                                                    color: '#fff',
                                                    fontSize: 50
                                                },
                                                show: Number(e) > 0,
                                                position: 'insideTop',
                                                formatter: (param) => Number(param.value) > 0 ? Number(param.value) : ''
                                            }
        
                                        }
                                    }
                                };
                            })
                        }
                    ]
                };
                if (this.chart1) this.chart1.dispose();
                this.chart1 = echarts.init(ReactDOM.findDOMNode(this.refs.echart1));
                this.chart1.setOption(ops);
                this.chart1.on('click', (param) => {
                    this.setState({ layer: 'ck', param: param.name });
                });
            });
            publish('getData', { svn: 'skhg_stage', tableName: 'imap_scct_sxfx_01', data: { where: "category='I' and EFFECTDATE LIKE to_char(sysdate,'yyyy')||'%'" } }).then((res) => {
                let data = res[0].features.map((e) => e.attributes.DATAA).concat([0,0,0,0,0,0,0,0]);
                let ops = {
                    calculable: true,
                    xAxis: [
                        {
                            type: 'category',
                            axisLabel: {
                                textStyle: {
                                    color: '#fff',
                                    fontSize: 50
                                }
                            },
                            axisLine: {
                                lineStyle: {
                                    color: '#1890ff',
                                    width: 5
                                }
                            },
                            data: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
                        }
                    ],
                    yAxis: [
                        {
                            type: 'value',
                            name: '天',
                            nameTextStyle:{
                                fontSize:50  
                            },
                            axisLabel: {
                                textStyle: {
                                    color: '#fff',
                                    fontSize: 50
        
                                }
                            },
                            axisLine: {
                                lineStyle: {
                                    color: '#1890ff',
                                    width: 5
                                }
                            },
                            boundaryGap: [0, 0.1]
                        }
                    ],
                    series: [
                        {
                            name: '去年完成值',
                            type: 'line',
                            data: [17.9925, 17.9925, 17.9925, 17.9925, 17.9925, 17.9925, 17.9925, 17.9925, 17.9925, 17.9925, 17.9925, 17.9925],
                            symbolSize: 15,
                            itemStyle: {
                                normal: {
                                    color: "#70e100",
                                    lineStyle: {
                                        width: 6,
                                        color: "#70e100"
                                    }
                                }
                            },
                            markLine: {
                                data: [
                                    { type: 'average', name: '平均值' }
                                ]
                            },
                        },
                        {
                            name: '目标值',
                            type: 'line',
                            data: [15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15],
                            symbolSize: 15,
                            itemStyle: {
                                normal: {
                                    color: "#f00",
                                    lineStyle: {
                                        width: 6,
                                        type : 'dotted',
                                        color: "#f00"
                                    }
                                }
                            },
                            markLine: {
                                data: [
                                    { type: 'average', name: '平均值' }
                                ]
                            },
                        },
                        {
                            name: '城北所',
                            type: 'bar',
                            stack: 'sum',
                            barWidth: '60%',
                            barCategoryGap: '50%',
                            data: data.map((e, i) => {
                                return {
                                    name: (i + 1) + '月',
                                    value: e,
                                    itemStyle: {
                                        normal: {
                                            color: e < 15 ? '#1890ff' : e < 17.9925 ? '#dbcf01' : '#f00',
                                            label: {
                                                textStyle: {
                                                    color: '#fff',
                                                    fontSize: 50
                                                },
                                                show: Number(e) > 0,
                                                position: 'insideTop',
                                                formatter: (param) => Number(param.value) > 0 ? Number(param.value) : ''
                                            }
        
                                        }
                                    }
                                };
                            })
                        }
                    ]
                };
                if (this.chart2) this.chart2.dispose();
                this.chart2 = echarts.init(ReactDOM.findDOMNode(this.refs.echart2));
                this.chart2.setOption(ops);
                this.chart2.on('click', (param) => {
                    this.setState({ layer: 'jk', param: param.name });
                });
            });
        }
        this.update();
    }
    render() {
        return (
            <div className='ac'>
                {this.state.layer == 'sy' ? <div className='ac-box'>
                    <div ref='echart1' className='ac-box-t'></div>
                    <div ref='echart2' className='ac-box-b'></div>
                </div> : <CK layer={this.state.layer} data={this.state.param} back={() => this.setState({layer: 'sy'}, this.update)}/>}
            </div>
        )
    }
}

// 出口组件
class CK extends React.Component {
    state = {
        selectIndex: 1,
        ck: [],
        jk: [],
        top10: [],
        containerNo: '',
    }
    componentDidMount() {
        let layer = this.props.layer;
        let month = Number(this.props.data.replace('月', ''));
        let year = new Date().getFullYear();
        publish('getData', { svn: 'skhg_stage', tableName: 'imap_scct_sxfx_01', data: { where: "category='" + (this.props.layer == 'ck' ? 'E' : 'I') + "' and EFFECTDATE='" + year + (month < 10 ? '0' : '') + month + "'" } }).then((res) => {
            let e = res[0].features[0].attributes;
            let temp = {
                ck: {qn: 7.038750, jn: 6.5},
                jk: {qn: 17.9925, jn: 15},
            }
            let mdata = [];
            if (this.props.layer == 'ck') {
                mdata = [
                    { layer: 'ck', name: '通关准备', top10Table: 'v_imap_scct_sxfx_e_b', style: { width: 646, height: 628 }, type: Number(e.DATAB) > temp[layer].qn ? 0 : 1, time: e.DATAB, items: [{ name: (Number(e.DATAB) > temp[layer].qn ? '超' : '低') + '去年均值', value: Math.abs(Number(e.DATAB) - temp[layer].qn).toFixed(2), rate: (Math.abs(Number(e.DATAB) - temp[layer].qn)/temp[layer].qn*100).toFixed(0) }, { name: (Number(e.DATAB) > temp[layer].jn ? '超' : '低') + '目标值', value: Math.abs(Number(e.DATAB) - temp[layer].jn).toFixed(2), rate: (Math.abs(Number(e.DATAB) - temp[layer].jn)/temp[layer].jn*100).toFixed(0) }] },
                    { layer: 'ck', name: '货物提离', top10Table: 'v_imap_scct_sxfx_e_c', style: { width: 646, height: 628 }, type: Number(e.DATAC) > temp[layer].qn ? 0 : 1, time: e.DATAC, items: [{ name: (Number(e.DATAC) > temp[layer].qn ? '超' : '低') + '去年均值', value: Math.abs(Number(e.DATAC) - temp[layer].qn).toFixed(2), rate: (Math.abs(Number(e.DATAC) - temp[layer].qn)/temp[layer].qn*100).toFixed(0) }, { name: (Number(e.DATAC) > temp[layer].jn ? '超' : '低') + '目标值', value: Math.abs(Number(e.DATAC) - temp[layer].jn).toFixed(2), rate: (Math.abs(Number(e.DATAC) - temp[layer].jn)/temp[layer].jn*100).toFixed(0) }] },
                    { layer: 'ck', name: '通关准备', top10Table: 'v_imap_scct_sxfx_e_d', style: { width: 646, height: 628 }, type: Number(e.DATAD) > temp[layer].qn ? 0 : 1, time: e.DATAD, items: [{ name: (Number(e.DATAD) > temp[layer].qn ? '超' : '低') + '去年均值', value: Math.abs(Number(e.DATAD) - temp[layer].qn).toFixed(2), rate: (Math.abs(Number(e.DATAD) - temp[layer].qn)/temp[layer].qn*100).toFixed(0) }, { name: (Number(e.DATAD) > temp[layer].jn ? '超' : '低') + '目标值', value: Math.abs(Number(e.DATAD) - temp[layer].jn).toFixed(2), rate: (Math.abs(Number(e.DATAD) - temp[layer].jn)/temp[layer].jn*100).toFixed(0) }] },
                    { layer: 'ck', name: '查验作业', top10Table: 'v_imap_scct_sxfx_e_e', style: { width: 646, height: 628 }, type: Number(e.DATAE) > temp[layer].qn ? 0 : 1, time: e.DATAE, items: [{ name: (Number(e.DATAE) > temp[layer].qn ? '超' : '低') + '去年均值', value: Math.abs(Number(e.DATAE) - temp[layer].qn).toFixed(2), rate: (Math.abs(Number(e.DATAE) - temp[layer].qn)/temp[layer].qn*100).toFixed(0) }, { name: (Number(e.DATAE) > temp[layer].jn ? '超' : '低') + '目标值', value: Math.abs(Number(e.DATAE) - temp[layer].jn).toFixed(2), rate: (Math.abs(Number(e.DATAE) - temp[layer].jn)/temp[layer].jn*100).toFixed(0) }] },
                    { layer: 'ck', name: '货物提离', top10Table: 'v_imap_scct_sxfx_e_f', style: { width: 646, height: 628 }, type: Number(e.DATAF) > temp[layer].qn ? 0 : 1, time: e.DATAF, items: [{ name: (Number(e.DATAF) > temp[layer].qn ? '超' : '低') + '去年均值', value: Math.abs(Number(e.DATAF) - temp[layer].qn).toFixed(2), rate: (Math.abs(Number(e.DATAF) - temp[layer].qn)/temp[layer].qn*100).toFixed(0) }, { name: (Number(e.DATAF) > temp[layer].jn ? '超' : '低') + '目标值', value: Math.abs(Number(e.DATAF) - temp[layer].jn).toFixed(2), rate: (Math.abs(Number(e.DATAF) - temp[layer].jn)/temp[layer].jn*100).toFixed(0) }] },
                ];
            }
            else {
                mdata = [
                    { layer: 'jk', name: '通关准备', top10Table: 'v_imap_scct_sxfx_i_b', style: { width: 691, height: 628, marginLeft: 75 }, type: Number(e.DATAB) > temp[layer].qn ? 0 : 1, time: e.DATAB, items: [{ name: (Number(e.DATAB) > temp[layer].qn ? '超' : '低') + '去年均值', value: Math.abs(Number(e.DATAB) - temp[layer].qn).toFixed(2), rate: (Math.abs(Number(e.DATAB) - temp[layer].qn)/temp[layer].qn*100).toFixed(0) }, { name: (Number(e.DATAB) > temp[layer].jn ? '超' : '低') + '目标值', value: Math.abs(Number(e.DATAB) - temp[layer].jn).toFixed(2), rate: (Math.abs(Number(e.DATAB) - temp[layer].jn)/temp[layer].jn*100).toFixed(0) }] },
                    { layer: 'jk', name: '货物提离', top10Table: 'v_imap_scct_sxfx_i_c', style: { width: 691, height: 628, marginRight: 130 }, type: Number(e.DATAC) > temp[layer].qn ? 0 : 1, time: e.DATAC, items: [{ name: (Number(e.DATAC) > temp[layer].qn ? '超' : '低') + '去年均值', value: Math.abs(Number(e.DATAC) - temp[layer].qn).toFixed(2), rate: (Math.abs(Number(e.DATAC) - temp[layer].qn)/temp[layer].qn*100).toFixed(0) }, { name: (Number(e.DATAC) > temp[layer].jn ? '超' : '低') + '目标值', value: Math.abs(Number(e.DATAC) - temp[layer].jn).toFixed(2), rate: (Math.abs(Number(e.DATAC) - temp[layer].jn)/temp[layer].jn*100).toFixed(0) }] },
                    { layer: 'jk', name: '通关准备', top10Table: 'v_imap_scct_sxfx_i_d', style: { width: 691, height: 628, marginRight: 30 }, type: Number(e.DATAD) > temp[layer].qn ? 0 : 1, time: e.DATAD, items: [{ name: (Number(e.DATAD) > temp[layer].qn ? '超' : '低') + '去年均值', value: Math.abs(Number(e.DATAD) - temp[layer].qn).toFixed(2), rate: (Math.abs(Number(e.DATAD) - temp[layer].qn)/temp[layer].qn*100).toFixed(0) }, { name: (Number(e.DATAD) > temp[layer].jn ? '超' : '低') + '目标值', value: Math.abs(Number(e.DATAD) - temp[layer].jn).toFixed(2), rate: (Math.abs(Number(e.DATAD) - temp[layer].jn)/temp[layer].jn*100).toFixed(0) }] },
                    { layer: 'jk', name: '查验作业', top10Table: 'v_imap_scct_sxfx_i_e', style: { width: 691, height: 628, marginRight: 75 }, type: Number(e.DATAE) > temp[layer].qn ? 0 : 1, time: e.DATAE, items: [{ name: (Number(e.DATAE) > temp[layer].qn ? '超' : '低') + '去年均值', value: Math.abs(Number(e.DATAE) - temp[layer].qn).toFixed(2), rate: (Math.abs(Number(e.DATAE) - temp[layer].qn)/temp[layer].qn*100).toFixed(0) }, { name: (Number(e.DATAE) > temp[layer].jn ? '超' : '低') + '目标值', value: Math.abs(Number(e.DATAE) - temp[layer].jn).toFixed(2), rate: (Math.abs(Number(e.DATAE) - temp[layer].jn)/temp[layer].jn*100).toFixed(0) }] },
                ];
            }
            this.setState({[this.props.layer]: mdata}, () => this.updateTop10(0));
        });
        this.updateTop10 = (i) => {
            let month = Number(this.props.data.replace('月', ''));
            let year = new Date().getFullYear();
            publish('getData', { svn: 'skhg_stage', tableName: this.state[this.props.layer][i].top10Table, data: { pageno: 1, pagesize: 10, where: "EFFECTDATE='" + year + (month < 10 ? '0' : '') + month + "' ORDER BY DIS DESC" } }).then((res) => {
                let top10 = res[0].features.map((e) => e.attributes);
                this.setState({top10: [], containerNo: null}, () => this.setState({top10: top10, containerNo: top10[0].CONTAINERNO}));
            });
        }
    }
    render() {
        let datas = this.state[this.props.layer];
        return (
            <div className='ac-ckbox'>
                <div className='ac-back' onClick={this.props.back}></div>
                {/* <div className='ac-close' onClick={() => publish('closeAC', false)}></div> */}
                <div className='ac-ckbox-title'>{this.props.layer == 'ck' ? '出口' : '进口'}</div>
                <div style={{width: 3, height: 733, position: 'absolute', top: 257, left: this.props.layer == 'ck' ? 1500 : 1870, background: '#1f9bff'}}></div>
                <div className='ac-ckbox-t'>
                    <div style={{ background: "url('../agingControl/" + this.props.layer + ".png') no-repeat", backgroundSize: '100% 100%' }}></div>
                    <div>
                        {datas.map((e, i) => <JD key={i} index={i + 1} datas={e} selected={this.state.selectIndex == i + 1} click={() => {this.setState({selectIndex: i + 1});this.updateTop10(i);}} />)}
                    </div>
                </div>
                <div className='ac-ckbox-c'><div>诊断结论：</div><div>2018年{this.props.data}出口时效......</div></div>
                <div className='ac-ckbox-b'>
                    {this.state.top10.length > 0 ? <Top10 datas={this.state.top10} click={(containerNo) => this.setState({containerNo: containerNo})}/> : null}
                    {this.state.containerNo ? <DataDesc containerNo={this.state.containerNo} /> : null}
                </div>
            </div>
        )
    }
}

// 进度组件
class JD extends React.Component {
    render() {
        let type = this.props.datas.type;
        return (
            <div className={'jd' + (this.props.selected ? ' jd-select' : '')} style={this.props.datas.style} onClick={this.props.click}>
                <div>{this.props.datas.name}</div>
                <div style={{ background: "url('../agingControl/" + this.props.datas.layer + "_" + this.props.index + "_" + type + ".png') no-repeat", backgroundSize: '100% 100%' }}></div>
                <div>
                    <div>平均时间：</div>
                    <div style={{ color: type == 1 ? '#70e100' : '#ff0000' }}>{this.props.datas.time}</div>
                    <div style={{ color: type == 1 ? '#70e100' : '#ff0000' }} >天</div>
                </div>
                <div>
                    {this.props.datas.items.map((e, i) => <JDEC key={i} type={this.props.datas.type} datas={e} />)}
                </div>
            </div>
        )
    }
}

// echarts组件
class JDEC extends React.Component {
    componentDidMount() {
        let ops = {
            series: [
                {
                    name: '访问来源',
                    type: 'pie',
                    radius: ['70%', '90%'],
                    avoidLabelOverlap: false,
                    labelLine: {
                        normal: {
                            show: false
                        }
                    },
                    data: [
                        {
                            value: Number(this.props.datas.rate), 
                            itemStyle: {
                                normal: {
                                    color: this.props.type == 1 ? '#70e100' : '#ff0000',
                                }
                            },
                            label: {
                                normal: {
                                    formatter: '{d}%',
                                    position: 'center',
                                    show: true,
                                    textStyle: {
                                        fontSize: '50',
                                        fontWeight: 'normal',
                                        color: this.props.type == 1 ? '#70e100' : '#ff0000',
                                    }
                                }
                            },
                        },
                        {
                            value: 100 - Number(this.props.datas.rate), itemStyle: {
                                normal: {
                                    color: '#ccc'
                                }
                            }
                        }
                    ]
                }
            ]
        };
        if (this.chart) this.chart.dispose();
        this.chart = echarts.init(ReactDOM.findDOMNode(this.refs.echart));
        this.chart.setOption(ops);
    }
    render() {
        let type = this.props.type;
        return (
            <div className='jd-ec'>
                <div ref='echart'></div>
                <div>
                    <div style={{ color: type == 1 ? '#70e100' : '#ff0000' }}>{this.props.datas.value}</div>
                    <div style={{ color: type == 1 ? '#70e100' : '#ff0000' }}>天</div>
                </div>
                <div>{this.props.datas.name}</div>
            </div>
        )
    }
}

// Top10组件
class Top10 extends React.Component {
    state = {
        select: 0,
    }
    componentDidMount() {
    }
    render() {
        let items = this.props.datas;
        let maxDIS = items.length > 0 ? Number(items[0].DIS) : 0;
        return (
            <div className='top10'>
                <div className='top10-title'>前10名-TOP10</div>
                <div className='top10-l'></div>
                <div className='top10-r'>
                    {items.map((e, i) => <div className='hvr-bounce-to-right' key={i} onClick={() => {this.props.click(e.CONTAINERNO);this.setState({select: i});}} style={{ width: 100 - i * 2 + '%', fontSize: 50, color: i == 0 ? '#ff0000' : i == 1 ? '#ee7622' : i == 2 ? '#ffad29' : 'white', background: this.state.select == i ? '#062361' : '' }}>
                        <div>{e.CONTAINERNO}</div>
                        <div>{e.DIS}</div>
                        <div className={i <= 2 ? 'top-icon1-3' : 'top-icon4-10'}></div>
                    </div>)}
                </div>
            </div>
        )
    }
}

// 详细数据组件
class DataDesc extends React.Component {

    state = {
        jzxxx: {},
        jzxlsgj: [],
    }

    componentWillReceiveProps(nextProps) {
        this.update(nextProps.containerNo);
    }

    componentDidMount() {
        this.update = (containerNo) => {
            Promise.all([
                publish('webAction', { svn: 'eportapisct', path: 'GContainerInfo', data: { System: '', PageIndex: 1, PageSize: 30, SortBy: '', IsDescending: false, ContainerNo: containerNo } }),
                publish('webAction', { svn: 'eportapisct', path: 'GContainerHistoryInfo', data: { System: '', PageIndex: 1, PageSize: 30, SortBy: '', IsDescending: false, ContainerNo: containerNo } }),
            ]).then((res) => {
                this.setState({ jzxxx: res[0][0]['InnerList'][0], jzxlsgj: res[1][0]['InnerList'] })
            });
        }
        this.update(this.props.containerNo);
    }

    render() {
        return (
            <div className='dd'>
                <div className='dd-t'>详情数据</div>
                <div className='dd-b scrollbar'>
                    <OneRecordTable jzxxx={this.state.jzxxx} />
                    <div className='dd-b-line'></div>
                    <TwoRecordTable jzxlsgj={this.state.jzxlsgj} />
                </div>
            </div>
        )
    }
}

// 单条数据详情组件
class OneRecordTable extends React.Component {
    render() {
        // let datas = [
        //     [{ key: 'IMO号', value: 'UN9377145' }, { key: '箱型尺寸宽度', value: '20/GP/16' }, { key: '进场时间', value: '2018-05-25 12:12:12' }],
        //     [{ key: 'IMO号', value: 'UN9377145' }, { key: '箱型尺寸宽度', value: '20/GP/16' }, { key: '进场时间', value: '2018-05-25 12:12:12' }],
        //     [{ key: 'IMO号', value: 'UN9377145' }, { key: '箱型尺寸宽度', value: '20/GP/16' }, { key: '进场时间', value: '2018-05-25 12:12:12' }],
        //     [{ key: 'IMO号', value: 'UN9377145' }, { key: '箱型尺寸宽度', value: '20/GP/16' }, { key: '进场时间', value: '2018-05-25 12:12:12' }],
        //     [{ key: 'IMO号', value: 'UN9377145' }, { key: '箱型尺寸宽度', value: '20/GP/16' }, { key: '进场时间', value: '2018-05-25 12:12:12' }],
        //     [{ key: 'IMO号', value: 'UN9377145' }, { key: '箱型尺寸宽度', value: '20/GP/16' }, { key: '进场时间', value: '2018-05-25 12:12:12' }],
        //     [{ key: 'IMO号', value: 'UN9377145' }, { key: '箱型尺寸宽度', value: '20/GP/16' }, { key: '进场时间', value: '2018-05-25 12:12:12' }],
        // ];
        let map = [
            { title: 'IMO号', dataIndex: 'IMO' },
            { title: '箱主', dataIndex: 'LineId' },
            { title: '船名航次', dataIndex: 'OutVesselVoyage' },
            { title: '作业码头', dataIndex: 'DbId' },
            { title: '总提运单号', dataIndex: 'BlNbr' },
            { title: '出口商业航次号', dataIndex: 'OutBusinessVoy' },
            { title: '订舱号', dataIndex: 'BookingEdo' },
            { title: '箱号', dataIndex: 'ContainerNbr' },
            { title: '箱型尺寸高度', dataIndex: 'SzTpHt' },
            { title: '空重', dataIndex: 'Status' },
            { title: '进出口状态', dataIndex: 'Category' },
            { title: '进口商业航次号', dataIndex: 'InBusinessVoy' },
            { title: '当前位置', dataIndex: 'Location' },
            { title: '装货港', dataIndex: 'PolAlias' },
            { title: '海关放行时间', dataIndex: 'CUS' },
            { title: '目的港', dataIndex: 'Destination' },
            { title: '卸货港', dataIndex: 'PodAlias' },
            { title: '国检放行时间', dataIndex: 'CIQ' },
            { title: '集中查验时间', dataIndex: 'CicTime' },
            { title: '集中查验状态', dataIndex: 'CicStatus' },
            { title: '进场时间', dataIndex: 'InTime' },
            { title: '离港时间', dataIndex: 'OutTime' },
            { title: '海关查验状态、国检查验状态、放行状态', dataIndex: 'ReleaseStatus' },
        ];
        let json = this.props.jzxxx;
        let datas1 = map.map((e) => { return { key: e.title, value: json[e.dataIndex] } });
        return (
            <div className='ort scrollbar'>
                {/* <table>
                    <thead></thead>
                    <tbody>
                        {
                          
                        }
                    </tbody>
                </table> */}
                {
                    datas1.length > 0 ? datas1.map((e, i) => {
                        return <div className="ort_ty" key={"xx" + i}>
                            <div title={e.key}  className="ort_ty_key">{e.key}：</div>
                            <div title={e.value}  className="ort_ty_val">{e.value}</div>
                        </div>
                    }) : <div />
                }
            </div>
        )
    }
}

//第二栏展示内容
class TwoRecordTable extends React.Component {
    render() {
        // let datas = [
        //     [{ key: 'IMO号', value: 'UN9377145' }, { key: '箱型尺寸宽度', value: '20/GP/16' }, { key: '进场时间', value: '2018-05-25 12:12:12' }],
        //     [{ key: 'IMO号', value: 'UN9377145' }, { key: '箱型尺寸宽度', value: '20/GP/16' }, { key: '进场时间', value: '2018-05-25 12:12:12' }],
        //     [{ key: 'IMO号', value: 'UN9377145' }, { key: '箱型尺寸宽度', value: '20/GP/16' }, { key: '进场时间', value: '2018-05-25 12:12:12' }],
        //     [{ key: 'IMO号', value: 'UN9377145' }, { key: '箱型尺寸宽度', value: '20/GP/16' }, { key: '进场时间', value: '2018-05-25 12:12:12' }],
        //     [{ key: 'IMO号', value: 'UN9377145' }, { key: '箱型尺寸宽度', value: '20/GP/16' }, { key: '进场时间', value: '2018-05-25 12:12:12' }],
        //     [{ key: 'IMO号', value: 'UN9377145' }, { key: '箱型尺寸宽度', value: '20/GP/16' }, { key: '进场时间', value: '2018-05-25 12:12:12' }],
        //     [{ key: 'IMO号', value: 'UN9377145' }, { key: '箱型尺寸宽度', value: '20/GP/16' }, { key: '进场时间', value: '2018-05-25 12:12:12' }],
        // ];
        let flds2 = [
            { title: '港区', dataIndex: 'DbId' },
            { title: '船公司', dataIndex: 'ContainerOwner' },
            { title: '操作', dataIndex: 'OpType' },
            { title: '操作时间', dataIndex: 'OpTime' },
            { title: '操作服务', dataIndex: 'ColumnName' },
            { title: '从', dataIndex: 'OldValue' },
            { title: '到', dataIndex: 'NewValue' },
        ];
        return (
            <div className='orts scrollbar'>
                {/* <table>
                    <thead></thead>
                    <tbody>
                        {datas.map((e, i) => <tr key={i}>
                            {e.map((td, j) => [<td>{td.key + ':'}</td>, <td>{td.value}</td>])}
                        </tr>)}
                    </tbody>
                </table> */}
                <Table rowNo={true} title={null} style={{ width: 2243, height: 540 }} id={"id2"} selectedIndex={null} flds={flds2} datas={this.props.jzxlsgj} trClick={null} trDbclick={null} />
            </div>
        )
    }
}