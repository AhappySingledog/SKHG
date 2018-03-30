import '../less';
import 'animate.css';
import _ from 'lodash';
import $ from 'jquery';
import moment from 'moment';
import React from 'react';
import ReactDOM from 'react-dom';
import echarts from 'echarts';
import bmap from 'echarts/extension/bmap/bmap';
import { table2Excel } from '../../../frame/core/table2Excel';
import { subscribe, unsubscribe, publish } from '../../../frame/core/arbiter';
import { ViwePager, Tip, Panel, Dialog, ChartView, Table } from '../../../frame/componets/index';
import { Desc, Details } from '../../../frame/componets/details/index';
import BigShipIcon from '../../../res/mapIcon/bigShip.png';
import BargeIcon from '../../../res/mapIcon/Barge.png';
import TruckIcon from '../../../res/mapIcon/car.png';
import VideoIcon from '../images/视频监控.png';
import PierRightPanel from './pierRightPanel';
import zb from '../images/倒三角.png';

/** 计算数量得到小数点和前面加0 */
function toArray(str) {
    let arr = [];
    if (str > 10 || str === 0) {
        for (var i = 0, j = str.length; i < j; i++) { arr.push(str[i]) }
    } else {
        for (var i = 0, j = str.length; i < j; i++) {
            arr.push(0)
            arr.push(str[i])
        }
    }
    return arr;
}

function getNumberArr(num) {
    let nums = [], arrs = (num + '').split('.').map(toArray);
    if (arrs[0].length > 0) {
        let arr = arrs[0], m = arr.length % 3;
        for (var i = 0, j = arr.length; i < j; i++) { let n = i - m; if (i > 0 && n >= 0 && n % 3 === 0) nums.push('break'); nums.push(arr[i]); }
    }
    else nums.push('0');
    if (arrs[1] && arrs[1].length > 0) { nums.push('point'); nums = nums.concat(arrs[1]) }
    return nums;
}

// 地图操作组件
class MapOperation extends React.Component {
    state = {
        showMT: false,
        dataSource: [],
        datajson: [],
        tip: {
            showtip: false,
            mtJson: [],
            isShowDes: false,
            desTitle: '显示详情',
            desItem: {},
            desColumns: [],
        },
        visible_duiwei: false,
    }

    componentDidMount() {
        this.sub_box = subscribe('box', this.box);
        this.sub_boxModel = subscribe('box_model', this.boxModel);
        this.sub_location = subscribe('box_location', this.handleNbr);
        this.sub_onIconClick = subscribe('box_onIconClick', this.onIconClick);
        this.sub_handleCloseDesDailog = subscribe('box_handleCloseDesDailog', this.handleCloseDesDailog);
        Object.keys(this.props.datas.mapExtent).forEach((key) => this.props.datas.mapExtent[key] = Number(this.props.datas.mapExtent[key]));
        this.props.map.mapOper.setMapExtent(this.props.datas.mapExtent);
        publish('webAction', { svn: 'skhg_service', path: 'queryGeomTable', data: { tableName: 'SK_AREA', where: "SSDW='" + this.props.datas.code + "' AND LAYER=3" } }).then((res) => {
            const color = {
                1: [250, 22, 80, 1],       // 红色
                2: [57, 255, 95, 1],       // 绿色
                3: [255, 255, 255, 1],       // 蓝色
                4: [251, 251, 0, 1],       // 黄色
            };
            res[0].data.forEach((e, i) => {
                let dots = e.geom.rings[0].map((p) => { return { x: p[0], y: p[1] }; });
                let params = {
                    id: 'port_view_' + i,
                    linecolor: color[e.type],
                    layerId: 'port_view',
                    dots: dots,
                    attr: { ...e },
                    click: () => publish('changeLayer', { index: 3, props: { datas: e } }),
                    linewidth: 6,
                }
                this.props.map.mapDisplay.polygon(params);
            });
            if (this.props.datas.type == 1) {
                /** 大船显示 */
                publish('vessel_GetListAsync').then((res) => this.handleBigship(this.ScreenWharf(res[0], this.props.datas.name)));
                /** 驳船显示 */
                publish('barge_GetListAsync').then((res) => this.handleBarge(this.ScreenWharf(res[0], this.props.datas.name)));
                /** 外拖拖车 */
                publish('truck_GetListAsync').then((res) => this.handleOutcar(this.ScreenWharf(res[0], this.props.datas.name)));
            }
            this.drawVideos(this.props.datas);
        });
    }

    componentWillUnmount() {
        if (this.sub_box) unsubscribe(this.sub_box);
        if (this.sub_boxModel) unsubscribe(this.sub_boxModel);
        if (this.sub_location) unsubscribe(this.sub_location);
        if (this.sub_onIconClick) unsubscribe(this.sub_onIconClick);
        if (this.sub_handleCloseDesDailog) unsubscribe(this.sub_handleCloseDesDailog);
        this.props.map.mapDisplay.clearLayer('box_view');
        this.props.map.mapDisplay.clearLayer('TRUCK_LAYER');
        this.props.map.mapDisplay.clearLayer('BIG_SHIP_LAYER');
        this.props.map.mapDisplay.clearLayer('BARGE_SHIP_LAYER');
        this.props.map.mapDisplay.clearLayer('CONTAINERVIEW_LAYER');
        this.props.map.mapDisplay.clearLayer('CONTAINERVIEW_LAYER_BOX');
        this.props.map.mapDisplay.clearLayer('VIDEO_LAYER');
    }
    /** 筛选 */
    ScreenWharf(data, name) {
        let datas = [];
        data.map((value, key) => {
            if (value.terminal === name || value.Terminal === name) datas.push(value);
            if (typeof (value.curstatus) !== 'undefined' && value.curstatus.indexOf(name)) datas.push(value);
        })
        return datas;
    }

    drawVideos = (datas) => {
        console.log(datas.code);
        Promise.all([
            publish('webAction', { svn: 'skhg_stage_service', path: 'queryTableByWhere', data: {tableName: 'IMAP_VIDEO', where: "ENTERPRISENAME='" + datas.code + "'"} }),
            publish('webAction', { svn: 'skhg_service', path: 'queryGeomTable', data: {tableName: 'SK_MONITOR_GIS', where: "SSDW='" + datas.code + "'"} }),
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

    handleBigship = (json) => {
        let that = this;
        for (let o in json) {
            json[o].key = '' + o;
            json[o].name = '大船详情';
            json[o].colname = 'bigship';
            if (Number(json[o].longitude) !== 0 && Number(json[o].latitude) !== 0) {
                let param = {
                    id: 'BIG_SHIP_LAYER' + o,
                    layerId: 'BIG_SHIP_LAYER',
                    src: BigShipIcon,
                    width: 70,
                    height: 140,
                    angle: (Number(json[o].heading) / 100) - 90,
                    x: json[o].longitude,
                    y: json[o].latitude,
                    attr: { ...json[o] },
                    click: this.onIconClick,
                    mouseover: function (g) {
                        let symbol = g.symbol;
                        if (symbol.setWidth) {
                            symbol.setWidth(70 + 9);
                            symbol.setHeight(140 + 36);
                        }
                        g.setSymbol(symbol);
                        let param2 = {
                            id: 'BIG_SHIP_LAYER',
                            layerId: 'BIG_SHIP_LAYER_HOVERTEXT',
                            x: g.geometry.x,
                            y: g.geometry.y,
                            text: g.attributes.cshipname || g.attributes.shipname,
                            size: '10pt',
                            color: 'red',
                            offsetX: 0,
                            offsetY: 132,
                            visible: true,
                            layerIndex: 10,
                        }
                        that.props.map.mapDisplay.text(param2);
                    },
                    mouseout: function (g) {
                        let symbol = g.symbol;
                        if (symbol.setWidth) {
                            symbol.setWidth(70);
                            symbol.setHeight(140);;
                        }
                        g.setSymbol(symbol);
                        that.props.map.mapDisplay.clearLayer('BIG_SHIP_LAYER_HOVERTEXT');
                    }
                }
                this.props.map.mapDisplay.image(param);
            }
        }
    }

    handleBarge = (json) => {
        let that = this;
        for (let o in json) {
            json[o].key = '' + o;
            json[o].name = '驳船详情';
            json[o].colname = 'bargeship';
            if (Number(json[o].longitude) !== 0 && Number(json[o].latitude) !== 0) {
                let param = {
                    id: 'BARGE_SHIP_LAYER' + o,
                    layerId: 'BARGE_SHIP_LAYER',
                    src: BargeIcon,
                    width: 70,
                    height: 140,
                    angle: (Number(json[o].heading) / 100) - 90,
                    x: json[o].longitude,
                    y: json[o].latitude,
                    attr: { ...json[o] },
                    click: this.onIconClick,
                    mouseover: function (g) {
                        let symbol = g.symbol;
                        if (symbol.setWidth) {
                            symbol.setWidth(70 + 9);
                            symbol.setHeight(140 + 36);
                        }
                        g.setSymbol(symbol);
                        let param2 = {
                            id: 'BARGE_SHIP_LAYER',
                            layerId: 'BARGE_SHIP_HOVERTEXT',
                            x: g.geometry.x,
                            y: g.geometry.y,
                            text: g.attributes.cshipname || g.attributes.shipname,
                            size: '10pt',
                            color: 'red',
                            offsetX: 0,
                            offsetY: 132,
                            visible: true,
                            layerIndex: 10,
                        }
                        that.props.map.mapDisplay.text(param2);
                    },
                    mouseout: function (g) {
                        let symbol = g.symbol;
                        if (symbol.setWidth) {
                            symbol.setWidth(70);
                            symbol.setHeight(140);
                        }
                        g.setSymbol(symbol);
                        that.props.map.mapDisplay.clearLayer('BARGE_SHIP_HOVERTEXT');
                    }
                }
                this.props.map.mapDisplay.image(param);
            }
        }
    }


    handleOutcar = (json) => {
        let that = this;
        for (let o in json) {
            json[o].key = '' + o;
            json[o].name = '拖车详情';
            json[o].colname = 'outcar';
            if (Number(json[o].lon) !== 0 && Number(json[o].lat) !== 0) {
                let param = {
                    id: 'TRUCK_LAYER' + o,
                    layerId: 'TRUCK_LAYER',
                    src: TruckIcon,
                    width: 69,
                    height: 34,
                    x: json[o].Curlng,
                    y: json[o].Curlat,
                    attr: { ...json[o] },
                    click: this.onIconClick,
                    layerIndex: 30,
                    mouseover: (g) => {
                        let symbol = g.symbol;
                        if (symbol.setWidth) {
                            symbol.setWidth(69 + 36);
                            symbol.setHeight(34 + 9);
                        }
                        g.setSymbol(symbol);
                        let param2 = {
                            id: 'TRUCK_LAYER',
                            layerId: 'TRUCK_LAYER_HOVERTEXT',
                            x: g.geometry.x,
                            y: g.geometry.y,
                            text: g.attributes.Truckno,
                            size: '10pt',
                            offsetX: 0,
                            offsetY: 110,
                            visible: true,
                            layerIndex: 20,
                        }
                        that.props.map.mapDisplay.text(param2);
                    },
                    mouseout: (g) => {
                        let symbol = g.symbol;
                        if (symbol.setWidth) {
                            symbol.setWidth(69);
                            symbol.setHeight(34);
                        }
                        g.setSymbol(symbol);
                        that.props.map.mapDisplay.clearLayer('TRUCK_LAYER_HOVERTEXT');
                    }
                }
                this.props.map.mapDisplay.image(param);
            }

        };
    }


    /** 图标点击事件 */
    onIconClick = (e) => {
        this.setState({ isShowDes: false });
        let attr = e.attributes;
        publish('tableName_find').then((res) => {
            res[0].features.forEach((value, key) => {
                if (value.type === attr.colname) {
                    this.setState({
                        desColumns: value.talbe,
                        desTitle: attr.name,
                        desItem: attr,
                        isShowDes: true
                    });
                }
            });
        });
    }

    /** 鼠标移入事件 */
    toolTipIn = (e) => {
        let datajson = e.attributes;
        this.setState({
            showMT: true,
            tip: {
                showtip: true,
                mtJson: datajson,
            }
        });
    }

    /**
    * 取消关闭详情框
    */
    handleCloseDesDailog = (e) => {
        this.setState({ isShowDes: false });
    }

    /** 点击右侧的堆存柜量后，订阅过来的数据，做展示出当前堆位的所有场位数据 */
    box = (e) => {
        this.setState({ visible_duiwei: false }, () => this.setState({
            visible_duiwei: true,
            dataSource: e.khsj,
            datajson: e.bdsj,
        }));
        this.old_khsj = e.khsj;
        this.old_bdsj = e.bdsj;
    }

    /** 点击查询框的时候，展示当前贝位的数据列表 */
    findBox = (e) => {
        let khsj = this.old_khsj;
        let bdsj = this.old_bdsj;
        let new_data = {};
        if (0 < e.length && e.length < 3 && e.trim() !== '') {
            khsj = khsj.filter((d) => d.YARDROWNO === e);
            this.setState({
                dataSource: khsj,
            });
        } else if (2 < e.length && e.length < 4 && e.trim() !== '') {
            khsj = khsj.filter((d) => d.YARDBAYNO === e);
            this.setState({
                dataSource: khsj,
            });
        } else if (4 < e.length && e.trim() !== '') {
            if (typeof (bdsj[e]) !== 'undefined') {
                this.setState({
                    dataSource: bdsj[e],
                });
            }
        } else if (e.trim() === '') {
            this.setState({
                dataSource: this.old_khsj,
            });
        }
    };


    /** 点击地图的时候，出现集装箱信息 */
    boxModel = (e) => {
        this.setState({ visible_duiwei: false, isShowDes: false });
        let attr = e.attributes;
        let data = Object.keys(attr).map((key, i) => attr[key]);
        data = data.filter((d) => d.YARDLANENO);
        data.sort((a, b) => Number(a.YARDLANENO) - Number(b.YARDLANENO));
        this.setState({
            visible_duiwei: true,
            dataSource: data,
        });
    }

    /** 点击场位后，展现详细信息 */
    handleDetails = (e) => {
        let pa = [{
            paramName: 'P_TERMINALCODE',
            value: this.props.datas.code
        }, {
            paramName: 'P_CONTAINERNO',
            value: e.CONTAINERNO
        }];
        this.handleNbr(e);
        publish('webAction', { svn: 'skhg_loader_service', path: 'queryPro', data: { proName: 'P_IMAP_SCCTYARD_BYCNTR', parms: JSON.stringify(pa) } }).then((res) => {
            let json = {};
            e['colname'] = 'onyard';
            e['name'] = '柜子';
            let obj = Object.assign(res[0].data.CUR_A[0], e);
            json['attributes'] = obj;
            this.onIconClick(json);
        });
    }
    /** 关闭集装箱查询窗口 */
    handleCloseTitle() {
        this.setState({ visible_duiwei: false, isShowDes: false });
    }


    /** 缩放和指示位置 */
    handleNbr = (e) => {
        this.props.map.mapDisplay.clearLayer('box_view');
        this.props.map.mapDisplay.clearLayer('CONTAINERVIEW_LAYER');
        this.props.map.mapDisplay.clearLayer('CONTAINERVIEW_LAYER_BOX');
        let js = e.YARDLANENO + e.YARDBAYNO + e.YARDROWNO;
        publish('webAction', { svn: 'skhg_service', path: 'queryGeomTable', data: { tableName: 'GIS_CCT', where: "SSDW like '%" + this.props.datas.code + "' and NAME LIKE '" + e.YARDLANENO + "%'    " } }).then((ors) => {
            let orsJson = {};
            for (let i in ors[0].data) {
                orsJson[ors[0].data[i].name] = [ors[0].data[i]];
            }
            if (orsJson !== "") {
                let dots = orsJson[js][0].geom.rings[0].map((p) => { return { x: p[0], y: p[1] }; });
                let points = dots.slice(0, 4);
                let x = points[0].x + points[1].x + points[2].x + points[3].x;
                let y = points[0].y + points[1].y + points[2].y + points[3].y;
                let mText = {
                    id: 'text_box',
                    layerId: 'CONTAINERVIEW_LAYER_BOX',
                    x: x / 4,
                    y: (y / 4) + 0.00004,
                    src: zb,
                    width: 48,
                    height: 48,
                    layerIndex: 30,
                };
                let params = {
                    id: 'box_view' + orsJson[js],
                    linecolor: [255, 0, 0, 1],
                    fillcolor: [255, 0, 0, 1],
                    layerId: 'CONTAINERVIEW_LAYER',
                    dots: dots,
                    linewidth: 0,
                }
                let point = { x: x / 4, y: y / 4 };
                const level = 5;
                this.props.map.mapOper.centerAndZoom(point, level);
                this.props.map.mapDisplay.image(mText);
                this.props.map.mapDisplay.polygon(params);
            } else {
                alert("没有地址~");
            }
        })
    }

    render() {
        let { tip = {} } = this.state;
        let descmsg = <Details columns={this.state.desColumns} columnTotal={2} item={this.state.desItem}></Details>;
        let StyleView = {
            'bottom': '5%',
            'right': '0',
            'animation': 'showAnimete 0.5s ease',
            'transformOrigin': 'right center ',
        };
        const shipsFlds = [
            { title: '场位', dataIndex: 'YARDCELL' },
            { title: '栏位', dataIndex: 'YARDLANENO' },
            { title: '贝位', dataIndex: 'YARDBAYNO' },
            { title: '列号', dataIndex: 'YARDROWNO' },
            { title: '层高', dataIndex: 'YARDTIERNO' },
        ];

        return (
            <div>
                {/* {this.state.isShowDes ? <Desc className='descTip' title={this.state.desTitle} content={<div className='test-tip'></div>} close={this.handleCloseDesDailog} /> : null} */}
                {this.state.isShowDes ? <Desc className='descTip' style={StyleView} title={this.state.desTitle} content={descmsg} close={this.handleCloseDesDailog} /> : null}
                {
                    this.state.showMT ? <div className="portTip animated" > </div> : null
                }
                {
                    this.state.visible_duiwei ? <div className="box_model">
                        <div style={{ width: '100%', background: '#051658' }} >
                            <Table rowNo={true} title={<Title title={'集装箱展示列表'} findDate={this.findBox} id={'a1'} onClose={this.handleCloseTitle} />} style={{ width: 1200, height: 772 }} id={'a1'} selectedIndex={null} flds={shipsFlds} datas={this.state.dataSource} trClick={this.handleDetails.bind(this)} trDbclick={null} />
                        </div>
                    </div> : null
                }
            </div>
        )
    }
}


/** 内部信息 */
class PortMsg extends React.Component {
    state = {
        showTip: false,
    }
    render() {
        const { showtip, mtJson = [] } = this.props.msg;
        const sum = [];
        const bc = [];
        const dc = [];
        mtJson.data.map((value, key) => {
            sum.push(getNumberArr((value.aisBarge) + (value.aisBigShip)));
            dc.push(getNumberArr(value.aisBigShip));
            bc.push(getNumberArr(value.aisBarge));
        })
        return (
            <div id="msgs" className="Msg">
                <div className="Msg-title" ></div>
                <div className="Msg-row">
                    {mtJson.data.map((value, key) =>
                        <div id={"dsadsadsa" + key} key={key} className="Msg-row-flex">
                            <div className="Msg-row-flex-InShip">
                                <span>{value.harbor}</span>
                                <div className='number-view'>
                                    {sum[key].map((num, i) => { return <div key={i} className={'number-' + num}></div> })}
                                </div>
                            </div>
                            <div className="Msg-row-flex-InBigShip">
                                <span>{value.shipname}</span>
                                <div className="Msg-row-flex-InBigShip-val">
                                    <span>{bc[key]}</span>
                                    <span>{dc[key]}</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        )
    }
}

/** 标题 */
class Title extends React.Component {
    componentDidMount() {
        document.addEventListener('keydown', this.handleEnterKey);
    }

    export = () => {
        table2Excel(this.props.id);
    }
    handleEnterKey = (e) => {
        if (e.keyCode === 13) {
            this.props.findDate($('#inp').val())
        }
    }

    render() {
        return (
            <div className='tableTitle'>
                <div className='tableTitle-n'>
                    {this.props.title}
                </div>
                <input className='tableTitle-i' id='inp' />
                <div className='tableTitle-f' onClick={() => this.props.findDate($('#inp').val())}></div>
                <div className='tableTitle-c' onClick={() => this.props.onClose()}></div>
            </div>
        )
    }
}

/** 饼状图 */
class PortPie extends React.Component {
    state = {}
    componentDidMount() {
        publish('port_pie_gk').then((res) => {
            if (this.chart) this.chart.dispose();
            this.chart = echarts.init(ReactDOM.findDOMNode(this.refs.echart1));
            this.chart.setOption(res[0]);
        });
        publish('port_pie_zk').then((res) => {
            if (this.charts) this.charts.dispose();
            this.charts = echarts.init(ReactDOM.findDOMNode(this.refs.echart2));
            this.charts.setOption(res[0]);
        });
    }

    render() {
        return (
            <div className="Pie">
                {/* <ChartView scr='port_pie_gk_scr' sub='port_pie_gk' options={true} /> */}
                {/* <ChartView scr='port_pie_zk_scr' sub='port_pie_zk' options={true} /> */}
                <Panel style={{ flexGrow: 1, paddingTop: 60 }}>
                    <div className='homeRightE' style={{ width: 1015, height: 800, paddingBottom: 30 }}>
                        <div className='homeRightE-l' style={{ height: '50%' }} ref="echart1"></div>
                        <div className='homeRightE-l' style={{ height: '50%' }} ref="echart2"></div>
                    </div>
                </Panel>
            </div>
        )
    }
}
// 码头
export default class Pier extends React.Component {
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
        let { tview = [], idx = 0, } = this.state;
        return (
            <div className='pierMap' style={{ overflow: 'hidden', height: '100%' }}>
                <div className='pierleft'>
                    <div ref="iframe"></div>
                    {this.state.map ? <MapOperation map={this.state.map} datas={this.props.datas} /> : null}
                </div>
                <div className='pierRight' style={{ marginLeft: 30 }}>
                    <PierRightPanel datas={this.props.datas} map={this.state.map} />
                </div>
            </div>
        )
    }
}