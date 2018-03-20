import '../less';
import 'animate.css';
import React from 'react';
import ReactDOM from 'react-dom';
import { publish } from '../../../frame/core/arbiter';
import { Panel, WordsContent } from '../../../frame/componets/index';
import echarts from 'echarts';
import $ from 'jquery';
import _ from 'lodash';
import violet from '../../../res/mapIcon/1.png';
import blue from '../../../res/mapIcon/2.png';
import green from '../../../res/mapIcon/3.png';


/** 计算数量得到小数点和前面加0 */
function toArray(str) {
    let arr = [];
    if (str >= 10 || str === 0) {
        for (var i = 0, j = str.length; i < j; i++) { arr.push(str[i]) }
    } else {
        for (var i = 0, j = str.length; i < j; i++) {
            arr.push(0)
            arr.push(str[i])
        }
    }
    return arr;
}

function getNumberArr(num) {
    let nums = [], arrs = (num + '').split('.').map(toArray);
    if (arrs[0].length > 0) {
        let arr = arrs[0], m = arr.length % 3;
        for (var i = 0, j = arr.length; i < j; i++) { let n = i - m; if (i > 0 && n >= 0 && n % 3 === 0) nums.push('break'); nums.push(arr[i]); }
    }
    else nums.push('0');
    if (arrs[1] && arrs[1].length > 0) { nums.push('point'); nums = nums.concat(arrs[1]) }
    return nums;
}

/** 右侧上 */
class PortRightTop extends React.Component {
    state = {}
    render() {
        const num = 125678.90;
        const sum = [];
        sum.push(getNumberArr(num));
        return (
            <div className="Top">
                <div className="Top-left">
                    <div className="Top-left-span">
                        报<br />关<br />单<br />量<br />
                    </div>
                    <div className="Top-left-Num">
                        <div className="Top-left-Num-top">
                            <div className='numbers-view'>
                                {sum[0].map((num, i) => { return <div key={i} className={'numbers-' + num}></div> })}
                            </div>
                        </div>
                        <div className="Top-left-Num-bot">
                            <div className="Top-left-Num-bot-1">
                                <div>进口报关单量</div>
                                <span>259,163</span>
                            </div>
                            <div className="Top-left-Num-bot-2">
                                <div>出口报关单量</div>
                                <span>341,563</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="Top-right">
                    <div className="Top-right-top">
                        出入境人数
                    </div>
                    <div className="Top-right-center">
                        <div>500,000</div>
                    </div>
                    <div className="Top-right-bot">
                        <div className="Top-right-bot-left">
                            <div className="Top-right-bot-div">出境旅客人数</div>
                            <span className="Top-right-bot-span">175000</span>
                        </div>
                        <div className="Top-right-bot-right">
                            <div className="Top-right-bot-div">入境旅客人数</div>
                            <span className="Top-right-bot-span">325000</span>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

/** 右侧中 */
class PortRightCen extends React.Component {
    render() {
        const data = [{ 'value': '78', 'name': '通关效率' }, { 'value': '65', 'name': '查验时效' }];
        publish('port_pie_xl', { value: data[0] || 0 }).then((res) => {
            if (this.chart8) this.chart8.dispose();
            this.chart8 = echarts.init(ReactDOM.findDOMNode(this.refs.echart8));
            this.chart8.setOption(res[0]);
        });

        publish('port_pie_xl', { value: data[1] || 0 }).then((res) => {
            if (this.chart9) this.chart9.dispose();
            this.chart9 = echarts.init(ReactDOM.findDOMNode(this.refs.echart9));
            this.chart9.setOption(res[0]);
        });


        const boxNum = [
            {
                'name': '查验完毕柜数', 'num': '7856'
            }, {
                'name': '在场柜数柜数', 'num': '7856'
            }, {
                'name': '待调拨入场柜数', 'num': '7856'
            }]
        return (
            <div className="Cen">
                {/*      中间部分的左侧部分          */}
                <div className="Cen-left">
                    <div className="Cen-box">
                        {
                            boxNum.map((value, key) => {
                                return <div key={key} className={'Cen-box-zise'}>
                                    <span>{value.num}</span>
                                    <div>{value.name}</div>
                                </div>
                            })
                        }
                    </div>
                    <div className="Cen-pie">
                        <div className='Cen-pie-1'>
                            <div className='homeRightE-1' style={{ height: '100%', width: '100%' }} ref="echart8"></div>
                        </div>
                        <div className='Cen-pie-2'>
                            <div className='homeRightE-1' style={{ height: '100%', width: '100%' }} ref="echart9"></div>
                        </div>
                    </div>
                </div>
                {/*      中间部分的中间部分          */}
                <div className="Cen-center">
                    <div className="Cen-center-top">
                        <div>征收税款金额</div>
                        <div>23,456,789.00</div>
                    </div>
                    <div className="Cen-center-bot">
                        <div>查验票数</div>
                        <div>2,345,678</div>
                    </div>
                </div>

                {/*      中间部分的右侧部分          */}
                <div className="Cen-right">
                    <div className="Cen-right-top"> 5349关区 </div>
                    <div className="Cen-right-bot">
                        <div className="Cen-right-bot-violet">
                            <img src={violet} style={{ width: '140px', height: '140px' }} />
                            <div>
                                <div>25</div>
                                <span>报关总量</span>
                            </div>
                        </div>
                        <div className="Cen-right-bot-blue">
                            <img src={blue} style={{ width: '140px', height: '140px' }} />
                            <div>
                                <div>8</div>
                                <span>进口报关单量</span>
                            </div>
                        </div>
                        <div className="Cen-right-bot-green">
                            <img src={green} style={{ width: '140px', height: '140px' }} />
                            <div>
                                <div>11</div>
                                <span>出口报关单量</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

/** 右侧下 */
class PortRightBot extends React.Component {
    render() {
        return (
            <div className="Bot">
                <div className="Bot-video">
                    <div className='Bot-video-videoleft'>

                    </div>
                    <div className='Bot-video-vidospan' onClick={() => publish('playVedio')}>
                        重点视频监控
                            <div>
                            <div>视频信息一：对长桥吊运作</div>
                            <div>视频信息二：堆场工作现场</div>
                        </div>
                    </div>
                </div>
                <div className="Bot-video">
                    <div className="Bot-video-videoright">

                    </div>
                    <div className='Bot-video-vidospan' onClick={() => publish('playVedio')}>
                        重点视频监控
                            <div>
                            <div>视频信息一：对长桥吊运作</div>
                            <div>视频信息二：堆场工作现场</div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

// 第二页右侧组件
export default class PortRight extends React.Component {
    componentDidMount() {

    }
    componentWillUnmount() {
        if (this.chart) this.chart.dispose();
    }

    render() {
        return (
            <div className='portRight' style={{ marginLeft: 30 }}>
                <div style={{ 'position': 'absolute' }}>
                    <PortRightTop />
                    <PortRightCen />
                    <PortRightBot />
                </div>
            </div>
        )
    }
}