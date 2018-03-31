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
                {this.props.data.value}
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
            [
                { data: { value: 0 }, background: '13' },
                { data: { value: 2 }, background: '14' },
                { data: { value: 1 }, background: '15' },
                { data: { value: 3 }, background: '16' },
                { data: { value: 0 }, background: '17' },
                { data: { value: 0 }, background: '18' },
            ],
            [
                { data: { value: 1 }, background: '1' },
                { data: { value: 0 }, background: '2' },
                { data: { value: 0 }, background: '3' },
                { data: { value: 0 }, background: '4' },
                { data: { value: 0 }, background: '5' },
                { data: { value: 0 }, background: '6' },
            ],
            [
                { data: { value: 0 }, background: '7' },
                { data: { value: 0 }, background: '8' },
                { data: { value: 0 }, background: '9' },
                { data: { value: 0 }, background: '10' },
                { data: { value: 0 }, background: '11' },
                { data: { value: 0 }, background: '12' },
            ],
        ],
        table: null,
    }
    componentDidMount() {
        this.sub_showTable = subscribe('showTable', () => this.setState({table: null}));
    }
    componentWillUnmount() {
        if (this.sub_showTable) unsubscribe(this.sub_showTable);
    }
    onClick = (data) => {
        console.log(data);
        this.setState({table: true});
    }
    render() {
        let flds = [
            { title: '港口名称', name: 'name' },
            { title: '地点', name: 'addr' },
            { title: '港口开埠时间', name: 'kbsj' },
            { title: '招商局运营时间', name: 'yysj' },
        ];
        let datas = [
            {name: 1, addr: 2, kbsj: 3, yysj: 4},
            {name: 1, addr: 2, kbsj: 3, yysj: 4},
            {name: 1, addr: 2, kbsj: 3, yysj: 4},
            {name: 1, addr: 2, kbsj: 3, yysj: 4},
            {name: 1, addr: 2, kbsj: 3, yysj: 4},
            {name: 1, addr: 2, kbsj: 3, yysj: 4},
        ];
        return (
            <div className='homeRightP'>
                <div className='homeRightP-l'>
                    <Panel style={{ width: 3680, padding: '20px 25px' }}>
                        <div className='iWarning-yj'>
                            {this.state.datas[0].map((e, i) => <Warning key={i} style={{ color: '#F89824' }} className={'iWarning-G' + e.background} data={e.data} onClick={this.onClick} />)}
                        </div>
                    </Panel>
                </div>
                <div className='homeRightP-r'>
                    <Panel style={{ padding: '20px 25px', width: 3680, height: 1760, justifyContent: 'space-between' }}>
                        <div className='iWarning-yj'>
                            {this.state.datas[1].map((e, i) => <Warning key={i} style={{ color: '#E75656' }} className={'iWarning-G' + e.background} data={e.data} onClick={this.onClick} />)}
                        </div>
                        <div className='iWarning-yj'>
                            {this.state.datas[2].map((e, i) => <Warning key={i} style={{ color: '#E75656' }} className={'iWarning-G' + e.background} data={e.data} onClick={this.onClick} />)}
                        </div>
                    </Panel>
                </div>
                {this.state.table ? <div style={{position: 'absolute', top: 65, right: 3821}}>
                    <Table title={<Title title={'各栏堆存柜量'} id={'qqq'}/>} style={{height: 775}} id={'qqq'} selectedIndex={null} flds={flds} datas={datas} trClick={null} trDbclick={null} />
                </div> : null}
            </div>
        )
    }
}