import '../less';
import 'animate.css';
import React from 'react';
import ReactDOM from 'react-dom';
import { publish } from '../../../frame/core/arbiter';
import { Panel, WordsContent } from '../../../frame/componets/index';
import echarts from 'echarts';
import $ from 'jquery';
import _ from 'lodash';

class HgIntroduce extends React.Component {
    render() {
        return (
            <div className='introduce'>
                <div className='introduce-title'>海关简介</div>
                <div className='introduce-msg'>
                    <WordsContent style={{width: '100%', height: 1141, fontSize: 60, color: 'white', textIndent: '2em', lineHeight: '120px', padding: '0 20px'}}>
                        中华人民共和国蛇口海关隶属深圳海关，是深圳西部一个综合性海运口岸海关，主要业务包括：进出口海运货物监管、前海湾保税港区和进出境旅客监管；监管下去主要包括招湾、赤湾、妈湾、东角头、蛇口客运站、前海湾保税港区等港口作业区，监管海岸线达20公里。依法对经港口口岸进出境的运输工具、货物、物品进行监管；征收关税和其他法定有海关征收的税费；查缉走私；开展贸易统计并办理其他海关业务。
                    </WordsContent>
                    <div className='introduce-iv'>
                        <div className='introduce-image'></div>
                        <div className='introduce-video'>
                            <div className='introduce-Playvideo' onClick={() => publish('playVedio')}></div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

class Honor extends React.Component {
    render() {
        return (
            <div className='oneHonor'>
                <img className='oneHonor-img' src={this.props.data.img}/>
                <div>{this.props.data.time}</div>
                <div>{this.props.data.msg}</div>
            </div>
        )
    }
}

class HonorOnline extends React.Component {
    state= {
        data: [],
        honors: [],
    }
    componentDidMount() {
        let work = () => {
            let { data } = this.state;
            let firstItem = data[0];
            let temp = data.slice(1).concat(firstItem);
            let honors = _.take(temp, 4);
            this.setState({honors: honors, data: temp});
            $('.oneHonor').addClass('zoomIn animated').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', () => $('.oneHonor').removeClass('zoomIn animated'));
        }
        $.ajax({dataType: 'json', url: '../honors.json', async: false, success: (res) => {
            this.setState({data: res.data}, work);
            this.timer = setInterval(work, 20 * 1000);
        }});
    }

    componentWillUnmount() {
        clearInterval(this.timer);
    }
    
    render() {
        return (
            <div className='honor'>
                <div className='honor-title'>网上荣誉室</div>
                <div className='honor-body'>
                    <WordsContent style={{padding: '20px', width: 1366, height: 1113, display: 'flex', flexFlow: 'row wrap', alignContent: 'space-between', justifyContent: 'space-between'}}>
                        {this.state.honors.map((h, i) => <Honor key={i} data={h}/>)}
                    </WordsContent>
                </div>
            </div>
        )
    }
}

class Case extends React.Component {
    render() {
        return (
            <WordsContent style={{padding: '20px', width: 1366, height: 410, display: 'flex', flexDirction: 'column'}}>
                <div className='oneCase-title'>{this.props.data.title}</div>
                <div className='oneCase-msg'>{this.props.data.msg}</div>
            </WordsContent>
        )
    }
}

class ClassicCase extends React.Component {
    state= {
        data: [],
        cases: [],
    }
    componentDidMount() {
        let work = () => {
            let { data } = this.state;
            let firstItem = data[0];
            let temp = data.slice(1).concat(firstItem);
            let cases = _.take(temp, 1);
            this.setState({cases: cases, data: temp});
            $('.case-body').addClass('bounceInUp animated').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', () => $('.case-body').removeClass('bounceInUp animated'));
        }
        $.ajax({dataType: 'json', url: '../cases.json', async: false, success: (res) => {
            this.setState({data: res.data}, work);
            this.timer = setInterval(work, 30 * 1000);
        }});
    }
    componentWillUnmount() {
        if (this.timer) clearInterval(this.timer);
    }
    render() {
        return (
            <div className='case'>
                <div className='case-title'>{this.props.title}</div>
                <div className='case-body'>
                    {this.state.cases.map((c, i) => <Case key={i} data={c}/>)}
                </div>
            </div>
        )
    }
}

// 首页右侧组件
export default class HomeRightPanel extends React.Component {
    state = {
        eRadar: true
    }
    componentDidMount() {
        this.eRadar();
    }
    eBar = () => {
        publish('home_right_e').then((res) => {
            if (this.chart) this.chart.dispose();
            this.chart = echarts.init(ReactDOM.findDOMNode(this.refs.echart));
            this.chart.setOption(res[0]);
        });
    }
    eRadar = () => {
        publish('home_right_e_ldt').then((res) => {
            if (this.chart) this.chart.dispose();
            this.chart = echarts.init(ReactDOM.findDOMNode(this.refs.echart));
            this.chart.setOption(res[0]);
        });
    }
    Radar = () => {
        let flag = !this.state.eRadar;
        this.setState({eRadar: flag}, () => {
            if (flag) this.eRadar();
            else this.eBar();
        });
    }
    componentWillUnmount() {
        if (this.chart) this.chart.dispose();
    }
    render() {
        return (
            <div className='homeRightP'>
                <div className='homeRightP-l'>
                    <Panel style={{width: 2202, padding: '20px 25px', height: 1330}}>
                        <HgIntroduce />
                    </Panel>
                    <Panel style={{padding: '20px 25px', height: 1330}}>
                        <HonorOnline/>
                    </Panel>
                </div>
                <div className='homeRightP-r'>
                    <Panel style={{padding: '20px 25px'}}>
                        <div className='echart-title' style={{cursor: 'pointer'}} onClick={this.Radar}>业务数据</div>
                        <div ref="echart" style={{width: 2202, height: 1132}}></div>
                    </Panel>
                    <Panel style={{padding: '20px 25px', height: 1287}}>
                        <ClassicCase title='经典案例'/>
                        <ClassicCase title='舆情监控'/>
                    </Panel>
                </div>
            </div>
        )
    }
}