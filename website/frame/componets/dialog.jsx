import '../less';
import 'animate.css';
import React from 'react';

// tip组件
export default class Dialog extends React.Component {
    render() {
        return (
            <div className="dialog-title" style={{ left: this.props.title.style.left, top: this.props.title.style.top }}>
                <div className='dialog-top'><div className='dialog-top-title'>{this.props.title.name}</div></div>
                <div className='dialog-center'>
                    <div className='dialog-center-content'>{this.props.children}</div>
                </div>
                <div className='dialog-bottom' />
            </div>
        )
    }
}