import '../less';
import 'animate.css';
import React from 'react';
import ReactDOM from 'react-dom';
import $ from 'jquery';
import { table2Excel } from '../core/table2Excel';

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
                    this.props.trClick(datas[i], i, datas);
                }
            });
        }
        if (this.props.trDbclick) {
            let datas = this.props.datas;
            $(ReactDOM.findDOMNode(this.refs.table)).find('tbody>tr').each((i, e) => {
                e.ondblclick = () => {
                    this.props.trDbclick(datas[i], i, datas);
                }
            });
        }
        if (this.props.selectedIndex != undefined) {
            $('#' + this.props.id + '>tbody>tr>td').removeClass('trSelected');
            $('#' + this.props.id + '>tbody>tr:nth-of-type(' + (this.props.selectedIndex + 1) + ')>td').addClass('trSelected');
        }
    }
    updateTable = () => {
        if (this.props.datas.length > 0) this.bindClick();
        // if (this.props.datas.length > 0) {
        //     let tds = $('#' + this.props.id + '>tbody>tr')[0].cells;
        //     let ws = Object.keys(tds).map((key) => tds[key].clientWidth);
        //     ws.forEach((w, i) => $('#' + this.props.id + '_head_' + i).css({ width: w - 40 }));
        // }
        // else {
            let a = $('#' + this.props.id)[0];
            $('#' + this.props.id + '_head').css({ width: a.clientWidth || a.offsetWidth });
            let tds = $('#' + this.props.id + '>thead>tr')[0].cells;
            let ws = Object.keys(tds).map((key) => tds[key].clientWidth || tds[key].offsetWidth);
            ws.forEach((w, i) => {
                $('#' + this.props.id + '_head_' + i).css({ width: w })
            });
        // }
    }
    componentWillReceiveProps(nextProps) {
        if (JSON.stringify(this.props.datas) != JSON.stringify(nextProps.datas)) {
            $('#' + this.props.id).addClass('slideInUp animated').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', () => $('#' + this.props.id).removeClass('slideInUp animated'));
        }
    }
    componentDidUpdate() {
        this.updateTable();
    }
    componentDidMount() {
        this.updateTable();
        document.getElementById(this.props.id + '_scrollbar').onscroll = (e) => {
            $('#' + this.props.id + '_head').css({ left: '-' + $('#' + this.props.id + '_scrollbar')[0].scrollLeft + 'px' });
        }
    }
    render() {
        let { flds = [], datas = [], rowNo } = this.props;
        if (rowNo) {
            flds = [{ title: '序号', dataIndex: 'rowNo' }].concat(flds);
            datas.forEach((d, i) => d.rowNo = i + 1);
        }
        if (this.props.hide) flds = flds.filter((e) => !this.props.hide[e.dataIndex]);
        let items = [];
        this.props.title && this.props.title.export ? items.push(<div key={-2} className='tableExport' onClick={() => table2Excel(this.props.id)}></div>) : '';
        this.props.title && this.props.title.close ? items.push(<div key={-1} className='tableClose' onClick={() => this.props.title.close()}></div>) : '';
        this.props.title && this.props.title.items ? items = (this.props.title.items || []).concat(items) : '';
        return (
            <div className={this.props.className || 'mtable'} style={this.props.style} ref='table'>
                {this.props.title ? <div className='mttitle'><div>{this.props.title.name}</div><div>{items}</div></div> : null}
                <div className='tmhead'>
                    <div className='mhead' id={this.props.id + '_head'}>{flds.map((fld, i) => <div key={i} id={this.props.id + '_head_' + i}>{flds[i].title}</div>)}</div>
                </div>
                <div id={this.props.id + '_scrollbar'} className='mttable scrollbar' style={this.props.style.height ? { height: this.props.style.height - 185 } : {}}>
                    <table id={this.props.id}>
                        <thead>
                            <tr>
                                {flds.map((fld, i) => <td key={i}><div style={{height: 0, overflow: 'hidden'}}>{fld.title}</div></td>)}
                            </tr>
                        </thead>
                        <tbody>
                            {datas.map((data, i) =>
                                <tr key={i}>
                                    {flds.map((fld, j) => <td key={j}>{this.props.myTd ? this.props.myTd(i, data, fld, j) : data && data[fld.dataIndex]}</td>)}
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        )
    }
}