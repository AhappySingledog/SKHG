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
    state = { map: null, iframes: [], num: 0, }
    componentDidMount() {
        if (this.props.datas.type == 3) {
            publish('webAction', { svn: 'skhg_service', path: 'queryGeomTable', data: { tableName: 'SK_AREA', where: "CODE LIKE '" + this.props.datas.code + "%' AND CK_ID = '3'" } }).then((res) => {
                this.setState({ iframes: res[0].data.sort((a, b) => Number(a.gid) > Number(b.gid)) }, () => this.changeIframe($(ReactDOM.findDOMNode(this.refs.iframe)), '../map/index.html?mtype=' + this.state.iframes[0].code));
            });
        }
        else {
            this.changeIframe($(ReactDOM.findDOMNode(this.refs.iframe)), '../map/index.html?mtype=' + this.props.datas.code);
        }
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
            $($oIframe[0].contentWindow).on('unload', () => { this.addIframe($target, url) });
            this.closeIframe($oIframe);
        } else { this.addIframe($target, url); }
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
    closeIframe($iframe) {
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

    /** 下一张 */
    nextImg = (e) => {
        console.log("下一张");
        let a = this.state.num;
        let b = this.state.iframes.length;
        if (a < b - 1) {
            a++;
            this.setState({ num: a }, () => {
                this.changeIframe($(ReactDOM.findDOMNode(this.refs.iframe)), '../map/index.html?mtype='+this.state.iframes[a].code);
            })
        } else {
            this.setState({ num: 0 }, () => {
                this.changeIframe($(ReactDOM.findDOMNode(this.refs.iframe)), '../map/index.html?mtype='+this.state.iframes[0].code);
            });
        }
    }

    /** 上一张 */
    prevImg = (e) => {
        console.log("上一张");
        let a = this.state.num;
        let b = this.state.iframes.length;
        if (a < 0) {
            a = b - 1;
            this.setState({ num: a }, () => {
                this.changeIframe($(ReactDOM.findDOMNode(this.refs.iframe)), '../map/index.html?mtype='+this.state.iframes[a].code);
            })
        } else {
            this.changeIframe($(ReactDOM.findDOMNode(this.refs.iframe)), '../map/index.html?mtype='+this.state.iframes[0].code);
        }
    }

    /** 可以选择仓库的 */
    topBut = (e) => {
        this.changeIframe($(ReactDOM.findDOMNode(this.refs.iframe)), '../map/index.html?mtype=' + this.props.res[e.target.id].code + '_1');
    }

    /** 可以选择第几层 */
    botBtn = (e) => {
        this.changeIframe($(ReactDOM.findDOMNode(this.refs.iframe)), '../map/index.html?mtype=' + this.state.iframes[(e.target.id)].code);
        console.log(e.target.id);
    }

    render() {

        let item = [
            <div key="ckass" className="ckall">
                <div className="ckall_left" onClick={this.prevImg.bind(this)}>
                    <img src="../portImages/left.png" alt="左箭头" />
                </div>
                <div className="ckall_top" >
                    {
                        this.props.res.map((value, i) => { return <div key={i} onClick={this.topBut.bind(this)}> <img id={i} src={"../portImages/0" + i + ".jpg"} /> </div> })
                    }
                </div>
                <div className="ckall_bot" >
                    {
                        this.state.iframes.map((value, i) => { return <div key={i} id={i} onClick={this.botBtn.bind(this)}>{i + 1}</div> })
                    }
                </div>
                <div className="ckall_right" onClick={this.nextImg.bind(this)}>
                    <img src="../portImages/right.png" alt="右箭头" />
                </div>
            </div>
        ];

        return (
            <div className='houseMap' style={{ overflow: 'hidden', height: '100%' }}>
                <div className='houseleft'>
                    <div ref="iframe">
                        {this.state.map ? item : null}
                    </div>
                    {this.state.map ? <MapOperation map={this.state.map} datas={this.props.datas} reso={this.props.res} /> : null}
                </div>
                <div className='houseRight' style={{ marginLeft: 30 }}>
                    <WareHouseRight />
                </div>
            </div>
        )
    }
}