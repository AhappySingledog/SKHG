import '../less';
import 'animate.css';
import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import echarts from 'echarts';
import { publish, subscribe, unsubscribe } from '../../../frame/core/arbiter';
import { ViwePager, Tip, Table, Panel } from '../../../frame/componets/index';

class V extends React.Component {
    click = () => {
        publish('playVedio');
    }
    render() {
        return (
            <div className='ic-video-v'>
                <div>
                    <div onClick={this.click}></div>
                </div>
                <iframe src={this.props.data.url}></iframe>
            </div>
        )
    }
}

class Msg extends React.Component {
    render() {
        return (
            <div className='ic-record-one'>
                <div className='ic-record-one-name'>张三啊</div>
                <div className='ic-record-one-body'>
                    <div className='ic-record-one-body-time'>2018/03/09 10:50</div>
                    <div className='ic-record-one-body-msg'>哈哈哈哈</div>
                </div>
            </div>
        )
    }
}

// 智能指挥
export default class iCommand extends React.Component {
    send = () => {
        let msg = $.trim($('#msg').val());
        console.log(msg);
    }
    up = () => {
        console.log();
    }
    componentDidMount() {
        $('#record').scrollTop = $('#record').scrollHeight;
    }
    render() {
        let url = 'http://www.cheluyun.com/javascript/zsg/?id=100031600&rtmp=rtmp://playrtmp.simope.com:1935/live/524622521d?liveID=100031600&hls=http://playhls.simope.com/live/524622521d/playlist.m3u8?liveID=100031600';
        return (
            <div className='ic' style={{ overflow: 'hidden' }}>
                <div className='ic-close' onClick={this.props.close}></div>
                <div className='ic-record-more'>更多记录︽</div>
                <div className='ic-box'>
                    <div className='ic-video'>
                        <V data={{url: url}}/>
                        <V data={{url: url}}/>
                    </div>
                    <div id='record' className='ic-record scrollbar'>
                        <Msg/>
                        <Msg/>
                        <Msg/>
                        <Msg/>
                        <Msg/>
                        <Msg/>
                        <Msg/>
                        <Msg/>
                        <Msg/>
                        <Msg/>
                        <Msg/>
                        <Msg/>
                        <Msg/>
                    </div>
                    <div className='ic-msg'>
                        <div className='ic-msg-text'>
                            <textarea id='msg'></textarea>
                        </div>
                        <div className='ic-msg-button'>
                            <div className='ic-msg-button-send' onClick={this.send}></div>
                            <div className='ic-msg-button-up' onClick={this.up}></div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}