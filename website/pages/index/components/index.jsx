import '../less';
import 'animate.css';
import $ from 'jquery';
import moment from 'moment';
import React from 'react';
import ReactDOM from 'react-dom';
import { publish } from '../../../frame/core/arbiter';
import Home from './home';
import Port from './port';
import Pier from './pier';
import WareHouse from './wareHouse';

class Timer extends React.Component {
    state = { msg: '' }
    componentDidMount() {
        const week = { '1': '星期一', '2': '星期二', '3': '星期三', '4': '星期四', '5': '星期五', '6': '星期六', '7': '星期日' };
        let tq = '晴';
        function initWeather() {
            // publish('webAction', { svn: 'sojson', path: 'weather/json.shtml', data: { city: '深圳' } }).then((res) => {
            //     if (res[0].message === 'Success !') { tq = res[0].data.forecast[0].type; }
            // });
        }
        initWeather();
        setInterval(() => {
            let msg = moment().format('YYYY年MM月DD日 ') + week[moment().format('e')] + moment().format(' HH:mm:ss') + '           ' + tq;
            this.setState({ msg });
        }, 1000);
        setInterval(initWeather, 1000 * 60 * 60);
    }
    render() {
        return <div className='mheader-time'>{this.state.msg}</div>
    }
}

export default class App extends React.Component {
    state = {
        index: null,
        curLayer: null,
    }
    componentDidMount() {
        this.changeLayer(0, {});
    }
    changeLayer = (index, value) => {
        let { index: idx } = this.state;
        if (index != idx) {
            let curLayer = null;
            switch (index) {
                case 1:
                    curLayer = <Port changeLayer={this.changeLayer} {...value} />;
                    break;
                case 2:
                    curLayer = <Pier changeLayer={this.changeLayer} {...value} />;
                    break;
                case 3:
                    curLayer = <WareHouse changeLayer={this.changeLayer} {...value} />;
                    break;
                default:
                    curLayer = <Home changeLayer={this.changeLayer} {...value} />;
            }
            $('.mbody-content').addClass('zoomIn animated').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', () => $('.mbody-content').removeClass('zoomIn animated'));
            this.setState({ index, curLayer });
        }
    }
    iQuery = () => {
        console.log('iQuery');
    }
    iCount = () => {
        console.log('iCount');
    }
    iCommand = () => {
        console.log('iCommand');
    }
    warning = () => {
        console.log('warning');
    }
    render() {
        return (
            <div className='mframe'>
                <div className='mheader'>
                    <div className='mheader-title'>蛇口海关iMap智慧管理系统</div>
                    <div className='mheader-top'>
                        <Timer />
                        <div className='mheader-home' onClick={() => this.changeLayer(0, {})}/>
                        <div className='mheader-iQuery' onClick={() => this.iQuery()}/>
                        <div className='mheader-iCount' onClick={() => this.iCount()}/>
                        <div className='mheader-iCommand' onClick={() => this.iCommand()}/>
                        <div className='mheader-warning' onClick={() => this.warning()}/>
                    </div>
                </div>
                <div className='mbody'><div className='mbody-content'>{this.state.curLayer}</div></div>
                <div className='mfooter'/>
            </div>
        )
    }
}