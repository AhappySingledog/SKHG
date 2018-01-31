import '../less';
import 'animate.css';
import $ from 'jquery';
import moment from 'moment';
import React from 'react';
import ReactDOM from 'react-dom';
import { publish, subscribe, unsubscribe } from '../../../frame/core/arbiter';
import { Vedio } from '../../../frame/componets/index';
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
        cv: {},
    }
    componentDidMount() {
        this.sub_changeLayer = subscribe('changeLayer', this.changeLayer);
        this.sub_playVedio = subscribe('playVedio', this.playVedio);
        publish('changeLayer', 0, {});
    }
    componentWillUnmount() {
        if (this.sub_changeLayer) unsubscribe(this.sub_changeLayer);
        if (this.sub_playVedio) unsubscribe(this.sub_playVedio);
    }
    changeLayer = (index, value) => {
        let { index: idx } = this.state;
        if (index != idx) {
            let curLayer = null;
            switch (index) {
                case 1:
                    curLayer = <Port {...value} />;
                    break;
                case 2:
                    curLayer = <Pier {...value} />;
                    break;
                case 3:
                    curLayer = <WareHouse {...value} />;
                    break;
                default:
                    curLayer = <Home {...value} />;
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
    playVedio = (vedio) => {
        let data = [
            { name: 'SCT大楼12F大厅', url: 'http://www.cheluyun.com/javascript/zsg/?id=100032172&rtmp=rtmp://playrtmp.simope.com:1935/live/07f39deff1?liveID=100032172&hls=http://playhls.simope.com/live/07f39deff1/playlist.m3u8?liveID=100032172' },
            { name: 'SCT4号泊位', url: 'http://www.cheluyun.com/javascript/zsg/?id=100032166&rtmp=rtmp://playrtmp.simope.com:1935/live/e4b0c82c15?liveID=100032166&hls=http://playhls.simope.com/live/e4b0c82c15/playlist.m3u8?liveID=100032166' },
            { name: 'SCT工程部维修车间', url: 'http://www.cheluyun.com/javascript/zsg/?id=100032170&rtmp=rtmp://playrtmp.simope.com:1935/live/89619ada51?liveID=100032170&hls=http://playhls.simope.com/live/89619ada51/playlist.m3u8?liveID=100032170' },
            { name: 'SCT大楼1F监控室', url: 'http://www.cheluyun.com/javascript/zsg/?id=100032167&rtmp=rtmp://playrtmp.simope.com:1935/live/105c2009a0?liveID=100032167&hls=http://playhls.simope.com/live/105c2009a0/playlist.m3u8?liveID=100032167' },
            { name: 'CCT操作部中控室', url: 'http://www.cheluyun.com/javascript/zsg/?id=100032173&rtmp=rtmp://playrtmp.simope.com:1935/live/ee2e705054?liveID=100032173&hls=http://playhls.simope.com/live/ee2e705054/playlist.m3u8?liveID=100032173' },
            { name: 'CCT工程部维修车间', url: 'http://www.cheluyun.com/javascript/zsg/?id=100032171&rtmp=rtmp://playrtmp.simope.com:1935/live/d37820f07a?liveID=100032171&hls=http://playhls.simope.com/live/d37820f07a/playlist.m3u8?liveID=100032171' },
            { name: 'MCT闸口安保室', url: 'http://www.cheluyun.com/javascript/zsg/?id=100032174&rtmp=rtmp://playrtmp.simope.com:1935/live/28110b959b?liveID=100032174&hls=http://playhls.simope.com/live/28110b959b/playlist.m3u8?liveID=100032174' },
            { name: 'SCT 1# 2#堆场', url: 'http://www.cheluyun.com/javascript/zsg/?id=100031600&rtmp=rtmp://playrtmp.simope.com:1935/live/524622521d?liveID=100031600&hls=http://playhls.simope.com/live/524622521d/playlist.m3u8?liveID=100031600' },
        ];
        this.setState({cv: {}}, () => this.setState({cv: data[7]}));
    }
    closeVedio = () => {
        this.setState({cv: {}});
    }
    render() {
        return (
            <div className='mframe'>
                <div className='mheader'>
                    <div className='mheader-title'>蛇口海关iMap智慧管理系统</div>
                    <div className='mheader-top'>
                        <div className='mheader-nt'>
                            <div className='mheader-name'>海关监管区域</div>
                            <Timer />
                        </div>
                        <div className='mheader-home' onClick={() => this.changeLayer(0, {})}/>
                        <div className='mheader-iQuery' onClick={() => this.iQuery()}/>
                        <div className='mheader-iCount' onClick={() => this.iCount()}/>
                        <div className='mheader-iCommand' onClick={() => this.iCommand()}/>
                        <div className='mheader-warning' onClick={() => this.warning()}/>
                    </div>
                </div>
                <div className='mbody'><div className='mbody-content'>{this.state.curLayer}</div></div>
                <div className='mfooter'/>
                {this.state.cv.url ? <Vedio close={this.closeVedio} video={this.state.cv} /> : null}
            </div>
        )
    }
}