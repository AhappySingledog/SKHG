import '../less';
import 'animate.css';
import React from 'react';

// tip组件
export default class ImgDisplay extends React.Component {
    render() {
        return (
            <div className="imgDisplay">
                {this.props.close ? <div className="closeImgs" onClick={() => this.props.close()} /> : null}
                <img src={this.props.img}/>
            </div>
        )
    }
}