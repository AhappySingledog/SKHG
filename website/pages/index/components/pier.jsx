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
import { ViwePager, Tip, Panel, Dialog, ChartView, Table } from '../../../frame/componets/index';
import { Desc, Details } from '../../../frame/componets/details/index';
import BigShipIcon from '../../../res/mapIcon/bigShip.png';
import BargeIcon from '../../../res/mapIcon/Barge.png';
import TruckIcon from '../../../res/mapIcon/car.png';
import VideoIcon from '../images/视频监控.png';
import PierRightPanel from './pierRightPanel';

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
        this.sub_boxView = subscribe('box_Information', this.onIconClick);
        Object.keys(this.props.datas.mapExtent).forEach((key) => {
            this.props.datas.mapExtent[key] = Number(this.props.datas.mapExtent[key]);
        });
        this.props.map.mapOper.setMapExtent(this.props.datas.mapExtent);
        this.handleMTSJ(this.props.datas);

        /** 大船显示 */
        publish('vessel_GetListAsync').then((res) => {
            this.handleBigship(this.ScreenWharf(res[0], this.props.datas.name));
        });

        /** 驳船显示 */
        publish('barge_GetListAsync').then((res) => {
            this.handleBarge(this.ScreenWharf(res[0], this.props.datas.name));
        });

        /** 外拖拖车 */
        publish('truck_GetListAsync').then((res) => {
            this.handleOutcar(this.ScreenWharf(res[0], this.props.datas.name));
        });
    };

    componentWillUnmount() {
        if (this.sub_box) unsubscribe(this.sub_box);
        if (this.sub_boxView) unsubscribe(this.sub_boxView);
        if (this.sub_boxModel) unsubscribe(this.sub_boxModel);
    };
    /** 筛选 */
    ScreenWharf(data, name) {
        let datas = [];
        data.map((value, key) => {
            if (value.terminal === name || value.Terminal === name) {
                datas.push(value);
            }
            if (typeof (value.curstatus) !== "undefined") {
                if (value.curstatus.indexOf(name)) {
                    datas.push(value);
                }
            }
        })
        return datas;
    }

    handleMTSJ = (datas) => {
        if (datas.code === 'SCT') {
            publish('webAction', { svn: 'QUERY_KHSJ', path: 'api/VideoMonitor/GetListAsync', data: {} }).then((res) => {
                let data = JSON.parse(res).filter((e) => e.liveName.indexOf('SCT') >= 0);
                initVideo(data);
                this.setState({ JsonData: data, dataSource: data.map((e, i) => { return { key: i + 1, name: e.name, liveID: e.liveID, liveName: e.liveName } }) });
            });
            let clickVideo = (e) => {
                let url = null;
                let data = null;
                if (typeof (e.attributes) !== 'undefined') {
                    url = 'http://www.cheluyun.com/javascript/zsg?id=' + e.attributes.liveID + '&rtmp=' + e.attributes.rtmpReleaseAddr + '&hls=' + e.attributes.hlsReleaseAddr;
                    data = e.attributes;
                } else {
                    url = 'http://www.cheluyun.com/javascript/zsg?id=' + e.liveID + '&rtmp=' + e.rtmpReleaseAddr + '&hls=' + e.hlsReleaseAddr;
                    data = e;
                }
                publish('playVedio', { url: url, name: data.name });
            }
            let initVideo = (data) => {
                this.props.map.mapDisplay.clearLayer('VIDEO_LAYER');
                let that = this;
                data.forEach((e, i) => {
                    let point = e.coordinate.split(',');
                    let param = {
                        id: 'VIDEO_LAYER' + i,
                        layerId: 'VIDEO_LAYER',
                        src: VideoIcon,
                        width: 140,
                        height: 140,
                        angle: 0,
                        x: point[0],
                        y: point[1],
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
        }
    };

    handleBigship = (json) => {
        let that = this;
        for (let o in json) {
            json[o]['key'] = "" + o + "";
            json[o]['name'] = '大船详情';
            json[o]['colname'] = 'bigship';
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
            json[o]['key'] = "" + o + "";
            json[o]['name'] = '驳船详情';
            json[o]['colname'] = 'bargeship';
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
            json[o]["key"] = "" + o + "";
            json[o]["name"] = "拖车详情";
            json[o]['colname'] = 'outcar';
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
        let bigship = [
            { title: "船东", dataIndex: "shipowner" }, { title: "泊位", dataIndex: "berth" }, { title: "航线", dataIndex: "service" },
            { title: "航次", dataIndex: "voyage" }, { title: "船长", dataIndex: "vessellength" }, { title: "船高", dataIndex: "vesselheight" },
            { title: "吃水", dataIndex: "depth" }, { title: "分线", dataIndex: "qcnums" }, { title: "ETA", dataIndex: "etatime" },
            { title: "ETD", dataIndex: "etdtime" }, { title: "POB", dataIndex: "pobtime" }, { title: "ATB", dataIndex: "atbtime" },
            { title: "ATD", dataIndex: "atdtime" }, { title: "状态", dataIndex: "curstatus" }, { title: "装卸", dataIndex: "ldds", colspan: true },
            { title: "航道", dataIndex: "fairwayname", colspan: true }
        ];
        let bargeship = [
            { title: "船东", dataIndex: "shipowner", colspan: true },
            { title: "进口航次", dataIndex: "voyagein", colspan: true },
            { title: "出口航次", dataIndex: "voyageout", colspan: true },
            { title: "ETA", dataIndex: "etatime", colspan: true },
            { title: "状态", dataIndex: "curstatus", colspan: true }
        ];

        let onyard = [
            { title: "箱号", dataIndex: "containerno" },
            { title: "场位", dataIndex: "YARDCELL" },
            { title: "栏位", dataIndex: "YARDLANENO " },
            { title: "贝位", dataIndex: "YARDBAYNO" },
            { title: "列号", dataIndex: "YARDROWNO" },
            { title: "层高", dataIndex: "YARDTIERNO" },
        ];

        let nocus90 = [
            { title: "箱号", dataIndex: "containerno" },
            { title: "场位", dataIndex: "YARDCELL" },
            { title: "栏位", dataIndex: "YARDLANENO " },
            { title: "贝位", dataIndex: "YARDBAYNO" },
            { title: "列号", dataIndex: "YARDROWNO" },
            { title: "层高", dataIndex: "YARDTIERNO" },
        ];

        if (attr.colname === 'bigship') {
            this.setState({
                desColumns: bigship
            })
        } else if (attr.colname === 'bargeship') {
            this.setState({
                desColumns: bargeship
            })
        } else if (attr.colname === 'onyard') {
            this.setState({
                desColumns: onyard
            })
        } else if (attr.colname === 'nocus90') {
            this.setState({
                desColumns: nocus90
            })
        }

        this.setState({
            desTitle: attr.name,
            desItem: attr,
            isShowDes: true
        });
    }

    /** 箱子的内部信息 */
    onClickBoxmodel = (e) => {
        let pa = [{
            paramName: "P_TERMINALCODE",
            value: this.props.datas.code
        }, {
            paramName: "P_CONTAINERNO",
            value: e.CONTAINERNO
        }];
        publish('webAction', { svn: 'skhg_loader_service', path: 'queryPro', data: { proName: 'P_IMAP_SCCTYARD_BYCNTR', parms: JSON.stringify(pa) } }).then((res) => {
            console.log(res);
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
        this.setState({
            isShowDes: false
        });
    }

    /** 点击右侧的堆存柜量后，订阅过来的数据，做展示出当前堆位的所有场位数据 */
    box = (e) => {
        this.setState({ visible_duiwei: false }, () => this.setState({
            visible_duiwei: true,
            dataSource: e.khsj,
            datajson: e.bdsj,
        }));
    }

    /** 点击查询框的时候，展示当前贝位的数据列表 */
    findBox = (e) => {
        this.setState({ visible_duiwei: false });
        let datajs = this.state.datajson;
        if (typeof (datajs[e]) !== 'undefined') {
            this.setState({
                visible_duiwei: true,
                dataSource: datajs[e],
            });
        } else {
            this.setState({
                visible_duiwei: true,
            });
        }
    };


    /** 点击地图的时候，出现集装箱信息 */
    boxModel = (e) => {
        this.setState({ visible_duiwei: false });
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
            paramName: "P_TERMINALCODE",
            value: this.props.datas.code
        }, {
            paramName: "P_CONTAINERNO",
            value: e.CONTAINERNO
        }];

        let nocus90 = [
            { title: "箱号", dataIndex: "containerno" },
            { title: "ISO代码", dataIndex: "isocode" },
            { title: "栏位", dataIndex: "YARDLANENO " },
            { title: "贝位", dataIndex: "YARDBAYNO" },
            { title: "列号", dataIndex: "YARDROWNO" },
            { title: "层高", dataIndex: "YARDTIERNO" },
        ];

        publish('webAction', { svn: 'skhg_loader_service', path: 'queryPro', data: { proName: 'P_IMAP_SCCTYARD_BYCNTR', parms: JSON.stringify(pa) } }).then((res) => {
            
        });
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
            { title: '场位', name: 'YARDCELL' },
            { title: '栏位', name: 'YARDLANENO' },
            { title: '贝位', name: 'YARDBAYNO' },
            { title: '列号', name: 'YARDROWNO' },
            { title: '层高', name: 'YARDTIERNO' },
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
                            <Table rowNo={true} title={<Title title={'集装箱展示列表'} findDate={this.findBox} id={'a1'} />} style={{ width: 1000, height: 772 }} id={'a1'} selectedIndex={null} flds={shipsFlds} datas={this.state.dataSource} trClick={this.handleDetails.bind(this)} trDbclick={null} />
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
        document.addEventListener("keydown", this.handleEnterKey);
    }

    export = () => {
        console.log(this.props.id);
        table2Excel(this.props.id);
    }
    handleEnterKey = (e) => {
        if (e.keyCode === 13) {
            if ($('#inp').val() !== "" && $('#inp').val() !== 'undefined') {
                this.props.findDate($('#inp').val())
            }
        }
    }

    render() {
        return (
            <div className='tableTitle'>
                <div className='tableTitle-n'>
                    {this.props.title}
                </div>
                <input className='tableTitle-i' id='inp' />
                <div className='tableTitle-f' onClick={() => this.props.findDate($('#inp').val())}>
                </div>
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

    componentWillUnmount() {
        if (this.chart) this.chart.dispose();
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