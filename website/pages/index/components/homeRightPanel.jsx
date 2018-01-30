import '../less';
import 'animate.css';
import React from 'react';
import ReactDOM from 'react-dom';
import { publish } from '../../../frame/core/arbiter';
import { Panel, WordsContent } from '../../../frame/componets/index';
import echarts from 'echarts';

class HgIntroduce extends React.Component {
    render() {
        return (
            <div className='introduce'>
                <div className='introduce-title'/>
                <div className='introduce-msg'>
                    <WordsContent style={{height: 1141, fontSize: 60, color: 'white'}}>
                        中华人民共和国蛇口海关隶属深圳海关，是深圳西部一个综合性海运口岸海关，主要业务包括：进出口海运货物监管、前海湾保税港区和进出境旅客监管；监管下去主要包括招湾、赤湾、妈湾、东角头、蛇口客运站、前海湾保税港区等港口作业区，监管海岸线达20公里。依法对经港口口岸进出境的运输工具、货物、物品进行监管；征收关税和其他法定有海关征收的税费；查缉走私；开展贸易统计并办理其他海关业务。
                    </WordsContent>
                    <div className='introduce-iv'>
                        <div className='introduce-image'></div>
                        <div className='introduce-video'></div>
                    </div>
                </div>
            </div>
        )
    }
}

// 首页右侧组件
export default class HomeRightPanel extends React.Component {
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
            <div className='homeRightP'>
                <div className='homeRightP-l'>
                    <Panel style={{width: 2202, padding: '20px 25px'}}>
                        <HgIntroduce />
                    </Panel>
                    <div className='homeRightP-l-bottom'>
                        <Panel style={{padding: '20px 25px', flexGrow: 1}}>
                            <div ref="echart" style={{width: 2203, height: 1272}}></div>
                        </Panel>
                    </div>
                </div>
                <div className='homeRightP-r'></div>
            </div>
        )
    }
}