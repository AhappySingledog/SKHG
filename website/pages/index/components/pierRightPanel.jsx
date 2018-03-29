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

class Title extends React.Component {
    export = () => {
        console.log(this.props.id);
        table2Excel(this.props.id);
    }
    render() {
        return (
            <div className='tableTitle'><div className='tableTitle-n'>{this.props.title}</div><div className='tableTitle-b' onClick={() => this.export()}></div></div>
        )
    }
}

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
        vedios: [],
        vediosHeight: 1100,
    }
    componentDidMount() {
        let data = [
            { name: 'SCT 1# 2#堆场', url: 'http://www.cheluyun.com/javascript/zsg/?id=100031600&rtmp=rtmp://playrtmp.simope.com:1935/live/524622521d?liveID=100031600&hls=http://playhls.simope.com/live/524622521d/playlist.m3u8?liveID=100031600' },
            { name: 'SCT 1# 2#堆场', url: 'http://www.cheluyun.com/javascript/zsg/?id=100031600&rtmp=rtmp://playrtmp.simope.com:1935/live/524622521d?liveID=100031600&hls=http://playhls.simope.com/live/524622521d/playlist.m3u8?liveID=100031600' },
        ];
        const vedios = {
            sct: [[data, data]],
            cct: [[data, data]],
            mct: [[data, data]],
            cmbl: [[data, data], [data, data]],
            cic: [[data, data], [data, data]],
            yth: [[data, data], [data, data], [data, data]],
            ylmg: [[data, data], [data, data], [data, data]],
        };
        publish('tableName_find').then((res) => {
            let temp = {};
            res[0].features.forEach((value, key) => temp[value.type] = value.talbe);
            this.setState(temp, () => {
                if (this.props.datas.type == 1) {
                    this.setState({ vedios: vedios[this.props.datas.code.toLowerCase()], vediosHeight: 1100 });
                    let pa = [{
                        paramName: 'P_TERMINALCODE',
                        value: this.props.datas.code
                    }];
                    /** 各栏堆存柜量 */
                    publish('webAction', { svn: 'skhg_loader_service', path: 'queryTableByWhere', data: { tableName: 'V_IMAP_SCCT_ONYARD', where: "TERMINALCODE= '" + this.props.datas.code + "'" } }).then((res) => this.setState({ onyard: res[0].data }));
                    /** 泊位停靠船舶信息 */
                    publish('webAction', { svn: 'skhg_loader_service', path: 'queryTableByWhere', data: { tableName: 'V_IMAP_SCCT_BERTH', where: "TERMINALCODE= '" + this.props.datas.code + "'" } }).then((res) => this.setState({ berths: res[0].data }));
                    /** 超三个月海关未放行的柜列表  */
                    publish('webAction', { svn: 'skhg_loader_service', path: 'queryPro', data: { proName: 'P_IMAP_SCCTYARD_NOCUS90', parms: JSON.stringify(pa) } }).then((res) => this.setState({ scctyard: res[0].data.CUR_A }));
                }
                else if (this.props.datas.type == 4) {
                    publish('pire_right_yq_axis').then((res) => {
                        if (this.chart) this.chart.dispose();
                        this.chart = echarts.init(ReactDOM.findDOMNode(this.refs.echart1));
                        this.chart.setOption(res[0]);
                    });
                    this.setState({ vedios: vedios[this.props.datas.code.toLowerCase()], vediosHeight: 930 });
                } else if (this.props.datas.type === 2) {

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

    /** 超三个月海关未放行的柜列表 点击相应的柜信息实现定位及输出信息完整显示 */
    nocus90 = (e) => {
        let json = {};
        e.colname = 'onyard';
        e.name = '超三个月的柜子';
        json.attributes = e;
        publish('box_location', e);
        publish('box_onIconClick', json);
    }

    /** 柜量信息 */
    showContainerModal = (e) => {
        publish('box_model', e);
    };

    /** 单击显示场位的集装箱 */
    OnfindBox = (e) => {
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
            khsj.push(res[0].data.CUR_A);
            publish('webAction', { svn: 'skhg_service', path: 'queryGeomTable', data: { tableName: 'GIS_CCT', where: "SSDW like '%" + this.props.datas.code + "' and NAME LIKE '" + e.YARD + "%'    " } }).then((ors) => {
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

    /** 画箱子 */
    huatu(res, ors) {
        this.props.map.mapDisplay.clearLayer('box_view');
        this.props.map.mapDisplay.clearLayer('box_view');
        this.props.map.mapDisplay.clearLayer('textLayer');
        for (let key in res) {
            let o = res[key];
            res[key].colname = 'onyard';
            res[key].name = '柜子';
            if (typeof (ors[key]) !== 'undefined') {
                let dots = ors[key][0].geom.rings[0].map((p) => { return { x: p[0], y: p[1] }; });
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
                this.props.map.mapOper.centerAndZoom(point, level);
                this.props.map.mapDisplay.polygon(params);
            }
        }
    }

    render() {
        let { vedios, vediosHeight } = this.state;
        let id1 = 'a1', id2 = 'a2', id3 = 'a3', id4 = 'a4';
        let items = [];
        let { type } = this.props.datas;
        if (type == 1) {
            items = [
                <div style={{ width: 3750 }} key='1'>
                    <Table rowNo={true} title={<Title title={'各栏堆存柜量'} id={id1} />} style={{ width: '40%', height: 775 }} id={id1} selectedIndex={null} flds={this.state.onyardFlds} datas={this.state.onyard} trClick={this.OnfindBox.bind(this)} trDbclick={null} />
                    <Table rowNo={true} title={<Title title={'泊位停靠船舶信息'} id={id2} />} style={{ width: '59%', height: 775 }} id={id2} selectedIndex={null} flds={this.state.berthsFlds} datas={this.state.berths} trClick={null} trDbclick={null} />
                </div>,
                <div style={{ width: 3750 }} key='2'>
                    <Table rowNo={true} title={<Title title={'超三个月海关未放行柜列表'} id={id3} />} style={{ width: '40%', height: 775 }} id={id3} selectedIndex={null} flds={this.state.scctyardFlds} datas={this.state.scctyard} trClick={this.nocus90.bind(this)} trDbclick={null} />
                    <Table rowNo={true} title={<Title title={'在场整船换装柜列表'} id={id4} />} style={{ width: '59%', height: 775 }} id={id4} selectedIndex={null} flds={this.state.shipsFlds} datas={this.state.berths} trClick={null} trDbclick={null} />
                </div>
            ];
        }
        else if (type == 4) {
            items = [
                <div className="houseView" key='1'>
                    <div className="houseView-leftspan">
                        仓<br />库<br />库<br />存<br />情<br />况
                   </div>
                    <div className="houseView-view">
                        <div className="houseView-view-cendiv">
                            <div >仓库一</div>
                            <div >仓库二</div>
                            <div >仓库三</div>
                            <div >仓库四</div>
                            <div >仓库五</div>
                            <div >仓库六</div>
                            <div >仓库七</div>
                            <div >仓库八</div>
                            <div >仓库九</div>
                            <div >仓库十</div>
                        </div>
                        <div className="houseView-view-ec">
                            <div className='houseView-view-ec-row' style={{ height: '100%', width: '100%' }} ref="echart1"></div>
                        </div>
                        <div className="houseView-view-rig">
                            <div className="houseView-view-rig-top">
                                <div>今日</div>
                                <div>昨日</div>
                                <div>同比</div>
                            </div>
                            <div className="houseView-view-rig-num">
                                <div>
                                    <div>913</div>
                                    <div>880</div>
                                    <div className="houseView-view-rig-num-green">3.75%</div>
                                </div>

                                <div >
                                    <div>913</div>
                                    <div>880</div>
                                    <div className="houseView-view-rig-num-red">3.75%</div>
                                </div>

                                <div>
                                    <div>913</div>
                                    <div>880</div>
                                    <div className="houseView-view-rig-num-green">3.75%</div>
                                </div>

                                <div>
                                    <div>913</div>
                                    <div>880</div>
                                    <div className="houseView-view-rig-num-red">3.75%</div>
                                </div>

                                <div>
                                    <div>913</div>
                                    <div>880</div>
                                    <div className="houseView-view-rig-num-green">3.75%</div>
                                </div>

                                <div>
                                    <div>913</div>
                                    <div>880</div>
                                    <div className="houseView-view-rig-num-red">3.75%</div>
                                </div>

                                <div>
                                    <div>913</div>
                                    <div>880</div>
                                    <div className="houseView-view-rig-num-red">3.75%</div>
                                </div>

                                <div>
                                    <div>913</div>
                                    <div>880</div>
                                    <div className="houseView-view-rig-num-red">3.75%</div>
                                </div>

                                <div>
                                    <div>913</div>
                                    <div>880</div>
                                    <div className="houseView-view-rig-num-red">3.75%</div>
                                </div>

                                <div>
                                    <div>913</div>
                                    <div>880</div>
                                    <div className="houseView-view-rig-num-red">3.75%</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ];
        }
        return (
            <div className='pierRight-1'>
                {items}
                {vedios.map((e, i) => <div key={i} style={{ padding: '10px', border: '2px solid #1890ff', width: 3730 }}>
                    <Vedios style={{ width: 1855, height: vediosHeight }} datas={e[0]} />
                    <Vedios style={{ width: 1855, height: vediosHeight }} datas={e[1]} />
                </div>)}
            </div>
        )
    }
} 