import '../less';
import 'animate.css';
import React from 'react';
import ReactDOM from 'react-dom';
import { publish } from '../../../frame/core/arbiter';
import { table2Excel } from '../../../frame/core/table2Excel';
import { Panel, WordsContent, Table, Vedios } from '../../../frame/componets/index';
import echarts from 'echarts';
import $ from 'jquery';
import _ from 'lodash';
import zb from '../images/倒三角.png';
import up from '../images/向上.png';

var Mock = require('mockjs')
var Nowdata = Mock.mock({
    // 属性 list 的值是一个数组，其中含有 1 到 10 个元素
    'list|1-9': [{
        // 属性 id 是一个自增数，起始值为 1，每次增 1
        'id|+1': 1,
        'today|1-1000': 10,
        'yesterday|1-1000': 10,
        'cname': '@cword("一二三四五六七八九十",1,1)',
    }]
});

// 智能预警右侧组件
export default class PierRightPanel extends React.Component {
    state = {
        warehouse: [],
        park: [],
        onyard: [],              //各栏堆存柜量
        berths: [],               //泊位停靠船舶信息
        scctyard: [],            //超过三个月海关未放行的柜量
        ships: [],               //整船换装柜量
        wharf: {               //码头数据
            BYLANENO: [],
            GIS: [],
            BYCNTR: [],        //详细信息
        },
        onyardFlds: [],
        berthsFlds: [],
        scctyardFlds: [],
        shipsFlds: [],
        tableyardFlds: [],
        anchorFlds: [],
        vedios: [],
        vediosHeight: 1100,
        cic0: {flds: [], datas: []},
        cic1: {flds: [], datas: []},
        cic2: {flds: [], datas: []},
    }
    componentDidMount() {
        let data = [
            { name: 'SCT 1# 2#堆场', url: 'http://www.cheluyun.com/javascript/zsg/?id=100031600&rtmp=rtmp://playrtmp.simope.com:1935/live/524622521d?liveID=100031600&hls=http://playhls.simope.com/live/524622521d/playlist.m3u8?liveID=100031600' },
            //{ name: 'SCT 1# 2#堆场', url: 'http://www.cheluyun.com/javascript/zsg/?id=100031600&rtmp=rtmp://playrtmp.simope.com:1935/live/524622521d?liveID=100031600&hls=http://playhls.simope.com/live/524622521d/playlist.m3u8?liveID=100031600' },
        ];
        const vedios = {
            sct: [[
                [{ name: '卡口外南(云台)', url: 'http://172.28.1.65:8020/?ip=172.28.4.130' }], 
                [{ name: '危险品堆场北(云台)', url: 'http://172.28.1.65:8020/?ip=172.28.4.154' }]
            ]],
            cct: [[data, data]],
            mct: [[data, data]],
            cmbl: [
                [[{name: '招商保税101库球机', url: 'http://172.28.1.65:8020/?ip=10.131.16.12'}], [{name: '招商保税102库球机', url: 'http://172.28.1.65:8020/?ip=10.131.16.16'}]],
                [[{name: '招商保税103库球机', url: 'http://172.28.1.65:8020/?ip=10.131.16.19'}], [{name: '招商保税104库球机', url: 'http://172.28.1.65:8020/?ip=10.131.16.22'}]], 
                [data, data]
            ],
            cic: [],
            yth: [[data, data], [data, data]],
            ylmg: [[data, data], [data, data]],
            cwgh: [[data, data]],
            zsgw: [[data, data]],
            zgms_ck: [[data, data], [data, data]],
            szms_ck: [[data, data], [data, data]],
        };
        publish('tableName_find').then((res) => {
            let temp = {};
            res[0].features.forEach((value, key) => temp[value.type] = value.table);
            this.setState(temp, () => {
                if (this.props.datas.type == 1) {
                    this.setState({ vedios: vedios[this.props.datas.code.toLowerCase()], vediosHeight: 1100 });
                    let pa = [{ paramName: 'P_TERMINALCODE', value: this.props.datas.code }];
                    /** 各栏堆存柜量 */
                    publish('webAction', { svn: 'skhg_loader_service', path: 'queryTableByWhere', data: { tableName: 'V_IMAP_SCCT_ONYARD', where: "TERMINALCODE= '" + this.props.datas.code + "'" } }).then((res) => this.setState({ onyard: res[0].data }));
                    /** 泊位停靠船舶信息 */
                    publish('webAction', { svn: 'skhg_loader_service', path: 'queryTableByWhere', data: { tableName: 'V_IMAP_SCCT_BERTH', where: "TERMINALCODE= '" + this.props.datas.code + "'" } }).then((res) => {
                        res[0].data.forEach((value, key) => value.VESSELTYPE === 'B' ? value.VESSELTYPE = '大船' : value.VESSELTYPE = '驳船')
                        this.setState({ berths: res[0].data });
                        //this.drawShips(res[0].data);
                    });
                    /** 超三个月海关未放行的柜列表  */
                    publish('webAction', { svn: 'skhg_loader_service', path: 'queryPro', data: { proName: 'P_IMAP_SCCTYARD_NOCUS90', parms: JSON.stringify(pa) } }).then((res) => this.setState({ scctyard: res[0].data }));
                }
                else if (this.props.datas.type == 4) {
                    if (this.props.datas.ssdw == 'CIC') {
                        Promise.all([
                            publish('getData', { svn: 'skhg_loader', tableName: 'V_IMAP_ALERTING_11', data: { pageno: 1, pagesize: 10000, where: '1=1' } }),
                            publish('getData', { svn: 'skhg_loader', tableName: 'V_IMAP_ALERTING_12', data: { pageno: 1, pagesize: 10000, where: '1=1' } }),
                            publish('getData', { svn: 'skhg_loader', tableName: 'V_IMAP_ALERTING_13', data: { pageno: 1, pagesize: 10000, where: '1=1' } }),
                        ]).then((res) => {
                            console.log(res);
                            res.forEach((r, i) => {
                                this.setState({['cic' + i]: {
                                    flds: res[i][0].fields.map((e) => {return {title: e.alias, dataIndex: e.name}}),
                                    datas: res[i][0].features.map((e) => e.attributes)
                                }});
                            });
                        });
                    }
                    else {
                        publish('pire_right_yq_axis', { value: Nowdata }).then((res) => {
                            if (this.chart) this.chart.dispose();
                            this.chart = echarts.init(ReactDOM.findDOMNode(this.refs.echart1));
                            this.chart.setOption(res[0]);
                        });
                        this.setState({ vedios: vedios[this.props.datas.code.toLowerCase()], vediosHeight: 930 });
                    }
                } else if (this.props.datas.type == 2) {
                    publish('port_2_bar').then((res) => {
                        if (this.chart2) this.chart2.dispose();
                        this.chart2 = echarts.init(ReactDOM.findDOMNode(this.refs.echart2));
                        this.chart2.setOption(res[0]);
                    });
                    publish('port_2_bar').then((res) => {
                        if (this.chart3) this.chart3.dispose();
                        this.chart3 = echarts.init(ReactDOM.findDOMNode(this.refs.echart3));
                        this.chart3.setOption(res[0]);
                    });
                    this.setState({ vedios: vedios[this.props.datas.code.toLowerCase()], vediosHeight: 930 });
                }
                else {
                    this.setState({ vedios: vedios[this.props.datas.code.toLowerCase()], vediosHeight: 870 });
                }
            });
        });
    }

    componentWillUnmount() {
        this.props.map.mapDisplay.clearLayer('box_view');
        this.props.map.mapDisplay.clearLayer('CONTAINERVIEW_LAYER');
        this.props.map.mapDisplay.clearLayer('CONTAINERVIEW_LAYER_BOX');
    }

    //绘制大船驳船
    drawShips = (data) => {
        publish('webAction', { svn: 'skhg_service', path: 'queryGeomTable', data: { tableName: 'SK_BERTH_GIS', where: "SSDW='SCT'" } }).then((res) => {
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
                        click: () => alert(),
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
                        }
                    }
                    this.props.map.mapDisplay.image(param);
                }
            });
            this.props.map.mapDisplay.hide('S_LAYER');
            this.props.map.mapDisplay.hide('B_LAYER');
            this.props.setFatherState({S_LAYER: false, B_LAYER: false});
        });
    }

    /** 超三个月海关未放行的柜列表 点击相应的柜信息实现定位及输出信息完整显示 */
    nocus90 = (e) => {
        let json = {};
        e.colname = 'onyard';
        e.name = '柜子';
        json.attributes = e;
        /** 缩放 */
        publish('box_location', e);
        /** 详情 */
        publish('box_onIconClick', json);
        publish('getVideoAndDisplay', {map: this.props.map, type: '集装箱', data: {ssdw: this.props.datas.ssdw, lw: e.YARDLANENO}});
    }

    /** 柜量信息 */
    showContainerModal = (e) => {
        publish('box_model', e);
    };

    /** 单击显示场位的集装箱 */
    OnfindBox = (e) => {
        window.openLoading();
        publish('box_handleCloseDesDailog', {});
        let pa = [{
            paramName: 'P_TERMINALCODE',
            value: this.props.datas.code
        }, {
            paramName: 'P_LANENO',
            value: e.YARD
        }];
        /** 
         *  备注： 
         *       res 查询loader存储.点击对应的栏号编码后读取该栏号的在场柜
         *       ors 查询skhg表.    点击对应的栏号编码后得到表中场位中所有的箱量
        */
        let khsj = [];
        let bdsj = [];
        let resjson = {};
        let orsJson = {};
        publish('webAction', { svn: 'skhg_loader_service', path: 'queryPro', data: { proName: 'P_IMAP_SCCTYARD_BYLANENO', parms: JSON.stringify(pa) } }).then((res) => {
            khsj.push(res[0].data);
            publish('webAction', { svn: 'skhg_service', path: 'queryGeomTable', data: { tableName: 'SK_MAP_GIS', where: "SSDW like '%" + this.props.datas.code + "' and NAME LIKE '" + e.YARD.replace('*', '') + "%'    " } }).then((ors) => {
                /** 匹配数据 */
                for (let o in khsj[0]) {
                    let js = khsj[0][o].YARDLANENO + khsj[0][o].YARDBAYNO + khsj[0][o].YARDROWNO;
                    if (typeof (resjson[js]) === 'undefined') {
                        resjson[js] = [khsj[0][o]];
                    } else {
                        resjson[js].push(khsj[0][o]);
                    }
                }
                for (let i in ors[0].data) {
                    orsJson[ors[0].data[i].name] = [ors[0].data[i]];
                }
                publish('box', { khsj: khsj[0], bdsj: resjson });
                this.huatu(resjson, orsJson);
            })
        });
    }

    /** 单击显示船舶定位 */
    OnfindBerth = (e) => {
        publish('webAction', { svn: 'skhg_service', path: 'queryGeomTable', data: { tableName: 'SK_BERTH_GIS', where: "SSDW = '" + this.props.datas.code + "' and CODE = '" + e.BERTHNO + "'" } }).then((ors) => {
            /** 去展示船的定位和详细信息 */
            publish('berth_ship', { a: e, b: ors });
        })
        publish('getVideoAndDisplay', {map: this.props.map, type: '船舶', data: {ssdw: e.TERMINALCODE, bw: e.BERTHNO}});
    }
    /** 画箱子 */
    huatu(res, ors) {
        this.props.map.mapDisplay.clearLayer('box_view');
        this.props.map.mapDisplay.clearLayer('box_view');
        this.props.map.mapDisplay.clearLayer('textLayer');
        let first = true;
        for (let key in res) {
            let o = res[key];
            res[key].colname = 'onyard';
            res[key].name = '柜子';
            let orsKey = key.indexOf('*') >= 0 ? key.substring(1,6) + key.substring(7,8) : key;
            if (typeof (ors[orsKey]) !== 'undefined') {
                let dots = ors[orsKey][0].geom.rings[0].map((p) => { return { x: p[0], y: p[1] }; });
                let params = {
                    id: 'box_view' + o,
                    linecolor: [255, 0, 0, 1],
                    fillcolor: [255, 0, 0, 1],
                    layerId: 'box_view',
                    dots: dots,
                    attr: { ...res[key] },
                    click: this.showContainerModal,
                    linewidth: 0,
                };
                let points = dots.slice(0, 4);
                let x = points[0].x + points[1].x + points[2].x + points[3].x;
                let y = points[0].y + points[1].y + points[2].y + points[3].y;
                let point = { x: x / 4, y: y / 4 };
                const level = 5;
                if (first) {
                    this.props.map.mapOper.centerAndZoom(point, level);
                    first = false;
                }
                this.props.map.mapDisplay.polygon(params);
            }
        }
        window.closeLoading();
        if (first) layer.msg('未匹配到定位数据，请联系管理员!');
    }

    render() {
        let { vedios, vediosHeight } = this.state;
        let id1 = 'a1', id2 = 'a2', id3 = 'a3', id4 = 'a4';
        let items = [];
        let { type } = this.props.datas;
        if (type == 1) {
            items = [
                <div style={{ width: 3750 }} key='1'>
                    <Table rowNo={true} title={{name: '各栏堆存柜量', export: true}} style={{ width: '40%', height: 888 }} id={id1} selectedIndex={null} flds={this.state.onyardFlds} datas={this.state.onyard} trClick={this.OnfindBox.bind(this)} trDbclick={null} />
                    <Table rowNo={true} title={{name: '泊位停靠船舶信息', export: true}} style={{ width: '59%', height: 888 }} id={id2} selectedIndex={null} flds={this.state.berthsFlds} datas={this.state.berths} trClick={this.OnfindBerth.bind(this)} trDbclick={null} />
                </div>,
                <div style={{ width: 3750 }} key='2'>
                    <Table rowNo={true} title={{name: '超三个月海关未放行柜列表', export: true}} style={{ width: '40%', height: 888 }} id={id3} selectedIndex={null} flds={this.state.scctyardFlds} datas={this.state.scctyard} trClick={this.nocus90.bind(this)} trDbclick={null} />
                    <Table rowNo={true} title={{name: '在场整船换装柜列表', export: true}} style={{ width: '59%', height: 888 }} id={id4} selectedIndex={null} flds={this.state.shipsFlds} datas={[]} trClick={null} trDbclick={null} />
                </div>
            ];
        } else if (type == 2) {
            items = [
                <div style={{ width: 3750 }} key='1'>
                    <Table rowNo={true} title={{name: '堆场', export: true}} style={{ width: '40%', height: 775 }} id={id1} selectedIndex={null} flds={this.state.tableyardFlds} datas={this.state.scctyard} trClick={null} trDbclick={null} />
                    <Table rowNo={true} title={{name: '泊位停靠船舶信息', export: true}} style={{ width: '59%', height: 775 }} id={id2} selectedIndex={null} flds={this.state.anchorFlds} datas={this.state.scctyard} trClick={null} trDbclick={null} />
                </div>,
                <div style={{ width: 3750 }} key='2'>
                    <div className="szmt">
                        <div className="szmt-top">船舶进出港情况</div>
                        <div className="szmt-left">
                            <div style={{ height: '100%', width: '100%' }} ref="echart2"></div>
                        </div>
                    </div>
                    <div className="szmt">
                        <div className="szmt-top">游客进出港情况</div>
                        <div className="szmt-right">
                            <div style={{ height: '100%', width: '100%' }} ref="echart3"></div>
                        </div>
                    </div>
                </div>
            ];
        }
        else if (type == 4) {
            if (this.props.datas.ssdw == 'CIC') {
                items = [
                    <div style={{ width: 3750 }} key='1'>
                        <Table rowNo={true} title={{name: '收到查验指令24小时未调入CIC', export: true}} style={{ width: '100%', height: 890 }} id={id1} selectedIndex={null} flds={this.state.cic0.flds} datas={this.state.cic0.datas} trClick={null} trDbclick={null} />
                    </div>,
                    <div style={{ width: 3750 }} key='2'>
                        <Table rowNo={true} title={{name: '调入CIC超24小时未查验', export: true}} style={{ width: '100%', height: 890 }} id={id2} selectedIndex={null} flds={this.state.cic1.flds} datas={this.state.cic1.datas} trClick={null} trDbclick={null} />
                    </div>,
                    <div style={{ width: 3750 }} key='3'>
                        <Table rowNo={true} title={{name: '查验完毕超12小时未调离CIC', export: true}} style={{ width: '100%', height: 890 }} id={id3} selectedIndex={null} flds={this.state.cic2.flds} datas={this.state.cic2.datas} trClick={null} trDbclick={null} />
                    </div>
                ];
            }
            else{

            }
            // else {
            //     items = [
            //         <div className="houseView" key='1'>
            //             <div className="houseView-leftspan">
            //                 仓<br />库<br />库<br />存<br />情<br />况
            //            </div>
            //             <div className="houseView-view test-1">
            //                 <div className="houseView-view-cendiv">
            //                     {Nowdata.list.map((value, key) => { return <div key={key}>仓库{value.cname}</div> })}
            //                 </div>
            //                 <div className="houseView-view-ec">
            //                     <div className='houseView-view-ec-row' style={{ height: '100%', width: '100%' }} ref="echart1"></div>
            //                 </div>
            //                 <div className="houseView-view-rig">
            //                     <div className="houseView-view-rig-top">
            //                         <div>今日</div>
            //                         <div>昨日</div>
            //                         <div>同比</div>
            //                     </div>
            //                     <div className="houseView-view-rig-num">
            //                         {Nowdata.list.map((value, key) => {
            //                             if (value.today > value.yesterday) {
            //                                 return <div key={key}>
            //                                     <div>{value.today}</div>
            //                                     <div>{value.yesterday}</div>
            //                                     <div className="houseView-view-rig-num-green">{Math.abs((value.today - value.yesterday) / value.yesterday * 100).toFixed(2)}%</div>
            //                                 </div>
            //                             } else return <div key={key}>
            //                                 <div>{value.today}</div>
            //                                 <div>{value.yesterday}</div>
            //                                 <div className="houseView-view-rig-num-red">{Math.abs((value.today - value.yesterday) / value.yesterday * 100).toFixed(2)}%</div>
            //                             </div>
            //                         })}
            //                     </div>
            //                 </div>
            //             </div>
            //         </div>
            //     ];
            // }
        }
        else {
            let fld = [
                {title: '属性1', dataIndex: 'a'},
                {title: '属性2', dataIndex: 'b'},
                {title: '属性3', dataIndex: 'c'},
                {title: '属性4', dataIndex: 'd'},
                {title: '属性5', dataIndex: 'e'}
            ];
            items = [
                <div style={{ width: 3750 }} key='1'>
                    <Table rowNo={true} title={{name: this.props.datas.name + '业务数据', export: true}} style={{ width: '100%', height: 880 }} id={id1} selectedIndex={null} flds={fld} datas={[]} trClick={null} trDbclick={null} />
                </div>
            ];
        }
        return (
            <div className='pierRight-1'>
                {items}
                {vedios.map((e, i) => <div key={i} style={{ padding: '10px', border: '2px solid #1890ff', width: 3730 }}>
                    <Vedios style={{ width: 1855, height: 870 }} datas={e[0]} />
                    <Vedios style={{ width: 1855, height: 870 }} datas={e[1]} />
                </div>)}
            </div>
        )
    }
} 