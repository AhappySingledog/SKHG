import React from 'react';
import './css/style.less';

export default class Desc extends React.Component {
    constructor(props) {
        super(props);
        this.state = {}
    }
    render() {
        return (
            <div className={this.props.className} style={this.props.style}>
                <div className='desc-top'>
                    <div className='desc-title'>{this.props.title}</div>
                    <div onClick={this.props.close} className='closeDesc'/>
                </div>
                <div className='desc-center'>{this.props.content}</div>
                <div className='desc-bottom'></div>
            </div>
        )
    }
}


