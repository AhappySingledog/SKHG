import _ from 'lodash';
import React from 'react';
import echarts from 'echarts';
import ReactDOM from 'react-dom';
import { subscribe, unsubscribe, publish } from '../core/arbiter';

export default class ChartView extends React.Component {
    state = {}
    componentDidMount() {
        const { scr, sub, options } = this.props;
        let scribe = (ops) => {
            publish(sub, ops).then((res) => {
                if (this.chart) this.chart.dispose();
                this.chart = echarts.init(ReactDOM.findDOMNode(this.refs.chart));
                this.chart.setOption(res[0]);
                if (res[0].img) { this.setState({ img: res[0].img }); }
            });
        }
        if (scr != sub) this.token = subscribe(scr, scribe);
        if (options) { scribe(options); this.timer = setInterval(() => scribe(options), 1000 * 60 * 5); }
    }
    componentWillUnmount() {
        if (this.token) unsubscribe(this.token);
        if (this.chart) this.chart.dispose();
        if (this.timer) clearInterval(this.timer);
    }
    render() {
        let { style } = this.props;
        return (
            <div style={_.assign({ height: '100%', overflow: 'hide' }, style)}>
                {
                    this.state.img ? <div style={{ position: 'absolute', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '5px' }}><img src={this.state.img.url} /></div> : null
                }
                <div ref="chart" style={{ height: '100%' }}></div>
            </div>
        );
    }
}
