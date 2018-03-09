import '../less';
import 'animate.css';
import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import echarts from 'echarts';
import { publish, subscribe, unsubscribe } from '../../../frame/core/arbiter';
import { ViwePager, Tip, Table, Panel } from '../../../frame/componets/index';
import HomeRightEcharts from './homeRightEcharts';
import HomeRightPanel from './homeRightPanel';
import Cesium from 'cesium/Cesium'
import 'cesium/Widgets/widgets.css'

class MyPortDesc extends React.Component {
    state = {}
    fullScreen = (imgs) => {
        publish('playImgs', imgs);
    }
    render() {
        return (
            <div className='desc'>
                <div className='desc-top'>
                    {this.props.port.events.map((e, i) => <div key={i} className='desc-top-msg'><div className='desc-top-year'>{e.year}</div><div className='desc-top-event'>{e.event}</div><div className='desc-top-time' /></div>)}
                </div>
                <div className='desc-bottom'>
                    <div className='desc-bottom-msg'>{this.props.port.msg}</div>
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
        tip: null,
    }
    componentDidMount() {
        let handleShowTip = (tip) => {
            let port = this.state.ports.filter((p) => p.id == tip)[0];
            this.setState({ tip: null }, () => this.setState({ tip: port }));
        }
        publish('home_worldMap').then((res) => {
            let ports = res[0].ports.data;
            let czml = res[0].czml;
            let timeout = null;
            let entitys = [];
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
            let drawPorts = (ports) => {
                ports.forEach((p, i) => {
                    let entity = viewer.entities.add({ //绘点
                        id: p.id,
                        position: Cesium.Cartesian3.fromDegrees(p.geo[0], p.geo[1]),
                        point: {
                            pixelSize: 60,
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
                });
            }

            Cesium.Camera.DEFAULT_VIEW_RECTANGLE = Cesium.Rectangle.fromDegrees(54, 60, 147, 12); //主页默认视角 
            this.setState({ ports: ports });
            drawPorts(ports);
            setTimeout(() => {
                viewer.camera.flyTo({ //定位并缩放
                    destination: Cesium.Cartesian3.fromDegrees(114.059378, 22.554598, 15500000.0)
                });
                viewer.dataSources.add(Cesium.CzmlDataSource.load(czml));
                setInterval(() => {
                    viewer.dataSources.removeAll(true);
                    viewer.dataSources.add(Cesium.CzmlDataSource.load(czml));
                }, 50 * 1000);
                let handler = new Cesium.ScreenSpaceEventHandler(scene.canvas);
                handler.setInputAction((click) => {
                    stopRotate();
                    if (timeout) clearTimeout(timeout);
                    timeout = setTimeout(autoRotate, 30 * 1000);
                    let pickedObject = scene.pick(click.position);
                    if (pickedObject) {
                        let p = ports.filter((p) => p.id === pickedObject.id.id)[0];
                        viewer.camera.flyTo({ //定位并缩放
                            destination: Cesium.Cartesian3.fromDegrees(p.geo[0], p.geo[1], 15500000.0)
                        });
                        handleShowTip(p.id);
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
            $('.cesium-toolbar-button').css({ width: '120px', height: '120px' });
            $('.cesium-baseLayerPicker-item').css({ width: '144px' });
            $('.cesium-viewer-bottom').css({ display: 'none' });
        });
    }
    render() {
        let { ports = [] } = this.state;
        return (
            <div className='home' style={{ overflow: 'hidden', height: '100%' }}>
                <div className='homeLeft'>
                    <div id='homeLeft' style={{ width: 7564, height: 2684 }} />
                    {/* <div id='animationContainer' style={{width: 400, height: 400}}/> */}
                </div>
                <div className='homeRight' style={{ paddingLeft: 20 }}>
                    <HomeRightPanel />
                </div>
                {this.state.tip ?
                    <Tip style={{ position: 'absolute', top: 420, left: 5560 }} title={this.state.tip.name} titleClick={() => { if (this.state.tip.name == '深圳-深圳西部港区') publish('changeLayer', { index: 1, props: {} }); }} close={() => this.setState({ tip: null })}>
                        <MyPortDesc port={this.state.tip} />
                    </Tip> : null
                }
            </div>
        )
    }
}