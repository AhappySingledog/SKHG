import '../less';
import 'animate.css';
import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import echarts from 'echarts';
import { publish, subscribe, unsubscribe } from '../../../frame/core/arbiter';
import { ViwePager, Tip, Table, Panel } from '../../../frame/componets/index';
import '../../../frame/less/hover.less';

// 智能预警
export default class iWarningNew extends React.Component {
    state = {
        table: null
    }
    onClick = (e, type) => {
        let key = e.key;
        if (key) {
            const map = {
                alter1: { svn: 'skhg_loader', title: '进口集装箱到港后超7天未放行', query: { tableName: 'V_IMAP_ALERTING_01', where: '1=1' }, width: 5000 },
                alter2: { svn: 'skhg_loader', title: '进口集装箱到港后超14天未放行', query: { tableName: 'V_IMAP_ALERTING_02', where: '1=1' }, width: 5000 },
                alter3: { svn: 'skhg_loader', title: '进口集装箱到港后超90天未放行', query: { tableName: 'V_IMAP_ALERTING_03', where: '1=1' }, width: 5000 },
                alter4: { svn: 'skhg_loader', title: '进口集装箱放行后超15天未提离', query: { tableName: 'V_IMAP_ALERTING_04', where: '1=1' }, width: 5000 },
                alter5: { svn: 'skhg_loader', title: '出口集装箱进闸后超7天未放行', query: { tableName: 'V_IMAP_ALERTING_05', where: '1=1' }, width: 5000 },
                alter6: { svn: 'skhg_loader', title: '出口集装箱进闸后超90天未放行', query: { tableName: 'V_IMAP_ALERTING_06', where: '1=1' }, width: 5000 },
                alter7: { svn: 'skhg_loader', title: '出口集装箱放行后超10天未装船', query: { tableName: 'V_IMAP_ALERTING_07', where: '1=1' }, width: 5000 },
                alter8: { svn: 'skhg_loader', title: '进口舱单品名含敏感词', query: { tableName: 'V_IMAP_ALERTING_08', where: '1=1' }, width: 3000 },
                alter9: { svn: 'skhg_loader', title: '出口预配舱单品名含敏感词', query: { tableName: 'V_IMAP_ALERTING_09', where: '1=1' }, width: 3000 },
                alter10: { svn: 'skhg_loader', title: '整船换装货物超期滞留堆场', query: { tableName: 'V_IMAP_ALERTING_10', where: '1=1' }, width: 5000 },
                alter11: { svn: 'skhg_loader', title: '收到查验指令24小时未调入CIC', query: { tableName: 'V_IMAP_ALERTING_11', where: '1=1' }, width: 3000 },
                alter12: { svn: 'skhg_loader', title: '调入CIC超24小时未查验', query: { tableName: 'V_IMAP_ALERTING_12', where: '1=1' }, width: 3000 },
                alter13: { svn: 'skhg_loader', title: '查验完毕超12小时未调离CIC', query: { tableName: 'V_IMAP_ALERTING_13', where: '1=1' }, width: 3000 },
                warning1: { svn: 'skhg_stage', title: '空柜有货', query: { tableName: 'IMAP_WARNING_LOG1', where: "ISHANDLED='N'" }, width: 5000 },
                warning2: { svn: 'skhg_stage', title: '调拨通道途中监管异常报警', query: { tableName: 'IMAP_WARNING_LOG2', where: "ISHANDLED='N'" }, width: 5000 },
                warning3: { svn: 'skhg_stage', title: '行政通道车辆识别异常报警', query: { tableName: 'IMAP_WARNING_LOG3', where: "ISHANDLED='N'" }, width: 5000 },
                warning10: { svn: 'skhg_stage', title: '旅检船舶未审批即移泊', query: { tableName: 'IMAP_WARNING_LOG10', where: "ISHANDLED='N'" }, width: 5000 }
            };
            publish('getData', { svn: map[key].svn, tableName: map[key].query.tableName, data: { pageno: 1, pagesize: 100, where: map[key].query.where } }).then((res) => {
                let flds = res[0].fields.map((e) => { return { title: e.alias, dataIndex: e.name };});
                let table = <Table rowNo={true} title={<Title title={e.alias} id={'qqq'} close={() => this.setState({table: null})} />} style={{ height: 775, width: map[key].width }} id={'qqq'} selectedIndex={null} flds={flds} datas={res[0].features.map((e) => e.attributes)} trClick={null} trDbclick={null} myTd={null} hide={{ GKEY: true, GID: true, ISREADE: true, ISHANDLED: true, HANDLEDRESULT: true }} />
                this.setState({ table: table, key: key }, () => $('#warningDesc').addClass('magictime spaceInUp animated').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', () => $('#warningDesc').removeClass('magictime spaceInUp animated')));
            });
        }
    }
    render() {
        let jksx = [
            { name: '180天', style: { marginLeft: 64 } },
            { name: '90天', style: { marginLeft: 66 } },
            { name: '14天', style: { marginLeft: 71 } },
            { name: '7天', style: { marginLeft: 86 } },
            { name: '申报', style: { marginLeft: 85 } },
            { name: '放行', style: { marginLeft: 79 } },
            { name: '15天', style: { marginLeft: 75 } },
        ];
        let jkyj = [
            { name: '180天', alias: '', data: 0 },
            { name: '90天', key: 'alter3', alias: '进口集装箱到港后超90天未放行', data: 30 },
            { name: '14天', key: 'alter2', alias: '进口集装箱到港后超14天未放行', data: 50 },
            { name: '7天', key: 'alter1', alias: '进口集装箱到港后超7天未放行', data: 60 },
            { name: '申报', data: 0 },
            { name: '放行', data: 0 },
            { name: '15天', key: 'alter4', alias: '进口集装箱放行后超15天未提离', data: 40 },
        ];
        let jkbj = [
            { name: '180天', key: 'alter2', alias: '国际中转集装箱滞港超180天', data: { cl: 30, wcl: 3 } },
            { name: '90天', key: 'alter2', alias: '国际中转集装箱滞港超90天', data: { cl: 40, wcl: 3 } },
            { name: '14天', data: { cl: 0, wcl: 0 } },
            { name: '7天', data: { cl: 0, wcl: 0 } },
            { name: '申报', data: { cl: 0, wcl: 0 } },
            { name: '放行', data: { cl: 0, wcl: 0 } },
            { name: '15天', data: { cl: 0, wcl: 0 } },
        ];
        let cksx = [
            { name: '90天', style: { marginLeft: 80 } },
            { name: '7天', style: { marginLeft: 83 } },
            { name: '申报', style: { marginLeft: 87 } },
            { name: '3天', style: { marginLeft: 85 } },
            { name: '放行', style: { marginLeft: 87 } },
            { name: '预留', style: { marginLeft: 80 } },
            { name: '24小时', style: { marginLeft: 56 } },
            { name: '10天', style: { marginLeft: 54 } },
        ];
        let ckyj = [
            { name: '90天', key: 'alter6', alias: '出口集装箱进闸后超90天未放行', data: 40 },
            { name: '7天', key: 'alter5', alias: '出口集装箱进闸后超7天未放行', data: 30 },
            { name: '申报', data: 0 },
            { name: '3天', data: 0 },
            { name: '放行', data: 0 },
            { name: '预留', data: 0 },
            { name: '24小时', data: 0 },
            { name: '10天', key: 'alter7', alias: '出口集装箱放行后超10天未装船', data: 50 },
        ];
        let ckbj = [
            { name: '90天', data: { cl: 0, wcl: 0 } },
            { name: '7天', data: { cl: 0, wcl: 0 } },
            { name: '申报', data: { cl: 0, wcl: 0 } },
            { name: '3天', key: 'alter2', alias: '出口提前申报后超3天未抵运', data: { cl: 50, wcl: 3 } },
            { name: '放行', data: { cl: 0, wcl: 0 } },
            { name: '预留', key: 'alter2', alias: '装载舱单数据发送不及时', data: { cl: 20, wcl: 2 } },
            { name: '24小时', key: 'alter2', alias: '船舶离港后超24小时未发送理货报告', data: { cl: 42, wcl: 11 } },
            { name: '10天', data: { cl: 0, wcl: 0 } },
        ];
        let gk1 = [
            { name: '', key: 'warning1', alias: '海关未放行集装箱装船', type: 1, data: { cl: 72, wcl: 15 } },
            { name: '', key: 'warning1', alias: '海关未放行集装箱出闸', type: 1, data: { cl: 32, wcl: 2 } },
            { name: '', key: 'warning1', alias: '整船换装货物异常提离堆场', type: 1, data: { cl: 56, wcl: 12 } },
            { name: '', key: 'warning1', alias: '整船换装货物异常预配载', type: 1, data: { cl: 33, wcl: 6 } },
            { name: '', key: 'warning1', alias: '同船运输集装箱异常装卸', type: 1, data: { cl: 55, wcl: 13 } },
            { name: '', key: 'warning1', alias: '空柜重量异常', type: 1, data: { cl: 50, wcl: 0 } },
            { name: '', key: 'warning1', alias: '散杂货异常堆放', type: 1, data: { cl: 52, wcl: 2 } },
            { name: '', key: 'alter8', alias: '进口舱单品名含敏感词', type: 0, data: 23 },
            { name: '', key: 'alter9', alias: '出口预配舱单品名含敏感词', type: 0, data: 26 },
            { name: '', key: 'alter10', alias: '整船换装货物超期滞留堆场', type: 0, data: 50 },
        ];
        let gk2 = [
            { name: '', key: 'alter3', alias: '收到查验指令72小时未调入CIC', type: 1, data: { cl: 72, wcl: 12 } },
            { name: '', key: 'alter3', alias: '查验完毕超24小时未调离CIC', type: 1, data: { cl: 22, wcl: 2 } },
            { name: '', key: 'alter11', alias: '收到查验指令24小时未调入CIC', type: 0, data: 23 },
            { name: '', key: 'alter12', alias: '调入CIC超24小时未查验', type: 0, data: 26 },
            { name: '', key: 'alter13', alias: '查验完毕超12小时未调离CIC', type: 0, data: 50 },
        ];
        let gk3 = [
            { name: '', key: 'warning2', alias: '调拨车辆偏离路线', type: 1, data: { cl: 39, wcl: 3 } },
            { name: '', key: 'warning2', alias: '调拨车辆运行超时', type: 1, data: { cl: 15, wcl: 2 } },
            { name: '', key: 'warning2', alias: '调拨车辆超时停留', type: 0, data: 44 },
        ];
        let gk4 = [
            { name: '', key: 'warning3', alias: '行政通道车辆识别异常', type: 1, data: { cl: 23, wcl: 2 } },
            { name: '', key: 'warning3', alias: '行政通道车辆布控中控', type: 1, data: { cl: 33, wcl: 3 } },
        ];
        let gk5 = [
            { name: '', key: 'warning10', alias: '旅检船舶未确认即移泊', type: 1, data: { cl: 23, wcl: 5 } },
            { name: '', key: 'warning10', alias: '旅检船舶夜间异常', type: 1, data: { cl: 29, wcl: 2 } },
        ];
        let max = 60;
        return (
            <div className='iw'>
                <div className='iw-title' style={{ left: 185, top: 0 }}>进口时效</div>
                <div className='iw-title' style={{ left: 1985, top: 0 }}>出口时效</div>
                <div className='iw-title' style={{ left: 185, top: 900 }}>管控预报警</div>
                <BZ type={0} style={{ top: 360, left: 1560 }} />
                <BZ type={1} style={{ top: 590, left: 1560 }} />
                <BZ type={0} style={{ top: 360, left: 3400 }} />
                <BZ type={1} style={{ top: 590, left: 3400 }} />
                <div className='iw-box'>
                    <div className='iw-box-t'>
                        <JT style={{ position: 'relative', top: 450, left: 200 }} datas={jksx} bj={jkbj} yj={jkyj} click={this.onClick} />
                        <JT style={{ position: 'relative', top: 400, left: 2020 }} datas={cksx} bj={ckbj} yj={ckyj} click={this.onClick} />
                    </div>
                    <div className='iw-box-b'>
                        <div>
                            <GK name={'码头'} datas={gk1} max={100} height={425} click={this.onClick} />
                            <GK name={'CIC'} datas={gk2} max={100} height={250} click={this.onClick} />
                            <GK name={'调拨车辆'} datas={gk3} max={100} height={147} click={this.onClick} />
                            <GK name={'行政车辆'} datas={gk4} max={100} height={110} click={this.onClick} />
                            <GK name={'旅检'} datas={gk5} max={100} height={110} click={this.onClick} />
                        </div>
                    </div>
                </div>
                {this.state.table ? <div id='warningDesc' style={{ position: 'absolute', top: 65, right: 3821, background: '#051658' }}>{this.state.table}</div> : null}
            </div>
        )
    }
}

class Title extends React.Component {
    export = () => {
        console.log(this.props.id);
        this.props.close();
    }
    render() {
        return (
            <div className='tableTitle'><div className='tableTitle-n'>{this.props.title}</div><div className='tableTitle-b' onClick={() => this.export()}></div></div>
        )
    }
}

//箭头
class JT extends React.Component {
    click = (e, type) => {
        if (this.timer) clearTimeout(this.timer);
        this.timer = setTimeout(() => {
            this.props.click(e, type);
        }, 300);
    }
    dbclick = (e, type) => {
        if (this.timer) clearTimeout(this.timer);
        console.log(e);
        console.log(type);
    }
    render() {
        let { bj = [], yj = [], max = 60 } = this.props;
        return (
            <div className='jt' style={this.props.style}>
                <div className='jt-t'>{yj.map((e, i) => <div className='jt-yj hvr-pulse-shrink' key={i} style={{ height: 320 * e.data / max }} onClick={() => this.click(e, 'yj')} onDoubleClick={() => this.dbclick(e, 'yj')}></div>)}</div>
                <div className='jt-b'>{bj.map((e, i) => <div className='jt-bj' key={i}><div className='jt-bj-wcl hvr-pulse-shrink' style={{ height: 340 * e.data.wcl / max }} onClick={() => this.click(e, 'bjwcl')} onDoubleClick={() => this.dbclick(e, 'bjwcl')}></div><div className='jt-bj-cl hvr-pulse-shrink' style={{ height: 340 * e.data.cl / max }} onClick={() => this.click(e, 'bjycl')} onDoubleClick={() => this.dbclick(e, 'bjycl')}></div></div>)}</div>
                {this.props.datas.map((e, i) => <div className='jt-name' key={i} style={e.style}>{e.name}</div>)}
            </div>
        )
    }
}

//标注
class BZ extends React.Component {
    render() {
        return (
            <div style={this.props.style} className={this.props.type == 1 ? 'bz-yj' : 'bz-bj'}>{this.props.type == 1 ? '预警' : '报警'}</div>
        )
    }
}

//单个管控预报警
class ONEGK extends React.Component {
    componentDidMount() {
        this.timer = setInterval(() => this.setState({ data: 1 }), Math.random() * 100000 + 10000)
    }
    componentDidUpdate() {
        $(ReactDOM.findDOMNode(this.refs.animate)).addClass('gkss animated').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', () => $(ReactDOM.findDOMNode(this.refs.animate)).removeClass('gkss animated'));
    }
    componentWillUnmount() {
        if (this.timer) clearInterval(this.timer);
    }
    click = (e, type) => {
        if (this.timer) clearTimeout(this.timer);
        this.timer = setTimeout(() => {
            this.props.click(e, type);
        }, 300);
    }
    dbclick = (e, type) => {
        if (this.timer) clearTimeout(this.timer);
        console.log(e);
        console.log(type);
    }
    render() {
        let { e = null, max = 100 } = this.props;
        return (
            e ? <div className='gk-4-one' ref='animate'>{e.type == 1 ? [<div key={0} className='gk-4-one-bj-cl hvr-pulse-shrink' style={{ width: (e.data.cl / max).toFixed(2) * 100 + '%' }} onClick={() => this.click(e, 'bjycl')} onDoubleClick={() => this.dbclick(e, 'bjycl')}></div>, <div key={1} className='gk-4-one-bj-wcl hvr-pulse-shrink' style={{ width: (e.data.wcl / max).toFixed(2) * 100 + '%' }} onClick={() => this.click(e, 'bjwcl')} onDoubleClick={() => this.dbclick(e, 'bjwcl')}></div>] : <div className='gk-4-one-yj hvr-pulse-shrink' style={{ width: (e.data / max).toFixed(2) * 100 + '%' }} onClick={() => this.click(e, 'yj')} onDoubleClick={() => this.dbclick(e, 'yj')}></div>}</div> : null
        )
    }
}

//管控预报警
class GK extends React.Component {
    render() {
        let { max = 100, datas = [], height = 200 } = this.props;
        return (
            <div className='gk' style={{ height: height }}>
                <div className='gk-1'>
                    <div className='gk-1-t'></div>
                    <div className='gk-1-b'></div>
                </div>
                <div className='gk-2'><div>{this.props.name || ''}</div></div>
                <div className='gk-3'>
                </div>
                <div className='gk-4'>
                    {datas.map((e, i) => <ONEGK key={i} e={e} max={100} click={this.props.click} />)}
                </div>
                <div className='gk-5'>
                    <div className='gk-5-t'></div>
                    <div className='gk-5-b'></div>
                </div>
            </div>
        )
    }
}