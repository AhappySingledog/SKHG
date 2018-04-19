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
        let msg = this.props.msg;
        return (
            <div className='ic-record-one'>
                <div className='ic-record-one-name'>{msg.sender}</div>
                <div className='ic-record-one-body'>
                    <div className='ic-record-one-body-time'>{msg.sendTime}</div>
                    <div className='ic-record-one-body-msg'>{msg.msg}</div>
                </div>
            </div>
        )
    }
}

// 智能指挥
export default class iCommand extends React.Component {
    state = {
        msgs: [],
        number: 100,
    }
    send = () => {
        let msg = $.trim($('#msg').val());
        publish('webAction', { svn: 'skhg_service', path: 'sendICMsg', data: { sender: 'admin', senderId: '1', msg: msg } }).then((res) => {
            if (res.success) this.update();
        });
    }
    update = () => {
        publish('webAction', { svn: 'skhg_service', path: 'getNewestICMsgs', data: { number: this.state.number } }).then((res) => {
            this.setState({msgs: res[0].data}, () => document.getElementById('record').scrollTop = document.getElementById('record').scrollHeight);
        });
    }
    up = () => {
        console.log();
    }
    more = () => {
        console.log();
        let number = this.state.number;
        this.setState({number: number + 100}, this.update);
    }
    componentDidMount() {
        this.update();
        this.timer = setInterval(this.update, 1000 * 10);
    }
    componentWillUnmount() {
        if (this.timer) clearInterval(this.timer);
    }
    render() {
        let url = 'http://www.cheluyun.com/javascript/zsg/?id=100031600&rtmp=rtmp://playrtmp.simope.com:1935/live/524622521d?liveID=100031600&hls=http://playhls.simope.com/live/524622521d/playlist.m3u8?liveID=100031600';
        return (
            <div className='ic' style={{ overflow: 'hidden' }}>
                <div className='ic-close' onClick={this.props.close}></div>
                <div className='ic-record-more' onClick={this.more}>更多记录︽</div>
                <div className='ic-box'>
                    <div className='ic-video'>
                        <V data={{url: url}}/>
                        <V data={{url: url}}/>
                    </div>
                    <div id='record' className='ic-record scrollbar'>
                        {this.state.msgs.map((e, i) => <Msg key={i} msg={e}/>)}
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