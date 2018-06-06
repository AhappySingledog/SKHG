import '../less';
import 'animate.css';
import React from 'react';
import ReactDOM from 'react-dom';
import { publish, subscribe, unsubscribe } from '../../../frame/core/arbiter';
import { Panel, WordsContent, Table } from '../../../frame/componets/index';
import echarts from 'echarts';
import $ from 'jquery';
import _ from 'lodash';
import '../../../frame/core/xcConfirm';

class Warning extends React.Component {
    onMouseOver = () => {
        let target = ReactDOM.findDOMNode(this.refs.target);
        $(target).addClass('flipInY animated').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', () => $(target).removeClass('flipInY animated'));
    }
    render() {
        return (
            <div ref='target' style={this.props.style} className={this.props.className} onClick={() => this.props.onClick(this.props.data)} onMouseOver={this.onMouseOver}>
                {this.props.data}
            </div>
        )
    }
}

class Title extends React.Component {
    export = () => {
        console.log(this.props.id);
        publish('showTable');
    }
    render() {
        return (
            <div className='tableTitle'><div className='tableTitle-n'>{this.props.title}</div><div className='tableTitle-b' onClick={() => this.export()}></div></div>
        )
    }
}

// 智能预警右侧组件
export default class IWarningRightPanel extends React.Component {
    state = {
        datas: [
            {
                alter1: { value: 0, background: '13' },
                alter2: { value: 0, background: '14' },
                alter3: { value: 0, background: '15' },
                alter4: { value: 0, background: '16' },
                alter5: { value: 0, background: '17' },
                alter6: { value: 0, background: '18' },
            },
            {
                warning1: { value: 0, background: '1' },
                warning2: { value: 0, background: '2' },
                warning3: { value: 0, background: '3' },
                warning4: { value: 0, background: '4' },
                warning5: { value: 0, background: '5' },
                warning6: { value: 0, background: '6' },
            },
            {
                warning7: { value: 0, background: '7' },
                warning8: { value: 0, background: '8' },
                warning9: { value: 0, background: '9' },
                warning10: { value: 0, background: '10' },
                warning11: { value: 0, background: '11' },
                warning12: { value: 0, background: '12' },
            }
        ],
        table: null,
        key: null,
    }
    componentDidMount() {
        this.sub_showTable = subscribe('showTable', () => this.setState({ table: null }));
        let work = () => Promise.all([
            publish('webAction', { svn: 'skhg_stage_service', path: 'queryTableByWhere', data: { tableName: 'IMAP_ALERTING' } }),
            publish('webAction', { svn: 'skhg_stage_service', path: 'queryTableByWhere', data: { tableName: 'IMAP_WARNING' } }),
        ]).then((res) => {
            let data1 = res[0][0].data;
            let data2 = res[1][0].data;
            let datas = this.state.datas;
            if (data1.length > 0) {
                Object.keys(datas[0]).forEach((e) => datas[0][e].value = data1[0][e.toUpperCase()]);
            }
            if (data2.length > 0) {
                Object.keys(datas[1]).forEach((e) => datas[1][e].value = data2[0][e.toUpperCase()]);
                Object.keys(datas[2]).forEach((e) => datas[2][e].value = data2[0][e.toUpperCase()]);
            }
            if (data1.length > 0 || data2.length > 0) this.setState({ datas: datas });
        });
        work();
        this.timer = setInterval(work, 1000 * 60 * 10);
    }
    componentWillUnmount() {
        if (this.sub_showTable) unsubscribe(this.sub_showTable);
        if (this.timer) clearInterval(this.timer);
    }
    // 右侧面板点击事件
    onClick = (key) => {
        const map = {
            alter1: {svn: 'skhg_loader_service', title: '还柜后超2周未申报', query: { tableName: '', where: '1=1' }},
            alter2: {svn: 'skhg_loader_service', title: '到港3个月未放行', query: { tableName: 'V_IMAP_SCCT_ONYARD_NOCUS90', where: '1=1' }},
            alter3: {svn: 'skhg_loader_service', title: '在场堆积压柜未调入CIC查验', query: { tableName: '', where: '1=1' }},
            alter4: {svn: 'skhg_loader_service', title: 'CIC在场积压未开始查验', query: { tableName: '', where: '1=1' }},
            alter5: {svn: 'skhg_loader_service', title: 'CIC查验完毕未离场柜数', query: { tableName: '', where: '1=1' }},
            alter6: {svn: 'skhg_loader_service', title: '收到海关放行信息未提离/装船', query: { tableName: 'V_IMAP_SCCT_ONYARD_RECCIQ', where: 'rownum<500' }},
            warning1: {svn: 'skhg_stage_service', title: '空柜有货', query: { tableName: 'IMAP_WARNING_LOG1', where: "ISHANDLED='N'" }},
            warning2: {svn: 'skhg_stage_service', title: '调拨通道途中监管异常报警', query: { tableName: 'IMAP_WARNING_LOG2', where: "ISHANDLED='N'" }},
            warning3: {svn: 'skhg_stage_service', title: '行政通道车辆识别异常报警', query: { tableName: 'IMAP_WARNING_LOG3', where: "ISHANDLED='N'" }},
            warning10: {svn: 'skhg_stage_service', title: '旅检船舶未审批即移泊', query: { tableName: 'IMAP_WARNING_LOG10', where: "ISHANDLED='N'" }}
        };
        publish('webAction', { svn: map[key].svn, path: 'queryTableByWhere', data: map[key].query }).then((res) => {
            let flds = Object.keys(res[0].attr).map((key) => {return {title: res[0].attr[key], dataIndex: key}}).concat(key.indexOf('warning') >= 0 ? [{title: '操作', dataIndex: 'cl'}] : []);
            let table = <Table rowNo={true} title={<Title title={map[key].title} id={'qqq'} />} style={{ height: 775 }} id={'qqq'} selectedIndex={null} flds={flds} datas={res[0].data} trClick={null} trDbclick={this.trDbclick} myTd={this.myTd} hide={{GKEY: true}}/>
            this.setState({ table: table, key: key }, () => $('#warningDesc').addClass('magictime spaceInUp animated').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', () => $('#warningDesc').removeClass('magictime spaceInUp animated')));
        });
    }
    trDbclick = (data, index, datas) => {
        let drawDefaultLayer = (props, pier, cno) => {
            if (cno) {
                publish('webAction', { svn: 'eportapisct', path: 'GContainerInfo', data: { System: '', PageIndex: 1, PageSize: 30, SortBy: '', IsDescending: false, ContainerNo: cno } }).then((res) => {
                    let result = res[0].InnerList;
                    if (result.length > 0) {
                        let wz = result[0].Location.substring(5, 13);
                        publish('webAction', { svn: 'skhg_service', path: 'queryGeomTable', data: { tableName: 'SK_MAP_GIS', where: "SSDW='" + pier + "' and NAME='" + wz + "'" } }).then((res) => {
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
                    }
                });
            }
        }
        drawDefaultLayer(this.props, data.TERMINALCODE, data.CONTNO);
    }
    // 自定义td
    myTd = (trIndex, data, fld, tdIndex) => {
        if (fld.dataIndex === 'cl') {
            return <div style={{ display: 'flex', flexDirection: 'row' }}>
                <div className='link-cl' onClick={() => this.cl(data, fld)}>处理</div>
            </div>
        }
        return data[fld.dataIndex];
    }
    // 处理事件
    cl = (row, fld) => {
        window.wxc.xcConfirm('', window.wxc.xcConfirm.typeEnum.inputs, {
            autoClose: false,
            onOk: function(data) {
                console.log(data);
                if (data.name == '' || data.value == '') {
                    window.wxc.xcConfirm('请输入处理人或处理意见', window.wxc.xcConfirm.typeEnum.warning);
                    return false;
                }
                else {
                    publish('webAction', { svn: 'skhg_stage_service', path: 'excuteSqlNoQuery', data: {sql: "UPDATE IMAP_WARNING_LOG1 SET ISHANDLED='Y', HANDLER='" + data.name + "', HANDLINGRESULT='" + data.value + "', HANDLINGTIME=SYSDATE WHERE GKEY=" + row.GKEY + ';UPDATE IMAP_WARNING SET WARNING1=WARNING1-1'} }).then((res) => {
                        if (!res[0].success) window.wxc.xcConfirm(res[0].msg, window.wxc.xcConfirm.typeEnum.error);
                    });
                    return true;
                }
            },
            inputs: [
                {id: 'name', title: '处理人', type: 'text', placeholder: '请输入处理人'},
                {id: 'value', title: '处理意见', type: 'text', placeholder: '请输入处理意见'}
            ]
        });
    }
    render() {
        let { datas } = this.state;
        return (
            <div className='homeRightP'>
                <div className='homeRightP-l'>
                    <Panel style={{ width: 3680, padding: '20px 25px' }}>
                        <div className='iWarning-yj'>
                            {Object.keys(datas[0]).map((e, i) => <Warning key={i} style={{ color: '#F89824' }} className={'iWarning-G' + datas[0][e].background} data={datas[0][e].value} onClick={() => this.onClick(e)} />)}
                        </div>
                    </Panel>
                </div>
                <div className='homeRightP-r'>
                    <Panel style={{ padding: '20px 25px', width: 3680, height: 1760, justifyContent: 'space-between' }}>
                        <div className='iWarning-yj'>
                            {Object.keys(datas[1]).map((e, i) => <Warning key={i} style={{ color: '#E75656' }} className={'iWarning-G' + datas[1][e].background} data={datas[1][e].value} onClick={() => this.onClick(e)} />)}
                        </div>
                        <div className='iWarning-yj'>
                            {Object.keys(datas[2]).map((e, i) => <Warning key={i} style={{ color: '#E75656' }} className={'iWarning-G' + datas[2][e].background} data={datas[2][e].value} onClick={() => this.onClick(e)} />)}
                        </div>
                    </Panel>
                </div>
                {this.state.table ? <div id='warningDesc' style={{ position: 'absolute', top: 65, right: 3821, background: '#051658' }}>{this.state.table}</div> : null}
            </div>
        )
    }
}