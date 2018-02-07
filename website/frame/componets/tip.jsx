import '../less';
import 'animate.css';
import React from 'react';

// tip组件
export default class Tip extends React.Component {
    render() {
        return (
            <div className='tip' style={this.props.style}>
                <div className='tip-top'>
                    <div className='tip-top-title' onClick={this.props.titleClick}>{this.props.title}</div>
                    <div className='tip-top-close' onClick={this.props.close}></div>
                </div>
                <div className='tip-center'>
                    <div className='tip-center-content'>{this.props.children}</div>
                </div>
                <div className='tip-bottom'/>
            </div>
        )
    }
}