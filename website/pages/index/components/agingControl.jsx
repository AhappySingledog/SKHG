import '../less';
import 'animate.css';
import React from 'react';
import ReactDOM from 'react-dom';
import $ from 'jquery';
import echarts from 'echarts';

// tip组件
export default class AgingControl extends React.Component {
    state = {
        first: true
    }
    componentDidMount() {
        let ops1 = {
            calculable: true,
            xAxis: [
                {
                    type: 'category',
                    axisLabel: {
                        textStyle: {
                            color: '#fff',
                            fontSize: 25
                        }
                    },
                    axisLine: {
                        lineStyle: {
                            color: '#1890ff',
                            width: 2
                        }
                    },
                    data: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
                }
            ],
            yAxis: [
                {
                    type: 'value',
                    axisLabel: {
                        textStyle: {
                            color: '#fff',
                            fontSize: 30

                        }
                    },
                    axisLine: {
                        lineStyle: {
                            color: '#1890ff',
                            width: 2
                        }
                    },
                    boundaryGap: [0, 0.1]
                }
            ],
            series: [
                {
                    name: '去年完成值',
                    type: 'line',
                    data: [20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20],
                    itemStyle: {
                        normal: {
                            lineStyle: {
                                width: 3,
                                type: 'solid',
                            }
                        }
                    },
                    markLine: {
                        data: [
                            { type: 'average', name: '平均值' }
                        ]
                    },
                    lineStyle: {
                        color: '#009944'
                    }
                },
                {
                    name: '目标值',
                    type: 'line',
                    data: [10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10],
                    itemStyle: {
                        normal: {
                            lineStyle: {
                                width: 3,
                                type: 'dottted',
                            }
                        }
                    },
                    markLine: {
                        data: [
                            { type: 'average', name: '平均值' }
                        ]
                    },
                    lineStyle: {
                        color: '#fff45c'
                    }
                },
                {
                    name: '城北所',
                    type: 'bar',
                    stack: 'sum',
                    barCategoryGap: '50%',
                    itemStyle: {
                        normal: {
                            label: {
                                textStyle: {
                                    color: '#fff',
                                    fontSize: 20
                                },
                                show: true,
                                position: 'insideTop'
                            }

                        }
                    },
                    data: [35, 12, 22, 25, 10, 12, 22, 15, 20, 30, 30, 20].map((e, i) => {
                        return {
                            name: (i + 1) + '月',
                            value: e,
                            itemStyle: {
                                normal: {
                                    color: e < 10 ? '#1890ff' : e < 20 ? '#fff45c' : '#f00',
                                    label: {
                                        textStyle: {
                                            color: '#fff',
                                            fontSize: 20
                                        },
                                        show: true,
                                        position: 'insideTop'
                                    }
        
                                }
                            }
                        };
                    })
                }
            ]
        };
        let ops2 = null;
        if (this.chart1) this.chart1.dispose();
        this.chart1 = echarts.init(ReactDOM.findDOMNode(this.refs.echart1));
        this.chart1.setOption(ops1);
        this.chart1.on('click', (param) => {
            this.setState({first: false});
        });
        if (this.chart2) this.chart2.dispose();
        this.chart2 = echarts.init(ReactDOM.findDOMNode(this.refs.echart2));
        this.chart2.setOption(ops1);
        this.chart2.on('click', (param) => {
            this.setState({first: false});
        });
    }
    render() {
        return (
            <div className='ac'>
                {this.state.first ? <div className='ac-box'>
                    <div ref='echart1' className='ac-box-t'></div>
                    <div ref='echart2' className='ac-box-b'></div>
                </div> : <CK />}
            </div>
        )
    }
}

// 出口组件
class CK extends React.Component {
    render() {
        return (
            <div className='ac-ckbox'>
            </div>
        )
    }
}

// 进度组件
class JD extends React.Component {
    render() {
        let type = this.props.type || 1;
        return (
            <div className='jd'>
                <div style={{background: "url('../agingControl/ck_1_" + type + ".png') no-repeat", backgroundSize: '100% 100%'}}></div>
                <div>
                    <div>平均时间：</div>
                    <div style={{color: type == 1 ? '#70e100' : '#1f9bff'}}>10</div>
                    <div style={{color: type == 1 ? '#70e100' : '#1f9bff'}} >小时</div>
                </div>
                <div>
                    <JDEC/>
                    <JDEC/>
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
                            value: 90, itemStyle: {
                            normal: {color: this.props.type == 1 ? '#70e100' : '#1f9bff'}
                        }
                        },
                        {
                            value: 10, itemStyle: {
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
        let type = this.props.type || 1;
        return (
            <div className='jd-ec'>
                <div ref='echart'></div>
                <div>
                    <div style={{color: type == 1 ? '#70e100' : '#1f9bff'}}>2</div>
                    <div style={{color: type == 1 ? '#70e100' : '#1f9bff'}}>小时</div>
                </div>
                <div>超去年均值</div>
            </div>
        )
    }
}

// Top10组件
class Top10 extends React.Component {
    componentDidMount() {
    }
    render() {
        let items = [95,90,85,80,78,76,75,74,72,70]
        return (
            <div className='top10'>
                <div className='top10-l'></div>
                <div className='top10-r'>
                    {items.map((e, i) => <div key={i} style={{width: e + '%', fontSize: 50, color: i == 0 ? '#ff0000' : i == 1 ? '#ee7622' : i == 2 ? '#ffad29' : 'white'}}>
                        <div>UN9377145</div>
                        <div>{e + '%'}</div>
                        <div className={i <= 2 ? 'top-icon1-3' : 'top-icon4-10'}></div>
                    </div>)}
                </div>
            </div>
        )
    }
}

// 详细数据组件
class DataDesc extends React.Component {
    render() {
        return (
            <div className='dd'>
                <div className='dd-t'>详情数据</div>
                <div className='dd-b scrollbar'>
                    <OneRecordTable/>
                    <div className='dd-b-line'></div>
                    <OneRecordTable/>
                </div>
            </div>
        )
    }
}

// 单条数据详情组件
class OneRecordTable extends React.Component {
    render() {
        let datas = [
            [{ key: 'IMO号', value: 'UN9377145' }, { key: '箱型尺寸宽度', value: '20/GP/16' }, { key: '进场时间', value: '2018-05-25 12:12:12' }],
            [{ key: 'IMO号', value: 'UN9377145' }, { key: '箱型尺寸宽度', value: '20/GP/16' }, { key: '进场时间', value: '2018-05-25 12:12:12' }],
            [{ key: 'IMO号', value: 'UN9377145' }, { key: '箱型尺寸宽度', value: '20/GP/16' }, { key: '进场时间', value: '2018-05-25 12:12:12' }],
            [{ key: 'IMO号', value: 'UN9377145' }, { key: '箱型尺寸宽度', value: '20/GP/16' }, { key: '进场时间', value: '2018-05-25 12:12:12' }],
            [{ key: 'IMO号', value: 'UN9377145' }, { key: '箱型尺寸宽度', value: '20/GP/16' }, { key: '进场时间', value: '2018-05-25 12:12:12' }],
            [{ key: 'IMO号', value: 'UN9377145' }, { key: '箱型尺寸宽度', value: '20/GP/16' }, { key: '进场时间', value: '2018-05-25 12:12:12' }],
            [{ key: 'IMO号', value: 'UN9377145' }, { key: '箱型尺寸宽度', value: '20/GP/16' }, { key: '进场时间', value: '2018-05-25 12:12:12' }],
        ];
        return (
            <div className='ort scrollbar'>
                <table>
                    <thead></thead>
                    <tbody>
                        {datas.map((e, i) => <tr key={i}>
                            {e.map((td, j) => [<td>{td.key + ':'}</td>, <td>{td.value}</td>])}
                        </tr>)}
                    </tbody>
                </table>
            </div>
        )
    }
}