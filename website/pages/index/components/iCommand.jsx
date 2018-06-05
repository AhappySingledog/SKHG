import '../less';
import 'animate.css';
import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import echarts from 'echarts';
import { publish, subscribe, unsubscribe } from '../../../frame/core/arbiter';
import { ViwePager, Tip, Table, Panel } from '../../../frame/componets/index';

// 智能指挥
export default class iCommand extends React.Component {
    render() {
        return (
            <div className='ic' style={{ overflow: 'hidden' }}>
                <iframe src='../icommand/index.html'/>
                {/* <div className='ic-close' onClick={this.props.close}></div> */}
            </div>
        )
    }
}