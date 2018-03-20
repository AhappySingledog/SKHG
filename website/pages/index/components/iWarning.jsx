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
                    <IWarningRightPanel />
                </div>
            </div>
        )
    }
}