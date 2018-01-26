import '../less';
import 'animate.css';
import React from 'react';
import ReactDOM from 'react-dom';
import echarts from 'echarts';
import { publish } from '../../../frame/core/arbiter';

// tip组件
export default class HomeRightEcharts extends React.Component {
    componentDidMount() {
        publish('home_right_e').then((res) => {
            if (this.chart) this.chart.dispose();
            this.chart = echarts.init(ReactDOM.findDOMNode(this.refs.echart));
            this.chart.setOption(res[0]);
        });
    }
    componentWillUnmount() {
        if (this.chart) this.chart.dispose();
    }
    render() {
        return (
            <div className='homeRightE' style={{width: 1200}}>
                <div className='homeRightE-l' style={{height: '100%'}} ref="echart"></div>
            </div>
        )
    }
}