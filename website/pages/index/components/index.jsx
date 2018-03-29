import '../less';
import 'animate.css';
import $ from 'jquery';
import moment from 'moment';
import React from 'react';
import ReactDOM from 'react-dom';
import { publish, subscribe, unsubscribe } from '../../../frame/core/arbiter';
import { Vedio, ViwePager, Table, ImgDisplay, Panel, Vedios } from '../../../frame/componets/index';
import { table2Excel } from '../../../frame/core/table2Excel';
import Home from './home';
import Port from './port';
import Pier from './pier';
import WareHouse from './wareHouse';
import IWarning from './iWarning';
import TableTitle from './tableTitle';
import '../../../frame/less/magic.less';

class Timer extends React.Component {
    state = { msg: '' }
    componentDidMount() {
        const week = { '1': '星期一', '2': '星期二', '3': '星期三', '4': '星期四', '5': '星期五', '6': '星期六', '7': '星期日' };
        let tq = '晴';
        function initWeather() {
            publish('webAction', { svn: 'sojson', path: 'weather/json.shtml', data: { city: '深圳' } }).then((res) => {
                if (res[0].message === 'Success !') { tq = res[0].data.forecast[0].type; }
            });
        }
        //initWeather();
        setInterval(() => {
            let msg = moment().format('YYYY年MM月DD日 ') + week[moment().format('e')] + moment().format(' HH:mm:ss') + '           ' + tq;
            this.setState({ msg });
        }, 1000);
        setInterval(initWeather, 1000 * 60 * 60);
    }
    render() {
        return <div className='mheader-time'>{this.state.msg}</div>
    }
}

let temp = [
    { name: '华夏号', hc: 'hxh', gq: 'SCT', bw: 'E501P2', sj: '2018/03/19 12:21', sl: '200/300', cl: '确认 | 取消' },
    { name: '华夏号', hc: 'hxh', gq: 'SCT', bw: 'E501P2', sj: '2018/03/19 12:21', sl: '200/300', cl: '确认 | 取消' },
    { name: '华夏号', hc: 'hxh', gq: 'SCT', bw: 'E501P2', sj: '2018/03/19 12:21', sl: '200/300', cl: '确认 | 取消' },
    { name: '华夏号', hc: 'hxh', gq: 'SCT', bw: 'E501P2', sj: '2018/03/19 12:21', sl: '200/300', cl: '确认 | 取消' },
    { name: '华夏号', hc: 'hxh', gq: 'SCT', bw: 'E501P2', sj: '2018/03/19 12:21', sl: '200/300', cl: '确认 | 取消' },
    { name: '华夏号', hc: 'hxh', gq: 'SCT', bw: 'E501P2', sj: '2018/03/19 12:21', sl: '200/300', cl: '确认 | 取消' },
    { name: '华夏号', hc: 'hxh', gq: 'SCT', bw: 'E501P2', sj: '2018/03/19 12:21', sl: '200/300', cl: '确认 | 取消' },
    { name: '华夏号', hc: 'hxh', gq: 'SCT', bw: 'E501P2', sj: '2018/03/19 12:21', sl: '200/300', cl: '确认 | 取消' },
    { name: '华夏号', hc: 'hxh', gq: 'SCT', bw: 'E501P2', sj: '2018/03/19 12:21', sl: '200/300', cl: '确认 | 取消' },
];
class MyLink extends React.Component {
    state = {
        items: [
            { name: '旅检移泊确认', show: true },
            { name: '整泊换装确认', show: false }
        ],
        datas: temp
    }
    clickTitle = (index) => {
        let items = this.state.items;
        let datas = temp.slice((Math.random() * 7).toFixed(0));
        items.forEach((e, i) => e.show = (i === index));
        this.setState({ items: items, datas: datas });
    }
    cl = (data, fld) => {
        console.log(data);
    }
    qx = (data, fld) => {
        console.log(data);
    }
    myTd = (trIndex, data, fld, tdIndex) => {
        if (fld.dataIndex === 'cl') {
            return <div style={{ display: 'flex', flexDirection: 'row' }}>
                <div className='link-cl' onClick={() => this.cl(data, fld)}>处理</div>
                <div style={{ margin: '0 5px' }}>|</div>
                <div className='link-qx' onClick={() => this.qx(data, fld)}>取消</div>
            </div>
        }
        return data[fld.dataIndex];
    }
    render() {
        let flds = [
            { title: '船名', dataIndex: 'name' },
            { title: '航次', dataIndex: 'hc' },
            { title: '预计靠泊港区', dataIndex: 'gq' },
            { title: '预计靠泊泊位', dataIndex: 'bw' },
            { title: '预计靠泊时间', dataIndex: 'sj' },
            { title: '整船柜数量(E/F)', dataIndex: 'sl' },
            { title: '处理', dataIndex: 'cl' },
        ];
        return (
            <div className='warningTip' style={{ position: 'absolute', top: 360, left: 4950, zIndex: 99999 }}>
                <div className='warningTip-t'></div>
                <div className='warningTip-b'>
                    <Panel style={{ padding: '20px 25px', width: 2365, height: 1071 }}>
                        <div className='warningTip-b-title'>
                            {this.state.items.map((e, i) => <div onClick={() => this.clickTitle(i)} className={e.show ? 'warningTip-b-title-1' : 'warningTip-b-title-2'} key={i}>{e.name}</div>)}
                        </div>
                        <div className='warningTip-b-body'>
                            <Table style={{ width: 2361, height: 954, overflow: 'auto' }} id={'bb'} selectedIndex={null} flds={flds} datas={this.state.datas} trClick={null} trDbclick={null} myTd={this.myTd} />
                        </div>
                    </Panel>
                </div>
            </div>
        );
    }
}

class Warning extends React.Component {
    componentDidMount() {
        let target = ReactDOM.findDOMNode(this.refs.target);
        $(target).addClass('wobble animated').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', () => $(target).removeClass('wobble animated'));
    }
    render() {
        return (
            <div className='warning' ref='target'>
                {this.props.warning.msg}
            </div>
        );
    }
}

class Title extends React.Component {
    export = () => {
        console.log(this.props.id);
        table2Excel(this.props.id);
    }
    render() {
        return (
            <div className='tableTitle'><div className='tableTitle-n'>{this.props.title}</div><div className='tableTitle-b' onClick={() => this.export()}></div></div>
        )
    }
}

class MyQuery extends React.Component {
    state = {
        index: 0
    }
    componentDidMount() {
        console.log(this.props);
    }
    chooseItem = (index) => {
        $('.query-t-b').addClass('magictime holeOut animated').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', () => {$('.query-t-b').removeClass('magictime holeOut animated');this.setState({index: index}, () => $('.query-t-b').addClass('magictime swashIn animated').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', () => $('.query-t-b').removeClass('magictime swashIn animated')));});
    }
    render() {
        let items = ['码头泊位', '集装箱', '仓库信息', '提单信息'];
        let content = [];
        let index = this.state.index;
        let id1 = 'a', id2 = 'b';
        let flds = [], datas = [];
        let w = 1640, h = 916;
        let data = [
            { name: 'SCT 1# 2#堆场', url: 'http://www.cheluyun.com/javascript/zsg/?id=100031600&rtmp=rtmp://playrtmp.simope.com:1935/live/524622521d?liveID=100031600&hls=http://playhls.simope.com/live/524622521d/playlist.m3u8?liveID=100031600' },
            { name: 'SCT 1# 2#堆场', url: 'http://www.cheluyun.com/javascript/zsg/?id=100031600&rtmp=rtmp://playrtmp.simope.com:1935/live/524622521d?liveID=100031600&hls=http://playhls.simope.com/live/524622521d/playlist.m3u8?liveID=100031600' },
        ];
        if (index === 0) {
            flds = [
                {title: '泊位', dataIndex: 'a'},
                {title: '船名', dataIndex: 'b'},
                {title: '航次号', dataIndex: 'c'}
            ];
            datas = [
                {a: 1, b: 2, c: 3},
                {a: 1, b: 2, c: 3},
                {a: 1, b: 2, c: 3},
                {a: 1, b: 2, c: 3},
                {a: 1, b: 2, c: 3},
                {a: 1, b: 2, c: 3},
                {a: 1, b: 2, c: 3},
                {a: 1, b: 2, c: 3},
            ];
            content = [
                <Table key={1} rowNo={true} title={<TableTitle title={'泊位停靠船舶信息'} id={id1} query={(e) => alert(e)}/>} style={{ width: 3343, height: 969 }} id={id1} selectedIndex={null} flds={flds} datas={datas} trClick={null} trDbclick={null} />,
                <div key={2} className='query-t-b-c' style={{ padding: '10px', border: '2px solid #1890ff', width: 3323, margin: '30px 0' }}>
                    <Vedios style={{ width: w, height: h }} datas={data} />
                    <Vedios style={{ width: w, height: h }} datas={data} />
                </div>
            ];
        }
        else if (index === 1) {
            flds = [
                {title: '码头', dataIndex: 'a'},
                {title: '堆位', dataIndex: 'b'},
                {title: '位置', dataIndex: 'c'}
            ];
            datas = [
                {a: 1, b: 2, c: 3},
                {a: 1, b: 2, c: 3},
                {a: 1, b: 2, c: 3},
                {a: 1, b: 2, c: 3},
                {a: 1, b: 2, c: 3},
                {a: 1, b: 2, c: 3},
                {a: 1, b: 2, c: 3},
                {a: 1, b: 2, c: 3},
            ];
            content = [
                <Table key={1} rowNo={true} title={<TableTitle title={'集装箱信息'} id={id1} query={(e) => alert(e)}/>} style={{ width: 3343, height: 969 }} id={id1} selectedIndex={null} flds={flds} datas={datas} trClick={null} trDbclick={null} />,
                <div key={2} className='query-t-b-c' style={{ padding: '10px', border: '2px solid #1890ff', width: 3323, margin: '30px 0' }}>
                    <Vedios style={{ width: w, height: h }} datas={data} />
                </div>
            ];
        }
        else if (index === 2) {
            flds = [
                {title: '仓库名', dataIndex: 'a'},
                {title: '当前库存量', dataIndex: 'b'},
                {title: '所属单位', dataIndex: 'c'}
            ];
            datas = [
                {a: 1, b: 2, c: 3},
                {a: 1, b: 2, c: 3},
                {a: 1, b: 2, c: 3},
                {a: 1, b: 2, c: 3},
                {a: 1, b: 2, c: 3},
                {a: 1, b: 2, c: 3},
                {a: 1, b: 2, c: 3},
                {a: 1, b: 2, c: 3},
            ];
            content = [
                <Table key={1} rowNo={true} title={<TableTitle title={'仓库信息'} id={id1} query={(e) => alert(e)}/>} style={{ width: 3343, height: 969 }} id={id1} selectedIndex={null} flds={flds} datas={datas} trClick={null} trDbclick={null} />,
                <div key={2} className='query-t-b-c' style={{ padding: '10px', border: '2px solid #1890ff', width: 3323, margin: '30px 0' }}>
                    <Vedios style={{ width: w, height: h }} datas={data} />
                    <Vedios style={{ width: w, height: h }} datas={data} />
                </div>
            ];
        }
        else if (index === 3) {
            flds = [
                {title: '提单号', dataIndex: 'a'},
                {title: '集装箱号', dataIndex: 'b'},
                {title: '装船/出闸信息', dataIndex: 'c'}
            ];
            datas = [
                {a: 1, b: 2, c: 3},
                {a: 1, b: 2, c: 3},
                {a: 1, b: 2, c: 3},
                {a: 1, b: 2, c: 3},
                {a: 1, b: 2, c: 3},
                {a: 1, b: 2, c: 3},
                {a: 1, b: 2, c: 3},
                {a: 1, b: 2, c: 3},
            ];
            content = [
                <Table key={1} rowNo={true} title={<TableTitle title={'集装箱已离港情况'} id={id1} query={(e) => alert(e)}/>} style={{ width: 3343, height: 969 }} id={id1} selectedIndex={null} flds={flds} datas={datas} trClick={null} trDbclick={null} />,
                <Table key={2} rowNo={true} title={<TableTitle title={'集装箱在场情况'} id={id2}/>} style={{ width: 3343, height: 969 }} id={id2} selectedIndex={null} flds={flds} datas={datas} trClick={null} trDbclick={null} />,
            ];
        }
        
        return (
            <div className='queryBox'>
                <div className='query' ref='target'>
                    <div className='query-t'>
                        <div className='query-t-t'>
                            {items.map((e, i) => <div key={i} className={'query-t-t-item-' + (i + 1) + (i === this.state.index ? '-select' : '')} onClick={() => this.chooseItem(i)}></div>)}
                        </div>
                        <div className='query-t-b'>
                            {content}
                        </div>
                    </div>
                    <div className='query-b' onClick={this.props.close}></div>
                </div>
            </div>
        );
    }
}

export default class App extends React.Component {
    state = {
        index: null,
        curLayer: null,
        oldProps: {},
        curProps: {},
        cv: {},
        viwePager: null,
        warningTip: false,
        jkname: null,
        img: null,
        warning: null,
        myQuery: false,
    }
    componentDidMount() {
        this.sub_changeLayer = subscribe('changeLayer', this.changeLayer);
        this.sub_playVedio = subscribe('playVedio', this.playVedio);
        this.sub_viwePager = subscribe('playImgs', this.playImgs);
        this.sub_playImg = subscribe('playImg', this.playImg);
        publish('changeLayer', { index: 0, props: {} });
        this.timer = setInterval(() => {
            this.setState({ warning: null }, () => this.setState({ warning: { msg: '您有一条新的报警信息！' } }));
        }, 10 * 1000);
    }
    componentWillUnmount() {
        if (this.sub_changeLayer) unsubscribe(this.sub_changeLayer);
        if (this.sub_playVedio) unsubscribe(this.sub_playVedio);
        if (this.sub_viwePager) unsubscribe(this.sub_viwePager);
        if (this.sub_playImg) unsubscribe(this.sub_playImg);
    }
    changeLayer = (ops) => {
        let idx = this.state.index;
        let oldProps = this.state.curProps;
        let curProps = ops.props;
        let index = ops.index;
        if (index != idx) {
            let curLayer = null;
            switch (index) {
                case 1:
                    curLayer = <Port {...curProps} />;
                    this.setState({
                        jkname: '海关监管区域'
                    });
                    break;
                case 2:
                    curLayer = <Pier {...curProps} />;
                    this.setState({
                        jkname: ops.props.datas.name
                    });
                    break;
                case 3:
                    curLayer = <WareHouse {...curProps} />;
                    break;
                case 4:
                    curLayer = <IWarning {...curProps} />;
                    break;
                default:
                    curLayer = <Home {...curProps} />;
                    this.setState({
                        jkname: '海关监管区域'
                    });
            }
            $('.mbody-content').addClass('zoomIn animated').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', () => $('.mbody-content').removeClass('zoomIn animated'));
            this.setState({ index, curLayer, oldProps, curProps });
        }
    }
    iQuery = () => {
        console.log('iQuery');
        this.setState({myQuery: true}, () => $('.queryBox').addClass('magictime foolishIn animated').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', () => $('.queryBox').removeClass('magictime foolishIn animated')));
    }
    iCount = () => {
        console.log('iCount');
    }
    iCommand = () => {
        console.log('iCommand');
    }
    warning = () => {
        console.log('warning');
        publish('changeLayer', { index: 4, props: {} });
    }
    link = () => {
        console.log('link');
        let flag = !this.state.warningTip;
        if (flag) this.setState({ warningTip: flag }, () => $('.warningTip').addClass('showAnimete_1 animated').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', () => $('.warningTip').removeClass('showAnimete_1 animated')));
        else $('.warningTip').addClass('showAnimete_2 animated').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', () => { $('.warningTip').removeClass('showAnimete_2 animated'); this.setState({ warningTip: flag }); });
    }
    goBack = () => {
        let index = this.state.index;
        let oldProps = this.state.oldProps;
        if (index >= 1) this.changeLayer({ index: index - 1, props: oldProps });
    }
    playVedio = (vedio) => {
        let data = [
            { name: 'SCT大楼12F大厅', url: 'http://www.cheluyun.com/javascript/zsg/?id=100032172&rtmp=rtmp://playrtmp.simope.com:1935/live/07f39deff1?liveID=100032172&hls=http://playhls.simope.com/live/07f39deff1/playlist.m3u8?liveID=100032172' },
            { name: 'SCT4号泊位', url: 'http://www.cheluyun.com/javascript/zsg/?id=100032166&rtmp=rtmp://playrtmp.simope.com:1935/live/e4b0c82c15?liveID=100032166&hls=http://playhls.simope.com/live/e4b0c82c15/playlist.m3u8?liveID=100032166' },
            { name: 'SCT工程部维修车间', url: 'http://www.cheluyun.com/javascript/zsg/?id=100032170&rtmp=rtmp://playrtmp.simope.com:1935/live/89619ada51?liveID=100032170&hls=http://playhls.simope.com/live/89619ada51/playlist.m3u8?liveID=100032170' },
            { name: 'SCT大楼1F监控室', url: 'http://www.cheluyun.com/javascript/zsg/?id=100032167&rtmp=rtmp://playrtmp.simope.com:1935/live/105c2009a0?liveID=100032167&hls=http://playhls.simope.com/live/105c2009a0/playlist.m3u8?liveID=100032167' },
            { name: 'CCT操作部中控室', url: 'http://www.cheluyun.com/javascript/zsg/?id=100032173&rtmp=rtmp://playrtmp.simope.com:1935/live/ee2e705054?liveID=100032173&hls=http://playhls.simope.com/live/ee2e705054/playlist.m3u8?liveID=100032173' },
            { name: 'CCT工程部维修车间', url: 'http://www.cheluyun.com/javascript/zsg/?id=100032171&rtmp=rtmp://playrtmp.simope.com:1935/live/d37820f07a?liveID=100032171&hls=http://playhls.simope.com/live/d37820f07a/playlist.m3u8?liveID=100032171' },
            { name: 'MCT闸口安保室', url: 'http://www.cheluyun.com/javascript/zsg/?id=100032174&rtmp=rtmp://playrtmp.simope.com:1935/live/28110b959b?liveID=100032174&hls=http://playhls.simope.com/live/28110b959b/playlist.m3u8?liveID=100032174' },
            { name: 'SCT 1# 2#堆场', url: 'http://www.cheluyun.com/javascript/zsg/?id=100031600&rtmp=rtmp://playrtmp.simope.com:1935/live/524622521d?liveID=100031600&hls=http://playhls.simope.com/live/524622521d/playlist.m3u8?liveID=100031600' },
        ];
        this.setState({ cv: {} }, () => this.setState({ cv: data[7] }));
    }
    closeVedio = () => {
        this.setState({ cv: {} });
    }
    playImgs = (imgs) => {
        this.setState({ viwePager: { imgs: imgs } }, () => $('#imgsDisplay').addClass('bounceInLeft animated').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', () => $('#imgsDisplay').removeClass('bounceInLeft animated')));
    }
    closeImgs = () => {
        $('#imgsDisplay').addClass('bounceOutLeft animated').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', () => { $('#imgsDisplay').removeClass('bounceOutLeft animated'); this.setState({ viwePager: null }); });
    }
    playImg = (img) => {
        this.setState({ img: img }, () => $('.imgDisplay').addClass('bounceInLeft animated').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', () => $('.imgDisplay').removeClass('bounceInLeft animated')));
    }
    closeImg = () => {
        $('.imgDisplay').addClass('bounceOutLeft animated').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', () => { $('.imgDisplay').removeClass('bounceOutLeft animated'); this.setState({ img: null }); });
    }
    render() {
        return (
            <div className='mframe'>
                <div className='mheader'>
                    <div className='mheader-title'>蛇口海关iMap智慧管理系统</div>
                    <div className='mheader-top'>
                        <div className='mheader-back' onClick={this.goBack} />
                        <div className='mheader-home' onClick={() => this.changeLayer(0, {})} />
                        <div className='mheader-iQuery' onClick={this.iQuery} />
                        <div className='mheader-iCount' onClick={this.iCount} />
                        <div className='mheader-iCommand' onClick={this.iCommand} />
                        <div className='mheader-warning' onClick={this.warning} />
                        <div className='mheader-link' onClick={this.link} />
                        <div className='mheader-nt'>
                            <div className='mheader-name'>{this.state.jkname}</div>
                            <Timer />
                        </div>
                    </div>
                </div>
                <div className='mbody'><div className='mbody-content'>{this.state.curLayer}</div></div>
                <div className='mfooter' />
                {this.state.cv.url ? <Vedio close={this.closeVedio} video={this.state.cv} /> : null}
                {this.state.viwePager ? <div id='imgsDisplay' style={{ position: 'absolute', top: 462, left: 5126, zIndex: 10 }}><ViwePager autoPlay={true} direction={'right'} imgs={this.state.viwePager.imgs} style={{ width: 2538, height: 2683 }} boxStyle="content" interval={4000} close={this.closeImgs} /></div> : null}
                {this.state.warningTip ? <MyLink /> : null}
                {this.state.img ? <ImgDisplay img={this.state.img} close={this.closeImg} /> : null}
                {this.state.warning ? <Warning warning={this.state.warning} /> : null}
                {this.state.myQuery ? <MyQuery close={() => $('.queryBox').addClass('magictime foolishOut animated').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', () => {$('.queryBox').removeClass('magictime foolishOut animated');this.setState({myQuery: false});})}/> : null}
            </div>
        )
    }
}