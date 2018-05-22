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

// 货仓
export default class TableTitle extends React.Component {
    componentDidMount() {
        document.addEventListener('keydown', this.handleEnterKey);
    }
    export = () => {
        console.log(this.props.id);
        table2Excel(this.props.id);
    }
    handleEnterKey = (e) => {
        if (e.keyCode === 13) {
            let val = $(ReactDOM.findDOMNode(this.refs.target)).val();
            if (val !== '' && val !== 'undefined') this.props.query(val);
        }
    }
    render() {
        return (
            <div className='tableTitle'>
                <div className='tableTitle-n'>
                    {this.props.title}
                </div>
                {this.props.query ? <div className='tableTitle-s'>
                    <input id={this.props.id} className='tableTitle-i' ref='target' />
                    <div className='tableTitle-f' onClick={() => this.props.query($(ReactDOM.findDOMNode(this.refs.target)).val())}>
                    </div>
                </div> : null}
            </div>
        )
    }
}