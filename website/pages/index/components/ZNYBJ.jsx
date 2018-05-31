import '../less';
import 'animate.css';
import React from 'react';
import ReactDOM from 'react-dom';
import $ from 'jquery';
import echarts from 'echarts';
import { publish } from '../../../frame/core/arbiter';
import { Table } from '../../../frame/componets/index';


let yjsl = {
    ALTER01: { title: '进口集装箱到港后超7天未放行', tableName: 'V_IMAP_ALERTING_01', num: 0, width: 3000 },
    ALTER02: { title: '进口集装箱到港后超14天未放行', tableName: 'V_IMAP_ALERTING_02', num: 0, width: 3000 },
    ALTER03: { title: '进口集装箱到港后超90天未放行', tableName: 'V_IMAP_ALERTING_03', num: 0, width: 3000 },
    ALTER04: { title: '进口集装箱放行后超15天未提离', tableName: 'V_IMAP_ALERTING_04', num: 0, width: 3000 },
    ALTER05: { title: '出口集装箱进闸后超7天未放行', tableName: 'V_IMAP_ALERTING_05', num: 0, width: 3000 },
    ALTER06: { title: '出口集装箱进闸后超90天未放行', tableName: 'V_IMAP_ALERTING_06', num: 0, width: 3000 },
    ALTER07: { title: '出口集装箱放行后超10天未装船', tableName: 'V_IMAP_ALERTING_07', num: 0, width: 3000 },
    ALTER08: { title: '进口舱单品名含敏感词', tableName: 'V_IMAP_ALERTING_08', num: 0, width: 3000 },
    ALTER09: { title: '出口预配舱单品名含敏感词', tableName: 'V_IMAP_ALERTING_09', num: 0, width: 3000 },
    ALTER10: { title: '整船换装货物超期滞留堆场', tableName: 'V_IMAP_ALERTING_10', num: 0, width: 3000 },
    ALTER11: { title: '收到查验指令24小时未调入CIC', tableName: 'V_IMAP_ALERTING_11', num: 0, width: 3000 },
    ALTER12: { title: '调入CIC超24小时未查验', tableName: 'V_IMAP_ALERTING_12', num: 0, width: 3000 },
    ALTER13: { title: '查验完毕超12小时未调离CIC', tableName: 'V_IMAP_ALERTING_13', num: 0, width: 3000 },
    ALTER14: { title: '进口通关时效超长预警', tableName: 'V_IMAP_ALERTING_14', num: 0, width: 3000 },
    ALTER15: { title: '出口通关时效超长预警', tableName: 'V_IMAP_ALERTING_15', num: 0, width: 3000 },
}

let bjsl = {
    WARNING01: { title: '国际中转集装箱滞港超90天', tableName: 'IMAP_WARNING_01', num: { ycl: 0, wcl: 0 }, width: 3000 },
    WARNING02: { title: '国际中转集装箱滞港超180天', tableName: 'IMAP_WARNING_02', num: { ycl: 0, wcl: 0 }, width: 3000 },
    WARNING03: { title: '出口提前申报后超3天未抵运', tableName: 'IMAP_WARNING_02', num: { ycl: 0, wcl: 0 }, width: 3000 },
    WARNING04: { title: '装载舱单数据发送不及时', tableName: 'IMAP_WARNING_02', num: { ycl: 0, wcl: 0 }, width: 3000 },
    WARNING05: { title: '船舶离港后超24小时未发送理货报告', tableName: 'IMAP_WARNING_02', num: { ycl: 0, wcl: 0 }, width: 3000 },
    WARNING06: { title: '海关未放行集装箱装船', tableName: 'IMAP_WARNING_06', num: { ycl: 0, wcl: 0 }, width: 3000 },
    WARNING07: { title: '海关未放行集装箱出闸', tableName: 'IMAP_WARNING_07', num: { ycl: 0, wcl: 0 }, width: 3000 },
    WARNING08: { title: '整船换装货物异常提离堆场', tableName: 'IMAP_WARNING_08', num: { ycl: 0, wcl: 0 }, width: 3000 },
    WARNING09: { title: '整船换装货物异常预配载', tableName: 'IMAP_WARNING_09', num: { ycl: 0, wcl: 0 }, width: 3000 },
    WARNING10: { title: '同船运输集装箱异常装卸', tableName: 'IMAP_WARNING_10', num: { ycl: 0, wcl: 0 }, width: 3000 },
    WARNING11: { title: '空柜重量异常', tableName: 'IMAP_WARNING_11', num: { ycl: 0, wcl: 0 }, width: 3000 },
    WARNING12: { title: '调拨车辆超时停留', tableName: 'IMAP_WARNING_12', num: { ycl: 0, wcl: 0 }, width: 3000 },
    WARNING13: { title: '调拨车辆偏离路线', tableName: 'IMAP_WARNING_13', num: { ycl: 0, wcl: 0 }, width: 3000 },
    WARNING14: { title: '调拨车辆运行超时', tableName: 'IMAP_WARNING_14', num: { ycl: 0, wcl: 0 }, width: 3000 },
    WARNING15: { title: '散杂货异常堆放', tableName: 'IMAP_WARNING_02', num: { ycl: 0, wcl: 0 }, width: 3000 },
    WARNING16: { title: '收到查验指令72小时未调入CIC', tableName: 'IMAP_WARNING_16', num: { ycl: 0, wcl: 0 }, width: 3000 },
    WARNING17: { title: '查验完毕超24小时未调离CIC', tableName: 'IMAP_WARNING_17', num: { ycl: 0, wcl: 0 }, width: 3000 },
    WARNING18: { title: '行政通道车辆识别异常', tableName: 'IMAP_WARNING_18', num: { ycl: 0, wcl: 0 }, width: 3000 },
    WARNING19: { title: '行政通道车辆布控中控', tableName: 'IMAP_WARNING_19', num: { ycl: 0, wcl: 0 }, width: 3000 },
    WARNING20: { title: '旅检船舶未审批即移泊', tableName: 'IMAP_WARNING_10', num: { ycl: 0, wcl: 0 }, width: 3000 },
    WARNING21: { title: '旅检船舶夜间异常', tableName: 'IMAP_WARNING_01', num: { ycl: 0, wcl: 0 } },
    WARNING22: { title: '船舶抵港时间异常报警', tableName: 'IMAP_WARNING_01', num: { ycl: 0, wcl: 0 }, width: 3000 },
    WARNING23: { title: '船舶离港时间异常报警', tableName: 'IMAP_WARNING_01', num: { ycl: 0, wcl: 0 }, width: 3000 },
}

// 智能预报警
export default class ZNYBJ extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,     //刷新界面
            sel: '',
            gkyxBtn: 0,
            ybj: [],
            table: null,
        }
    }

    componentDidMount() {
        this.setState({ loading: false });
        /** 这个是预警 */
        publish('webAction', {
            svn: 'skhg_stage_service', path: 'queryTableByWhere', data: { tableName: 'IMAP_ALERTING_NEW' }
        }).then(res => {
            Object.keys(res[0].data[0]).map(e => yjsl[e].num = res[0].data[0][e])
        });
        /** 这个是报警的未处理  和  已处理 */
        Object.keys(bjsl).map(e => {
            Promise.all([
                publish('webAction', { svn: 'skhg_stage_service', path: 'queryTableByWhere', data: { tableName: bjsl[e].tableName, where: "ISHANDLED = 'N'" } }),
                publish('webAction', { svn: 'skhg_stage_service', path: 'queryTableByWhere', data: { tableName: bjsl[e].tableName, where: "ISHANDLED = 'Y'" } })
            ]).then(res => {
                /** 更改自定义的json数据 */
                bjsl[e].num.wcl = res[0][0].data.length;
                bjsl[e].num.ycl = res[1][0].data.length;
                this.setState({ loading: true });
            });
        })
    }

    handleSel = (e) => {
        this.setState({ sel: e.target.value, gkyxBtn: e.target.selectedIndex });
        switch (e.target.selectedIndex) {
            case 1:
                this.setState({ ybj: [["ALTER01", "ALTER02", "ALTER03", "ALTER04"], ["WARNING01", "WARNING02"]] })
                break;
            case 2:
                this.setState({ ybj: [["ALTER05", "ALTER06", "ALTER07"], ["WARNING03", "WARNING04", "WARNING05"]] })
                break;
            case 3:
                this.setState({
                    ybj: [["ALTER08", "ALTER09", "ALTER10", "ALTER11", "ALTER12", "ALTER13", "ALTER14", "ALTER15"
                    ], ["WARNING06", "WARNING07", "WARNING08", "WARNING09", "WARNING10", "WARNING11", "WARNING12", "WARNING13", "WARNING14", "WARNING15",
                        "WARNING16", "WARNING17", "WARNING18", "WARNING19", "WARNING20", "WARNING21", "WARNING22", "WARNING23"
                    ]]
                })
                break;
            default:
                this.setState({
                    ybj: [["ALTER01", "ALTER02", "ALTER03", "ALTER04", "ALTER05", "ALTER06", "ALTER07", "ALTER08", "ALTER09", "ALTER10", "ALTER11", "ALTER12", "ALTER13", "ALTER14", "ALTER15"],
                    ["WARNING01", "WARNING02", "WARNING03", "WARNING04", "WARNING05", "WARNING06", "WARNING07", "WARNING08", "WARNING09", "WARNING10", "WARNING11", "WARNING12", "WARNING13", "WARNING14", "WARNING15",
                        "WARNING16", "WARNING17", "WARNING18", "WARNING19", "WARNING20", "WARNING21", "WARNING22", "WARNING23"]]
                })
        }
    }


    handleClik = (e, i, width) => {
        this.setState({ loading: false });
        publish('getData', { svn: i, tableName: e, data: { pageno: 1, pagesize: 100, where: '1=1' } }).then((res) => {
            let flds = res[0].fields.map((e) => { return { title: e.alias, dataIndex: e.name }; });
            let table = <Table rowNo={true} title={{ name: e.alias, export: true, close: () => this.setState({ table: null }) }} style={{ height: 775, width: width }} id={'qqq'} selectedIndex={null} flds={flds} datas={res[0].features.map((e) => e.attributes)} trClick={null} trDbclick={null} myTd={null} hide={{ GKEY: true, GID: true, ISREADE: true, ISHANDLED: true, HANDLEDRESULT: true }} />
            this.setState({ table: table, key: e, loading: true }, () => $('#warningDesc').addClass('magictime spaceInUp animated').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', () => $('#warningDesc').removeClass('magictime spaceInUp animated')));
        });
    }
    render() {
        return (
            <div className="znybj">
                <div className="znybj_top">
                    <div className="znybj_top_sel">
                        <div className="znybj_top_sel_span">预报警类型</div>
                        <select className="znybj_top_sel_select" value={this.state.sel} onChange={this.handleSel} >
                            <option value="--请选择--">--请选择--</option>
                            <option key="1" value="进口时效">进口时效</option>
                            <option key="2" value="出口时效">出口时效</option>
                            <option key="3" value="管控运行">管控运行</option>
                        </select>
                    </div>
                    {
                        this.state.gkyxBtn < 3 ? <div className="znybj_top_btn">
                            <div className="znybj_top_btn_mt">码头</div>
                            <div className="znybj_top_btn_cic">CIC</div>
                        </div> : <div className="znybj_top_btn">
                                <div className="znybj_top_btn_mt">码头</div>
                                <div className="znybj_top_btn_cic">CIC</div>
                                <div className="znybj_top_btn_dbcl">调拨车辆</div>
                                <div className="znybj_top_btn_xztd">行政通道</div>
                                <div className="znybj_top_btn_lj">旅检</div>
                            </div>
                    }
                </div>
                <div className="znybj_bot">
                    <Znyj yj={this.state.ybj[0]} yjjson={yjsl} click={this.handleClik}></Znyj>
                    <div className="znybj_bot_fgx">分割线</div>
                    {this.state.loading ? <div /> : <div className="loading"> <span>加</span> <span>载</span> <span>中</span> <span>.</span> <span>.</span> </div>}
                    <Znbj bj={this.state.ybj[1]} bjjson={bjsl} click={this.handleClik}></Znbj>
                </div>
                {this.state.table ? <div id='warningDesc' style={{ position: 'absolute', top: 65, right: 3821, background: '#051658' }}>{this.state.table}</div> : null}
            </div>
        )
    }
}

/** 智能预警数量检查 */
class Znyj extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            ALTER: yjsl,
            table: null,
        }
    }

    componentDidMount() {
        this.setState({ ALTER: this.props.yjjson });
    }

    componentWillReceiveProps(NexProps) {
        if (NexProps.yj) {
            let data = NexProps.yj;
            let Al = {};
            for (let a in data) { Al[data[a]] = yjsl[data[a]] };
            this.setState({ ALTER: Al });
        }
    }



    render() {
        let { ALTER } = this.state;
        return (
            <div className="znyjs">
                {
                    Object.keys(ALTER).map((e, i) => {
                        return <div key={"yj" + i} className="znyjs_yj" onClick={() => this.props.click(ALTER[e].tableName, 'skhg_loader', ALTER[e].width)}>
                            <div className="znyjs_yj_num">{ALTER[e].num}</div>
                            <div className="znyjs_yj_fot">{ALTER[e].title}</div>
                        </div>
                    })
                }
            </div>
        )
    }
}

class Znbj extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            WARNING: bjsl
        }
    }

    componentDidMount() {
        this.setState({ WARNING: this.props.bjjson });
    }

    componentWillReceiveProps(NexProps) {
        if (NexProps.bj) {
            let data = NexProps.bj;
            let WA = {};
            for (let a in data) { WA[data[a]] = bjsl[data[a]] };
            this.setState({ WARNING: WA });
        }
    }

    render() {
        let { WARNING } = this.state;
        return (
            <div className="znbjs">
                {
                    Object.keys(this.state.WARNING).map((e, i) => {
                        return <div key={i} className="znbjs_bj" onClick={() => this.props.click(WARNING[e].tableName, 'skhg_stage', WARNING[e].width)}>
                            <div className="znbjs_bj_num">
                                <div className="znbjs_bj_num_ycl">{WARNING[e].num.wcl}</div>
                                <div className="znbjs_bj_num_fgx"></div>
                                <div className="znbjs_bj_num_wcl">{WARNING[e].num.ycl}</div>
                            </div>
                            <div className="znbjs_bj_fot">{WARNING[e].title}</div>
                        </div>
                    })
                }
            </div>
        )
    }
}