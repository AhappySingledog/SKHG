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

class CkList extends React.Component {
    state = {
        ckList: [],
        ckIndex: 0,
        itemIndex: 0,
    }
    componentDidMount() {
        let ck = [
            {
                key: 1, name: '一号仓库', 
                items: [
                    { key: 'CMBLCK_1', name: '第一层' },
                ],
            },
            {
                key: 2, name: '二号仓库', 
                items: [
                    { key: 'CMBLCK_2_1', name: '第一层' },
                    { key: 'CMBLCK_2_2', name: '第二层' },
                ],
            },
            {
                key: 3, name: '三号仓库', 
                items: [
                    { key: 'CMBLCK_3_1', name: '第一层' },
                    { key: 'CMBLCK_3_2', name: '第二层' },
                ],
            },
            {
                key: 4, name: '四号仓库', 
                items: [
                    { key: 'CMBLCK_4_1', name: '第一层' },
                    { key: 'CMBLCK_4_2', name: '第二层' },
                ],
            },
            {
                key: 5, name: '五号仓库', 
                items: [
                    { key: 'CMBLCK_5_1', name: '第一层' },
                ],
            },
            {
                key: 6, name: '六号仓库', 
                items: [
                    { key: 'CMBLCK_6_1', name: '第一层' },
                    { key: 'CMBLCK_6_2', name: '第二层' },
                    { key: 'CMBLCK_6_3', name: '第一层' },
                    { key: 'CMBLCK_6_4', name: '第二层' },
                    { key: 'CMBLCK_6_5', name: '第一层' },
                ],
            },
        ];
        this.setState({ckList: ck});
    }
    componentDidUpdate() {
        let ck = this.state.ckList[this.state.ckIndex];
        publish('setLayerName', ck.name + '-' + ck.items[this.state.itemIndex].name);
        $('#house').css({backgroundSize: '100% 100%'});
    }
    left = () => {
        let index = this.state.itemIndex;
        let length = this.state.ckList[this.state.ckIndex].items.length;
        index = index - 1 < 0 ? length - 1 : index - 1;
        $('#house').addClass('magictime slideLeft animated').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', () => { $('#house').removeClass('magictime slideLeft animated'); this.setState({ itemIndex: index }, () => $('#house').addClass('magictime slideRightRetourn animated').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', () => $('#house').removeClass('magictime slideRightRetourn animated'))); });
    }
    right = () => {
        let index = this.state.itemIndex;
        let length = this.state.ckList[this.state.ckIndex].items.length;
        index = index + 1 >= length ? 0 : index + 1;
        $('#house').addClass('magictime slideRight animated').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', () => { $('#house').removeClass('magictime slideRight animated'); this.setState({ itemIndex: index }, () => $('#house').addClass('magictime slideLeftRetourn animated').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', () => $('#house').removeClass('magictime slideLeftRetourn animated'))); });
    }
    goItemIndex = (index) => {
        let itemIndex = this.state.itemIndex;
        if (index < itemIndex) $('#house').addClass('magictime slideLeft animated').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', () => { $('#house').removeClass('magictime slideLeft animated'); this.setState({ itemIndex: index }, () => $('#house').addClass('magictime slideRightRetourn animated').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', () => $('#house').removeClass('magictime slideRightRetourn animated'))); });
        if (index > itemIndex) $('#house').addClass('magictime slideRight animated').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', () => { $('#house').removeClass('magictime slideRight animated'); this.setState({ itemIndex: index }, () => $('#house').addClass('magictime slideLeftRetourn animated').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', () => $('#house').removeClass('magictime slideLeftRetourn animated'))); });
    }
    goCkIndex = (index) => {
       if (this.state.ckIndex !== index) $('#house').addClass('magictime swashOut animated').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', () => { $('#house').removeClass('magictime swashOut animated'); this.setState({ itemIndex: 0, ckIndex: index }, () => $('#house').addClass('magictime swashIn animated').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', () => $('#house').removeClass('magictime swashIn animated'))); });
    }
    render() {
        let ckList = this.state.ckList;
        return (
            <div style={{width: '100%', height: '100%', overflow: 'hidden'}}>
                <div id='house' style={{ background: "url('../portImages/" + (ckList.length > 0 ? ckList[this.state.ckIndex].items[this.state.itemIndex].key : 'Warehouse') + ".png') no-repeat", width: '100%', height: '100%' }}>
                </div>
                <div className='ckList'>
                    <div className='ckList-ck'>
                        {ckList.map((e, i) => <div key={i} style={{ background: "url('../portImages/00.jpg') no-repeat", backgroundSize: '100% 100%' }} onClick={() => this.goCkIndex(i)}>{this.state.ckIndex === i ? <div className='ckList-ck-select'></div> : null}</div>)}
                    </div>
                    <div className='ckList-left' onClick={this.left}></div>
                    <div className='ckList-right' onClick={this.right}></div>
                    <div className='ckList-cs'>
                        {ckList.length > 0 ? ckList[this.state.ckIndex].items.map((e, i) => <div key={i} className={this.state.itemIndex === i ? 'ckList-cs-select' : 'ckList-cs-normal'} onClick={() => this.goItemIndex(i)}>第{i + 1}层</div>) : null}
                    </div>
                </div>
            </div>
        )
    }
}

// 货仓
export default class WareHouse extends React.Component {
    state = { map: null }
    componentDidMount() {
        if (this.props.datas.type == 3) {
            // publish('webAction', { svn: 'skhg_service', path: 'queryGeomTable', data: { tableName: 'SK_AREA', where: "CODE LIKE '" + this.props.datas.code + "%' AND CK_ID = '3'" } }).then((res) => {
            //     this.setState({ iframes: res[0].data.sort((a, b) => Number(a.gid) > Number(b.gid)) }, () => this.changeIframe($(ReactDOM.findDOMNode(this.refs.iframe)), '../map/index.html?mtype=' + this.state.iframes[0].code));
            // });
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
    render() {
        return (
            <div className='houseMap' style={{ overflow: 'hidden', height: '100%' }}>
                <div className='houseleft'>
                    <div id='warehouse' ref="iframe">
                        <CkList/>
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