import '../less';
import 'animate.css';
import React from 'react';

// 文字容器
export default class WordsContent extends React.Component {
    render() {
        return (
            <div className='words' style={this.props.style}>
                {this.props.children}
            </div>
        )
    }
}