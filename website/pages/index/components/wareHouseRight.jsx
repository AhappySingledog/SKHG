import '../less';
import 'animate.css';
import $ from 'jquery';
import moment from 'moment';
import React from 'react';
import ReactDOM from 'react-dom';
import echarts from 'echarts';
import { publish } from '../../../frame/core/arbiter';
import { Panel, WordsContent, Table, Vedios } from '../../../frame/componets/index';
import { table2Excel } from '../../../frame/core/table2Excel';

class MapOperation extends React.Component {
    componentDidMount() {
        console.log(this.props);
    }
    render() {
        return (<div></div>)
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


// 货仓
export default class WareHouseRight extends React.Component {
    componentDidMount() {
        console.log(this.props);
    }
    render() {
        let w = 1830;
        let h = 860;
        let data = [
            { name: 'SCT 1# 2#堆场', url: 'http://www.cheluyun.com/javascript/zsg/?id=100031600&rtmp=rtmp://playrtmp.simope.com:1935/live/524622521d?liveID=100031600&hls=http://playhls.simope.com/live/524622521d/playlist.m3u8?liveID=100031600' },
            { name: 'SCT 1# 2#堆场', url: 'http://www.cheluyun.com/javascript/zsg/?id=100031600&rtmp=rtmp://playrtmp.simope.com:1935/live/524622521d?liveID=100031600&hls=http://playhls.simope.com/live/524622521d/playlist.m3u8?liveID=100031600' },
        ];
        const onyardFlds = [
            { title: '监控场所', name: 'a' },
            { title: '线路编号', name: 'b' },
            { title: '场所名称', name: 'c' },
        ];
        return (
            <div className='warehouse'>
                <div className='warehouse-l'>
                    <Table rowNo={true} title={<Title title={'监控视频列表'} id={'id1'} />} style={{ width: 1853, height: 1804 }} id={'id1'} selectedIndex={null} flds={onyardFlds} datas={[]} trClick={null} trDbclick={null} />
                    <div className='warehouse-v'>
                        <Vedios style={{ width: w, height: h }} datas={data} />
                    </div>
                </div>
                <div className='warehouse-r'>
                    <div className='warehouse-v'>
                        <Vedios style={{ width: w, height: h }} datas={data} />
                    </div>
                    <div className='warehouse-v'>
                        <Vedios style={{ width: w, height: h }} datas={data} />
                    </div>
                    <div className='warehouse-v'>
                        <Vedios style={{ width: w, height: h }} datas={data} />
                    </div>
                </div>
            </div>
        )
    }
}