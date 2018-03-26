import '../less';
import 'animate.css';
import React from 'react';

// tip组件
export default class Vedios extends React.Component {
    state = {
        index: 0,
    }
    componentDidMount() {
        this.setState({videos: this.props.datas});
    }
    onClick = (index) => {
        this.setState({index: index});
    }
    render() {
        return (
            <div className='vs' style={this.props.style}>
                <div className='vs-t'>
                    <iframe src={this.props.datas[this.state.index].url} />
                </div>
                <div className='vs-b'>
                    {(this.props.datas || []).map((e, i) => <div className='vs-b-v' key={i}><div className='vs-b-v-name'>{'重点视频监控'}</div><div className='vs-b-v-name' style={this.state.index === i ? {color: '#1890ff', cursor: 'pointer'} : {cursor: 'pointer'}} onClick={() => this.onClick(i)}>{e.name}</div></div>)}
                </div>
            </div>
        )
    }
}