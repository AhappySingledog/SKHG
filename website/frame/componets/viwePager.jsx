import '../less/index.less';
import React from 'react';

// 图片轮播
export default class ViwePager extends React.Component {
    state = {
        activeIndex: 0,
        direction: 'right',
    }
    componentDidMount() {
        this.autoPlay();
    }
    componentWillUnmount() {
        clearInterval(this.timeOuter);
    }
    autoPlay = () => {
        if (this.props.autoPlay) {
            if (this.props.direction === 'right') {
                this.timeOuter = setInterval(this.playRight, this.props.interval);
            } else if (this.props.direction === 'left') {
                this.timeOuter = setInterval(this.playLeft, this.props.interval);
            }
        }
    }
    playRight = (indexIn) => {
        let index = indexIn ? indexIn : this.state.activeIndex + 1;
        if (index > (this.props.imgs.length || 1) - 1) {index = 0;}
        this.setState({activeIndex: index})
    }
    playLeft = (indexIn) => {
        let index = indexIn ? indexIn : this.state.activeIndex - 1;
        if (index < 0) {index = (this.props.imgs.length || 1) - 1;}
        this.setState({activeIndex: index})
    }
    toIndex = (indexIn) => {
        clearInterval(this.timeOuter);
        this.setState({activeIndex: indexIn});
        this.autoPlay();
    }
    position = () => {return {left: -40 - this.state.activeIndex * this.props.width};}
    left = () => {
        clearInterval(this.timeOuter);
        let oldIndex = this.props.activeIndex;
        this.playLeft(oldIndex + 1);
        this.autoPlay();
    }
    right = () => {
        clearInterval(this.timeOuter);
        let oldIndex = this.props.activeIndex;
        this.playRight(oldIndex - 1);
        this.autoPlay();
    }
    render() {
        let {boxStyle, width, height} = this.props;
        return <div className={boxStyle} style={{width: width, height: height}}>
            <div className="leftIcon" onClick={this.left}/>
            <div className="rightIcon" onClick={this.right}/>
            <div className='changeImg'>{this.props.imgs.map((img, i) => <div key={i} style={{opacity: this.state.activeIndex === i ? 1 : 0.6}} className='changeImg-item' onClick={() => this.toIndex(i)}/>)}</div>
            <ul style={this.position()}>
                {this.props.imgs.map((img, i) => <li key={i} className="boxStyleLi" style={{width: width, height: height + 50}} ><img src={img} /></li>)}
            </ul>
        </div>
    }
}