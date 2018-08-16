import '../less';
import 'animate.css';
import $ from 'jquery';
import moment from 'moment';
import React from 'react';
import ReactDOM from 'react-dom';
import echarts from 'echarts';
import bmap from 'echarts/extension/bmap/bmap';
import { publish, subscribe, unsubscribe } from '../../../frame/core/arbiter';
import WareHouseRight from './wareHouseRight';
import VideoIcon from '../images/视频监控.png';

class MapOperation extends React.Component {
    componentDidMount() {
        let datas = this.props.datas;
        let mapExtent = {
            xmin: Number(datas.xmin),
            xmax: Number(datas.xmax),
            ymin: Number(datas.ymin),
            ymax: Number(datas.ymax),
        }
        this.props.map.mapOper.setMapExtent(mapExtent);
        let drawVideos = (datas) => {
            Promise.all([
                publish('webAction', { svn: 'skhg_stage_service', path: 'queryTableByWhere', data: { tableName: 'IMAP_VIDEO', where: "ENTERPRISENAME='" + datas.ssdw + "'" } }),
                publish('webAction', { svn: 'skhg_service', path: 'queryGeomTable', data: { tableName: 'SK_MONITOR_GIS_N', where: "SSDW='" + datas.ssdw + "'" } }),
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
        videos: [],
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
                    { key: 'CMBLCK_6_3', name: '第三层' },
                    { key: 'CMBLCK_6_4', name: '第四层' },
                    { key: 'CMBLCK_6_5', name: '第五层' },
                ],
            },
        ];
        this.setState({ ckList: ck, ckIndex: this.props.data.datas.ckIndex || 0 }, () => this.getVideosAndDisplayForHouse({}));
        this.sub_getVideosAndDisplayForHouse = subscribe('getVideosAndDisplayForHouse', this.getVideosAndDisplayForHouse);
    }
    getVideosAndDisplayForHouse = (kw) => {
        let ck = this.state.ckList[this.state.ckIndex];
        // let cs = ck[this.state.itemIndex];
        publish('webAction', { svn: 'skhg_service', path: 'queryTableByWhere', data: { tableName: 'SK_MONITOR_HOUSE', where: "CK='" + ck.name + "' AND CS='" + (this.state.itemIndex + 1) + "'" } }).then((res) => {
            let videos = res[0].data.map((e) => { return { name: e.CODE, top: e.TOP, left: e.LEFT, url: e.URL } });
            this.setState({ videos: videos });
        });
    }
    componentDidUpdate() {
        let ck = this.state.ckList[this.state.ckIndex];
        publish('setLayerName', ck.name + '-' + ck.items[this.state.itemIndex].name);
        $('#house').css({ backgroundSize: '100% 100%' });
    }
    left = () => {
        let index = this.state.itemIndex;
        let length = this.state.ckList[this.state.ckIndex].items.length;
        index = index - 1 < 0 ? length - 1 : index - 1;
        $('#house').addClass('magictime slideLeft animated').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', () => { $('#house').removeClass('magictime slideLeft animated'); this.setState({ itemIndex: index }, () => { $('#house').addClass('magictime slideRightRetourn animated').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', () => $('#house').removeClass('magictime slideRightRetourn animated')); this.getVideosAndDisplayForHouse({}); }); });
    }
    right = () => {
        let index = this.state.itemIndex;
        let length = this.state.ckList[this.state.ckIndex].items.length;
        index = index + 1 >= length ? 0 : index + 1;
        $('#house').addClass('magictime slideRight animated').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', () => { $('#house').removeClass('magictime slideRight animated'); this.setState({ itemIndex: index }, () => { $('#house').addClass('magictime slideLeftRetourn animated').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', () => $('#house').removeClass('magictime slideLeftRetourn animated')); this.getVideosAndDisplayForHouse({}); }); });
    }
    goItemIndex = (index) => {
        let indexs = layer.load(1, { shade: [0.5, '#fff'] });
        let itemIndex = this.state.itemIndex;
        if (index < itemIndex) $('#house').addClass('magictime slideLeft animated').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', () => { $('#house').removeClass('magictime slideLeft animated'); this.setState({ itemIndex: index }, () => { $('#house').addClass('magictime slideRightRetourn animated').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', () => $('#house').removeClass('magictime slideRightRetourn animated')); this.getVideosAndDisplayForHouse({}); }); });
        if (index > itemIndex) $('#house').addClass('magictime slideRight animated').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', () => { $('#house').removeClass('magictime slideRight animated'); this.setState({ itemIndex: index }, () => { $('#house').addClass('magictime slideLeftRetourn animated').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', () => $('#house').removeClass('magictime slideLeftRetourn animated')); this.getVideosAndDisplayForHouse({}); }); });

        setTimeout(() => { layer.close(indexs); }, 2500);
    }
    goCkIndex = (index) => {


        let indexs = layer.load(1, { shade: [0.5, '#fff'] });
        if (this.state.ckIndex !== index) $('#house').addClass('magictime swashOut animated').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', () => { $('#house').removeClass('magictime swashOut animated'); this.setState({ itemIndex: 0, ckIndex: index }, () => $('#house').addClass('magictime swashIn animated').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', () => { $('#house').removeClass('magictime swashIn animated'); this.getVideosAndDisplayForHouse({}); })); });

        setTimeout(() => { layer.close(indexs); publish('handleWare', index + 1); }, 2500);
    }
    render() {
        let ckList = this.state.ckList;
        console.log(this.state.videos);
        return (
            <div style={{ width: '100%', height: '100%', overflow: 'hidden' }}>
                {this.state.videos.map((e, i) => <div style={{ top: Number(e.top), left: Number(e.left) }} className='houseVideo' key={i} onClick={() => publish('playVedio', e)}></div>)}
                <div id='house' style={{ background: "url('../portImages/" + (ckList.length > 0 ? ckList[this.state.ckIndex].items[this.state.itemIndex].key : 'Warehouse') + ".png') no-repeat", width: '100%', height: '100%' }}>
                </div>
                <div className='ckList'>
                    <div className='ckList-ck'>
                        {/* {ckList.map((e, i) => <div key={i} style={{ background: "url('../portImages/00.jpg') no-repeat", backgroundSize: '100% 100%' }} onClick={() => this.goCkIndex(i)}>{this.state.ckIndex === i ? <div className='ckList-ck-select'></div> : null}</div>)} */}
                        {ckList.map((e, i) => <div style={{ color: '#fff', fontSize: '60px', textAlign: 'center' }} key={i} onClick={() => this.goCkIndex(i)}>{this.state.ckIndex === i ? <div className='ckList-ck-select'></div> : null}{(i + 1) + "号仓库"}</div>)}
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
    state = {
        map: null,
        ckList: false,
        show: 'none',
        top: 0,
        left: 0,
        width: 0,
        height: 0,
    }
    componentDidMount() {
        this.sub_find_kwh = subscribe('find_kwh', this.find_kwh);
        if (this.props.datas.type == 3) {
            // publish('webAction', { svn: 'skhg_service', path: 'queryGeomTable', data: { tableName: 'SK_AREA', where: "CODE LIKE '" + this.props.datas.code + "%' AND CK_ID = '3'" } }).then((res) => {
            //     this.setState({ iframes: res[0].data.sort((a, b) => Number(a.gid) > Number(b.gid)) }, () => this.changeIframe($(ReactDOM.findDOMNode(this.refs.iframe)), '../map/index.html?mtype=' + this.state.iframes[0].code));
            // });
            this.setState({ ckList: true });
        }
        else {
            this.changeIframe($(ReactDOM.findDOMNode(this.refs.iframe)), '../map/index.html?mtype=' + this.props.datas.code);
        }
    }

    find_kwh = (e) => {
        const sbjson = {
            101: { top: 996, left: 670, width: 817, height: 1589 },
            102: { top: 996, left: 1490, width: 817, height: 1589 },
            103: { top: 996, left: 2300, width: 817, height: 1589 },
            104: { top: 996, left: 3110, width: 817, height: 1589 },
            105: { top: 996, left: 4150, width: 817, height: 1589 },
            106: { top: 996, left: 4960, width: 817, height: 1589 },
            107: { top: 996, left: 5770, width: 817, height: 1589 },

            201: { top: 545, left: 1387, width: 1030, height: 1520 },
            202: { top: 545, left: 2423, width: 1300, height: 1535 },
            203: { top: 545, left: 3747, width: 1300, height: 1535 },
            204: { top: 545, left: 5060, width: 1300, height: 1535 },
            208: { top: 1285, left: 1145, width: 2735, height: 805 },
            209: { top: 1285, left: 3878, width: 2735, height: 805 },

            304: { top: 920, left: 650, width: 1275, height: 1285 },
            303: { top: 920, left: 1950, width: 1520, height: 1285 },
            302: { top: 920, left: 3495, width: 1520, height: 1285 },
            301: { top: 920, left: 5035, width: 1520, height: 1285 },
            305: { top: 880, left: 5085, width: 1330, height: 1340 },
            306: { top: 880, left: 3485, width: 1590, height: 1340 },
            307: { top: 880, left: 1870, width: 1590, height: 1340 },
            308: { top: 880, left: 520, width: 1330, height: 1340 },

            401: { top: 1000, left: 1195, width: 1210, height: 1223 },
            402: { top: 1000, left: 2405, width: 1195, height: 1223 },
            403: { top: 1000, left: 3605, width: 1195, height: 1223 },
            404: { top: 1000, left: 4805, width: 1195, height: 1223 },
            405: { top: 1000, left: 6015, width: 1195, height: 1223 },
            407: { top: 1000, left: 1250, width: 1150, height: 1170 },
            408: { top: 1000, left: 2410, width: 1150, height: 1170 },
            409: { top: 1000, left: 3570, width: 1150, height: 1170 },
            410: { top: 1000, left: 4730, width: 1150, height: 1170 },
            411: { top: 1000, left: 5890, width: 1150, height: 1170 },

            501: { top: 788, left: 4850, width: 1285, height: 1295 },
            502: { top: 788, left: 3565, width: 1285, height: 1295 },
            503: { top: 788, left: 2275, width: 1285, height: 1295 },
            504: { top: 788, left: 988, width: 1285, height: 1295 },

            611: { top: 1611, left: 2161, width: 1880, height: 620 },
            612: { top: 785, left: 2164, width: 1880, height: 820 },
            613: { top: 1611, left: 4050, width: 1880, height: 620 },
            614: { top: 785, left: 4050, width: 1880, height: 820 },

            621: { top: 1680, left: 1830, width: 2195, height: 975 },
            622: { top: 697, left: 1830, width: 2195, height: 975 },
            623: { top: 1680, left: 4046, width: 2195, height: 975 },
            624: { top: 697, left: 4046, width: 2195, height: 975 },

            631: { top: 1680, left: 1830, width: 2195, height: 975 },
            632: { top: 697, left: 1830, width: 2195, height: 975 },
            633: { top: 1680, left: 4046, width: 2195, height: 975 },
            634: { top: 697, left: 4046, width: 2195, height: 975 },

            641: { top: 1680, left: 1830, width: 2195, height: 975 },
            642: { top: 697, left: 1830, width: 2195, height: 975 },
            643: { top: 1680, left: 4046, width: 2195, height: 975 },
            644: { top: 697, left: 4046, width: 2195, height: 975 },

            651: { top: 1680, left: 1830, width: 2195, height: 975 },
            652: { top: 697, left: 1830, width: 2195, height: 975 },
            653: { top: 1680, left: 4046, width: 2195, height: 975 },
            654: { top: 697, left: 4046, width: 2195, height: 975 },
        };
        let ms = e['LOCATION_TS'] ? e['LOCATION_TS'].match(/\d+/g) : e;
        this.setState({
            top: sbjson[ms] ? sbjson[ms].top : 0,
            left: sbjson[ms] ? sbjson[ms].left : 0,
            width: sbjson[ms] ? sbjson[ms].width : 0,
            height: sbjson[ms] ? sbjson[ms].height : 0,
            show: null
        })
    }

    componentWillMount() {
        if (this.sub_find_kwh) unsubscribe(this.sub_find_kwh);
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
                $ifrme.css({ visibility });
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
                        {this.state.ckList ? <CkList data={this.props} /> : null}
                    </div>
                    {this.state.map ? <MapOperation map={this.state.map} datas={this.props.datas} reso={this.props.res} /> : null}
                </div>
                <div style={{ width: Number(this.state.width), height: Number(this.state.height), 'position': 'absolute', background: 'rgba(0,0,0,0.6)', display: this.state.show, top: Number(this.state.top), left: Number(this.state.left) }}></div>
                <div className='houseRight' style={{ marginLeft: 30 }}>
                    <WareHouseRight datas={this.props.datas} type={this.props.datas.type} />
                </div>
            </div>
        )
    }
}