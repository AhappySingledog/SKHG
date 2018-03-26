import '../less';
import 'animate.css';
import React from 'react';
import ReactDOM from 'react-dom';
import $ from 'jquery';

// tip组件
/**
 *      title           ：自定义标题
 *      id              : 表格的ID
 *      style           : 样式内容
 *      selectedIndex   : 当前被选中的
 *      flds            : 列名
 *      datas           : 接收的数据
 *      trClick         : 单击事件
 *      trDbclick       : 双击事件
 */
export default class Table extends React.Component {
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
    componentDidUpdate() {
        if (this.props.datas.length > 0) this.bindClick();
        if (this.props.datas.length > 0) {
            let tds = $('#' + this.props.id + '>tbody>tr')[0].cells;
            let ws = Object.keys(tds).map((key) => tds[key].clientWidth);
            ws.forEach((w, i) => $('#' + this.props.id + '_head_' + i).css({ width: w - 40 }));
        }
        else {
            let tds = $('#' + this.props.id + '>tHead>tr')[0].cells;
            let ws = Object.keys(tds).map((key) => tds[key].clientWidth);
            ws.forEach((w, i) => $('#' + this.props.id + '_head_' + i).css({ width: w - 40 }));
        }
    }
    componentWillReceiveProps(nextProps) {
        if (JSON.stringify(this.props.datas) != JSON.stringify(nextProps.datas)) {
            $('#' + this.props.id).addClass('slideInUp animated').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', () => $('#' + this.props.id).removeClass('slideInUp animated'));
        }
    }
    componentDidMount() {
        if (this.props.datas.length > 0) this.bindClick();
    }
    render() {
        let { flds = [], datas = [], rowNo } = this.props;
        if (rowNo) {
            flds = [{ title: '序号', name: 'rowNo' }].concat(flds);
            datas.forEach((d, i) => d.rowNo = i + 1);
        }
        return (
            <div className='mtable' style={this.props.style} ref='table'>
                {this.props.title ? <div className='mttitle'>{this.props.title}</div> : null}
                <div className='mhead'>{flds.map((fld, i) => <div key={i} id={this.props.id + '_head_' + i}>{flds[i].title}</div>)}</div>
                <div className='mttable scrollbar' style={this.props.style.height ? { height: this.props.style.height - 185 } : {}}>
                    <table id={this.props.id}>
                        <thead>
                            <tr>
                                {flds.map((fld, i) => <td key={i}><div style={{ height: 0, overflow: 'hidden' }}>{fld.title}</div></td>)}
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
            </div>
        )
    }
}