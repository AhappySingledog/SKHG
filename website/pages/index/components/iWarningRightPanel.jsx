import '../less';
import 'animate.css';
import React from 'react';
import ReactDOM from 'react-dom';
import { publish } from '../../../frame/core/arbiter';
import { Panel, WordsContent } from '../../../frame/componets/index';
import echarts from 'echarts';
import $ from 'jquery';
import _ from 'lodash';

class Warning extends React.Component {
    render() {
        return (
            <div style={this.props.style} className={this.props.className} onClick={() => this.props.onClick(this.props.data)}>
                {this.props.data.value}
            </div>
        )
    }
}

// 智能预警右侧组件
export default class IWarningRightPanel extends React.Component {
    state = {
        datas: [
            [
                {data: {value: 789}, background: '13'},
                {data: {value: 789}, background: '14'},
                {data: {value: 789}, background: '15'},
                {data: {value: 789}, background: '16'},
                {data: {value: 789}, background: '17'},
                {data: {value: 789}, background: '18'},
            ],
            [
                {data: {value: 789}, background: '1'},
                {data: {value: 789}, background: '2'},
                {data: {value: 789}, background: '3'},
                {data: {value: 789}, background: '4'},
                {data: {value: 789}, background: '5'},
                {data: {value: 789}, background: '6'},
            ],
            [
                {data: {value: 789}, background: '7'},
                {data: {value: 789}, background: '8'},
                {data: {value: 789}, background: '9'},
                {data: {value: 789}, background: '10'},
                {data: {value: 789}, background: '11'},
                {data: {value: 789}, background: '12'},
            ],
        ]
    }
    componentDidMount() {

    }
    onClick = (data) => {
        console.log(data);
    }
    render() {
        return (
            <div className='homeRightP'>
                <div className='homeRightP-l'>
                    <Panel style={{width: 3680, padding: '20px 25px'}}>
                        <div className='iWarning-yj'>
                            {this.state.datas[0].map((e, i) => <Warning key={i} style={{color: '#F89824'}} className={'iWarning-G' + e.background} data={e.data} onClick={this.onClick}/>)}
                        </div>
                    </Panel>
                </div>
                <div className='homeRightP-r'>
                    <Panel style={{padding: '20px 25px', width: 3680, height: 1760, justifyContent: 'space-between'}}>
                        <div className='iWarning-yj'>
                            {this.state.datas[1].map((e, i) => <Warning key={i} style={{color: '#E75656'}} className={'iWarning-G' + e.background} data={e.data} onClick={this.onClick}/>)}
                        </div>
                        <div className='iWarning-yj'>
                            {this.state.datas[2].map((e, i) => <Warning key={i} style={{color: '#E75656'}} className={'iWarning-G' + e.background} data={e.data} onClick={this.onClick}/>)}
                        </div>
                    </Panel>
                </div>
            </div>
        )
    }
}