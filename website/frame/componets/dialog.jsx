import '../less';
import 'animate.css';
import React from 'react';

// tip组件
export default class Dialog extends React.Component {
    render() {
        return (
            <div className="dialog-title">
                <div className='dialog-top'><div className='dialog-top-title'>{this.props.cshipname}</div></div>
                <div className='dialog-center'>
                    <div className='dialog-center-content'>{this.props.children}</div>
                </div>
                <div className='dialog-bottom'/>
            </div>
        )
    }
}