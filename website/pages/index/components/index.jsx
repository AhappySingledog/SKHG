import '../less';
import 'animate.css';
import $ from 'jquery';
import moment from 'moment';
import React from 'react';
import ReactDOM from 'react-dom';
import echarts from 'echarts';
import { publish, subscribe, unsubscribe } from '../../../frame/core/arbiter';
import { Vedio, ViwePager, Table, ImgDisplay, Panel, Vedios } from '../../../frame/componets/index';
import { table2Excel } from '../../../frame/core/table2Excel';
import Home from './home';
import Port from './port';
import Pier from './pier';
import WareHouse from './wareHouse';
import IWarning from './iWarning';
import ICommand from './iCommand';
import TableTitle from './tableTitle';
import '../../../frame/less/magic.less';
import '../../../frame/less/xcConfirm.less';

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

class WarningTitle extends React.Component {
    render() {
        return (
            <div className='tableTitle'>
                <div className='tableTitle-n'>
                    {this.props.title}
                </div>
                <div className='tableTitle-s'>
                    <input placeholder='请输入处理意见' className='tableTitle-i' ref='target' />
                    <div className='tableTitle-cl' onClick={() => this.props.handle($(ReactDOM.findDOMNode(this.refs.target)).val())}>
                    </div>
                </div>
            </div>
        )
    }
}

class Warning extends React.Component {
    componentDidMount() {
        let target = ReactDOM.findDOMNode(this.refs.target);
        $(target).addClass('wobble animated').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', () => $(target).removeClass('wobble animated'));
    }
    render() {
        return (
            <div className='warningBox'>
                <div className='warning' ref='target'>
                    <div>
                        <div onClick={this.props.close}></div>
                    </div>
                    <div>
                        <div>
                            <div></div>
                            <div>{this.props.title}</div>
                        </div>
                        <div>
                            <input placeholder='请输入处理人' />
                            <input placeholder='请输入处理意见' />
                            <div>处理</div>
                        </div>
                    </div>
                    <div>{this.props.warning}</div>
                </div>
            </div>
        );
    }
}

class QueryTitle extends React.Component {
    render() {
        return (
            <div className='tableTitle'>
                <div className='tableTitle-n'>
                    {this.props.title}
                </div>
                <div className='tableTitle-s'>
                    码头<input style={{ width: 310 }} placeholder='请输入码头' className='tableTitle-i' id='mt' />
                    IMO号<input style={{ width: 380 }} placeholder='请输入IMO号' className='tableTitle-i' id='imo' />
                    航次号<input placeholder='请输入航次号' className='tableTitle-i' id='hc' />
                    <div className='tableTitle-cl' onClick={() => this.props.query($('#mt').val(), $('#imo').val(), $('#hc').val())}>
                    </div>
                </div>
            </div>
        )
    }
}

class MyQuery extends React.Component {
    state = {
        index: 0,
        port: { datas1: [] },
        container: { datas1: [], datas2: [] },
        wareHouse: { datas1: [] },
        list: { datas1: [], datas2: [] },
    }
    chooseItem = (index) => {
        $('.query-t-b').addClass('magictime holeOut animated').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', () => { $('.query-t-b').removeClass('magictime holeOut animated'); this.setState({ index: index }, () => $('.query-t-b').addClass('magictime swashIn animated').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', () => $('.query-t-b').removeClass('magictime swashIn animated'))); });
    }
    render() {
        let items = ['码头泊位', '集装箱', '仓库信息', '提单信息'];
        let content = [];
        let index = this.state.index;
        let id1 = 'a', id2 = 'b';
        let flds = [];
        let width = 1280, height = 1360;
        let h = 660;
        if (index === 0) {
            let query = (mt, imo, hc) => {
                let pa = [{
                    paramName: 'P_TERMINALCODE',
                    value: mt
                }, {
                    paramName: 'P_IMO',
                    value: imo
                }, {
                    paramName: 'P_BUSINESSVOY',
                    value: hc
                }];
                publish('webAction', { svn: 'skhg_loader_service', path: 'queryPro', data: { proName: 'P_IMAP_SCCT_SHIPSCHEDULE', parms: JSON.stringify(pa) } }).then((res) => {
                    if (res[0].data.length > 0) {
                        let attr = res[0].attr;
                        let datas = Object.keys(attr).map((e) => { return { key: attr[e], value: res[0].data[0][e] } });
                        this.setState({ port: { datas1: datas } });
                    }
                });
            }
            let trClick = (data, index, datas) => {
                console.log(datas);
                // let zymt = datas.filter((e) => e.key == '作业码头')[0].value;
                // publish('webAction', { svn: 'skhg_service', path: 'getAreaByWhere', data: { where: "CODE='" + zymt + "'" } }).then((res) => {
                //     publish('changeLayer', { index: 2, props: { datas: res[0].data[0], defaultLayer: {container: datas} } });
                // })
            }
            flds = [
                { title: '参数名', dataIndex: 'key' },
                { title: '参数值', dataIndex: 'value' },
            ];
            content = [
                <Table key={1} rowNo={true} title={<QueryTitle title={'泊位停靠船舶信息'} id={id1} query={query} />} style={{ width: '100%', height: height }} id={id1} selectedIndex={null} flds={flds} datas={this.state.port.datas1} trClick={trClick} trDbclick={null} />,
            ];
        }
        else if (index === 1) {
            let map = [
                { title: 'IMO号', dataIndex: 'IMO' },
                { title: '进口商业航次号', dataIndex: 'InBusinessVoy' },
                { title: '出口商业航次号', dataIndex: 'OutBusinessVoy' },
                { title: '船名航次', dataIndex: 'OutVesselVoyage' },
                { title: '作业码头', dataIndex: 'DbId' },
                { title: '总提运单号', dataIndex: 'BlNbr' },
                { title: '订舱号', dataIndex: 'BookingEdo' },
                { title: '箱号', dataIndex: 'ContainerNbr' },
                { title: '箱型尺寸高度', dataIndex: 'SzTpHt' },
                { title: '空重', dataIndex: 'Status' },
                { title: '进出口状态', dataIndex: 'Category' },
                { title: '箱主', dataIndex: 'LineId' },
                { title: '当前位置', dataIndex: 'Location' },
                { title: '装货港', dataIndex: 'PolAlias' },
                { title: '卸货港', dataIndex: 'PodAlias' },
                { title: '目的港', dataIndex: 'Destination' },
                { title: '海关放行时间', dataIndex: 'CUS' },
                { title: '国检放行时间', dataIndex: 'CIQ' },
                { title: '集中查验时间', dataIndex: 'CicTime' },
                { title: '集中查验状态', dataIndex: 'CicStatus' },
                { title: '海关查验状态、国检查验状态、放行状态', dataIndex: 'ReleaseStatus' },
                { title: '进场时间', dataIndex: 'InTime' },
                { title: '离港时间', dataIndex: 'OutTime' },
            ];
            flds = [
                { title: '参数名', dataIndex: 'key' },
                { title: '参数值', dataIndex: 'value' },
            ];
            let flds2 = [
                { title: '港区', dataIndex: 'DbId' },
                { title: '船公司', dataIndex: 'ContainerOwner' },
                { title: '操作', dataIndex: 'OpType' },
                { title: '操作时间', dataIndex: 'OpTime' },
                { title: '操作服务', dataIndex: 'ColumnName' },
                { title: '从', dataIndex: 'OldValue' },
                { title: '到', dataIndex: 'NewValue' },
            ];
            let query = (e) => {
                Promise.all([
                    publish('webAction', { svn: 'eportapisct', path: 'GContainerInfo', data: { System: '', PageIndex: 1, PageSize: 30, SortBy: '', IsDescending: false, ContainerNo: e } }),
                    publish('webAction', { svn: 'eportapisct', path: 'GContainerHistoryInfo', data: { System: '', PageIndex: 1, PageSize: 30, SortBy: '', IsDescending: false, ContainerNo: e } }),
                ]).then((res) => {
                    let result = res[0][0].InnerList;
                    if (result.length > 0) {
                        let datas1 = map.map((e) => { return { key: e.title, value: result[0][e.dataIndex] } });
                        this.setState({ container: { datas1: datas1, datas2: res[1][0].InnerList } });
                    }
                });
            }
            let trClick = (data, index, datas) => {
                let zymt = datas.filter((e) => e.key == '作业码头')[0].value;
                let cno = datas.filter((e) => e.key == '箱号')[0].value;
                publish('webAction', { svn: 'skhg_service', path: 'getAreaByWhere', data: { where: "CODE='" + zymt + "'" } }).then((res) => {
                    publish('changeLayer', { index: 2, props: { datas: res[0].data[0], defaultLayer: {container: cno} } });
                })
            }
            content = [
                <div key={1} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', width: '100%', height: height }}>
                    <Table rowNo={true} title={<TableTitle title={'集装箱信息'} id={id1} query={query} />} style={{ width: '100%', height: h }} id={id1} selectedIndex={null} flds={flds} datas={this.state.container.datas1} trClick={trClick} trDbclick={null} />
                    <Table rowNo={true} title={<TableTitle title={'集装箱历史轨迹'} id={id2} />} style={{ width: '100%', height: h }} id={id2} selectedIndex={null} flds={flds2} datas={this.state.container.datas2} trClick={null} trDbclick={null} />
                </div>
            ];
        }
        else if (index === 2) {
            flds = [
                { title: '仓库名', dataIndex: 'a' },
                { title: '当前库存量', dataIndex: 'b' },
                { title: '所属单位', dataIndex: 'c' }
            ];
            content = [
                <Table key={1} rowNo={true} title={<TableTitle title={'仓库信息'} id={id1} query={(e) => alert(e)} />} style={{ width: '100%', height: height }} id={id1} selectedIndex={null} flds={flds} datas={this.state.wareHouse.datas1} trClick={null} trDbclick={null} />,
            ];
        }
        else if (index === 3) {
            flds = [
                { title: '提单号', dataIndex: 'a' },
                { title: '集装箱号', dataIndex: 'b' },
                { title: '装船/出闸信息', dataIndex: 'c' }
            ];
            content = [
                <Table key={1} rowNo={true} title={<TableTitle title={'集装箱已离港情况'} id={id1} query={(e) => alert(e)} />} style={{ width: width, height: height }} id={id1} selectedIndex={null} flds={flds} datas={this.state.list.datas1} trClick={null} trDbclick={null} />,
                <Table key={2} rowNo={true} title={<TableTitle title={'集装箱在场情况'} id={id2} />} style={{ width: width, height: height }} id={id2} selectedIndex={null} flds={flds} datas={this.state.list.datas2} trClick={null} trDbclick={null} />,
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

class ICountimg extends React.Component {
    state = {
        showIm: false,
    }
    componentDidMount() {
        for (let i = 1; i < 16; i++) {
            publish('ICountimg_' + i).then((res) => {
                let chars = echarts.init(ReactDOM.findDOMNode(this.refs['echart' + i]));
                chars.setOption(res[0]);
            });
        }
    }

    handleOnsle = () => {
        this.setState({ showIm: false })
    }

    handleOpen = (e) => {
        this.setState({ showIm: true })
        publish('ICountimg_' + e.currentTarget.id, 'ICountimg_' + e.currentTarget.id).then((res) => {
            if (this.chart) this.chart.dispose();
            this.chart = echarts.init(ReactDOM.findDOMNode(this.refs.echart));
            this.chart.setOption(res[0]);
        });
    }
    render() {
        return (
            <div>
                <div className='queryCount'>
                    <div className='queryCounts'>
                        <div id="1" onClick={this.handleOpen}>
                            <div style={{ height: '100%', width: '100%' }} ref="echart1"></div>
                        </div>

                        <div id="2" onClick={this.handleOpen}>
                            <div style={{ height: '100%', width: '100%' }} ref="echart2"></div>
                        </div>

                        <div id="3" onClick={this.handleOpen}>
                            <div style={{ height: '100%', width: '100%' }} ref="echart3"></div>
                        </div>

                        <div id="4" onClick={this.handleOpen}>
                            <div style={{ height: '100%', width: '100%' }} ref="echart4"></div>
                        </div>

                        <div id="5" onClick={this.handleOpen}>
                            <div style={{ height: '100%', width: '100%' }} ref="echart5"></div>
                        </div>

                        <div id="6" onClick={this.handleOpen}>
                            <div style={{ height: '100%', width: '100%' }} ref="echart6"></div>
                        </div>

                        <div id="7" onClick={this.handleOpen}>
                            <div style={{ height: '100%', width: '100%' }} ref="echart7"></div>
                        </div>

                        <div id="8" onClick={this.handleOpen}>
                            <div style={{ height: '100%', width: '100%' }} ref="echart8"></div>
                        </div>

                        <div id="9" onClick={this.handleOpen}>
                            <div style={{ height: '100%', width: '100%' }} ref="echart9"></div>
                        </div>

                        <div id="10" onClick={this.handleOpen}>
                            <div style={{ height: '100%', width: '100%' }} ref="echart10"></div>
                        </div>

                        <div id="11" onClick={this.handleOpen}>
                            <div style={{ height: '100%', width: '100%' }} ref="echart11"></div>
                        </div>

                        <div id="12" onClick={this.handleOpen}>
                            <div style={{ height: '100%', width: '100%' }} ref="echart12"></div>
                        </div>

                        <div id="13" onClick={this.handleOpen}>
                            <div style={{ height: '100%', width: '100%' }} ref="echart13"></div>
                        </div>

                        <div id="14" onClick={this.handleOpen}>
                            <div style={{ height: '100%', width: '100%' }} ref="echart14"></div>
                        </div>

                        <div id="15" onClick={this.handleOpen}>
                            <div style={{ height: '100%', width: '100%' }} ref="echart15"></div>
                        </div>
                    </div>
                    <div className="queryCounts-closes" onClick={() => this.props.close()}></div>
                </div>
                {this.state.showIm ?
                    <div className='OpenImBox'>
                        <div className="OpenIm">
                            <div className="OpenIm-a">
                                <div style={{ height: '100%', width: '100%' }} ref="echart"></div>
                            </div>
                            <div className="OpenIm-ons" onClick={this.handleOnsle}></div>
                        </div>
                    </div>
                    : null}
            </div>
        )
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
        iCountBtn: false,
        iCommand: false,
    }
    componentDidMount() {
        this.sub_changeLayer = subscribe('changeLayer', this.changeLayer);
        this.sub_playVedio = subscribe('playVedio', this.playVedio);
        this.sub_viwePager = subscribe('playImgs', this.playImgs);
        this.sub_playImg = subscribe('playImg', this.playImg);
        publish('changeLayer', { index: 0, props: {} });
        let work = () => Promise.all([
            publish('webAction', { svn: 'skhg_stage_service', path: 'queryTableByWhere', data: { tableName: 'IMAP_WARNING_LOG1' } }),
        ]).then((res) => {
            console.log(res);
            let temp = res[0][0];
            let flds = [
                { title: '参数名', dataIndex: 'key' },
                { title: '参数值', dataIndex: 'value' }
            ];
            let datas = Object.keys(temp.attr).map((e) => { return { key: temp.attr[e], value: temp.data[0][e] } });
            this.setState({ warning: { title: '空柜有货', msg: <Table className='mtable-warning' title={null} style={{ width: 2720, height: 1240, overflow: 'auto' }} id={'bb'} selectedIndex={null} flds={flds} datas={datas} trClick={null} trDbclick={null} myTd={null} /> } });
        });
        // work();
        // setInterval(work, 1000 * 60 * 2);
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
        if (index != idx || curProps.defaultLayer) {
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
    iQuery = (flag) => {
        console.log('iQuery');
        if (flag) this.setState({ myQuery: true }, () => $('.queryBox').addClass('magictime spaceInUp animated').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', () => $('.queryBox').removeClass('magictime spaceInUp animated')));
        else $('.queryBox').addClass('magictime spaceOutUp animated').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', () => { $('.queryBox').removeClass('magictime spaceOutUp animated'); this.setState({ myQuery: false }); })
    }
    iCount = () => {
        console.log('iCount');
        this.setState({ iCountBtn: true });
    }
    iCommand = (flag) => {
        console.log('iCommand');
        if (flag) this.setState({iCommand: flag}, () => $('.ic').addClass('magictime spaceInLeft animated').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', () => $('.ic').removeClass('magictime spaceInLeft animated')));
        else $('.ic').addClass('magictime spaceOutLeft animated').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', () => {$('.ic').removeClass('magictime spaceOutLeft animated');this.setState({iCommand: flag});});
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
                        <div className='mheader-iQuery' onClick={() => this.iQuery(!this.state.myQuery)} />
                        <div className='mheader-iCount' onClick={this.iCount} />
                        <div className='mheader-iCommand' onClick={() => this.iCommand(!this.state.iCommand)} />
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
                {this.state.warning ? <Warning title={this.state.warning.title} warning={this.state.warning.msg} close={() => this.setState({ warning: null })} /> : null}
                {this.state.myQuery ? <MyQuery close={() => this.iQuery(false)} /> : null}
                {this.state.iCountBtn ? <ICountimg close={() => this.setState({ iCountBtn: false })} /> : null}
                {this.state.iCommand ? <ICommand close={() => this.iCommand(false)}/> : null}
            </div>
        )
    }
}