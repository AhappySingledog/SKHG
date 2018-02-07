import '../less';
import 'animate.css';
import React from 'react';
import ReactDOM from 'react-dom';
import { publish } from '../../../frame/core/arbiter';
import { Panel, WordsContent } from '../../../frame/componets/index';
import echarts from 'echarts';
import $ from 'jquery';
import _ from 'lodash';

/** 右侧上 */
class PortRightTop extends React.Component {

}

/** 右侧中 */
class PortRightCen extends React.Component {

}

/** 右侧下 */
class PortRightBot extends React.Component {

}

// 第二页右侧组件
export default class PortRight extends React.Component {
    componentDidMount() {

    }
    componentWillUnmount() {
        if (this.chart) this.chart.dispose();
    }

    render() {
        return (
            <div className='portRightP'>
                <div className='portRightP-T'>
                    <Panel style={{ width: 2202, padding: '20px 25px' }}>
                        <PortRightTop />
                    </Panel>
                    <Panel style={{ padding: '20px 25px', flexGrow: 1 }}>
                        <div ref="echart" style={{ width: 2203, height: 1272 }}></div>
                    </Panel>
                </div>
                <div className='portRightP-r'>
                    <Panel style={{ padding: '20px 25px' }}>
                        <HonorOnline />
                    </Panel>
                    <div className='portRightP-r-bottom'>
                        <Panel style={{ padding: '20px 25px', flexGrow: 1 }}>
                            <ClassicCase />
                        </Panel>
                    </div>
                </div>
            </div>
        )
    }
}