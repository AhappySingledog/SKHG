import '../less';
import 'animate.css';
import React from 'react';
import ReactDOM from 'react-dom';
import $ from 'jquery';

// tip组件
export default class Table extends React.Component {
    componentDidUpdate() {
        this.bindClick();
    }
    componentWillReceiveProps(nextProps) {
        if (JSON.stringify(this.props.datas) != JSON.stringify(nextProps.datas)) $('#' + this.props.id).addClass('slideInUp animated').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', () => $('#' + this.props.id).removeClass('slideInUp animated'));
    }
    componentDidMount() {
        this.bindClick();
    }
    bindClick = () => {
        if (this.props.trClick) {
            let datas = this.props.datas;
            $(ReactDOM.findDOMNode(this.refs.table)).find('tbody>tr').each((i, e) => {
                e.onclick = (a) => {
                    this.props.trClick(datas[i], i);
                }
            });
        }
        if (this.props.trDbclick) {
            let datas = this.props.datas;
            $(ReactDOM.findDOMNode(this.refs.table)).find('tbody>tr').each((i, e) => {
                e.ondblclick = () => {
                    this.props.trDbclick(datas[i], i);
                }
            });
        }
        if (this.props.selectedIndex != undefined) {
            $('#' + this.props.id + '>tbody>tr>td').removeClass('trSelected');
            $('#' + this.props.id + '>tbody>tr:nth-of-type(' + (this.props.selectedIndex + 1) + ')>td').addClass('trSelected');
        }
    }
    render() {
        let { flds = [], datas = [] } = this.props;
        return (
            <div className='mtable' style={this.props.style} ref='table'>
                <table id={this.props.id}>
                    <thead>
                        <tr>
                            {flds.map((fld, i) => <td key={i}>{fld.title}</td>)}
                        </tr>
                    </thead>
                    <tbody>
                        {datas.map((data, i) =>
                            <tr key={i}>
                                {flds.map((fld, j) => <td key={j}>{this.props.myTd ? this.props.myTd(i, data, fld, j) : data && data[fld.name]}</td>)}
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        )
    }
}