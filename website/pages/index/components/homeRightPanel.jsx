import '../less';
import 'animate.css';
import React from 'react';
import ReactDOM from 'react-dom';
import { publish } from '../../../frame/core/arbiter';

class HgIntroduce extends React.Component {
    render() {
        return (
            <div className='introduce'>
                <div className='introduce-title'>深圳海关简介</div>
                <div className='introduce-msg'>深圳海关简介</div>
            </div>
        )
    }
}

// tip组件
export default class HomeRightPanel extends React.Component {
    componentDidMount() {
    }
    render() {
        return (
            <div className='homeRightP'>
                <HgIntroduce />
            </div>
        )
    }
}