import React from 'react';
import './css/desc.less';

export default class Desc extends React.Component {
    constructor(props) {
        super(props);
        this.state = {}
    }
    render() {
        return (
            <div className={this.props.className} style={this.props.style}>
                <div className='descTip-top'>
                    <div className='descTip-title'>{this.props.title}</div>
                    <div onClick={this.props.close} className='closeDesc'/>
                </div>
                <div className='descTip-center'>{this.props.content}</div>
                <div className='descTip-bottom'></div>
            </div>
        )
    }
}