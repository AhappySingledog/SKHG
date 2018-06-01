import '../less';
import 'animate.css';
import React from 'react';

// tip组件
export default class Vedio extends React.Component {
    render() {
        return (
            <div className='cv' style={this.props.style} onDoubleClick={this.props.scale}>
                <div className='cv-top'>
                    <div className='cv-title'>
                        <div className='cv-name'>{this.props.video.name}</div>
                        <div className='cv-liveID'>{this.props.video.liveID}</div>
                        <div className='cv-liveName'>{this.props.video.liveName}</div>
                    </div>
                    <div onClick={this.props.close} className='closeCv' />
                </div>
                <div className='cv-mid'>
                    <iframe className='cv-mid-iframe' src={this.props.video.url} />
                </div>
                <div className='cv-bottom' />
            </div>
        )
    }
}