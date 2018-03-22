import '../less';
import 'animate.css';
import React from 'react';
import ReactDOM from 'react-dom';
import { publish } from '../../../frame/core/arbiter';
import { Panel, WordsContent, Table, Vedios } from '../../../frame/componets/index';
import echarts from 'echarts';
import $ from 'jquery';
import _ from 'lodash';

class Title extends React.Component {
    export = () => {
        console.log(this.props.id);  
    }
    render() {
        return (
            <div className='tableTitle'><div className='tableTitle-n'>{this.props.title}</div><div className='tableTitle-b' onClick={() => this.export()}></div></div>
        )
    }
} 

// 智能预警右侧组件
export default class PierRightPanel extends React.Component {
    state = {
    }
    onClick = (data) => {
        console.log(data);
    }
    export = (id) => {
        console.log(id);  
    }
    render() {
        let flds = [
            { title: '港口名称', name: 'name' },
            { title: '地点', name: 'addr' },
            { title: '港口开埠时间', name: 'kbsj' },
            { title: '招商局运营时间', name: 'yysj' },
        ];
        let datas = [
            {name: 1, addr: 2, kbsj: 3, yysj: 4},
            {name: 1, addr: 2, kbsj: 3, yysj: 4},
            {name: 1, addr: 2, kbsj: 3, yysj: 4},
            {name: 1, addr: 2, kbsj: 3, yysj: 4},
            {name: 1, addr: 2, kbsj: 3, yysj: 4},
            {name: 1, addr: 2, kbsj: 3, yysj: 4},
        ];
        let data = [
            { name: 'SCT 1# 2#堆场', url: 'http://www.cheluyun.com/javascript/zsg/?id=100031600&rtmp=rtmp://playrtmp.simope.com:1935/live/524622521d?liveID=100031600&hls=http://playhls.simope.com/live/524622521d/playlist.m3u8?liveID=100031600' },
            { name: 'SCT 1# 2#堆场', url: 'http://www.cheluyun.com/javascript/zsg/?id=100031600&rtmp=rtmp://playrtmp.simope.com:1935/live/524622521d?liveID=100031600&hls=http://playhls.simope.com/live/524622521d/playlist.m3u8?liveID=100031600' },
        ];
        let id1 = 'a1', id2 = 'a2', id3 = 'a3', id4 = 'a4';
        return (
            <div className='pierRight-1'>
                <div style={{width: 3750}}>
                    <Table title={<Title title={'各栏堆存柜量'} id={id1}/>} style={{width: '40%', height: 775}} id={id1} selectedIndex={null} flds={flds} datas={datas} trClick={null} trDbclick={null} />
                    <Table title={<Title title={'泊位停靠船舶信息'} id={id2}/>} style={{width: '59%', height: 775}} id={id2} selectedIndex={null} flds={flds} datas={datas} trClick={null} trDbclick={null} />
                </div>
                <div style={{width: 3750}}>
                    <Table title={<Title title={'超三个月海关未放行柜列表'} id={id3}/>} style={{width: '40%', height: 775}} id={id3} selectedIndex={null} flds={flds} datas={datas} trClick={null} trDbclick={null} />
                    <Table title={<Title title={'在场整船换装柜列表'} id={id4}/>} style={{width: '59%', height: 775}} id={id4} selectedIndex={null} flds={flds} datas={datas} trClick={null} trDbclick={null} />
                </div>
                <div style={{padding: '10px', border: '2px solid #1890ff', width: 3730}}>
                    <Vedios style={{width: 1855, height: 1100}} datas={data}/>
                    <Vedios style={{width: 1855, height: 1100}} datas={data}/>
                </div>
            </div>
        )
    }
} 