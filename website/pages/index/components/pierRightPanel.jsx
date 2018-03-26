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
        onyard: [],              //各栏堆存柜量
        berths: [],               //泊位停靠船舶信息
        scctyard: [],            //超过三个月海关未放行的柜量
        ships: [],               //整船换装柜量
        wharf: {               //码头数据
            BYLANENO: [],
            GIS: [],
            BYCNTR: [],        //详细信息
        }
    }
    componentDidMount() {
        let pa = [{
            paramName: "P_TERMINALCODE",
            value: this.props.datas.code
        }];
        /** 各栏堆存柜量 */
        publish('webAction', { svn: 'skhg_loader_service', path: 'queryTableByWhere', data: { tableName: 'V_IMAP_SCCT_ONYARD', where: "TERMINALCODE= '" + this.props.datas.code + "'" } }).then((res) => {
            this.setState({
                onyard: res[0].data
            })
        });

        /** 泊位停靠船舶信息 */
        publish('webAction', { svn: 'skhg_loader_service', path: 'queryTableByWhere', data: { tableName: 'V_IMAP_SCCT_BERTH', where: "TERMINALCODE= '" + this.props.datas.code + "'" } }).then((res) => {
            this.setState({
                berths: res[0].data
            })
        });

        /** 超三个月海关未放行的柜列表  */
        publish('webAction', { svn: 'skhg_loader_service', path: 'queryPro', data: { proName: 'P_IMAP_SCCTYARD_NOCUS90', parms: JSON.stringify(pa) } }).then((res) => {
            this.setState({
                scctyard: res[0].data.CUR_A
            })
        });

    };

    /** 点击事件 */
    onClick = (data) => {
        console.log(data);
    }
    export = (id) => {
        console.log(id);
    }

    /** 超三个月海关未放行的柜列表 点击相应的柜信息实现定位及输出信息完整显示 */
    nocus90 = (e) => {
        let json = {};
        e['colname'] = 'nocus90';
        e['name'] = '超三个月的柜子';
        json['attributes'] = e;
        this.handleNbr(e);
        publish('box_Information', json);
    }


    /** 双击显示场位的集装箱 */
    OnfindBox = (e) => {
        let pa = [{
            paramName: "P_TERMINALCODE",
            value: this.props.datas.code
        }, {
            paramName: "P_LANENO",
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
                    let js = khsj[0][o]['YARDLANENO'] + khsj[0][o].YARDBAYNO + khsj[0][o].YARDROWNO;
                    if (typeof (resjson[js]) === 'undefined') {
                        resjson[js] = [khsj[0][o]];
                    } else {
                        resjson[js].push(khsj[0][o]);
                    }
                }
                for (let i in ors[0].data) {
                    orsJson[ors[0].data[i].name] = [ors[0].data[i]];
                }
                this.huatu(resjson, orsJson);
            })
        });
    }

    /** 画箱子 */
    huatu(res, ors) {
        this.props.map.mapDisplay.clearLayer('box_view');
        this.props.map.mapDisplay.clearLayer('textLayer');
        for (let key in res) {
            let o = res[key];
            res[key]['colname'] = 'onyard';
            res[key]['name'] = '柜子';
            if (typeof (ors[key]) !== 'undefined') {
                let dots = ors[key][0].geom.rings[0].map((p) => { return { x: p[0], y: p[1] }; });
                let params = {
                    id: 'box_view' + o,
                    linecolor: 'blue',
                    layerId: 'box_view',
                    dots: dots,
                    attr: { ...res[key] },
                    click: this.showContainerModal,
                    linewidth: 0,
                }
                this.props.map.mapDisplay.polygon(params,7);
            }
        }
    }


    /** 柜量信息 */
    showContainerModal = (e) => {
        publish('box_Information', e);
    };

    /** 缩放和指示位置 */
    handleNbr = (e) => {
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
                let point = { x: x / 4, y: y / 4 };
                const level = 5;
                this.props.map.mapOper.centerAndZoom(point,level);
                this.props.map.mapDisplay.image(mText);
            } else {
                alert("没有地址~");
            }
        })
    }

    render() {
        let { berths = [], onyard = [], scctyard = [] } = this.state;
        const onyardFlds = [
            { title: '码头', name: 'TERMINALCODE' },
            { title: '堆场位置', name: 'YARD' },
            { title: '堆存柜量', name: 'CNTRCOUNT' },
        ];
        const berthsFlds = [
            { title: '船舶名称', name: 'CVESSELNAME' },
            { title: '船舶编码', name: 'EVESSELNAME' },
            { title: '靠泊泊位', name: 'BERTHSEQ' },
            { title: '船舶类型', name: 'VESSELTYPE' },
        ];
        const scctyardFlds = [
            { title: '箱号', name: 'YARDCELL' },
            { title: '堆存天数', name: 'POOLDAYS' },
        ];
        const shipsFlds = [
            { title: '箱号', name: 'YARDCELL' },
            { title: '栏位', name: 'YARDLANENO' },
            { title: '贝位', name: 'YARDBAYNO' },
            { title: '列号', name: 'YARDROWNO' },
            { title: '层高', name: 'YARDTIERNO' },
        ];
        let data = [
            { name: 'SCT 1# 2#堆场', url: 'http://www.cheluyun.com/javascript/zsg/?id=100031600&rtmp=rtmp://playrtmp.simope.com:1935/live/524622521d?liveID=100031600&hls=http://playhls.simope.com/live/524622521d/playlist.m3u8?liveID=100031600' },
            { name: 'SCT 1# 2#堆场', url: 'http://www.cheluyun.com/javascript/zsg/?id=100031600&rtmp=rtmp://playrtmp.simope.com:1935/live/524622521d?liveID=100031600&hls=http://playhls.simope.com/live/524622521d/playlist.m3u8?liveID=100031600' },
        ];
        let id1 = 'a1', id2 = 'a2', id3 = 'a3', id4 = 'a4';
        return (
            <div className='pierRight-1'>
                <div style={{ width: 3750 }}>
                    <Table rowNo={true} title={<Title title={'各栏堆存柜量'} id={id1} />} style={{ width: '40%', height: 775 }} id={id1} selectedIndex={null} flds={onyardFlds} datas={onyard} trClick={this.OnfindBox.bind(this)} trDbclick={null} />
                    <Table rowNo={true} title={<Title title={'泊位停靠船舶信息'} id={id2} />} style={{ width: '59%', height: 775 }} id={id2} selectedIndex={null} flds={berthsFlds} datas={berths} trClick={null} trDbclick={null} />
                </div>
                <div style={{ width: 3750 }}>
                    <Table rowNo={true} title={<Title title={'超三个月海关未放行柜列表'} id={id3} />} style={{ width: '40%', height: 775 }} id={id3} selectedIndex={null} flds={scctyardFlds} datas={scctyard} trClick={this.nocus90.bind(this)} trDbclick={null} />
                    <Table rowNo={true} title={<Title title={'在场整船换装柜列表'} id={id4} />} style={{ width: '59%', height: 775 }} id={id4} selectedIndex={null} flds={shipsFlds} datas={scctyard} trClick={null} trDbclick={null} />
                </div>
                <div style={{ padding: '10px', border: '2px solid #1890ff', width: 3730 }}>
                    <Vedios style={{ width: 1855, height: 1100 }} datas={data} />
                    <Vedios style={{ width: 1855, height: 1100 }} datas={data} />
                </div>
            </div>
        )
    }
} 