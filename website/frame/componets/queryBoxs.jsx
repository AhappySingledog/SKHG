import '../less';
import 'animate.css';
import React from 'react';
import ReactDOM from 'react-dom';
import $ from 'jquery';

// tip组件
export default class QueryBoxs extends React.Component {
    items = [
        {key: 'mt', name: '码头'},
        {key: 'imo', name: 'IMO号'},
        {key: 'hch', name: '航次号'},
    ]
    click = () => {
        let temp = {};
        this.items.forEach((e) => {
            temp[e.key] = $(ReactDOM.findDOMNode(this.refs[e.key])).val().trim();
        });
        this.props.query(temp)
    }
    render() {
        return (
            <div className='qbs'>
                {this.items.map((e, i) => [<span>{e.name || ''}</span>, <input ref={e.key}/>])}
                <div className='hvr-pulse-shrink' onClick={this.click}></div>
            </div>
        )
    }
}