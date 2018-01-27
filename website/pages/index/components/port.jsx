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
import { ViwePager, Tip, Table, Panel, Dialog } from '../../../frame/componets/index';
import HomeRightEcharts from './homeRightEcharts';

// 地图操作组件
class MapOperation extends React.Component {
    state = {
        showMT: false,             //展现码头数据
        mtJson: [],               //码头数据
    }

    componentDidMount() {

        let mapExtent = {
            xmax: 113.9250031023771,
            xmin: 113.85290532405679,
            ymax: 22.486930314170145,
            ymin: 22.446418229209208,
        };
        this.props.map.mapOper.setMapExtent(mapExtent);

        publish('map_view_init').then((res) => {
            this.setState({ mtJson: res[0] })
            this.handleMTSJ(res[0]);
        })
    }

    handleMTSJ = (datas) => {
        for(let o in datas){
            let dots = datas[o].polygon.rings[0].map((p) => { return { x: p[0], y: p[1] }; });
            let params = {
                id: "port_view"+o,
                layerId: 'port_view',
                fillcolor: 'blue',
                dots: dots,
                // attr: { ...datas[key], no: o.length },
                click: this.showContainerModal,
                mouseover : (g) =>{
                    let datajsons = g.attributes;
                    this.setState({
                        showMT : !this.state.showMT
                    })
                },
                mouseout : () =>{
                    this.setState({
                        showMT : !this.state.showMT
                    })
                }
            }
            this.props.map.mapDisplay.polygon(params);
        }
    };

    showContainerModal = (e) => {
        alert("点击后就要进入第三个页面的！");
    };
    render() {
        let { flds = [], datas = [] } = this.state;
        return (
            <div>
                <div style={{ position: 'relative' }}>
                    {
                        this.state.showMT ? <Dialog /> : null
                    }
                </div>

            </div>

        )
    }
}

// 港口
export default class Port extends React.Component {

    state = { map: null }
    componentDidMount() {
        this.changeIframe($(ReactDOM.findDOMNode(this.refs.iframe)), '../map/index.html?mtype=two_layer');
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
        let { tview = [], idx = 0, } = this.state;
        return (
            <div className='portMap' style={{ overflow: 'hidden', height: '100%' }}>
                <div ref="iframe"></div>
                {this.state.map ? <MapOperation map={this.state.map} /> : null}
            </div>
        )
    }
}