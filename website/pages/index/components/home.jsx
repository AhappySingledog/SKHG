import '../less';
import 'animate.css';
import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import echarts from 'echarts';
import bmap from 'echarts/extension/bmap/bmap';
import { publish } from '../../../frame/core/arbiter';
import { ViwePager, Tip, Table, Panel } from '../../../frame/componets/index';
import HomeRightEcharts from './homeRightEcharts';
import HomeRightPanel from './homeRightPanel';

class MyPort extends React.Component {
    state = {
        showTip: false,
    }
    componentDidMount() {
        this.port = this.props.port;
        if (this.props.id !== '' && this.port.tip) {
            let $port = $('#' + this.props.id);
            $port.on('mouseover', () => {
                this.props.tipEvent(true, this.port);
            });
            $port.on('mouseout', () => {
                this.props.tipEvent(false, this.port);
            });
            $port.on('click', () => {
                // this.props.tipEvent(true, this.port, true);
                publish('changeLayer', {index: 1, props: {}});
            });
        }
    }
    componentWillUnmount() {
        if (this.timer) clearInterval(this.timer);
    }
    render() {
        const { port, id } = this.props;
        return (
            <div>
                <div className={port.icon.className} style={{ position: 'absolute', top: port.icon.top, left: port.icon.left }} id={id}>
                </div>
            </div>
        );
    }
}

class MyPortDesc extends React.Component {
    state = {}
    render() {
        return (
            <div className='desc'>
                <div className='desc-top'>
                    {this.props.port.events.map((e, i) => <div key={i} className='desc-top-msg'><div className='desc-top-year'>{e.year}</div><div className='desc-top-event'>{e.event}</div><div className='desc-top-time' /></div>)}
                </div>
                <div className='desc-bottom'>
                    <div className='desc-bottom-msg'>{this.props.port.msg}</div>
                    <ViwePager autoPlay={true} direction={'right'} imgs={this.props.port.imgs} width={449} height={614} boxStyle="content" interval={4000} />
                </div>
            </div>
        );
    }
}

// 首页
export default class Home extends React.Component {
    state = {
        index: 0,
        ports: [],
        tip: {
            showTip: false,
            msg: {},
            locked: false,
        }
    }
    componentDidMount() {
        publish('home_worldMap').then((res) => {
            this.setState({ ports: res[0].data });
        });
    }
    handleShowTip = (showTip, msg, locked) => {
        if (locked != undefined) this.setState({tip: {showTip: showTip, msg: msg, locked: locked}});
        else {
            let flag = this.state.tip.locked;
            if (!flag) this.setState({tip: {showTip: showTip, msg: msg}});
        }
    }
    render() {
        let { ports = [] } = this.state;
        return (
            <div className='home' style={{ overflow: 'hidden', height: '100%' }}>
                <div className='homeLeft'>
                    <div>
                        <div className='portType'>
                            <div className='greenPort'/>
                            <div style={{color: 'white', fontSize: 65, marginLeft: 60, marginRight: 140}}>国外港口分部</div>
                            <div className='yellowPort'/>
                            <div style={{color: 'white', fontSize: 65, marginLeft: 60}}>国内港口分部</div>
                        </div>
                        {ports.map((e, i) => <MyPort changeLayer={this.props.changeLayer} tipEvent={this.handleShowTip} ports={ports} key={i} port={e} id={e.id + '_' + i} />)}
                    </div>
                </div>
                <div className='homeRight' style={{paddingLeft: 20}}>
                    <HomeRightPanel/>
                </div>
                {this.state.tip.showTip ?
                    <Tip style={{ position: 'absolute', top: this.state.tip.msg.icon.top - 480, left: this.state.tip.msg.icon.left + 50 }} title={this.state.tip.msg.name}>
                        <MyPortDesc port={this.state.tip.msg} />
                    </Tip> : null
                }
            </div>
        )
    }
}