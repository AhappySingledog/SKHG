import '../less';
import 'animate.css';
import React from 'react';
import $ from 'jquery';

// tip组件
export default class Tip extends React.Component {
    componentDidMount() {
        $('.tip').addClass('zoomInRight animated').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', () => $('.tip').removeClass('zoomInRight animated'));
    }
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
                <div className='tip-bottom' />
            </div>
        )
    }
}