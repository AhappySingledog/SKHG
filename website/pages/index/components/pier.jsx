import '../less';
import 'animate.css';
import $ from 'jquery';
import moment from 'moment';
import React from 'react';
import ReactDOM from 'react-dom';
import echarts from 'echarts';
import bmap from 'echarts/extension/bmap/bmap';
import { publish } from '../../../frame/core/arbiter';

// 码头
export default class Pier extends React.Component {
    
    componentDidMount() {
      
    }

    componentWillUnmount() {
        console.log(this.props);
    }

  

    render() {
      
        return (
           <div></div>
        )
    }
}