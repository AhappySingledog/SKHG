import '../less';
import 'animate.css';
import React from 'react';

// tip组件
export default class Table extends React.Component {
    render() {
        let { flds = [], datas = [] } = this.props;
        return (
            <div className='mtable' style={this.props.style}>
                <div className=''>
                    <table>
                        <thead>
                            <tr>
                                {flds.map((fld, i) => <td key={i}>{fld.title}</td>)}
                            </tr>
                        </thead>
                        <tbody>
                            {datas.map((data, i) => 
                                <tr key={i}>
                                    {flds.map((fld, j) => <td key={j}>{data && data[fld.name]}</td>)}
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        )
    }
}