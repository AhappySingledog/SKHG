import '../less';
import 'animate.css';
import React from 'react';
import ReactDOM from 'react-dom';
import { publish } from '../../../frame/core/arbiter';
import { Panel, WordsContent, Table, Vedios } from '../../../frame/componets/index';
import echarts from 'echarts';
import $ from 'jquery';
import _ from 'lodash';

class Title extends React.Component {
    export = () => {
        console.log(this.props.id);
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
        // let code = JSON.stringify(this.props.datas.code).replace(/\"/g, "'");
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
    /** 双击显示箱位位置 */
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
        publish('webAction', { svn: 'skhg_loader_service', path: 'queryPro', data: { proName: 'P_IMAP_SCCTYARD_BYLANENO', parms: JSON.stringify(pa) } }).then((res) => {
            this.setState({ BYLANENO: res[0].data.CUR_A })
        });
        
        publish('webAction', { svn: 'skhg_service', path: 'queryGeomTable', data: { tableName: 'GIS_CCT', where: "SSDW like '%" + this.props.datas.code + "' and NAME LIKE '" + e.YARD + "%'"  } }).then((ors) => {
            this.setState({ GIS: ors });
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
            { title: '栏位', name: 'YARDLANENO' },
            { title: '贝位', name: 'YARDBAYNO' },
            { title: '列号', name: 'YARDROWNO' },
            { title: '层高', name: 'YARDTIERNO' },
        ];
        const shipsFlds = [
            { title: '箱号', name: 'YARDCELL' },
            { title: '栏位', name: 'YARDLANENO' },
            { title: '贝位', name: 'YARDBAYNO' },
            { title: '列号', name: 'YARDROWNO' },
            { title: '层高', name: 'YARDTIERNO' },
        ]
        let data = [
            { name: 'SCT 1# 2#堆场', url: 'http://www.cheluyun.com/javascript/zsg/?id=100031600&rtmp=rtmp://playrtmp.simope.com:1935/live/524622521d?liveID=100031600&hls=http://playhls.simope.com/live/524622521d/playlist.m3u8?liveID=100031600' },
            { name: 'SCT 1# 2#堆场', url: 'http://www.cheluyun.com/javascript/zsg/?id=100031600&rtmp=rtmp://playrtmp.simope.com:1935/live/524622521d?liveID=100031600&hls=http://playhls.simope.com/live/524622521d/playlist.m3u8?liveID=100031600' },
        ];
        let id1 = 'a1', id2 = 'a2', id3 = 'a3', id4 = 'a4';
        return (
            <div className='pierRight-1'>
                <div style={{ width: 3750 }}>
                    <Table rowNo={true} title={<Title title={'各栏堆存柜量'} id={id1} />} style={{ width: '40%', height: 775 }} id={id1} selectedIndex={null} flds={onyardFlds} datas={onyard} trClick={null} trDbclick={this.OnfindBox.bind(this)} />
                    <Table rowNo={true} title={<Title title={'泊位停靠船舶信息'} id={id2} />} style={{ width: '59%', height: 775 }} id={id2} selectedIndex={null} flds={berthsFlds} datas={berths} trClick={null} trDbclick={null} />
                </div>
                <div style={{ width: 3750 }}>
                    <Table rowNo={true} title={<Title title={'超三个月海关未放行柜列表'} id={id3} />} style={{ width: '40%', height: 775 }} id={id3} selectedIndex={null} flds={scctyardFlds} datas={scctyard} trClick={null} trDbclick={null} />
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