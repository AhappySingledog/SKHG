import React from 'react';
import './css/desc.less';

export default class Desc extends React.Component {
    constructor(props) {
        super(props);
        this.state = {}
    }
    render() {
        let censtyle = {
            'height': '1740px',
            'overflow': 'auto'
        };
        let tipstyle = {
            'bottom': 0,
            'right': '15px',
            'animation': 'showAnimete 0.5s ease',
            'transformOrigin': 'right center 0px',
            'position': 'absolute',
            'padding': '25px',
        };
        return (
            <div className={this.props.className} style={this.props.box ? tipstyle : this.props.style}>
                <div className='descTip-top'>
                    <div className='descTip-title'>{this.props.title}</div>
                    <div onClick={this.props.close} className='closeDesc' />
                </div>
                <div className='descTip-center test-1' style={this.props.box ? censtyle : null}>{this.props.content}</div>
                <div className='descTip-bottom'></div>
            </div>
        )
    }
}