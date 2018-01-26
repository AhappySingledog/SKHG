import '../less';
import 'animate.css';
import React from 'react';

// tip组件
export default class Panel extends React.Component {
    render() {
        return (
            <div className='panel' style={this.props.style}>
                {this.props.children}
            </div>
        )
    }
}