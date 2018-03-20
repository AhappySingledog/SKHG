import '../less/noHornTip.less';
import 'animate.css';
import React from 'react';
import $ from 'jquery';

// tip组件
export default class noHornTip extends React.Component {
    componentDidMount() {
        $('.tip').addClass('zoomInRight animated').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', () => $('.tip').removeClass('zoomInRight animated'));
    }
    render() {
        return (
            <div className='tips animated' style={this.props.style}>
                <div className='tips-top'>
                    <div className='tips-top-title'>{this.props.title}</div>
                    <div className='tips-top-close'></div>
                </div>
                <div className='tips-center'>
                    <div className='tips-center-content'>{this.props.children}</div>
                </div>
                <div className='tips-bottom' />
            </div>
        )
    }
}