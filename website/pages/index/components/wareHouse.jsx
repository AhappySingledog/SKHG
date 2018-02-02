import '../less';
import 'animate.css';
import $ from 'jquery';
import moment from 'moment';
import React from 'react';
import ReactDOM from 'react-dom';
import echarts from 'echarts';
import bmap from 'echarts/extension/bmap/bmap';
import { publish } from '../../../frame/core/arbiter';

// 货仓
export default class WareHouse extends React.Component {
    state = {}
    componentDidMount() {
        console.log(this.props);
    }
    componentWillUnmount() {
        console.log(this.props);
    }
    render() {
        return (
            <div className="house">
                <div className="houseleft">
                    <div className="houseleft-map">
                        <div className='test-sxt' style={{top: 772, left: 890}} onClick={() => publish('playVedio')}/>
                        <div className='test-sxt' style={{top: 1200, left: 3114}} onClick={() => publish('playVedio')}/>
                        <div className='test-sxt' style={{top: 2100, left: 1200}} onClick={() => publish('playVedio')}/>
                        <div className='test-sxt' style={{top: 1900, left: 4325}} onClick={() => publish('playVedio')}/>
                        <div className='test-sxt' style={{top: 765, left: 6325}} onClick={() => publish('playVedio')}/>
                    </div>
                </div>
                <div className="houseright">
                    <div className='houseright-1' onClick={() => publish('playVedio')}></div>
                    <div className='houseright-2' onClick={() => publish('playVedio')}></div>
                    <div className='houseright-3' onClick={() => publish('playVedio')}></div>
                    <div className='houseright-4' onClick={() => publish('playVedio')}></div>
                </div>
            </div>
        )
    }
}