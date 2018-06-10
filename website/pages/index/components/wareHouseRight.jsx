import '../less';
import 'animate.css';
import $ from 'jquery';
import moment from 'moment';
import React from 'react';
import ReactDOM from 'react-dom';
import echarts from 'echarts';
import { publish } from '../../../frame/core/arbiter';
import { Panel, WordsContent, Table, Vedios } from '../../../frame/componets/index';
import { table2Excel } from '../../../frame/core/table2Excel';

class MapOperation extends React.Component {
    componentDidMount() {
        console.log(this.props);
    }
    render() {
        return (<div></div>)
    }
}

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


/** 重新做的table数据 */
class Tables extends React.Component {
    render() {
        let { style, flds = [], datas = [] } = this.props;
        return (
            <div id="contenter" style={{ overflowX: 'auto' }}>
                <div id="fixedDiv">
                    <table id="id1" className="fixedTable fixedTab">
                        <thead>
                            <tr>
                                {flds.map((fld, i) => <th key={'bt' + i}><div>{fld.title}</div></th>)}
                            </tr>
                        </thead>
                    </table>
                </div>
                <div id="mainDiv">
                    <table style={{ marginTop: '35px' }} className="fixedTable grid">
                        <thead id="id2" style={{ 'display': 'none' }}>
                            <tr>
                                {flds.map((fld, i) => <th key={'bt' + i}><div>{fld.title}</div></th>)}
                            </tr>
                        </thead>
                        <tbody>
                            {datas.map((data, i) =>
                                <tr key={i}>
                                    {flds.map((fld, j) => <td key={j}>{data[fld.dataIndex]}</td>)}
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        )
    }
}


// 货仓
/**
 *      table  : 仓库库位列表展示
 *      pageNum : 翻页
 *      GoodsNum : 选中的仓库库位列表中的数据
 *      Goodsflds : 库位货物列表列名
 *      GoddsDatas : 库位货物数据
 *      libraryTitle : 出入库的列名
 */
export default class WareHouseRight extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            table: null,
            pageNum: 1,
            GoodsNum: null,
            Goodsflds: [],
            GoddsDatas: [],
            libraryTitle: [],
            Inlibrary: [],
            Outlibrary: [],
        }
    }
    componentDidMount() {
        if (this.props.datas.ckIndex < 1) {
            this.handleWare(this.props.datas.ckIndex + 1);
        } else {
            alert((this.props.datas.ckIndex + 1) + "号仓库暂无数据");
        }
    }

    /** 查询仓库库位列表数据 */
    handleWare = (e) => {
        let index = layer.load(1, { shade: [0.5, '#fff'] });
        publish('webAction',
            {
                svn: 'skhg_stage_service', path: 'queryTableByWhere', data: { tableName: 'CMBL_4RD_LOCATIONLIST', where: " LOCATION_TS like '" + e + "0%' and trunc(RECORDDATE) = trunc(sysdate)" }
            }).then(res => {
                let flds = Object.keys(res[0].attr).map(e => { return { dataIndex: e, title: res[0].attr[e] } });
                let table = <Table
                    rowNo={true}
                    title={{ name: '仓库库位列表', export: true }}
                    style={{ width: 3743, height: 650 }}
                    id={'id1'}
                    selectedIndex={null}
                    flds={flds}
                    datas={res[0].data}
                    trClick={this.handelGoods.bind(this)}
                    trDbclick={null} />
                this.setState({ table: table }, () => {
                    if (res[0].data.length > 0) {
                        layer.close(index);
                        this.handelGoods(res[0].data[0]);
                    }
                });
            })
    }

    /** 查询点击后的库位货物列表 */
    handelGoods = (e) => {
        let index = layer.load(1, { shade: [0.5, '#fff'] });
        publish('find_kwh', e);
        this.setState({ pageNum: 1, GoodsNum: e.LOCATION_TS }, () => {
            publish('getData', {
                svn: 'skhg_stage', tableName: 'CMBL_4RD_LOCATIONINVENTORYLIST', data: { pageno: 1, pagesize: 100, where: " LOCATION_TS = '" + e.LOCATION_TS + "' and trunc(RECORDDATE) = trunc(sysdate)" }
            }).then(res => {
                let flds = res[0].fields.map((e) => { return { title: e.alias, dataIndex: e.name }; });
                let datas = res[0].features.map((e) => e.attributes);
                this.setState({ Goodsflds: flds, GoddsDatas: datas }, () => this.handleLibrary(datas[0]));
                layer.close(index);
            });
        });
    }

    /** 出入库的数据 */
    handleLibrary = (e) => {
        let index = layer.load(1, { shade: [0.5, '#fff'] });
        // publish('getVideosAndDisplayForHouse', e.LOCATION_TS.substring(0, 3));
        Promise.all([
            publish('getData', {
                svn: 'skhg_stage', tableName: 'CMBL_4RD_INOUTWAREHOUSENUM', data: { pageno: 1, pagesize: 100, where: "LOCATION_TS = '" + e.LOCATION_TS + "' and OPTTYPE = 'I' and trunc(RECORDDATE) = trunc(sysdate)" }
            }),
            publish('getData', {
                svn: 'skhg_stage', tableName: 'CMBL_4RD_INOUTWAREHOUSENUM', data: { pageno: 1, pagesize: 100, where: "LOCATION_TS = '" + e.LOCATION_TS + "' and OPTTYPE = 'E' and trunc(RECORDDATE) = trunc(sysdate)" }
            })
        ]).then(res => {
            let flds = res[0][0].fields.map((e) => { return { title: e.alias, dataIndex: e.name }; });
            let indatas = res[0][0].features.map((e) => e.attributes);
            let outdatas = res[1][0].features.map((e) => e.attributes);
            this.setState({ libraryTitle: flds, Inlibrary: indatas, Outlibrary: outdatas });
            layer.close(index);
        });
    }

    /** 翻页：上一页 */
    handelUp = () => {
        let index = layer.load(1, { shade: [0.5, '#fff'] });
        if (this.state.pageNum > 1) {
            this.setState({ pageNum: this.state.pageNum - 1 }, () => {
                let { pageNum, GoodsNum } = this.state;
                publish('getData', {
                    svn: 'skhg_stage', tableName: 'CMBL_4RD_LOCATIONINVENTORYLIST', data: { pageno: pageNum, pagesize: 100, where: " LOCATION_TS = '" + GoodsNum + "' and trunc(RECORDDATE) = trunc(sysdate)" }
                }).then(res => {
                    let flds = res[0].fields.map((e) => { return { title: e.alias, dataIndex: e.name }; });
                    let datas = res[0].features.map((e) => e.attributes);
                    this.setState({ Goodsflds: flds, GoddsDatas: datas });
                    layer.close(index);
                });
            });
        } else {
            alert("这是最顶页了！");
        }
    }

    /** 翻页：下一页 */
    handleDown = () => {
        let index = layer.load(1, { shade: [0.5, '#fff'] });
        this.setState({ pageNum: this.state.pageNum + 1 }, () => {
            let { pageNum, GoodsNum } = this.state;
            publish('getData', {
                svn: 'skhg_stage', tableName: 'CMBL_4RD_LOCATIONINVENTORYLIST', data: { pageno: pageNum, pagesize: 100, where: " LOCATION_TS = '" + GoodsNum + "' and trunc(RECORDDATE) = trunc(sysdate)" }
            }).then(res => {
                if (res[0].features.length > 0) {
                    let flds = res[0].fields.map((e) => { return { title: e.alias, dataIndex: e.name }; });
                    let datas = res[0].features.map((e) => e.attributes);
                    this.setState({ Goodsflds: flds, GoddsDatas: datas });
                    layer.close(index);
                } else {
                    alert("这是最后一页了！");
                }
            });
        });
    }

    render() {
        let w = 1830;
        let h = 860;
        let item = [];
        let data = [
            { name: 'SCT 1# 2#堆场', url: 'http://www.cheluyun.com/javascript/zsg/?id=100031600&rtmp=rtmp://playrtmp.simope.com:1935/live/524622521d?liveID=100031600&hls=http://playhls.simope.com/live/524622521d/playlist.m3u8?liveID=100031600' },
            { name: 'SCT 1# 2#堆场', url: 'http://www.cheluyun.com/javascript/zsg/?id=100031600&rtmp=rtmp://playrtmp.simope.com:1935/live/524622521d?liveID=100031600&hls=http://playhls.simope.com/live/524622521d/playlist.m3u8?liveID=100031600' },
        ];
        const onyardFlds = [
            { title: '监控场所', name: 'a' },
            { title: '线路编号', name: 'b' },
            { title: '场所名称', name: 'c' },
        ];
        if (this.props.type === '3') {
            item = [
                <div key="czbs" className="ware">
                    <div> {this.state.table}</div>
                    <div className="ware_up" onClick={this.handelUp.bind(this)}>上一页</div>
                    <div className="ware_down" onClick={this.handleDown.bind(this)}>下一页</div>
                    <div><Table rowNo={true} title={{ name: '库位货物列表', export: true }} style={{ width: 3743, height: 650 }} id={'id2'} selectedIndex={null} flds={this.state.Goodsflds} datas={this.state.GoddsDatas} trClick={this.handleLibrary.bind(this)} trDbclick={null} /> </div>
                    <div> <Table rowNo={true} title={{ name: '出库台账', export: true }} style={{ width: 3743, height: 650 }} id={'id3'} selectedIndex={null} flds={this.state.libraryTitle} datas={this.state.Inlibrary} trClick={null} trDbclick={null} /> </div>
                    <div> <Table rowNo={true} title={{ name: '入库台账', export: true }} style={{ width: 3743, height: 650 }} id={'id4'} selectedIndex={null} flds={this.state.libraryTitle} datas={this.state.Outlibrary} trClick={null} trDbclick={null} />  </div>
                </div>
            ]
        } else {
            item = [
                <div key="bzd" className='warehouse'>
                    <div className='warehouse-l'>
                        {[
                            <div className='warehouse-v'>
                                <Vedios style={{ width: w, height: h }} datas={data} />
                            </div>,
                            <div className='warehouse-v'>
                                <Vedios style={{ width: w, height: h }} datas={data} />
                            </div>,
                            <div className='warehouse-v'>
                                <Vedios style={{ width: w, height: h }} datas={data} />
                            </div>
                        ]}
                    </div>
                    <div className='warehouse-r'>
                        {[
                            <div className='warehouse-v'>
                                <Vedios style={{ width: w, height: h }} datas={data} />
                            </div>,
                            <div className='warehouse-v'>
                                <Vedios style={{ width: w, height: h }} datas={data} />
                            </div>,
                            <div className='warehouse-v'>
                                <Vedios style={{ width: w, height: h }} datas={data} />
                            </div>
                        ]}
                    </div>
                </div>
            ]
        }

        return (
            <div>
                {item}
            </div>
        )
    }
}