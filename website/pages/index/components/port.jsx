import '../less';
import 'animate.css';
import _ from 'lodash';
import $ from 'jquery';
import moment from 'moment';
import React from 'react';
import ReactDOM from 'react-dom';
import echarts from 'echarts';
import bmap from 'echarts/extension/bmap/bmap';
import { subscribe, unsubscribe, publish } from '../../../frame/core/arbiter';

// 地图操作组件
class MapOperation extends React.Component {
    componentDidMount() {
        console.log(this.props.map);
        // this.props.map.mapOper.centerAt({x: 113.8662306010001, y: 22.457914536000033});
        let mapExtent = {
            xmax: 113.9250031023771,
            xmin: 113.85290532405679,
            ymax: 22.486930314170145,
            ymin: 22.446418229209208,
        };
        this.props.map.mapOper.setMapExtent(mapExtent);
        let param = {
            id: 'test',
            layerId: 'test',
            src: '../map/images/gngk.png',
            width: 100,
            height: 100,
            angle: 0,
            x: 113.8662306010001,
            y: 22.457914536000033,
        };
        this.props.map.mapDisplay.image(param);
    }
    render() {
        return (
            <div style={{ position: 'absolute', top: '-100%' }}>
            </div>
        )
    }
}

class ChartView extends React.Component {
    state = {}
    componentDidMount() {
        const { scr, sub, options } = this.props;
        let scribe = (ops) => {
            publish(sub, ops).then((res) => {
                if (this.chart) this.chart.dispose();
                this.chart = echarts.init(ReactDOM.findDOMNode(this.refs.chart));
                this.chart.setOption(res[0]);
                if (res[0].img) { this.setState({ img: res[0].img }); }
            });
        }
        if (scr != sub) this.token = subscribe(scr, scribe);
        if (options) { scribe(options); this.timer = setInterval(() => scribe(options), 1000 * 60 * 5); }
    }
    componentWillUnmount() {
        if (this.token) unsubscribe(this.token);
        if (this.chart) this.chart.dispose();
        if (this.timer) clearInterval(this.timer);
    }
    render() {
        let { style } = this.props;
        return (
            <div style={_.assign({ height: '100%', overflow: 'hide' }, style)}>
                {
                    this.state.img ?
                        <div style={{ position: 'absolute', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '5px' }}>
                            <img src={this.state.img.url} />
                        </div> : null
                }
                <div ref="chart" style={{ height: '100%' }}></div>
            </div>
        );
    }
}


// 港口
export default class Port extends React.Component {
    state = { tview: [], map: null }
    componentDidMount() {
        // 获取地图信息
        publish('map_view_init').then((res) => {
            console.log(res);
            let { data: tview } = res[0]
            this.setState({ tview }, () => this.changeIframe($(ReactDOM.findDOMNode(this.refs.iframe)), '../map/index.html?map=' + tview[0].key));
        });
    }

    /**
    * 
    * @param {*target} 地图参数  
    * @param {*} url   地图路径
    */
    changeIframe($target, url) {
        var $oIframe = $target.find('iframe');
        if ($oIframe.length > 0) {
            $target.addClass('zoomOut animated');
            $($oIframe[0].contentWindow).on('unload', () => {
                this.addIframe($target, url)
            });
            this.closeIframe($oIframe);
        } else {
            this.addIframe($target, url);
        }
    }

    /**
     * 
     * @param {*target}  地图参数
     * @param {*} url    地图路径
     */
    addIframe($target, url) {
        if (typeof url === 'string' && url.length > 0) {
            var $ifrme = $('<iframe scrolling="auto" frameborder="0" width="100%" height="100%" style="visibility: hidden" allowtransparency="true" src="' + url + '"></iframe>');
            $target.append($ifrme);
            $ifrme.on('load', () => {
                $ifrme.css({ visibility: '' });
                $target.removeClass('zoomOut animated').addClass('zoomIn animated');
                this.setState({ map: $ifrme['0'].contentWindow });
            });
        }
    }

    /**
     * 
     * @param {*target}  地图参数
     * @param {*} url    地图路径
     */
    closeIframe($target, url) {
        let iframe = $iframe[0],
            fwin = $iframe[0].contentWindow;
        try {
            if (fwin.navigator.userAgent.indexOf('Chrome') > -1 ||
                fwin.navigator.userAgent.indexOf('Firefox') > -1) {
                var event = fwin.document.createEvent('HTMLEvents');
                event.initEvent('unload', true, true);
                event.eventType = 'm-sys-close';
                fwin.document.dispatchEvent(event);
            }
            fwin.document.write('');
            fwin.close();
        } catch (ex) {
            // 跨域问题
        }
        iframe.innerHTML = '';
        $($iframe).remove();
    }

    render() {
        let { tview = [], idx = 0 } = this.state;
        return (
            <div className='portMap' style={{ overflow: 'hidden', height: '100%' }}>
                <div ref="iframe" style={{ height: '100%', width: '67%' }}>
                    {this.state.map ? <MapOperation map={this.state.map} /> : null}
                </div>
                <div className="Right_Map">
                    <div className="Right_Map_row1">
                        <span>12312321321</span>
                    </div>
                    <div className="Right_Pie">
                        <div className="Right_Pie_title">
                            <span>出入境旅客统计</span>
                        </div>
                        <div className="Right_Map_row2">
                            <ChartView scr='rpanel_gcfx_scr' sub='map_view_pie' options={true} />
                            <div>
                                <span>出境旅客人数</span>
                                <span>175000</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}