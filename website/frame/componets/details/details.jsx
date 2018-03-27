import React from 'react';
import $ from 'jquery';
import PropTypes from 'prop-types';
import './css/desc.less';

export default class details extends React.Component {
    /**
     * 设置参数
     */
    static propTypes = {
        columnTotal: PropTypes.number,
        columns: PropTypes.array.isRequired,
        item: PropTypes.object.isRequired
    }

    /**
     * 设置默认值
     */
    static defaultProps = {
        columnTotal: 2,
        columns: [],
        item: {}
    }

    constructor(props) {
        super(props);
    }

    /**
     * 创建方式
     */
    componentWillMount() {

    }

    /**
     *计算要显示的行总数
     */
    caculatorDesRows = (columns, columnToltal) => {
        let rows = 0;
        columns.forEach((item, index) => {
            if (typeof item.colspan !== 'undefined' && item.colspan) {
                rows++;
            }
        });
        rows += Math.ceil((columns.length - rows) / columnToltal);
        return rows;
    }

    render() {
        let that = this;
        let items = [];
        let rows = that.caculatorDesRows(that.props.columns, that.props.columnTotal);
        let colspanRowCount = 0;
        for (let i = 0; i < rows; i++) {
            let trs = [];
            for (let j = 0; j < that.props.columnTotal; j++) {
                let index = (i * that.props.columnTotal + j - colspanRowCount * (that.props.columnTotal - 1));
                let column = that.props.columns[index] || {};
                let title = typeof column.title === 'undefined' ? "" : column.title;
                let value = typeof column.dataIndex === 'undefined' ? "" : that.props.item[column.dataIndex];
                if (column.colspan) {
                    trs.push(<td key={j + '_1'} className="label">{title}</td>);
                    trs.push(<td key={j + '_2'} colSpan={that.props.columnTotal * 2 - 1}>{value}</td>);
                    colspanRowCount++;
                    break;
                } else {
                    trs.push(<td key={j + '_3'} className="label">{title}</td>);
                    trs.push(<td key={j + '_4'}>{value}</td>);
                }
            }
            items.push(<tr key={i}>{trs}</tr>);
        }
        return (
            <table className="details_table">
                <tbody>{items}</tbody>
            </table>
        );
    }
}