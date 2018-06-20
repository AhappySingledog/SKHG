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
                <div className='echart-title'>今日蛇关</div>
                <div className='introduce-msg'>
                    <WordsContent style={{ width: '100%', height: 1141, fontSize: 60, color: 'white', textIndent: '2em', lineHeight: '120px', padding: '0 20px' }}>
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
    onClick = () => {
        publish('playImg', this.props.data.img);
    }
    render() {
        return (
            <div className='oneHonor'>
                <img className='oneHonor-img' src={this.props.data.img} onClick={this.onClick}/>
                <div>{this.props.data.time}</div>
                <div style={{width: 673}}>{this.props.data.msg}</div>
            </div>
        )
    }
}

class HonorOnline extends React.Component {
    state = {
        data: [],
        honors: [],
    }
    componentDidMount() {
        let work = () => {
            let { data } = this.state;
            let firstItem = data[0];
            let temp = data.slice(1).concat(firstItem);
            let honors = _.take(temp, 4);
            this.setState({ honors: honors, data: temp });
            $('.oneHonor').addClass('zoomIn animated').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', () => $('.oneHonor').removeClass('zoomIn animated'));
        }
        $.ajax({
            dataType: 'json', url: '../honors.json', async: false, success: (res) => {
                this.setState({ data: res.data }, work);
                this.timer = setInterval(work, 20 * 1000);
            },
        });
    }

    componentWillUnmount() {
        clearInterval(this.timer);
    }

    render() {
        return (
            <div className='honor'>
                <div className='honor-title'>蛇关风采</div>
                <div className='honor-body'>
                    <WordsContent style={{ padding: '20px', width: 1366, height: 1113, display: 'flex', flexFlow: 'row wrap', alignContent: 'space-between', justifyContent: 'space-between' }}>
                        {this.state.honors.map((h, i) => <Honor key={i} data={h} />)}
                    </WordsContent>
                </div>
            </div>
        )
    }
}

class Case extends React.Component {
    render() {
        return (
            <WordsContent style={{ padding: '20px', width: 3600, height: 320, display: 'flex', flexDirction: 'column' }}>
                <div className='oneCaseNew-title'>{this.props.data.title}</div>
                <div className='oneCaseNew-msg scrollbar'>{this.props.data.msg}</div>
            </WordsContent>
        )
    }
}

class ClassicCase extends React.Component {
    state = {
        data: [],
        cases: [],
        index: 0,
    }
    work = () => {
        let { data } = this.state;
        let firstItem = data[0];
        let temp = data.slice(1).concat(firstItem);
        let cases = _.take(temp, 3);
        this.setState({ cases: cases, data: temp });
        $('#' + this.props.itemKey).addClass('bounceInUp animated').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', () => $('#' + this.props.itemKey).removeClass('bounceInUp animated'));
    }
    componentDidMount() {
        $.ajax({
            dataType: 'json', url: '../cases.json', async: false, success: (res) => {
                if (this.props.itemKey === 'yqjk') {
                    this.datas = res[this.props.itemKey];
                    this.setState({ data: this.datas.xl }, this.work);
                    this.timer = setInterval(this.work, 30 * 1000);
                } else {
                    this.setState({ data: res[this.props.itemKey] }, this.work);
                    this.timer = setInterval(this.work, 30 * 1000);
                }
            },
        });
    }
    componentWillUnmount() {
        if (this.timer) clearInterval(this.timer);
    }
    onClick = (index, key) => {
        this.setState({index: index, data: this.datas[key]}, this.work);
    }
    render() {
        return (
            <div className='caseNew'>
                <div className='caseNew-body' id={this.props.itemKey} style={this.props.itemKey === 'yqjk' ? {paddingTop: '10px'} : {}}>
                    {this.state.cases.map((c, i) => <Case key={i} data={c} />)}
                </div>
            </div>
        )
    }
}

class Tab extends React.Component {
    state = {
        select: null,
        content: null,
        bar: true,
    }
    click = (i) => {
        if (this.timer) clearTimeout(this.timer);
        this.timer = setTimeout(() => {
            if (i != this.state.select) {
                if (i == 0) {
                    this.setState({select: 0, content: <div id="echart" style={{ width: 3637, height: 1134 }}></div>}, () => {
                        publish(this.state.bar ? 'home_right_e' : 'home_right_e_ldt').then((res) => {
                            if (this.chart) this.chart.dispose();
                            this.chart = echarts.init(document.getElementById('echart'));
                            this.chart.setOption(res[0]);
                        });
                    });
                }
                if (i == 1) {
                    this.setState({select: 1, content: <ClassicCase title='经典案例' itemKey={'jdal'} />});
                }
                if (i == 2) {
                    this.setState({select: 2, content: null});
                }
            }
        }, 300);
    }
    dbClick = (i) => {
        if (this.timer) clearTimeout(this.timer);
        if (i == 0) {
            let flag = !this.state.bar;
            this.setState({select: 0, bar: flag, content: <div id="echart" style={{ width: 3637, height: 1134 }}></div>}, () => {
                publish(flag ? 'home_right_e' : 'home_right_e_ldt').then((res) => {
                    if (this.chart) this.chart.dispose();
                    this.chart = echarts.init(document.getElementById('echart'));
                    this.chart.setOption(res[0]);
                });
            });
        }
    }
    componentDidMount() {
        this.click(0);
    }
    render() {
        let items = ['业务数据', '近期案例', '队伍风采'];
        return (
            <div className='homeRightN-t-body'>
                <div className='homeRightN-t-tab'>
                    {items.map((e, i) => <div key={i} onClick={() => this.click(i)} onDoubleClick={() => this.dbClick(i)} className={this.state.select == i ? 'homeRightN-t-tab-s' : 'homeRightN-t-tab-n'}>{e}</div>)}
                </div>
                <div className='homeRightN-t-tabContent'>
                    {this.state.content}
                </div>
            </div>
        )
    }
}

// 首页右侧组件
export default class HomeRightPanel extends React.Component {
    render() {
        return (
            <div className='homeRightN'>
                {/* <div className='homeRightN-t'>
                    <Panel style={{ width: 3685, padding: '20px 25px', height: 1470, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div className='homeRightN-t-title'>今日蛇关</div>
                        <Tab />
                    </Panel>
                </div> */}
                <div className='homeRightN-b'>
                    <Panel style={{ width: 3688, height: 2722, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between' }}>
                        {/* <div className='homeRightN-b-title'>舆情监控</div> */}
                        <iframe className='homeRightN-b-body' src='http://nebula.yun.pingan.com/#/share/107'></iframe>
                    </Panel>
                </div>
            </div>
        )
    }
}