import '../less';
import 'animate.css';
import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import echarts from 'echarts';
import { publish, subscribe, unsubscribe } from '../../../frame/core/arbiter';
import { ViwePager, Tip, Table, Panel } from '../../../frame/componets/index';
import HomeRightPanel from './homeRightPanel';
import HomeRightPanelNew from './homeRightPanelNew';
import Cesium from 'cesium/Cesium';
import 'cesium/Widgets/widgets.css';
import '../../../frame/core/xcConfirm';
import AgingControl from './agingControl';

class MyPortDesc extends React.Component {
    state = {}
    fullScreen = (imgs) => {
        publish('playImgs', imgs);
    }
    render() {
        return (
            <div className='desc' style={this.props.style}>
                <div className='desc-t'>{this.props.title}</div>
                <div className='desc-top'>
                    {this.props.port.events.map((e, i) => <div key={i} className='desc-top-msg'><div className='desc-top-year'>{e.year}</div><div className='desc-top-event'>{e.event}</div><div className='desc-top-time' /></div>)}
                </div>
                <div className='desc-bottom'>
                    <div className='desc-bottom-msg scrollbar'>{this.props.port.msg}</div>
                    <ViwePager autoPlay={true} direction={'right'} imgs={this.props.port.imgs} style={{ width: 449, height: 614 }} boxStyle="content" interval={4000} fullScreen={this.fullScreen} />
                </div>
            </div>
        );
    }
}

// 首页
export default class Home extends React.Component {
    state = {
        index: 0,
        ports: [],
        showTip: true,
        tip: null,
        selectedIndex: 0,
    }
    timeOut = null
    componentDidMount() {
        publish('home_worldMap').then((res) => {
            let ports = res[0].ports.data;
            this.setState({ ports: ports });
            let czml = res[0].czml;
            let timeout = null;
            let entitys = [];
            this.handleShowTip('p0');
            let viewer = new Cesium.Viewer('homeLeft', {
                animation: false, //是否创建动画小器件，左下角仪表 
                timeline: false, //是否显示时间轴,
                shouldAnimate: true,
                infoBox: false, //是否显示信息框,
                navigationHelpButton: false, //是否显示右上角的帮助按钮
                homeButton: true, //是否显示主页按钮
                geocoder: false, //是否显示搜索按钮
                fullscreenButton: false, //是否显示全屏按钮
                baseLayerPicker: false, //关闭图层选择器，不然还怎么指定呢
                imageryProvider: new Cesium.WebMapTileServiceImageryProvider({
                    url: "http://t0.tianditu.com/img_w/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=img&tileMatrixSet=w&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}&style=default&format=tiles",
                    layer: "tdtBasicLayer",
                    style: "default",
                    format: "image/jpeg",
                    tileMatrixSetID: "GoogleMapsCompatible",
                    show: false
                })
            });
            // viewer.imageryLayers.addImageryProvider(new Cesium.WebMapTileServiceImageryProvider({ //地图标注
            //     url: "http://t0.tianditu.com/cia_w/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=cia&tileMatrixSet=w&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}&style=default.jpg",
            //     layer: "tdtAnnoLayer",
            //     style: "default",
            //     format: "image/jpeg",
            //     tileMatrixSetID: "GoogleMapsCompatible",
            //     show: false
            // }));
            let scene = viewer.scene;
            let clock = viewer.clock;
            let icrf = (scene, time) => {
                if (scene.mode !== Cesium.SceneMode.SCENE3D) return;
                let icrfToFixed = Cesium.Transforms.computeIcrfToFixedMatrix(time);
                if (Cesium.defined(icrfToFixed)) {
                    let camera = viewer.camera;
                    let offset = Cesium.Cartesian3.clone(camera.position);
                    let transform = Cesium.Matrix4.fromRotationTranslation(icrfToFixed);
                    camera.lookAtTransform(transform, offset);
                }
            }
            let autoRotate = () => {
                clock.multiplier = 1 * 60 * 60;
                scene.globe.enableLighting = true;
                scene.postUpdate.addEventListener(icrf);
            }
            let stopRotate = () => {
                clock.multiplier = 1.0;
                scene.globe.enableLighting = false;
                scene.postUpdate.removeEventListener(icrf);
            }
            let flyTo = (ops) => {
                viewer.camera.flyTo({ //定位并缩放
                    destination: Cesium.Cartesian3.fromDegrees(ops.x, ops.y, ops.z || 15500000.0)
                });
            }
            let stopAuto = () => {
                stopRotate();
                if (timeout) clearTimeout(timeout);
                timeout = setTimeout(autoRotate, 30 * 1000);
            }
            this.flyTo = subscribe('flyTo', flyTo);
            this.stopAuto = subscribe('stopAuto', stopAuto);
            this.autoRotate = subscribe('autoRotate', autoRotate);
            this.stopRotate = subscribe('stopRotate', stopRotate);
            let autoScale = (entity) => {
                let i = 1;
                let timer = setInterval(() => {
                    entity.point.pixelSize = 6 * i;
                    i++;
                    if (i > 10) clearInterval(timer);
                }, 100);
            }
            let drawPorts = (ports) => {
                // ports.forEach((p, i) => {
                //     let entity = viewer.entities.add({ //绘点
                //         id: p.id,
                //         position: Cesium.Cartesian3.fromDegrees(p.geo[0], p.geo[1]),
                //         point: {
                //             pixelSize: 60,
                //             color: Cesium.Color[p.color || 'YELLOW'], //new Cesium.Color(255, 255, 255, 1)
                //         },
                //         label: {
                //             text: p.addr,
                //             font: '60px Microsoft YaHei',
                //             fillColor: Cesium.Color.WHITE,
                //             outlineColor: Cesium.Color.BLACK,
                //             outlineWidth: 2,
                //             style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                //             pixelOffset: new Cesium.Cartesian2(100, 0)
                //         }
                //     });
                //     entitys.push(entity);
                // });
                let index = 0;
                let timer1 = setInterval(() => {
                    let p = ports[index];
                    let entity = viewer.entities.add({ //绘点
                        id: p.id,
                        position: Cesium.Cartesian3.fromDegrees(p.geo[0], p.geo[1]),
                        point: {
                            pixelSize: 6,
                            color: Cesium.Color[p.color || 'YELLOW'], //new Cesium.Color(255, 255, 255, 1)
                        },
                        label: {
                            text: p.addr,
                            font: '60px Microsoft YaHei',
                            fillColor: Cesium.Color.WHITE,
                            outlineColor: Cesium.Color.BLACK,
                            outlineWidth: 2,
                            style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                            pixelOffset: new Cesium.Cartesian2(100, 0)
                        }
                    });
                    entitys.push(entity);
                    autoScale(entity);
                    index++;
                    if (index >= ports.length) clearInterval(timer1);
                }, 2 * 1000);
            }

            Cesium.Camera.DEFAULT_VIEW_RECTANGLE = Cesium.Rectangle.fromDegrees(54, 60, 147, 12); //主页默认视角 

            drawPorts(ports);
            setTimeout(() => {
                viewer.camera.flyTo({ //定位并缩放
                    destination: Cesium.Cartesian3.fromDegrees(114.059378, 22.554598, 28500000.0)
                });
                viewer.dataSources.add(Cesium.CzmlDataSource.load(czml));
                // setInterval(() => {
                //     viewer.dataSources.removeAll(true);
                //     viewer.dataSources.add(Cesium.CzmlDataSource.load(czml));
                // }, 50 * 1000);
                let handler = new Cesium.ScreenSpaceEventHandler(scene.canvas);
                handler.setInputAction((click) => {
                    stopAuto();
                    let pickedObject = scene.pick(click.position);
                    if (pickedObject) {
                        let index = null;
                        let p = ports.filter((p, i) => {
                            if (p.id === pickedObject.id.id) {
                                index = i;
                                return true;
                            }
                            return false;
                        })[0];
                        viewer.camera.flyTo({ //定位并缩放
                            destination: Cesium.Cartesian3.fromDegrees(p.geo[0], p.geo[1], 15500000.0)
                        });
                        this.handleShowTip(p.id);
                        this.setState({ selectedIndex: index });
                    }
                }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
                // handler.setInputAction(function (movement) {
                //     var pickedObject = scene.pick(movement.endPosition);
                //     if (pickedObject) {
                //         var entity = viewer.entities.getById(pickedObject.id.id);
                //         entity.point.color = Cesium.Color.WHITE;
                //         entity.point.pixelSize = 80;
                //         console.log(pickedObject);
                //     } else {
                //         entitys.forEach(function (e) {
                //             e.point.color = Cesium.Color.YELLOW;
                //             e.point.pixelSize = 60;
                //         });
                //     }
                // }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
            }, 2 * 1000);
            timeout = setTimeout(() => {
                // viewer.camera.flyTo({ //定位并缩放
                //     destination: Cesium.Cartesian3.fromDegrees(113.888, 22.478, 15500000.0)
                // });
                autoRotate();
            }, 30 * 1000);
        }).then(() => {
            $('.cesium-viewer-toolbar').css({ zIndex: 2 });
            $('.cesium-toolbar-button').css({ width: '120px', height: '120px' });
            $('.cesium-baseLayerPicker-item').css({ width: '144px' });
            $('.cesium-viewer-bottom').css({ display: 'none' });
            var $button = $('<button id="bt" title="港口列表" class="cesium-button cesium-toolbar-button cesium-home-button" style="width: 120px; height: 120px;" type="button"><div class="rightP-zk"></div></button>');
            $button.click(() => {
                let flag = !this.state.showTip;
                if (flag) this.setState({ showTip: flag }, () => $('.rightP').addClass('showAnimete_1 animated').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', () => $('.rightP').removeClass('showAnimete_1 animated')));
                else $('.rightP').addClass('showAnimete_2 animated').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', () => { $('.rightP').removeClass('showAnimete_2 animated'); this.setState({ showTip: flag }); });
            });
            $('.cesium-viewer-toolbar').append($button);
        });
    }
    componentDidUpdate() {
        if (this.state.showTip) {
            $('#bt>div').removeClass('rightP-sq');
            $('#bt>div').addClass('rightP-zk');
        }
        else {
            $('#bt>div').removeClass('rightP-zk');
            $('#bt>div').addClass('rightP-sq');
        }
    }
    handleShowTip = (tip) => {
        let port = this.state.ports.filter((p) => p.id == tip)[0];
        this.setState({ tip: port });
    }
    trClick = (tr, i) => {
        if (this.timeOut) clearTimeout(this.timeOut);
        this.timeOut = setTimeout(() => publish('stopAuto').then(() => {
            let port = this.state.ports.filter((p) => p.id === tr.id)[0];
            publish('flyTo', { x: port.geo[0], y: port.geo[1] });
            this.handleShowTip(tr.id);
            this.setState({ selectedIndex: i });
        }), 300);
    }
    trDbclick = (tr, i) => {
        if (i === 0) {
            if (this.timeOut) clearTimeout(this.timeOut);
            publish('changeLayer', { index: 1, props: {} })
        }
    }
    componentWillUnmount() {
        if (this.flyTo) unsubscribe(this.flyTo);
        if (this.autoRotate) unsubscribe(this.autoRotate);
        if (this.stopRotate) unsubscribe(this.stopRotate);
    }
    render() {
        let flds = [
            { title: '港口名称', dataIndex: 'name' },
            { title: '地点', dataIndex: 'addr' },
            { title: '港口开埠时间', dataIndex: 'kbsj' },
            { title: '招商局运营时间', dataIndex: 'yysj' },
        ];
        let temp = this.state.ports;
        let datas = temp.map((e) => { return { id: e.id, name: e.name, addr: e.addr, kbsj: e.events[0].year, yysj: e.events[1].year } });
        return (
            <div className='home' style={{ overflow: 'hidden', height: '100%' }}>
                <div className='homeLeft'>
                    <div id='homeLeft' style={{ width: 7564, height: 2684 }} />
                </div>
                {/* <div className='homeRight' style={{ paddingLeft: 20 }}>
                    <HomeRightPanelNew />
                </div> */}
                 {/* <AgingControl stl = '' /> */}
                {this.state.showTip ?
                    <div className='rightP' style={{ position: 'absolute', top: 250, right: 3820, width: 1750, height: 2470, zIndex: 1 }}>
                        <div className='rightP-t' />
                        <div className='rightP-c'>
                            <Table style={{ width: 1710, height: 1407 }} id={'aa'} selectedIndex={this.state.selectedIndex} flds={flds} datas={datas} trClick={this.trClick} trDbclick={this.trDbclick} />
                            {this.state.tip ? <MyPortDesc title={this.state.tip.name} style={{ width: 1700 }} port={this.state.tip} /> : null}
                        </div>
                        <div className='rightP-b' />
                    </div> : null}
            </div>
        )
    }
}