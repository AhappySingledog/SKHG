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
import { ViwePager, Tip, Panel, Dialog, ChartView, Table, QueryBox } from '../../../frame/componets/index';
import { Desc, Details } from '../../../frame/componets/details/index';
import S from '../../../res/mapIcon/Barge.png';
import B from '../../../res/mapIcon/bigShip.png';
import VideoIcon from '../images/sxt.png';
import PierRightPanel from './pierRightPanel';
import zb from '../images/下手势.png';

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
            items: 1,
            itemData: [],
        },
        ShipTrackFlds: [],
        visible_duiwei: false,
        Amap: false,
    }

    componentWillReceiveProps(nextProps) {
        // this.drawDefaultLayer(nextProps);
    }

    componentDidMount() {
        this.sub_box = subscribe('box', this.box);
        this.sub_boxModel = subscribe('box_model', this.boxModel);
        this.sub_location = subscribe('box_location', this.handleNbr);
        this.sub_onIconClick = subscribe('box_onIconClick', this.onIconClick);
        this.sub_Berth_ship = subscribe('berth_ship', this.berth_ship);
        this.sub_handleCloseDesDailog = subscribe('box_handleCloseDesDailog', this.handleCloseDesDailog);
        this.sub_getVideoAndDisplay = subscribe('getVideoAndDisplay', this.getVideoAndDisplay);
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
                e.ckIndex = i;
                let params = {
                    id: 'port_view_' + i,
                    linecolor: color[e.type],
                    layerId: 'port_view',
                    dots: dots,
                    attr: { ...e },
                    click: (e) => publish('changeLayer', { index: 3, props: { datas: e.attributes, res: res[0].data, layerName: e.attributes.name } }),
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
        }).then(() => this.drawDefaultLayer(this.props));

        /** 绘制摄像头 */
        publish('webAction', { svn: 'skhg_service', path: 'queryGeomTable', data: { tableName: 'SK_MONITOR_GIS_N', where: "SSDW='" + this.props.datas.code + "'" } }).then((res) => {
            res[0].data.forEach((e, i) => {
                let param = {
                    id: 'VIDEO_LAYER' + i,
                    layerId: 'VIDEO_LAYER',
                    layerIndex: 999,
                    src: VideoIcon,
                    width: 100,
                    height: 140,
                    angle: 0,
                    x: e.geom.x,
                    y: e.geom.y,
                    attr: { ...e },
                    click: (g) => publish('playVedio', {url: g.attributes.url, name: g.attributes.name}),
                    mouseover: function (g) {
                        let symbol = g.symbol;
                        if (symbol.setWidth) {
                            symbol.setWidth(100 + 12);
                            symbol.setHeight(100 + 12);
                        }
                        g.setSymbol(symbol);
                    },
                    mouseout: function (g) {
                        let symbol = g.symbol;
                        if (symbol.setWidth) {
                            symbol.setWidth(100);
                            symbol.setHeight(100);
                        }
                        g.setSymbol(symbol);
                    },
                }
                this.props.map.mapDisplay.image(param);

                let param2 = {
                    id: 'test' + i,
                    layerId: 'VIDEO_LAYER',
                    x: e.geom.x,
                    y: e.geom.y,
                    text: e.name,
                    size: '10pt',
                    color: 'red',
                    offsetX: 0,
                    offsetY: 132,
                    visible: true,
                    layerIndex: 10,
                }
                this.props.map.mapDisplay.text(param2);
            });
            this.props.map.mapDisplay.hide('VIDEO_LAYER');
        });

        publish('webAction', { svn: 'skhg_loader_service', path: 'queryTableByWhere', data: { tableName: 'V_IMAP_SCCT_BERTH', where: "TERMINALCODE= '" + this.props.datas.code + "'" } }).then((res) => {
            res[0].data.forEach((value, key) => value.VESSELTYPE === 'B' ? value.VESSELTYPE = '大船' : value.VESSELTYPE = '驳船');
            this.drawShips(res[0].data);
        });
    }

    getVideoAndDisplay = (ops) => {
        let map = ops.map;
        let type = ops.type;
        let data = ops.data;
        map.mapDisplay.clearLayer('VIDEO_LD_LAYER');
        let where = '1=1';
        if (type == '船舶') where = "SSDW='" + data.ssdw + "' AND BOWEI LIKE '%" + data.bw + "%'";
        if (type == '集装箱') where = "SSDW='" + data.ssdw + "' AND LANWEI LIKE '%" + data.lw + "%'";
        publish('webAction', { svn: 'skhg_service', path: 'queryGeomTable', data: { tableName: 'SK_MONITOR_GIS_N', where: where } }).then((res) => {
            res[0].data.forEach((e, i) => {
                let param = {
                    id: 'VIDEO_LD_LAYER' + i,
                    layerId: 'VIDEO_LD_LAYER',
                    layerIndex: 999,
                    src: VideoIcon,
                    width: 100,
                    height: 140,
                    angle: 0,
                    x: e.geom.x,
                    y: e.geom.y,
                    attr: { ...e },
                    click: (g) => publish('playVedio', {url: g.attributes.url, name: g.attributes.name}),
                    mouseover: function (g) {
                        let symbol = g.symbol;
                        if (symbol.setWidth) {
                            symbol.setWidth(100 + 12);
                            symbol.setHeight(100 + 12);
                        }
                        g.setSymbol(symbol);
                    },
                    mouseout: function (g) {
                        let symbol = g.symbol;
                        if (symbol.setWidth) {
                            symbol.setWidth(100);
                            symbol.setHeight(100);
                        }
                        g.setSymbol(symbol);
                    },
                }
                map.mapDisplay.image(param);
            });
        });
    }

    // 绘制大船驳船
    drawShips = (data) => {
        publish('webAction', { svn: 'skhg_service', path: 'queryGeomTable', data: { tableName: 'SK_BERTH_GIS', where:"SSDW='" + this.props.datas.code + "'" } }).then((res) => {
            console.log(res);
            let bw = res[0].data;
            data.forEach((e, i) => {
                let layer = e.VESSELTYPE == '大船' ? 'S_LAYER' : 'B_LAYER';
                let point = bw.filter((b) => b.type == e.VESSELTYPE && b.code == e.BERTHNO);
                if (point.length > 0) {
                    let param = {
                        id: layer + i,
                        layerId: layer,
                        layerIndex: 999,
                        src: e.VESSELTYPE == '大船' ? '../mapIcon/bigship.png' : '../mapIcon/Barge.png',
                        width: 70,
                        height: 140,
                        angle: point[0].angle,
                        x: point[0].geom.x,
                        y: point[0].geom.y,
                        attr: { ...e },
                        click: (e) => {
                            let temp = e.attributes;
                            if (temp.VESSELTYPE == '大船') {
                                temp.colname = 'berthShip';
                                temp.name = '班轮详情';
                            }
                            else {
                                temp.colname = 'berthShip';
                                temp.name = '驳船详情';
                            }
                            this.onIconClick(e);
                        },
                        mouseover: function (g) {
                            let symbol = g.symbol;
                            if (symbol.setWidth) {
                                symbol.setWidth(70 + 12);
                                symbol.setHeight(140 + 12);
                            }
                            g.setSymbol(symbol);
                        },
                        mouseout: function (g) {
                            let symbol = g.symbol;
                            if (symbol.setWidth) {
                                symbol.setWidth(70);
                                symbol.setHeight(140);
                            }
                            g.setSymbol(symbol);
                        },
                    }
                    this.props.map.mapDisplay.image(param);
                }
            });
            this.props.map.mapDisplay.hide('S_LAYER');
            this.props.map.mapDisplay.hide('B_LAYER');
            // this.props.setFatherState({S_LAYER: false, B_LAYER: false});
        });
    }

    componentWillUnmount() {
        if (this.sub_box) unsubscribe(this.sub_box);
        if (this.sub_boxModel) unsubscribe(this.sub_boxModel);
        if (this.sub_location) unsubscribe(this.sub_location);
        if (this.sub_Berth_ship) unsubscribe(this.sub_Berth_ship);
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

    drawDefaultLayer = (props) => {
        if (props.defaultLayer) {
            let defaultLayer = props.defaultLayer;
            if (defaultLayer.container) {
                publish('webAction', { svn: 'eportapisct', path: 'GContainerInfo', data: { System: '', PageIndex: 1, PageSize: 30, SortBy: '', IsDescending: false, ContainerNo: defaultLayer.container } }).then((res) => {
                    let result = res[0].InnerList;
                    if (result.length > 0) {
                        let where = '';
                        if (props.datas.code == 'SCT') where = "SSDW='SCT' and CHANGBIAO='" + result[0].Location.substring(6, 8) + "' AND BEIBIAO='" + Number(result[0].Location.substring(8, 11)) + "' AND PAIBIAO='" + result[0].Location.substring(11, 13) + "'";
                        else where = "SSDW='" + props.datas.code + "' and NAME='" + result[0].Location.substring(5, 13) + "'";
                        publish('webAction', { svn: 'skhg_service', path: 'queryGeomTable', data: { tableName: 'SK_MAP_GIS', where: where } }).then((res) => {
                            props.map.mapDisplay.clearLayer('QUERY_LAYER');
                            res[0].data.forEach((e, i) => {
                                let dots = e.geom.rings[0].map((p) => { return { x: p[0], y: p[1] }; });
                                let points = dots.slice(0, 4);
                                let x = points[0].x + points[1].x + points[2].x + points[3].x;
                                let y = points[0].y + points[1].y + points[2].y + points[3].y;
                                let params = {
                                    id: 'query_' + i,
                                    linecolor: [255, 0, 0, 1],
                                    fillcolor: [255, 0, 0, 1],
                                    layerId: 'QUERY_LAYER',
                                    dots: dots,
                                    linewidth: 0,
                                }
                                let point = { x: x / 4, y: y / 4 };
                                props.map.mapOper.centerAndZoom(point, 5);
                                props.map.mapDisplay.polygon(params);
                            });
                        });
                        publish('getVideoAndDisplay', {map: props.map, type: '集装箱', data: {ssdw: this.props.datas.ssdw, lw: result[0].Location.substring(5, 8)}});
                    }
                });
            }
            if (defaultLayer.ship) {
                publish('webAction', { svn: 'skhg_service', path: 'queryGeomTable', data: { tableName: 'SK_BERTH_GIS', where: "SSDW = '" + defaultLayer.ship.TERMINALCODE + "' and CODE = '" + defaultLayer.ship.BERTHNO + "'" } }).then((res) => {

                    /** 去展示船的定位和详细信息 */
                    let json = defaultLayer.ship;
                    this.props.map.mapDisplay.clearLayer('QUERY_LAYER');
                    res[0].data.forEach((value, key) => {
                        if (value.code === json.BERTHNO && value.type === json.VESSELTYPE) {
                            json.name = value.name;
                            json.colname = 'berthShip';
                            let scrs = value.type === 'B' || value.type == '大船' ? B : S;
                            this.props.map.mapOper.centerAndZoom({ x: value.geom.x, y: value.geom.y }, 3);
                            let param = {
                                id: 'QUERY_LAYER' + key,
                                layerId: 'QUERY_LAYER',
                                src: scrs,
                                width: 70,
                                height: 140,
                                angle: value.angle,
                                x: value.geom.x,
                                y: value.geom.y,
                                attr: { ...json },
                                click: this.onIconClick,
                                mouseover: function (g) {
                                    let symbol = g.symbol;
                                    if (symbol.setWidth) {
                                        symbol.setWidth(70 + 9);
                                        symbol.setHeight(140 + 36);
                                    }
                                    g.setSymbol(symbol);
                                },
                                mouseout: function (g) {
                                    let symbol = g.symbol;
                                    if (symbol.setWidth) {
                                        symbol.setWidth(70);
                                        symbol.setHeight(140);
                                    }
                                    g.setSymbol(symbol);
                                },
                            };
                            let param2 = {
                                id: 'BIG_SHIP_LAYER',
                                layerId: 'QUERY_LAYER',
                                x: value.geom.x,
                                y: value.geom.y,
                                text: json.CVESSELNAME,
                                size: '10pt',
                                color: 'red',
                                offsetX: 0,
                                offsetY: 132,
                                visible: true,
                                layerIndex: 10,
                            }
                            this.props.map.mapDisplay.text(param2);
                            this.props.map.mapDisplay.image(param);
                            let mText = {
                                id: 'text_box',
                                layerId: 'QUERY_LAYER',
                                x: value.geom.x / 4,
                                y: (value.geom.y / 4) + 0.00004,
                                src: zb,
                                width: 80,
                                height: 100,
                                layerIndex: 30,
                            };
                            this.props.map.mapDisplay.image(mText);
                        }
                    })
                });
                publish('getVideoAndDisplay', {map: props.map, type: '船舶', data: {ssdw: defaultLayer.ship.TERMINALCODE, bw: defaultLayer.ship.BERTHNO}});
            }
        }
    }

    /** 船的定位 */
    berth_ship = (datas) => {
        let that = this;
        let json = datas.a;
        let list = datas.b[0].data;
        this.props.map.mapDisplay.clearLayer('SHIP_LAYER');
        this.props.map.mapDisplay.clearLayer('CONTAINERVIEW_LAYER_BOX');
        that.props.map.mapDisplay.clearLayer('BIG_SHIP_LAYER_HOVERTEXT');
        list.map((value, key) => {
            if (value.code === json.BERTHNO && value.type === json.VESSELTYPE) {
                json.name = value.name;
                json.colname = 'berthShip';
                let scrs = value.type === 'B' || value.type == '大船' ? B : S;
                this.props.map.mapOper.centerAndZoom({ x: value.geom.x, y: value.geom.y }, 3);
                let param = {
                    id: 'SHIP_LAYER' + key,
                    layerId: 'SHIP_LAYER',
                    src: scrs,
                    width: 70,
                    height: 140,
                    angle: value.angle,
                    x: value.geom.x,
                    y: value.geom.y,
                    attr: { ...json },
                    click: this.onIconClick,
                    mouseover: function (g) {
                        let symbol = g.symbol;
                        if (symbol.setWidth) {
                            symbol.setWidth(70 + 9);
                            symbol.setHeight(140 + 36);
                        }
                        g.setSymbol(symbol);
                    },
                    mouseout: function (g) {
                        let symbol = g.symbol;
                        if (symbol.setWidth) {
                            symbol.setWidth(70);
                            symbol.setHeight(140);
                        }
                        g.setSymbol(symbol);
                    },
                };
                let param2 = {
                    id: 'BIG_SHIP_LAYER',
                    layerId: 'BIG_SHIP_LAYER_HOVERTEXT',
                    x: value.geom.x,
                    y: value.geom.y,
                    text: json.CVESSELNAME,
                    size: '10pt',
                    color: 'red',
                    offsetX: 0,
                    offsetY: 132,
                    visible: true,
                    layerIndex: 10,
                }
                this.props.map.mapDisplay.text(param2);
                this.props.map.mapDisplay.image(param);
                let mText = {
                    id: 'text_box',
                    layerId: 'CONTAINERVIEW_LAYER_BOX',
                    x: value.geom.x / 4,
                    y: (value.geom.y / 4) + 0.00004,
                    src: zb,
                    width: 80,
                    height: 100,
                    layerIndex: 30,
                };
                this.props.map.mapDisplay.image(mText);
            }
        })
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
                isShowDes: true,
                box: true,
                items: 1,
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
        if (datajson.type == 3) {
            const ck = {
                ONE_CK: 101,
                TWO_CK: 102,
                FOUR_CK: 104,
            };
            // let date = new Date();
            // let y = date.getFullYear();
            // let m = date.getMonth();
            // let d = date.getDate();
            // let dt = '' + y + '-' + (m + 1 > 9 ? m + 1 : '0' + (m + 1)) + '-' + d;
            // if (ck[datajson.code]) {

            // }
            // else {
            //     let datas = { data: [{ name: '库存数量', number: 123456 }, { name: '出库数量', number: 123456 }, { name: '入库数量', number: 123456 }, { name: '申报数量', number: 123456 }] };
            //     this.setState({ showMT: false, Amap: true, tip: { mtJson: datas, mapDesc: datajson } });
            // }
            // Promise.all([
            //     publish('getData', { svn: 'skhg_stage', tableName: 'cmbl_3rd_InOutWarehouseNum', data: { where: " trunc(recorddate) = trunc(sysdate) and warehouse= '" + datajson.name + "'" } }),
            //     publish('getData', { svn: 'skhg_stage', tableName: 'cmbl_3rd_DeclareGoodsNum', data: { where: " trunc(recorddate) = trunc(sysdate) and warehouse='" + datajson.name + "'" } }),
            // ]).then((res) => {
            //     let inNum = 0;
            //     let outNum = 0;
            //     let decNum = 0;
            //     res[0][0].features.forEach((e) => e.attributes.OPTTYPE == 'I' ? inNum = inNum + Number(e.attributes.QTY) : outNum = outNum + Number(e.attributes.QTY));
            //     res[0][0].features.forEach((e) => decNum = decNum + Number(e.attributes.QTY));
            //     let datas = { data: [{ name: '库存数量', number: 123456 }, { name: '出库数量', number: outNum }, { name: '入库数量', number: inNum }, { name: '申报数量', number: decNum }] };
            //     this.setState({ showMT: false, Amap: true, tip: { mtJson: datas, mapDesc: datajson } });
            // });
        }
    }

    /**
    * 取消关闭详情框
    */
    handleCloseDesDailog = (e) => {
        this.setState({ isShowDes: false });
    }

    /** 点击右侧的堆存柜量后，订阅过来的数据，做展示出当前堆位的所有场位数据 */
    box = (e) => {
        this.props.map.mapDisplay.clearLayer('box_view');
        this.props.map.mapDisplay.clearLayer('TRUCK_LAYER');
        this.props.map.mapDisplay.clearLayer('BIG_SHIP_LAYER');
        this.props.map.mapDisplay.clearLayer('BARGE_SHIP_LAYER');
        this.props.map.mapDisplay.clearLayer('CONTAINERVIEW_LAYER');
        this.props.map.mapDisplay.clearLayer('CONTAINERVIEW_LAYER_BOX');
        // this.props.map.mapDisplay.clearLayer('VIDEO_LAYER');
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
        if (e.trim() !== '') {
            khsj = khsj.filter((d) => d.CONTAINERNO === e);
            this.setState({
                dataSource: khsj,
            });
        } else if (e.trim() === '') {
            this.setState({
                dataSource: this.old_khsj,
            });
        }
    };

    /** 点击地图的时候，出现集装箱信息 */
    boxModel = (e) => {
        this.setState({ visible_duiwei: false, isShowDes: false }, () => {
            let attr = e.attributes;
            let data = Object.keys(attr).map((key, i) => attr[key]);
            data = data.filter((d) => d.YARDLANENO);
            data.sort((a, b) => Number(a.YARDLANENO) - Number(b.YARDLANENO));
            this.setState({
                visible_duiwei: true,
                dataSource: data,
            });
        });

    }

    /** 点击场位后，展现详细信息 */
    handleDetails = (e) => {
        let pa = [{
            paramName: 'P_TERMINALCODE',
            value: this.props.datas.code,
        }, {
            paramName: 'P_CONTAINERNO',
            value: e.CONTAINERNO,
        }];
        this.handleNbr(e);
        publish('webAction', { svn: 'skhg_loader_service', path: 'queryPro', data: { proName: 'P_IMAP_SCCTYARD_BYCNTR', parms: JSON.stringify(pa) } }).then((res) => {
            console.log(res);
            let json = {};
            e.colname = 'onyard';
            e.name = [<div className='gjTitle' onClick={() => this.setState({ items: 1 })}>柜子</div>, <div className='gjTitle' onClick={() => this.clickTitle(e)}>柜子轨迹</div>];
            let obj = Object.assign(res[0].data[0], e);
            json.attributes = obj;
            this.onIconClick(json);
        });
        publish('getVideoAndDisplay', {map: this.props.map, type: '集装箱', data: {ssdw: this.props.datas.ssdw, lw: e.YARDLANENO}});
    }

    clickTitle = (key) => {
        publish('webAction', { svn: 'eportapisct', path: 'GContainerHistoryInfo', data: { System: '', PageIndex: 1, PageSize: 30, SortBy: '', IsDescending: false, ContainerNo: key.CONTAINERNO } }).then((res) => {
            this.setState({ itemData: res[0].InnerList, items: 2 });
        });
    }

    /** 缩放和指示位置 */
    handleNbr = (e) => {
        this.props.map.mapDisplay.clearLayer('box_view');
        this.props.map.mapDisplay.clearLayer('CONTAINERVIEW_LAYER');
        this.props.map.mapDisplay.clearLayer('CONTAINERVIEW_LAYER_BOX');
        let js = e.YARDLANENO + e.YARDBAYNO + e.YARDROWNO;
        publish('webAction', { svn: 'skhg_service', path: 'queryGeomTable', data: { tableName: 'SK_MAP_GIS', where: "SSDW like '%" + this.props.datas.code + "' and NAME LIKE '" + e.YARDLANENO.replace('*', '') + "%'    " } }).then((ors) => {
            let orsJson = {};
            for (let i in ors[0].data) {
                orsJson[ors[0].data[i].name] = [ors[0].data[i]];
            }
            js = js.indexOf('*') >= 0 ? js.substring(1, 6) + js.substring(7, 8) : js;
            if (orsJson !== '') {
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
                    width: 80,
                    height: 100,
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
                alert('没有地址~');
            }
        })
    }

    render() {
        let id2 = 'b';
        let { tip = {}, items = 1 } = this.state;
        let StyleView = {
            'bottom': '5%',
            'right': '0',
            'animation': 'showAnimete 0.5s ease',
            'transformOrigin': 'right center ',
        };
        const shipsFlds = [
            { title: '柜号', dataIndex: 'CONTAINERNO' },
            { title: '场位', dataIndex: 'YARDCELL' },
            { title: '栏位', dataIndex: 'YARDLANENO' },
            { title: '贝位', dataIndex: 'YARDBAYNO' },
            { title: '列号', dataIndex: 'YARDROWNO' },
            { title: '层高', dataIndex: 'YARDTIERNO' },
        ];
        let descmsg = [];
        if (items === 1) {
            descmsg = <Details columns={this.state.desColumns} columnTotal={2} item={this.state.desItem}></Details>;
        }
        if (items === 2) {
            descmsg = <Table rowNo={true} style={{ width: '100%', height: 1740 }} id={id2} selectedIndex={null} flds={this.state.ShipTrackFlds} datas={this.state.itemData} trClick={null} trDbclick={null} />
        }
        return (
            <div>
                {/* {this.state.isShowDes ? <Desc className='descTip' title={this.state.desTitle} content={<div className='test-tip'></div>} close={this.handleCloseDesDailog} /> : null} */}
                {this.state.isShowDes ? <Desc className='descTip' style={StyleView} title={this.state.desTitle} content={descmsg} box={this.state.box} close={this.handleCloseDesDailog} /> : null}
                {this.state.showMT ? <div className="portTip animated" > </div> : null}
                {
                    this.state.visible_duiwei ? <div className="box_model" style={{zIndex: 1}}>
                        <div style={{ width: '100%', background: '#051658' }} >
                            <Table rowNo={true} title={{name: '集装箱展示列表', export: true, close: () => this.setState({ visible_duiwei: false, isShowDes: false }), items: [<QueryBox key={1} name='' query={this.findBox}/>]}} style={{ width: 2000, height: 772 }} id={'a1'} selectedIndex={null} flds={shipsFlds} datas={this.state.dataSource} trClick={this.handleDetails.bind(this)} trDbclick={null} />
                        </div>
                    </div> : null
                }
                {this.state.Amap ? <Tables flds={this.state.tip.mapDesc.name} datas={this.state.tip.mtJson}></Tables> : null}
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
                        <div id={'dsadsadsa' + key} key={key} className="Msg-row-flex">
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
    state = { 
        map: null,
        VIDEO_LAYER: false,
        B_LAYER: false,
        S_LAYER: false,
    }
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
                window.closeLoading();
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
    showLayer = (layer) => {
        this.state.map.mapDisplay.clearLayer('QUERY_LAYER');
        let flag = !this.state[layer];
        this.setState({ [layer]: flag }, () => flag ? this.state.map.mapDisplay.show(layer) : this.state.map.mapDisplay.hide(layer));
    }
    setFatherState = (ops) => this.setState(ops);
    render() {
        let { tview = [], idx = 0 } = this.state;
        return (
            <div className='pierMap' style={{ overflow: 'hidden', height: '100%' }}>
                <div className='pierleft'>
                    <div ref="iframe"></div>
                    {this.state.map ? <MapOperation map={this.state.map} datas={this.props.datas} defaultLayer={this.props.defaultLayer} /> : null}
                    <div className="mapbtn">
                        {this.state.map ? <div onClick={() => this.showLayer('VIDEO_LAYER')} style={{margin: '20px'}} className={!this.state.VIDEO_LAYER ? 'mapbtn-noSelected' : 'mapbtn-btn1'}>视频</div> : null}
                        {this.state.map && this.props.datas.type == 1 ? <div onClick={() => this.showLayer('S_LAYER')} style={{margin: '20px'}} className={!this.state.S_LAYER ? 'mapbtn-noSelected' : 'mapbtn-btn2'}>班轮</div> : null}
                        {this.state.map && this.props.datas.type == 1 ? <div onClick={() => this.showLayer('B_LAYER')} style={{margin: '20px'}} className={!this.state.B_LAYER ? 'mapbtn-noSelected' : 'mapbtn-btn3'}>驳船</div> : null}
                    </div>
                </div>
                <div className='pierRight' style={{ marginLeft: 30 }}>
                    {this.state.map ? <PierRightPanel datas={this.props.datas} map={this.state.map} setFatherState={this.setFatherState}/> : null}
                </div>
            </div>
        )
    }
}