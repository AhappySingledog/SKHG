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
        const num = 1125678.90;
        const sum = [];
        sum.push(getNumberArr(num));
        return (
            <div className="Top">
                <div className="Top-left">
                    <div className="Top-left-span">
                        报关单量
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
                            <div className='' style={{ height: '100%', width: '100%' }} ></div>
                        </div>
                        <div className='Cen-pie-2'>
                            <div className='' style={{ height: '100%', width: '100%' }} ></div>
                        </div>
                    </div>
                </div>
                {/*      中间部分的中间部分          */}
                <div className="Cen-center">
                    <div className="Cen-center-top">

                    </div>
                    <div className="Cen-center-bot">

                    </div>
                </div>

                {/*      中间部分的右侧部分          */}
                <div className="Cen-right">
                    <div className="Cen-right-top"> 5349关区 </div>
                    <div className="Cen-right-bot">
                        <div className="Cen-right-bot-violet">
                            <img src={violet} />
                            <div>
                                <div>25</div>
                                <span>报关总量</span>
                            </div>
                        </div>
                        <div className="Cen-right-bot-blue">
                            <img src={blue} />
                            <div>
                                <div>8</div>
                                <span>进口报关单量</span>
                            </div>
                        </div>
                        <div className="Cen-right-bot-green">
                            <img src={green} />
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
            <div>

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