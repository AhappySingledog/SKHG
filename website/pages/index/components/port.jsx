import '../less';
import 'animate.css';
import _ from 'lodash';
import $ from 'jquery';
import moment from 'moment';
import React from 'react';
import ReactDOM from 'react-dom';
import echarts from 'echarts';
import bmap from 'echarts/extension/bmap/bmap';
import PortRightPanel from './portRightPanel';
import { subscribe, unsubscribe, publish } from '../../../frame/core/arbiter';
import { ViwePager, NoHornTip, Table, Panel, Dialog, ChartView } from '../../../frame/componets/index';
import { Desc, Details } from '../../../frame/componets/details/index';
import BigShipIcon from '../../../res/mapIcon/bigShip.png';
import BargeIcon from '../../../res/mapIcon/Barge.png';
import TruckIcon from '../../../res/mapIcon/car.png';
import yl from '../../../res/mapIcon/游轮.png';

/** 计算数量得到小数点和前面加0 */
function toArray(str) {
    let arr = [];
    if (str >= 10 || str === 0) {
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
        showMT: false,      //码头弹出框
        Amap: false,        //园区、仓库等弹出框
        jiasuju: {},
        //图标点击事件
        icon: {
            isShowDes: false,
            desTitle: '显示详情',
            desItem: {},
            desColumns: [],
        },
        //替补框内容
        tip: {
            mtJson: [],     //后台请求的码头数据
            mapDesc: [],   //勾画出码头页面信息
        },
        /** 假数据 */
        mocksJS: null,
        /** ------- */
        SHIP_CRUISE: true,
        SHIP_LAYER: true,
        BARGE_SHIP_LAYER: true,
        map: true,
    }

    componentDidMount() {
        let mapExtent = {
            xmax: 113.96063309,
            xmin: 113.81710400,
            ymax: 22.49214402,
            ymin: 22.44131873,
        };
        // console.log(this.props.map);
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
                    mouseover: (g) => {
                        this.toolTipIn(g)
                    },
                    mouseout: (g) => {
                        this.setState({
                            showMT: false,
                            Amap: false,
                        });
                        this.props.map.mapDisplay.clearLayer('port_view1');
                    },
                }
                this.props.map.mapDisplay.polygon(params);
            });
        });

        // let insertArea = () => {// 插入区域信息
        //     $.ajax({
        //         dataType: 'json', url: '../test.json', async: false, success: (res) => {
        //             let a = res.features.map((e, i) => {
        //                 return {
        //                     attr: {
        //                         NAME: e.attributes.name,
        //                         CODE: e.name || '',
        //                         TYPE: '',
        //                         SSDW: '',
        //                         SSDWNAME: '',
        //                         XMIN: '',
        //                         XMAX: '',
        //                         YMIN: '',
        //                         YMAX: '',
        //                         LAYER: '',
        //                     },
        //                     geom: e.geometry
        //                 };
        //             });
        //             console.log(a);
        //             publish('webAction', { svn: 'skhg_service', type: 'post', path: 'insertArea', data: { datas: JSON.stringify(a) } }).then((res) => {
        //                 console.log(res);
        //             });
        //         }
        //     });
        // }

        // insertArea();

        /** 大船显示 */
        publish('vessel_GetListAsync').then((res) => {
            this.handleBigship(res[0]);
        })

        /** 驳船显示 */
        publish('barge_GetListAsync').then((res) => {
            this.handleBarge(res[0]);
        })

        /** 游轮显示 */
        publish('webAction', { svn: 'skhg_loader_service', path: 'queryTableByWhere', data: { tableName: 'YLMG_SHIP', where: '1=1' } }).then((res) =>{
            this.handleCruise(res[0].data);
        })

        /** 假数据---其他的 */
        publish('map_view_init').then((res) => {
            this.setState({
                mocksJS: res[0]
            })
        })
    }

    handleCruise = (json) =>{
        let that = this;
        for (let o in json) {
            json[o].key = "" + o + "";
            json[o].name = '游轮详情';
            json[o].colname = 'cruise';
            let param = {
                id: 'SHIP_CRUISE' + o,
                layerId: 'SHIP_CRUISE',
                src: yl,
                width: 140,
                height: 140,
                // angle: (Number(json[o].HEADING) / 100) - 90,
                x: json[o].LONGITUDE,
                y: json[o].LATITUDE,
                attr: { ...json[o] },
                click: this.onIconClick,
                mouseover: function (g) {
                    let symbol = g.symbol;
                    if (symbol.setWidth) {
                        symbol.setWidth(140 + 9);
                        symbol.setHeight(140 + 36);
                    }
                    g.setSymbol(symbol);
                    let param2 = {
                        id: 'SHIP_CRUISE',
                        layerId: 'SHIP_CRUISE_HOVERTEXT',
                        x: g.geometry.x,
                        y: g.geometry.y,
                        text: g.attributes.SHIPNAME_EN || g.attributes.SHIPNAME_CN,
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
                        symbol.setWidth(140);
                        symbol.setHeight(140);
                    }
                    g.setSymbol(symbol);
                    that.props.map.mapDisplay.clearLayer('SHIP_CRUISE_HOVERTEXT');
                }
            }
            this.props.map.mapDisplay.image(param);
            this.props.map.mapDisplay.hide("SHIP_CRUISE");
        }
    }

    handleBigship = (json) => {
        let that = this;
        for (let o in json) {
            json[o]['key'] = "" + o + "";
            json[o]['name'] = '大船详情';
            json[o]['colname'] = 'bigship';
            if (Number(json[o].longitude) !== 0 && Number(json[o].latitude) !== 0) {
                let param = {
                    id: 'SHIP_LAYER' + o,
                    layerId: 'SHIP_LAYER',
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
                            symbol.setHeight(140);
                        }
                        g.setSymbol(symbol);
                        that.props.map.mapDisplay.clearLayer('BIG_SHIP_LAYER_HOVERTEXT');
                    }
                }
                this.props.map.mapDisplay.image(param);
                this.props.map.mapDisplay.hide("SHIP_LAYER");
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
                this.props.map.mapDisplay.hide("BARGE_SHIP_LAYER");
            }
        }
    }

    /** 图标点击事件 */
    onIconClick = (e) => {
        this.setState({ isShowDes: false });
        let attr = e.attributes;
        publish('tableName_find').then((res) => {
            let temp = {};
            res[0].features.forEach((value, key) => temp[value.type] = value.table);
            this.setState(temp);
            this.setState({
                desColumns: temp[attr.colname],
                desTitle: attr.name,
                desItem: attr,
                isShowDes: true
            });
        });
    }

    /** 鼠标移入事件 */
    toolTipIn = (e) => {
        let datajson = e.attributes;
        let dots = datajson.geom.rings[0].map((p) => { return { x: p[0], y: p[1] }; });
        let params = {
            id: 'port_view1',
            layerId: 'port_view1',
            fillcolor: [255, 133, 71, 1],
            dots: dots,
            linewidth: 6,
        }
        this.props.map.mapDisplay.polygon(params);
        publish('getData', { svn: 'skhg_stage', tableName: 'SCCT_2RD', data: { where: "TERMINALCODE = '" + datajson.code + "' " } }).then((res) => {
            if (datajson.name.indexOf('码头') >= 0) {
                this.setState({
                    showMT: true,
                    Amap: false,
                    tip: {
                        mtJson: res[0].features,
                        mapDesc: datajson
                    }
                });
            } else if (datajson.name === '赤湾港航') {
                this.setState({
                    showMT: true,
                    Amap: false,
                    tip: {
                        mtJson: res[0].features,
                        mapDesc: datajson
                    }
                });
            } else {
                let datas = this.state.mocksJS;
                for (let a in datas) {
                    if (datas[a].code === datajson.code) {
                        this.setState({
                            showMT: false,
                            Amap: true,
                            tip: {
                                mtJson: datas[a],
                                mapDesc: datajson
                            },
                        });
                    }
                }
            }
        }
        );

    }

    /** 地图内容展示状态切换 */
    mapItemsDisplay = (key) => {
        let flag = !this.state[key];
        this.setState({ [key]: flag }, () => {
            flag ? this.props.map.mapDisplay.hide(key) : this.props.map.mapDisplay.show(key);
        });
    }

    render() {
        let { tip = {} } = this.state;
        let descmsg = <Details columns={this.state.desColumns} columnTotal={2} item={this.state.desItem}></Details>;
        let StyleView = {
            'bottom': '5%',
            'left': '0',
            'animation': 'showAnimete 0.5s ease',
            'transformOrigin': 'left center',
        };
        return (
            <div>
                <div className="mapbtn">
                    <div onClick={() => this.mapItemsDisplay('SHIP_CRUISE')} className={this.state.SHIP_CRUISE ? 'mapbtn-noSelected' : 'mapbtn-btn1'}>游轮</div>
                    <div onClick={() => this.mapItemsDisplay('SHIP_LAYER')} className={this.state.SHIP_LAYER ? 'mapbtn-noSelected' : 'mapbtn-btn2'}>大船</div>
                    <div onClick={() => this.mapItemsDisplay('BARGE_SHIP_LAYER')} className={this.state.BARGE_SHIP_LAYER ? 'mapbtn-noSelected' : 'mapbtn-btn3'}>驳船</div>
                    {/* <div className={this.state.map ? 'mapbtn-btn4' : 'mapbtn-noSelected'}>地图</div> */}
                </div>
                {
                    this.state.showMT ?
                        <NoHornTip title={this.state.tip.mapDesc.name} style={{ position: 'absolute', bottom: '235px', right: '50px' }}>
                            {/** 内部信息 */}
                            <PortMsg msg={this.state.tip} />
                            <PortPie msg={this.state.tip} />
                        </NoHornTip> : null
                }
                {this.state.Amap ? <Tables flds={this.state.tip.mapDesc.name} datas={this.state.tip.mtJson}></Tables> : null}
                {this.state.isShowDes ? <Desc className='descTip' style={StyleView} title={this.state.desTitle} content={descmsg} close={() => this.setState({ isShowDes: false })} /> : null}
            </div>
        )
    }
}


/** 园区、仓库等信息 */
class Tables extends React.Component {
    render() {
        let { flds = [], datas = {} } = this.props;
        return (
            <div className='mtables animated' style={this.props.style}>
                <div className="mtables-top">{flds}</div>
                <div className='mtables-center'>
                    {
                        datas.data.map((e, a) => {
                            if (a % 2 != 0) {
                                return <div key={a} className="mtables-center-corner">
                                    <div className="mtables-center-corner-view">
                                        <div className="mtables-center-corner-view-1">
                                            <span>{datas.data[a - 1].name} :</span>
                                            <div className='number-view'>
                                                {(getNumberArr(Number(datas.data[a - 1].number) || 0)).map((num, i) => {
                                                    if (num === 'break' || num === 'point') {
                                                        return <div key={i} className={'number-' + num}></div>
                                                    } else return <div key={i} style={{ width: 85, height: 120 }} className={'number-' + num}></div>
                                                })
                                                }
                                            </div>
                                        </div>
                                        <div className="mtables-center-corner-view-1">
                                            <span>{datas.data[a].name} :</span>
                                            <div className='number-view'>
                                                {(getNumberArr(Number(datas.data[a].number) || 0)).map((num, i) => {
                                                    if (num === 'break' || num === 'point') {
                                                        return <div key={i} className={'number-' + num}></div>
                                                    } else return <div key={i} style={{ width: 85, height: 120 }} className={'number-' + num}></div>
                                                })
                                                }
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            } else if (a > datas.data.length - 2 && a % 2 == 0) {
                                return <div key={a} className="mtables-center-corner">
                                    <div className="mtables-center-corner-view">
                                        <div className="mtables-center-corner-view-2">
                                            <span>{datas.data[a].name} :</span>
                                            <span className="mtables-center-corner-view-2-lastNum">{datas.data[a].number}</span>
                                        </div>

                                    </div>
                                </div>
                            }
                        })
                    }
                </div>
                <div className="mtables-bot"></div>
            </div>
        )
    }
}

/** 内部信息 */
class PortMsg extends React.Component {

    render() {
        const { mtJson = [], mapDesc = [] } = this.props.msg;
        const sum = [];
        const bc = [];
        const dc = [];
        var json = {};
        for (var o in mtJson) {
            json[mtJson[o].attributes.TYPE1] = mtJson[o].attributes.AMOUNT;
        }
        json['datas'] = [{ 'harbor': '进港港口', "shipname": "大船驳船" }, { 'harbor': '出港港口', "shipname": "大船驳船" }]
        sum.push(getNumberArr((Number(json.BargeIn) || 0) + (Number(json.VesselIn)) || 0));
        sum.push(getNumberArr((Number(json.BargeOut) || 0) + (Number(json.VesselOut)) || 0))
        dc.push(getNumberArr(Number(json.VesselIn) || 0));
        dc.push(getNumberArr(Number(json.VesselOut) || 0));
        bc.push(getNumberArr(Number(json.BargeIn) || 0));
        bc.push(getNumberArr(Number(json.BargeOut) || 0));
        return (
            <div id="msgs" className="Msg">
                {json.datas.map((value, key) =>
                    <div key={key} className="Msg-corner">
                        <div id={"dsadsadsa" + key} className="Msg-corner-flex">
                            <div className="Msg-corner-flex-InShip">
                                <span>{value.harbor}</span>
                                <div className='number-view'>
                                    {sum[key].map((num, i) => { return <div key={i} className={'number-' + num}></div> })}
                                </div>
                            </div>
                            <div className="Msg-corner-flex-InBigShip">
                                <span>{value.shipname}</span>
                                <div className="Msg-corner-flex-InBigShip-val">
                                    <span>{dc[key]}</span>
                                    <span>{bc[key]}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        )
    }
}

/** 饼状图 */
class PortPie extends React.Component {
    render() {
        const { mtJson = [] } = this.props.msg;
        var json = {};
        for (var o in mtJson) {
            json[mtJson[o].attributes.TYPE1] = mtJson[o].attributes.AMOUNT;
        }

        publish('port_pie_gk', { value: json['Loading'] || 0 }).then((res) => {
            if (this.chart) this.chart.dispose();
            this.chart = echarts.init(ReactDOM.findDOMNode(this.refs.echart1));
            this.chart.setOption(res[0]);
        });

        publish('port_pie_gk', { value: json['Discharge'] || 0 }).then((res) => {
            if (this.chart2) this.chart2.dispose();
            this.chart2 = echarts.init(ReactDOM.findDOMNode(this.refs.echart2));
            this.chart2.setOption(res[0]);
        });

        publish('port_pie_zk', { value: json['GateIn'] || 0 }).then((res) => {
            if (this.chart3) this.chart3.dispose();
            this.chart3 = echarts.init(ReactDOM.findDOMNode(this.refs.echart3));
            this.chart3.setOption(res[0]);
        });
        publish('port_pie_zk', { value: json['GateOut'] || 0 }).then((res) => {
            if (this.chart4) this.chart4.dispose();
            this.chart4 = echarts.init(ReactDOM.findDOMNode(this.refs.echart4));
            this.chart4.setOption(res[0]);
        });

        return (
            <div className="Pie">
                <div className='homeRightEcharts' >
                    <div className='homeRightEcharts-tip' style={{ width: 300, height: 400 }}>
                        <div className='homeRightE-1' style={{ height: '100%', width: '100%' }} ref="echart1"></div>
                        <div className='homeRightEcharts-span' ><span >装箱数量</span></div>
                    </div>

                    <div className='homeRightEcharts-tip' style={{ width: 300, height: 400 }}>
                        <div className='homeRightE-2' style={{ height: '100%', width: '100%' }} ref="echart2"></div>
                        <div className='homeRightEcharts-span'><span>卸箱数量</span></div>
                    </div>
                </div>
                <div className='homeRightEcharts' >
                    <div className='homeRightEcharts-tip' style={{ width: 300, height: 400 }}>
                        <div className='homeRightE-3' style={{ height: '100%', width: '100%' }} ref="echart3"></div>
                        <div className='homeRightEcharts-span'><span>进闸数量</span></div>
                    </div>

                    <div className='homeRightEcharts-tip' style={{ width: 300, height: 400 }}>
                        <div className='homeRightE-4' style={{ height: '100%', width: '100%' }} ref="echart4"></div>
                        <div className='homeRightEcharts-span'><span>出闸数量</span></div>
                    </div>
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

    componentWillUnmount() {
        if (this.chart) this.chart.dispose();
    }
    render() {
        let { tview = [], idx = 0, } = this.state;
        return (
            <div className='portMap' style={{ overflow: 'hidden', height: '100%' }}>
                <div className='portleft'>
                    <div ref="iframe"></div>
                    {this.state.map ? <MapOperation map={this.state.map} /> : null}
                </div>
                <PortRightPanel></PortRightPanel>
                {/* <div className='portRight' style={{ marginLeft: 30 }}>
                    <div className='portRight-1' onClick={() => publish('playVedio')}></div>
                    <div className='portRight-2' onClick={() => publish('playVedio')}></div>
                    <div className='portRight-3' onClick={() => publish('playVedio')}></div>
                    <div className='portRight-4' onClick={() => publish('playVedio')}></div>
                </div> */}


            </div>

        )
    }
}