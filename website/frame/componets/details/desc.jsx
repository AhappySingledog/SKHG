import React from 'react';
import './css/desc.less';

export default class Desc extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            box: false,
        }
    }

    componentDidMount() {
        if (this.props.title === '柜子') {
            this.setState({ box: true });
        } else {
            this.setState({ box: false });
        }
    }
    render() {
        let censtyle = {
            'height': '1740px',
            'overflow': 'auto'
        };
        let tipstyle = {
            'bottom': 0,
            'right': 0,
            'animation': 'showAnimete 0.5s ease',
            'transformOrigin': 'right center 0px',
            'position': 'absolute',
            'padding': '25px',
        };
        return (
            <div className={this.props.className} style={this.state.box ? tipstyle : this.props.style}>
                <div className='descTip-top'>
                    <div className='descTip-title'>{this.props.title}</div>
                    <div onClick={this.props.close} className='closeDesc' />
                </div>
                <div className='descTip-center test-1' style={this.state.box ? censtyle : null}>{this.props.content}</div>
                <div className='descTip-bottom'></div>
            </div>
        )
    }
}