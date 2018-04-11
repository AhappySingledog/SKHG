import '../less';
import 'animate.css';
import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import echarts from 'echarts';
import { publish, subscribe, unsubscribe } from '../../../frame/core/arbiter';
import { ViwePager, Tip, Table, Panel } from '../../../frame/componets/index';
import IWarningRightPanel from './iWarningRightPanel';
import Cesium from 'cesium/Cesium'
import 'cesium/Widgets/widgets.css'

// 地图操作组件
class MapOperation extends React.Component {
    state = {
    }
    componentDidMount() {
        let mapExtent = {
            xmax: 113.9250031023771,
            xmin: 113.85290532405679,
            ymax: 22.486930314170145,
            ymin: 22.446418229209208,
        };
        this.props.map.mapOper.setMapExtent(mapExtent);
        /** 港口码头划分 */
        publish('webAction', { svn: 'skhg_service', path: 'getAreaByWhere', data: { where: 'LAYER=2' } }).then((res) => {
            let color = {
                1: [250, 22, 80, 1],       //红色
                2: [57, 255, 95, 1],       //绿色
                3: [255, 255, 255, 1],       //蓝色
                4: [251, 251, 0, 1],       //黄色
            };
            res[0].data.forEach((data, i) => {
                let dots = data.geom.rings[0].map((p) => { return { x: p[0], y: p[1] }; });
                let fillColor = color[data.type];
                let params = {
                    id: 'port_view_' + i,
                    linecolor: fillColor,
                    layerId: 'port_view',
                    dots: dots,
                    attr: { ...data },
                    click: (e) => publish('changeLayer', { index: 2, props: { datas: e.attributes } }),
                    linewidth: 6,
                }
                this.props.map.mapDisplay.polygon(params);
            });
        });
    }
    render() {
        return (
            <div>
            </div>
        )
    }
}

// 智能预警
export default class IWarning extends React.Component {
    state = { map: null }
    componentDidMount() {
        this.changeIframe($(ReactDOM.findDOMNode(this.refs.iframe)), '../map/index.html?mtype=' + (this.props.code || 'two_layer'));
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
        return (
            <div className='home' style={{ overflow: 'hidden', height: '100%' }}>
                <div className='homeLeft'>
                    <div ref="iframe" style={{ width: 7564, height: 2684 }} />
                    {this.state.map ? <MapOperation map={this.state.map} datas={this.props.datas} /> : null}
                </div>
                <div className='homeRight' style={{ paddingLeft: 20 }}>
                    <IWarningRightPanel map={this.state.map}/>
                </div>
            </div>
        )
    }
}