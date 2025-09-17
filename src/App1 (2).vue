<template>
  <div id="cesiumContainer"></div>
  </template>
  <script setup>
    import * as Cesium from 'cesium';
    import {onMounted} from 'vue';
    import Radiant from "@/utils/radiant.js";
    import CesiumHeatPointmap from './utils/CesiumHeatPointmap.js';
    import csvToJson from './utils/cvstojson.js';
    import {entitiesLngLatList} from '@/utils/lnglatList.js';
    import { CesiumHeatmap } from "./utils/cesiumHeatMap.js";
    import { cvsdata } from "./utils/relitu.js";
    import polylineCommunication  from "./utils/polyline.js";
    import { createFlowingTextBetweenModels } from './utils/5GLink.js'
    import { createSignalWaveCone } from './utils/createDynamicSignalCone.js'
    import { createUpwardSignalDome  } from './utils/createUpwardSignalWave.js'
    import modelMethod  from "./utils/modelList.js";
    import modelMethodShip from "./utils/modelship.js";
    import modelMethodCar from "./utils/modelcar.js";
    
    // import CesiumHeatmap from './lib/CesiumHeatmap';
    // import CircleDiffusion from './components/11'
    // import HexagonSpread from './components/HexagonSpread'
    onMounted(()=>{
      const viewer = new Cesium.Viewer('cesiumContainer',{
        geocoder:false,
        baseLayerPicker:false,
        homeButton:false,
        sceneModePicker:false,
        navigationHelpButton:false,
        animation:false,
        timeline:false,
        cerditsDisplay:false,
        fullscreen:false,
        selectionIndicator: false,
        });
        //去除logo
        viewer.cesiumWidget.creditContainer.style.display = "none";
        //去除双击事件
        viewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(
          Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK
          );
          
          viewer.camera.setView({
            destination: Cesium.Cartesian3.fromDegrees(120.086713,23.090829, 100000), // 经纬度 + 高度
            orientation: {
              heading: Cesium.Math.toRadians(0.0),     // 朝向（东为0，顺时针）
              pitch: Cesium.Math.toRadians(-30.0),     // 向下看30度
              roll: 0.0                                 // 翻滚角，一般为0
            }
            });
            
            
            // 水波纹扩散
            let circleWave2 = new Radiant(viewer, "cirCleWave2");
            circleWave2.add([120.41733,24.540095, 15], 'green', 25000, 7000);
            
            // 1. 定义起止时间
            const start = Cesium.JulianDate.now();
            const stop = Cesium.JulianDate.addSeconds(start, 10, new Cesium.JulianDate());
            
            // 2. 设置 Cesium 时钟（控制时间轴）
            viewer.clock.startTime = start.clone();
            viewer.clock.stopTime = stop.clone();
            viewer.clock.currentTime = start.clone();
            viewer.clock.clockRange = Cesium.ClockRange.CLAMPED; // 到达 stop 后停止
            viewer.clock.multiplier = 1; // 时间速度（1秒真实时间 = 1秒模拟时间）
            // viewer.timeline.zoomTo(start, stop); // 缩放时间轴视图下`
            
            // 3. 构建轨迹（位置属性）
            const position = new Cesium.SampledPositionProperty();
            
            // 添加采样点（经纬度+高度）
            position.addSample(start, Cesium.Cartesian3.fromDegrees(120.75839,25.267783,30000));
            position.addSample(stop, Cesium.Cartesian3.fromDegrees(120.292125,24.574041, 30000));
            const CommunicationDroneD = viewer.entities.add({
              name: "model layer",
              position: position,
              //  orientation: new Cesium.VelocityOrientationProperty(position),
              model: {
                uri: '/models/无人机.glb',// 模型路径
                minimumPixelSize: 128,// 最小像素大小
                maximumScale: 10000,// 最大比例尺
                silhouetteColor : Cesium.Color.GREEN,// 设置边框颜色
                silhouetteSize : 2,
              },
              });
              const satellite =viewer.entities.add({
                name: "model ",
                position:entitiesLngLatList.satellite,
                heightReference: Cesium.HeightReference.NONE,
                model: {
                  uri: '../../public/models/卫星.glb',// 模型路径
                  minimumPixelSize: 128,// 最小像素大小
                  maximumScale: 10000,// 最大比例尺
                },
                });
                const CommunicationBoat =viewer.entities.add({
                  name: "model ",
                  position:entitiesLngLatList.CommunicationBoat,
                  heightReference: Cesium.HeightReference.NONE,
                  model: {
                    uri: '../../public/models/通讯艇.glb',// 模型路径
                    minimumPixelSize: 50,// 最小像素大小
                    maximumScale: 5000,// 最大比例尺
                    
                  },
                  });
                  
                  const CommunicationDroneA= modelMethod(viewer,entitiesLngLatList.CommunicationDroneA,'无人机A')
                  const CommunicationDroneB= modelMethod(viewer,entitiesLngLatList.CommunicationDroneB,'无人机B')
                  const CommunicationDroneC= modelMethod(viewer,entitiesLngLatList.CommunicationDroneC,'无人机C')
                  const CommunicationDroneE= modelMethod(viewer,entitiesLngLatList.CommunicationDroneE,'无人机E')
                  const Car1= modelMethodCar(viewer,entitiesLngLatList.Car1,'car1')
                  const Car2= modelMethodCar(viewer,entitiesLngLatList.Car2,'car2')
                  const Car3= modelMethodCar(viewer,entitiesLngLatList.Car3,'car3')
                  
                  // const CommunicationDroneD= modelMethod(viewer,entitiesLngLatList.CommunicationDroneD,'无人机D')
                  const Ship1= modelMethodShip(viewer,entitiesLngLatList.Ship1,'Ship1')
                  const Ship2= modelMethodShip(viewer,entitiesLngLatList.Ship2,'Ship2')
                  const Ship3= modelMethodShip(viewer,entitiesLngLatList.Ship3,'Ship3')
                  const Ship4= modelMethodShip(viewer,entitiesLngLatList.Ship4,'Ship4')
                  const Ship5= modelMethodShip(viewer,entitiesLngLatList.Ship5,'Ship5')
                  const Ship6= modelMethodShip(viewer,entitiesLngLatList.Ship6,'Ship6')
                  const Ship7= modelMethodShip(viewer,entitiesLngLatList.Ship7,'Ship7')
                  const Ship8= modelMethodShip(viewer,entitiesLngLatList.Ship8,'Ship8')
                  const Ship9= modelMethodShip(viewer,entitiesLngLatList.Ship9,'Ship9')
                  const Ship10= modelMethodShip(viewer,entitiesLngLatList.Ship10,'Ship10')
                  console.log(satellite.position,'撒大苏打');
                  
                  
                  // 119.446178,24.928226, 30000
                  // 121.572032,27.09037, 700000
                  // const polylineCommunicatio=polylineCommunication(viewer,satellite,CommunicationDroneA,5)
                  // const fromCoord = { lon: 119.446178, lat: 24.928226, height: 30000 }
                  // const toCoord = { lon: 121.572032, lat: 27.09037, height: 700000 }
                  
                  const SatelliteAtoUavA= createFlowingTextBetweenModels(viewer, satellite, CommunicationDroneA, {
                    text: '~~~',
                    fontSize: '16px',
                    color: Cesium.Color.BULE,
                    speed: 7000,
                    spacing:0.3
                    })
                    const SatelliteAtoUavB = createFlowingTextBetweenModels(viewer, satellite, CommunicationDroneB, {
                      text: '~~~',
                      fontSize: '16px',
                      color: Cesium.Color.BULE,
                      speed: 7000,
                      spacing:0.3
                      })
                      
                      const SatelliteAtoUavC = createFlowingTextBetweenModels(viewer, satellite, CommunicationDroneC, {
                        text: '~~~',
                        fontSize: '16px',
                        color: Cesium.Color.BULE,
                        speed: 7000,
                        spacing:0.3
                        })
                        const SatelliteAtoUavD = createFlowingTextBetweenModels(viewer, satellite, CommunicationDroneD, {
                          text: '~~~',
                          fontSize: '16px',
                          color: Cesium.Color.BULE,
                          speed: 7000,
                          spacing:0.3
                          })
                          const SatelliteAtoUavE = createFlowingTextBetweenModels(viewer, satellite, CommunicationDroneE, {
                            text: '~~~',
                            fontSize: '16px',
                            color: Cesium.Color.BULE,
                            speed: 7000,
                            spacing:0.3
                            })
                            const SatelliteAtoCommunicationBoatA = createFlowingTextBetweenModels(viewer, satellite, CommunicationBoat, {
                              text: '~~~',
                              fontSize: '16px',
                              color: Cesium.Color.BULE,
                              speed: 7000,
                              spacing:0.3
                              })
                              const UavAtoShip5 = createFlowingTextBetweenModels(viewer, CommunicationDroneA, Ship5, {
                                text: '0101',
                                fontSize: '10px',
                                color: Cesium.Color.LIME,
                                speed: 7000,
                                spacing:0.3
                                })
                                const UavAtoShip6 = createFlowingTextBetweenModels(viewer, CommunicationDroneA, Ship6, {
                                  text: '0101',
                                  fontSize: '10px',
                                  color: Cesium.Color.LIME,
                                  speed: 7000,
                                  spacing:0.3
                                  })
                                  const UavAtoShip7 = createFlowingTextBetweenModels(viewer, CommunicationDroneA, Ship7, {
                                    text: '0101',
                                    fontSize: '10px',
                                    color: Cesium.Color.LIME,
                                    speed: 7000,
                                    spacing:0.3
                                    })
                                    const UavAtoShip8 = createFlowingTextBetweenModels(viewer, CommunicationDroneA, Ship8, {
                                      text: '0101',
                                      fontSize: '10px',
                                      color: Cesium.Color.LIME,
                                      speed: 7000,
                                      spacing:0.3
                                      })
                                      const UavAtoShip9 = createFlowingTextBetweenModels(viewer, CommunicationDroneA, Ship9, {
                                        text: '0101',
                                        fontSize: '10px',
                                        color: Cesium.Color.LIME,
                                        speed: 7000,
                                        spacing:0.3
                                        })
                                        const UavBtoShip1 = createFlowingTextBetweenModels(viewer, CommunicationDroneB, Ship1, {
                                          text: '0101',
                                          fontSize: '10px',
                                          color: Cesium.Color.LIME,
                                          speed: 7000,
                                          spacing:0.3
                                          })
                                          const UavBtoShip2 = createFlowingTextBetweenModels(viewer, CommunicationDroneB, Ship2, {
                                            text: '0101',
                                            fontSize: '10px',
                                            color: Cesium.Color.LIME,
                                            speed: 7000,
                                            spacing:0.3
                                            })
                                            const UavBtoShip4 = createFlowingTextBetweenModels(viewer, CommunicationDroneB, Ship4, {
                                              text: '0101',
                                              fontSize: '10px',
                                              color: Cesium.Color.LIME,
                                              speed: 7000,
                                              spacing:0.3
                                              })
                                              const UavCtoShip3 = createFlowingTextBetweenModels(viewer, CommunicationDroneC, Ship3, {
                                                text: '0101',
                                                fontSize: '10px',
                                                color: Cesium.Color.LIME,
                                                speed: 7000,
                                                spacing:0.3
                                                })
                                                const UavCtoShip10 = createFlowingTextBetweenModels(viewer, CommunicationDroneC, Ship10, {
                                                  text: '0101',
                                                  fontSize: '10px',
                                                  color: Cesium.Color.LIME,
                                                  speed: 7000,
                                                  spacing:0.3
                                                  })
                                                  
                                                  // const antennaPos = Cesium.Cartesian3.fromDegrees(119.446178,24.928226, 30000)
                                                  const waveA = createSignalWaveCone(viewer, CommunicationDroneA, {
                                                    height: 30000,//高度
                                                    bottomRadius: 40000,//底部半径
                                                    ringCount: 3,//光波数量
                                                    ringSpeed: 5000,//毫秒
                                                    color: Cesium.Color.WHITE,//颜色
                                                    coneOpacity: 0.15,//透明度
                                                    ringOpacity:0.1//光环透明度
                                                    
                                                    })
                                                    const waveB = createSignalWaveCone(viewer, CommunicationDroneB, {
                                                      height: 30000,//高度
                                                      bottomRadius: 40000,//底部半径
                                                      ringCount: 2,//光波数量
                                                      ringSpeed: 5000,//毫秒
                                                      color: Cesium.Color.WHITE,//颜色
                                                      coneOpacity: 0.15,//透明度
                                                      ringOpacity:0.1//光环透明度
                                                      
                                                      })
                                                      const waveC = createSignalWaveCone(viewer, CommunicationDroneC, {
                                                        height: 30000,//高度
                                                        bottomRadius: 40000,//底部半径
                                                        ringCount: 2,//光波数量
                                                        ringSpeed: 5000,//毫秒
                                                        color: Cesium.Color.WHITE,//颜色
                                                        coneOpacity: 0.15,//透明度
                                                        ringOpacity:0.1//光环透明度
                                                        
                                                        })
                                                        const waveE = createSignalWaveCone(viewer, CommunicationDroneE, {
                                                          height: 10000,//高度
                                                          bottomRadius: 15000,//底部半径
                                                          ringCount: 2,//光波数量
                                                          ringSpeed: 5000,//毫秒
                                                          color: Cesium.Color.WHITE,//颜色
                                                          coneOpacity: 0.15,//透明度
                                                          ringOpacity:0.1//光环透明度
                                                          
                                                          })
                                                          // 清除
                                                          // wave.destroy()
                                                          
                                                          const signalWave = createUpwardSignalDome(viewer, CommunicationBoat, {
                                                            radius: 25000,
                                                            height: 20000,
                                                            color: Cesium.Color.YELLOW,
                                                            ringCount: 0,
                                                            ringSpeed: 5000,
                                                            domeOpacity: 0.2,     // 半球体更透明
                                                            ringOpacity: 0.2      // 圆环更清晰
                                                            })
                                                            //  const heatmap = new CesiumHeatPointmap(viewer, {
                                                              //     maxValue: 100,
                                                              //     fixedPixelSize: 40,
                                                              //     defaultHeight: 0,
                                                              //     colorStops: [
                                                                //       [0, '#0000ff'],
                                                                //       [50, '#00ff00'],
                                                                //       [100, '#ff0000']
                                                                //     ]
                                                                //   });
                                                                const data=csvToJson(cvsdata)
                                                                data.shift()
                                                                data.pop()
                                                                // console.log(JSON.parse(data));
                                                                let relitudata=[]
                                                                relitudata= data.map(element => {
                                                                  return {
                                                                    x:element.lon*1,
                                                                    y:element.lat*1,
                                                                    value:element.value
                                                                  }
                                                                  });
                                                                  console.log(relitudata);
                                                                  const cesiumHeatMap = new CesiumHeatmap(viewer, {
                                                                    // zoomToLayer: true,
                                                                    points: relitudata,
                                                                    heatmapDataOptions: { max: 1, min: 0 },
                                                                    heatmapOptions: {
                                                                      maxOpacity: 1,
                                                                      minOpacity: 0,
                                                                    },
                                                                    });
                                                                    // heatmap.setData(relitudata);
                                                                    
                                                                    
                                                                    // const center = Cesium.Cartesian3.fromDegrees(119.446178,24.928226, 30000);
                                                                    // const particleSystem = viewer.scene.primitives.add(new Cesium.ParticleSystem({
                                                                      //   image: '/src/assets/fire.png', // 你的粒子贴图路径
                                                                      //   startColor: Cesium.Color.YELLOW.withAlpha(0.9),
                                                                      //   endColor: Cesium.Color.ORANGE.withAlpha(0.0),
                                                                      //   startScale: 1.0,
                                                                      //   endScale: 3.0,
                                                                      //   particleLife: 1.2, // 粒子生命周期（秒）
                                                                      //   speed: 100.0,       // 喷射速度
                                                                      //   emissionRate: 100000, // 每秒发射粒子数
                                                                      //   lifetime: 10.0,     // 整个粒子系统持续时间（秒）
                                                                      
                                                                      //   imageSize: new Cesium.Cartesian2(20.0, 20.0),
                                                                      
                                                                      //   // 四周喷发的关键：使用球体发射器
                                                                      //   emitter: new Cesium.SphereEmitter(300.0), // 半径为3的球体方向
                                                                      
                                                                      //   modelMatrix: Cesium.Transforms.eastNorthUpToFixedFrame(center),
                                                                      //   emitterModelMatrix: Cesium.Matrix4.IDENTITY
                                                                      // }));
                                                                      setTimeout(()=>{
                                                                        console.log(Ship10,'Ship10');
                                                                        // circleWave1.del("cirCleWave1")
                                                                        waveC.destroy()
                                                                        UavCtoShip3.destroy()
                                                                        UavCtoShip10.destroy()
                                                                        SatelliteAtoUavC.destroy()
                                                                        Ship10.model.silhouetteColor = Cesium.Color.RED; // 设置边框颜色
                                                                        Ship10.model.silhouetteSize = 2;
                                                                        
                                                                        // viewer.entities.remove(polylineCommunicatio3);
                                                                        viewer.entities.remove(CommunicationDroneC);
                                                                        // const CommunicationDroneTOShip11=polylineCommunication(viewer,CommunicationDroneB,Ship3,1)
                                                                        viewer.clock.shouldAnimate = true
                                                                        const UavCtoShip3_1 = createFlowingTextBetweenModels(viewer, CommunicationDroneB, Ship3, {
                                                                          text: '0101',
                                                                          fontSize: '10px',
                                                                          color: Cesium.Color.LIME,
                                                                          speed: 7000,
                                                                          spacing:0.3
                                                                          })
                                                                          const CommunicationBoattoShip10_2 = createFlowingTextBetweenModels(viewer, CommunicationBoat, Ship10, {
                                                                            text: '0101',
                                                                            fontSize: '10px',
                                                                            color: Cesium.Color.LIME,
                                                                            speed: 7000,
                                                                            spacing:0.3
                                                                            })
                                                                            setTimeout(()=>{
                                                                              // circleWave1 = new Radiant(viewer, "cirCleWave1");
                                                                              // circleWave1.add([120.292125,24.574041, 15], 'green', 40000, 7000);
                                                                              
                                                                              UavCtoShip3_1.destroy()
                                                                              CommunicationBoattoShip10_2.destroy()
                                                                              const UavCtoShip3_2 = createFlowingTextBetweenModels(viewer, CommunicationDroneD, Ship3, {
                                                                                text: '0101',
                                                                                fontSize: '10px',
                                                                                color: Cesium.Color.LIME,
                                                                                speed: 7000,
                                                                                spacing:0.3
                                                                                })
                                                                                const UavCtoShip10_2 = createFlowingTextBetweenModels(viewer, CommunicationDroneD, Ship10, {
                                                                                  text: '0101',
                                                                                  fontSize: '10px',
                                                                                  color: Cesium.Color.LIME,
                                                                                  speed: 7000,
                                                                                  spacing:0.3
                                                                                  })
                                                                                  Ship10.model.silhouetteSize = 0;
                                                                                  const waveD = createSignalWaveCone(viewer, CommunicationDroneD, {
                                                                                    height: 30000,//高度
                                                                                    bottomRadius: 40000,//底部半径
                                                                                    ringCount: 3,//光波数量
                                                                                    ringSpeed: 5000,//毫秒
                                                                                    color: Cesium.Color.WHITE,//颜色
                                                                                    coneOpacity: 0.15,//透明度
                                                                                    ringOpacity:0.1//光环透明度
                                                                                    })
                                                                                    },10000)
                                                                                    },7000)
                                                                                    
                                                                                    
                                                                                    })
                                                                                    
                                                                                  </script>
                                                                                  <style>
                                                                                  html,body,#cesiumContainer{
                                                                                    width: 100%;
                                                                                    height: 100%;
                                                                                    padding: 0;
                                                                                    margin: 0;
                                                                                  }
                                                                                  
                                                                                </style>