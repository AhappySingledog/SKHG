import '../less';
import 'animate.css';
import React from 'react';
import ReactDOM from 'react-dom';
import { publish, subscribe, unsubscribe } from '../../../frame/core/arbiter';
import { Panel, WordsContent, Table } from '../../../frame/componets/index';
import echarts from 'echarts';
import $ from 'jquery';
import _ from 'lodash';

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
                Object.keys(datas[0]).forEach((e) => datas[0][e] = data1[0][e]);
            }
            if (data2.length > 0) {
                Object.keys(datas[1]).forEach((e) => datas[1][e] = data2[0][e]);
                Object.keys(datas[2]).forEach((e) => datas[2][e] = data2[0][e]);
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
    onClick = (data) => {
        console.log(data);
        this.setState({ table: true });
    }
    render() {
        let flds = [
            { title: '港口名称', name: 'name' },
            { title: '地点', name: 'addr' },
            { title: '港口开埠时间', name: 'kbsj' },
            { title: '招商局运营时间', name: 'yysj' },
        ];
        let data = [
            { name: 1, addr: 2, kbsj: 3, yysj: 4 },
            { name: 1, addr: 2, kbsj: 3, yysj: 4 },
            { name: 1, addr: 2, kbsj: 3, yysj: 4 },
            { name: 1, addr: 2, kbsj: 3, yysj: 4 },
            { name: 1, addr: 2, kbsj: 3, yysj: 4 },
            { name: 1, addr: 2, kbsj: 3, yysj: 4 },
        ];
        let { datas } = this.state;
        return (
            <div className='homeRightP'>
                <div className='homeRightP-l'>
                    <Panel style={{ width: 3680, padding: '20px 25px' }}>
                        <div className='iWarning-yj'>
                            {Object.keys(datas[0]).map((e, i) => <Warning key={i} style={{ color: '#F89824' }} className={'iWarning-G' + datas[0][e].background} data={datas[0][e].value} onClick={this.onClick} />)}
                        </div>
                    </Panel>
                </div>
                <div className='homeRightP-r'>
                    <Panel style={{ padding: '20px 25px', width: 3680, height: 1760, justifyContent: 'space-between' }}>
                        <div className='iWarning-yj'>
                            {Object.keys(datas[1]).map((e, i) => <Warning key={i} style={{ color: '#E75656' }} className={'iWarning-G' + datas[1][e].background} data={datas[1][e].value} onClick={this.onClick} />)}
                        </div>
                        <div className='iWarning-yj'>
                            {Object.keys(datas[2]).map((e, i) => <Warning key={i} style={{ color: '#E75656' }} className={'iWarning-G' + datas[2][e].background} data={datas[2][e].value} onClick={this.onClick} />)}
                        </div>
                    </Panel>
                </div>
                {this.state.table ? <div style={{ position: 'absolute', top: 65, right: 3821 }}>
                    <Table title={<Title title={'各栏堆存柜量'} id={'qqq'} />} style={{ height: 775 }} id={'qqq'} selectedIndex={null} flds={flds} datas={data} trClick={null} trDbclick={null} />
                </div> : null}
            </div>
        )
    }
}