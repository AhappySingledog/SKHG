import '../less';
import 'animate.css';
import React from 'react';
import ReactDOM from 'react-dom';
import $ from 'jquery';

// tip组件
export default class QueryBox extends React.Component {
    componentDidMount() {
        document.addEventListener('keydown', (e) => {if (e.keyCode === 13) this.props.query($(ReactDOM.findDOMNode(this.refs.input)).val())});
    }
    render() {
        return (
            <div className='qb'>
                <div><span>{this.props.name || ''}</span></div>
                <div><input id='qbInput' placeholder={'请输入' + (this.props.name || '参数')} ref='input'/><div className='hvr-pulse-shrink' onClick={() => this.props.query($(ReactDOM.findDOMNode(this.refs.input)).val())}></div></div>
            </div>
        )
    }
}