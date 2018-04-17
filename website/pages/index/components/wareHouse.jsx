import '../less';
import 'animate.css';
import $ from 'jquery';
import moment from 'moment';
import React from 'react';
import ReactDOM from 'react-dom';
import echarts from 'echarts';
import bmap from 'echarts/extension/bmap/bmap';
import { publish } from '../../../frame/core/arbiter';
import WareHouseRight from './wareHouseRight';
import VideoIcon from '../images/视频监控.png';

class MapOperation extends React.Component {
    componentDidMount() {
        console.log(this.props);
        let datas = this.props.datas;
        let mapExtent = {
            xmin: Number(datas.xmin),
            xmax: Number(datas.xmax),
            ymin: Number(datas.ymin),
            ymax: Number(datas.ymax),
        }
        this.props.map.mapOper.setMapExtent(mapExtent);
        let drawVideos = (datas) => {
            console.log(datas.code);
            Promise.all([
                publish('webAction', { svn: 'skhg_stage_service', path: 'queryTableByWhere', data: { tableName: 'IMAP_VIDEO', where: "ENTERPRISENAME='" + datas.ssdw + "'" } }),
                publish('webAction', { svn: 'skhg_service', path: 'queryGeomTable', data: { tableName: 'SK_MONITOR_GIS', where: "SSDW='" + datas.ssdw + "'" } }),
            ]).then((res) => {
                let videos = res[0][0].data;
                let temp = {};
                res[1][0].data.forEach((e) => temp[e.code] = e.geom);
                videos.forEach((e) => e.geom = temp[e.VIDEOIMAPID]);
                initVideo(videos);
            });
            let clickVideo = (e) => {
                let url = e.attributes.VIDEOURL;
                let name = e.attributes.VIDEOIMAPID;
                publish('playVedio', { url: url, name: name });
            }
            let initVideo = (data) => {
                this.props.map.mapDisplay.clearLayer('VIDEO_LAYER');
                data.forEach((e, i) => {
                    if (!e.geom) return;
                    let param = {
                        id: 'VIDEO_LAYER' + i,
                        layerId: 'VIDEO_LAYER',
                        layerIndex: 999,
                        src: VideoIcon,
                        width: 140,
                        height: 140,
                        angle: 0,
                        x: e.geom.x,
                        y: e.geom.y,
                        attr: { ...e },
                        click: clickVideo,
                        mouseover: function (g) {
                            let symbol = g.symbol;
                            if (symbol.setWidth) {
                                symbol.setWidth(140 + 12);
                                symbol.setHeight(140 + 12);
                            }
                            g.setSymbol(symbol);
                        },
                        mouseout: function (g) {
                            let symbol = g.symbol;
                            if (symbol.setWidth) {
                                symbol.setWidth(140);
                                symbol.setHeight(140);
                            }
                            g.setSymbol(symbol);
                        }
                    }
                    this.props.map.mapDisplay.image(param);
                });
            }
        };
        drawVideos(this.props.datas);
    }
    render() {
        return (<div></div>)
    }
}

// 货仓
export default class WareHouse extends React.Component {
    state = { map: null }
    componentDidMount() {
        this.changeIframe($(ReactDOM.findDOMNode(this.refs.iframe)), '../map/index.html?mtype=' + this.props.datas.code);
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
            <div className='pierMap' style={{ overflow: 'hidden', height: '100%' }}>
                <div className='pierleft'>
                    <div ref="iframe"></div>
                    {this.state.map ? <MapOperation map={this.state.map} datas={this.props.datas} /> : null}
                </div>
                <div className='pierRight' style={{ marginLeft: 30 }}>
                    <WareHouseRight/>
                </div>
            </div>
        )
    }
}