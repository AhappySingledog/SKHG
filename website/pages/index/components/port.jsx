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
import { ViwePager, Tip, Table, Panel, Dialog, ChartView } from '../../../frame/componets/index';
import { Desc, Details } from '../../../frame/componets/details/index';
import BigShipIcon from '../../../res/mapIcon/大船.gif';
import BargeIcon from '../../../res/mapIcon/驳船.gif';
import TruckIcon from '../../../res/mapIcon/车.png';

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
        Amap: false,
        jiasuju: {},
        tip: {
            showtip: false,
            isShowDes: false,
            desTitle: '显示详情',
            desItem: {},
            mtJson: [],
            desColumns: [],
        },
        TRUCK_LAYER: true,
        SHIP_LAYER: true,
        map: true,
    }

    componentDidMount() {
        console.log(this.props.map);
        let mapExtent = {
            xmax: 113.9250031023771,
            xmin: 113.85290532405679,
            ymax: 22.486930314170145,
            ymin: 22.446418229209208,
        };
        this.props.map.mapOper.setMapExtent(mapExtent);

        /** 港口码头划分 */
        publish('map_view_init').then((res) => {
            this.setState({ mtJson: res[0][0].features })
            this.handleMTSJ(res[0][0].features);
        });

        /** 大船显示 */
        publish('vessel_GetListAsync').then((res) => {
            this.handleBigship(res[0]);
        })

        /** 驳船显示 */
        publish('barge_GetListAsync').then((res) => {
            this.handleBarge(res[0]);
        })

        /** 外拖拖车 */
        publish('truck_GetListAsync').then((res) => {
            this.handleOutcar(res[0]);
        })
    }

    handleMTSJ = (datas) => {
        let color = {
            mt: [57, 255, 95, 0.6],
            ck: [24, 46, 255, 0.6],
            yq: [250, 22, 80, 0.6],
            mg: [8, 249, 250, 0.6],
        };
        for (let o in datas) {
            let dots = datas[o].geometry.coordinates[0].map((p) => { return { x: p[0], y: p[1] }; });
            let name = datas[o].properties.name;
            let fillColor = color.mg;
            if (name.indexOf('码头') >= 0) {
                fillColor = color.mt;
            }
            if (name.indexOf('园区') >= 0) {
                fillColor = color.yq;
            }
            if (name.indexOf('仓库') >= 0) {
                fillColor = color.ck;
            }
            let params = {
                id: 'port_view' + o,
                linecolor: fillColor,
                layerId: 'port_view',
                dots: dots,
                attr: { ...datas[o] },
                click: this.showContainerModal,
                linewidth: 6,
                mouseover: (g) => {
                    this.toolTipIn(g)
                },
                mouseout: (g) => {
                    this.setState({
                        showMT: false,
                        Amap: false
                    });
                    this.props.map.mapDisplay.clearLayer('port_view1');
                },
            }
            this.props.map.mapDisplay.polygon(params);
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
                    id: 'SHIP_LAYER' + o,
                    layerId: 'SHIP_LAYER',
                    src: BigShipIcon,
                    width: 140,
                    height: 70,
                    angle: (Number(json[o].heading) / 100) - 90,
                    x: json[o].longitude,
                    y: json[o].latitude,
                    attr: { ...json[o] },
                    click: this.onIconClick,
                    mouseover: function (g) {
                        let symbol = g.symbol;
                        if (symbol.setWidth) {
                            symbol.setWidth(140 + 36);
                            symbol.setHeight(70 + 9);
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
                            symbol.setWidth(140);
                            symbol.setHeight(70);
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
                    id: 'SHIP_LAYER' + o,
                    layerId: 'SHIP_LAYER',
                    src: BargeIcon,
                    width: 140,
                    height: 70,
                    angle: (Number(json[o].heading) / 100) - 90,
                    x: json[o].longitude,
                    y: json[o].latitude,
                    attr: { ...json[o] },
                    click: this.onIconClick,
                    mouseover: function (g) {
                        let symbol = g.symbol;
                        if (symbol.setWidth) {
                            symbol.setWidth(140 + 36);
                            symbol.setHeight(70 + 9);
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
                            symbol.setWidth(140);
                            symbol.setHeight(70);
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
                    width: 140,
                    height: 120,
                    x: json[o].Curlng,
                    y: json[o].Curlat,
                    attr: { ...json[o] },
                    click: this.onIconClick,
                    layerIndex: 30,
                    mouseover: (g) => {
                        let symbol = g.symbol;
                        if (symbol.setWidth) {
                            symbol.setWidth(140 + 36);
                            symbol.setHeight(120 + 9);
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
                            symbol.setWidth(140);
                            symbol.setHeight(120);
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
        let outcar = [
            { title: "车牌", dataIndex: "Truckno", colspan: true },
            { title: "单号", dataIndex: "Bookingno", colspan: true },
            { title: "箱号", dataIndex: "Containerno", colspan: true },
            { title: "箱型", dataIndex: "Containertype", colspan: true },
            { title: "尺寸", dataIndex: "Containersize", colspan: true },
            { title: "箱高", dataIndex: "Containerheight", colspan: true },
            { title: "空重", dataIndex: "Emptyfull", colspan: true },
            { title: "收提", dataIndex: "Inout", colspan: true }
        ];
        if (attr.colname === 'bigship') {
            this.setState({
                desColumns: bigship
            })
        } else if (attr.colname === 'bargeship') {
            this.setState({
                desColumns: bargeship
            })
        } else if (attr.colname === 'outcar') {
            this.setState({
                desColumns: outcar
            })
        };

        this.setState({
            desTitle: attr.name,
            desItem: attr,
            isShowDes: true
        });
    }

    /** 鼠标移入事件 */
    toolTipIn = (e) => {
        let datajson = e.attributes;
        let dots = datajson.geometry.coordinates[0].map((p) => { return { x: p[0], y: p[1] }; });
        let params = {
            id: 'port_view1',
            layerId: 'port_view1',
            fillcolor: [255, 133, 71, 1],
            dots: dots,
            linewidth: 6,
        }
        this.props.map.mapDisplay.polygon(params);
        var point = e.geometry.getCentroid();
        var screenPoint = this.props.map.mapDisplay.toScreen(point.x, point.y);
        var clientX = screenPoint.x + 200;
        var clientY = screenPoint.y - 900;
        if (datajson.properties.name.indexOf('码头') >= 0) {
            this.setState({
                showMT: true,
                Amap: false,
                tip: {
                    showtip: true,
                    mtJson: datajson,
                    clientX: clientX,
                    clientY: clientY,
                }
            });
        } else {
            this.setState({
                showMT: false,
                Amap: true,
                tip: {
                    mtJson: datajson,
                }
            });
        }

    }


    /**
    * 取消关闭详情框
    */
    handleCloseDesDailog = (e) => {
        this.setState({
            isShowDes: false
        });
    }

    /** 进入下一层 */
    showContainerModal = (e) => {
        publish('changeLayer', { index: 2, props: { datas: e.attributes } });
    };

    /** 地图内容展示状态切换 */
    mapItemsDisplay = (key) => {
        let flag = !this.state[key];
        this.setState({ [key]: flag }, () => {
            flag ? this.props.map.mapDisplay.show(key) :  this.props.map.mapDisplay.hide(key);
        });
    }

    render() {
        let { tip = {} } = this.state;
        let descmsg = <Details columns={this.state.desColumns} columnTotal={2} item={this.state.desItem}></Details>;

        return (
            <div>
                <div className="mapbtn">
                    <div onClick={() => this.mapItemsDisplay('TRUCK_LAYER')} className={this.state.TRUCK_LAYER ? 'mapbtn-btn1' : 'mapbtn-noSelected'}>拖车</div>
                    <div onClick={() => this.mapItemsDisplay('SHIP_LAYER')} className={this.state.SHIP_LAYER ? 'mapbtn-btn2' : 'mapbtn-noSelected'}>船舶</div>
                    <div className={this.state.map ? 'mapbtn-btn3' : 'mapbtn-noSelected'}>地图</div>
                </div>
                {
                    this.state.showMT ?
                        // <Tip title={this.state.tip.mtJson.properties.name} style={{ position: 'absolute', bottom: '235px', right: '50px' }}>
                        //     {/** 内部信息 */}
                        //     <PortMsg msg={this.state.tip} />
                        //     <PortPie />
                        // </Tip> : null
                        <div className = "portTip animated" > </div> : null
                }
                {
                    this.state.Amap ? <div className = "portSmallTip animated" style={{
                        background: 'url(../../../../mapIcon/' + tip.mtJson.properties.name + '.png) no-repeat',
                        'position': 'absolute',
                        'bottom': '240px',
                        'right': '30px',
                        width: '960px',
                        height: '620px',
                    }}></div> : null
                }
                {this.state.isShowDes ? <Desc className='descTip' title={this.state.desTitle} content={descmsg} close={this.handleCloseDesDailog} /> : null}
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

/** 饼状图 */
class PortPie extends React.Component {
    state = {
        /** 第二层详情分两种情况，一种无图，一种有图 */
        Amap: false,
        datas: {},
    }
    componentDidMount() {

        publish('port_pie_gk').then((res) => {
            if (this.chart) this.chart.dispose();
            this.chart = echarts.init(ReactDOM.findDOMNode(this.refs.echart1));
            this.chart.setOption(res[0]);
        });

    }

    render() {
        return (
            <div className="Pie">
                <Panel style={{ flexGrow: 1, paddingTop: 60 }}>
                    <div className='homeRightE' style={{ width: 1015, height: 800, paddingBottom: 30 }}>
                        <div className='homeRightE-l' style={{ height: '50%' }} ref="echart1"></div>
                        {/**   <div className='homeRightE-l' style={{ height: '50%' }} ref="echart2"></div> */}
                    </div>
                </Panel>
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
                <div className='portleft'>
                    <div ref="iframe"></div>
                    {this.state.map ? <MapOperation map={this.state.map} /> : null}
                </div>
                <div className='portRight' style={{ marginLeft: 30 }}>
                    <div className='portRight-1' onClick={() => publish('playVedio')}></div>
                    <div className='portRight-2' onClick={() => publish('playVedio')}></div>
                    <div className='portRight-3' onClick={() => publish('playVedio')}></div>
                    <div className='portRight-4' onClick={() => publish('playVedio')}></div>
                </div>
            </div>

        )
    }
}