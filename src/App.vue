<template>
  <div id="cesiumContainer"></div>
</template>
<script setup>
import {CesiumHeatmap} from '@/utils1/cesiumHeatMap.js';
import WebSocketClient from '@/utils/Websocket.js';
import * as Cesium from 'cesium';
import { onMounted } from 'vue';
import { entitiesLngLatList } from '@/utils/lnglatList.js';
import { addCustomEntityModel } from '@/utils/addCustomEntityModel.js'
import ModelManager from '@/utils/ModelManager.js'
import Top from "./components/top.vue";

// 将manager定义为全局变量
let manager = null;

onMounted(() => {

  // 设置Cesium Ion访问令牌
  Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIyZjVkZDQxNi1kOGE4LTQ2M2ItYTBhYi0yNTJlMzQ3MDkwMDIiLCJpZCI6MzMxOTY2LCJpYXQiOjE3NTUxNjM4ODd9.iQfgaK0GhIaYB9QNVGz1HrAewaIjLB9Knqz1Il1c1SY';
  
  console.log("🔑 Cesium Ion Token设置完成");

  let viewer;
  try {
    viewer = new Cesium.Viewer('cesiumContainer', {
      geocoder: false,
      baseLayerPicker: false,
      homeButton: false,
      sceneModePicker: false,
      navigationHelpButton: false,
      animation: false,
      timeline: false,
      cerditsDisplay: false,
      fullscreen: false,
      selectionIndicator: false,
    });
    
    console.log("🌍 Cesium Viewer创建成功");
    console.log("📊 影像层数量:", viewer.imageryLayers.length);
    
    // 添加影像层加载事件监听
    viewer.imageryLayers.layerAdded.addEventListener((layer) => {
      console.log("✅ 影像层已添加:", layer);
    });
    
    viewer.imageryLayers.layerRemoved.addEventListener((layer) => {
      console.log("❌ 影像层已移除:", layer);
    });
    
    // 检查默认影像层是否正常
    if (viewer.imageryLayers.length > 0) {
      const defaultLayer = viewer.imageryLayers.get(0);
      console.log("📷 默认影像层:", defaultLayer);
      
      // 安全地检查并监听影像层加载状态
      if (defaultLayer.readyPromise && typeof defaultLayer.readyPromise.then === 'function') {
        defaultLayer.readyPromise.then(() => {
          console.log("✅ 默认影像层加载成功");
        }).catch((error) => {
          console.error("❌ 默认影像层加载失败:", error);
          console.log("🔄 尝试使用备用影像层...");
          
          // 如果默认影像层失败，尝试使用OpenStreetMap作为备用
          viewer.imageryLayers.removeAll();
          viewer.imageryLayers.addImageryProvider(new Cesium.OpenStreetMapImageryProvider({
            url: 'https://a.tile.openstreetmap.org/'
          }));
          console.log("🗺️ 已切换到OpenStreetMap备用地图");
        });
      } else {
        console.log("⚠️ 影像层没有readyPromise，跳过加载状态检查");
      }
    }
    
    // 设置相机位置 - 移到try块内确保viewer存在
    console.log("📍 设置相机初始位置...");
    viewer.camera.setView({
      destination: Cesium.Cartesian3.fromDegrees(120.086713, 23.090829, 100000), // 经纬度 + 高度
      orientation: {
        heading: Cesium.Math.toRadians(0.0),     // 朝向（东为0，顺时针）
        pitch: Cesium.Math.toRadians(-30.0),     // 向下看30度
        roll: 0.0                                 // 翻滚角，一般为0
      }
    });
    console.log("✅ 相机位置设置完成");
    
    //去除logo
    viewer.cesiumWidget.creditContainer.style.display = "none";
    //去除双击事件
    viewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(
      Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK
    );
    
  } catch (error) {
    console.error("❌ Cesium Viewer创建失败:", error);
    return; // 如果创建失败，直接返回
  }

  // 保留原来的OpenStreetMap配置作为备注
  // 如果Cesium Ion无法访问，可以取消下面的注释使用OpenStreetMap
  // viewer.imageryLayers.removeAll();
  // viewer.imageryLayers.addImageryProvider(new Cesium.OpenStreetMapImageryProvider({
  //   url: 'https://a.tile.openstreetmap.org/'
  // }));
  let cesiumHeatmap = null;
  let coveragelist = [];
  let connectList = [];

  manager = new ModelManager(viewer);

  // 添加点击事件处理
  const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
  handler.setInputAction((event) => {
    // 使用 drillPick 获取所有被点击的对象，包括被遮挡的
    const pickedObjects = viewer.scene.drillPick(event.position);
    
    if (pickedObjects.length > 0) {
      // 遍历所有被点击的对象，找到模型实体
      for (let i = 0; i < pickedObjects.length; i++) {
        const pickedObject = pickedObjects[i];
        if (Cesium.defined(pickedObject) && pickedObject.id) {
          const entity = pickedObject.id;
          const entityId = entity.id;
          
          // 检查是否是覆盖范围信息中的模型
          const coverageInfo = coveragelist.find(item => item.entityId == entityId);
          if (coverageInfo) {
            showEntityInfo(entity, coverageInfo, event.position);
            break; // 找到模型后停止搜索
          }
        }
      }
    }
  }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

  // 显示实体信息框
  function showEntityInfo(entity, coverageInfo, clickPosition) {
    // 移除之前的信息框
    const existingInfoBox = document.getElementById('entity-info-box');
    if (existingInfoBox) {
      existingInfoBox.remove();
    }

    // 将屏幕坐标转换为页面坐标
    const canvas = viewer.scene.canvas;
    const rect = canvas.getBoundingClientRect();
    const x = clickPosition.x + rect.left;
    const y = clickPosition.y + rect.top;

    // 创建信息框
    const infoBox = document.createElement('div');
    infoBox.id = 'entity-info-box';
    infoBox.style.cssText = `
      position: fixed;
      left: ${x + 20}px;
      top: ${y - 10}px;
      background: rgba(0, 0, 0, 0.95);
      color: white;
      padding: 15px;
      border-radius: 8px;
      border: 2px solid #00ffff;
      box-shadow: 0 0 15px rgba(0, 255, 255, 0.6);
      z-index: 1000;
      min-width: 280px;
      max-width: 350px;
      font-family: 'Microsoft YaHei', sans-serif;
      font-size: 14px;
    `;

    const { A, B, C, D, E, F } = coverageInfo;

    let content = `
      <div style="text-align: center; margin-bottom: 12px; border-bottom: 1px solid #333; padding-bottom: 8px;">
        <h3 style="margin: 0; color: #00ffff; font-size: 16px;">${coverageInfo.entityName || entity.name || '未知设备'}</h3>
        <p style="margin: 3px 0; color: #ccc; font-size: 12px;">ID: ${entity.id}</p>
      </div>
      
      <div style="margin-bottom: 12px;">
        <h4 style="color: #00ffff; margin: 0 0 8px 0; font-size: 14px;">信号质量分布</h4>
        <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
          <span style="color: #00ff00;">优 (A):</span>
          <span style="color: #00ff00; font-weight: bold;">${(A * 100).toFixed(1)}%</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
          <span style="color: #ffff00;">良 (B):</span>
          <span style="color: #ffff00; font-weight: bold;">${(B * 100).toFixed(1)}%</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
          <span style="color: #ff8800;">中 (C):</span>
          <span style="color: #ff8800; font-weight: bold;">${(C * 100).toFixed(1)}%</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
          <span style="color: #ff0000;">差 (D):</span>
          <span style="color: #ff0000; font-weight: bold;">${(D * 100).toFixed(1)}%</span>
        </div>
      </div>
      
        <div style="border-top: 1px solid #333; padding-top: 8px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
            <span>预计服务点数:</span>
            <span style="color: #00ffff; font-weight: bold;">${F}</span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span>实际服务点数:</span>
            <span style="color: #00ffff; font-weight: bold;">${E}</span>
          </div>
        </div>
      
      <div style="text-align: center; margin-top: 10px;">
        <button onclick="this.parentElement.parentElement.remove()" 
                style="background: #00ffff; color: black; border: none; padding: 6px 15px; 
                       border-radius: 4px; cursor: pointer; font-weight: bold; font-size: 12px;">
          关闭
        </button>
      </div>
    `;

    infoBox.innerHTML = content;
    document.body.appendChild(infoBox);

    // 确保信息框在屏幕范围内
    const infoRect = infoBox.getBoundingClientRect();
    if (infoRect.right > window.innerWidth) {
      infoBox.style.left = `${x - infoRect.width - 20}px`;
    }
    if (infoRect.bottom > window.innerHeight) {
      infoBox.style.top = `${y - infoRect.height - 10}px`;
    }

    // 点击背景关闭信息框
    infoBox.addEventListener('click', (e) => {
      if (e.target === infoBox) {
        infoBox.remove();
      }
    });
  }
// 172.18.24.21
// 172.18.8.82
  const ws = new WebSocketClient("ws://172.18.10.65:8080/ws?client=vue",
  {
    onOpen:() => {
      console.log("✅连接成功！");
    },
    onMessage:(e) => {
      // 之前代码
      // const res = JSON.parse(e);
      // 兼容：e 可能是字符串，也可能是 { data: string } 或已是对象

      // 现在代码
      let res;
      try {
        if (typeof e === 'string') {
          res = JSON.parse(e);
        } else if (e && typeof e.data === 'string') {
          res = JSON.parse(e.data);
        } else if (e && typeof e === 'object') {
          res = e;
        }
      } catch (err) {
        console.error('JSON 解析失败，原始消息为：', e, err);
        return;
      }

      
      if (res.type==1){
        console.log("收到初始化信息", res);
        manager.reset();
        manager.add({
          id: 36933,
          name: '卫星节点',
          position: {
            lon: 121.572032,
            lat: 27.09037,
            height: 200000
          },
          modelType: 'Satellite',
        });
        const baseStationList = Array.isArray(res.msg?.baseStationList) ? res.msg.baseStationList : [];
        const terminalDeviceLandList = Array.isArray(res.msg?.terminalDeviceLandList) ? res.msg.terminalDeviceLandList : [];
        const terminalDeviceList = Array.isArray(res.msg?.terminalDeviceList) ? res.msg.terminalDeviceList : [];

        const baseStationIDList = baseStationList.map(item => {
          if (item.entityModel === '无人艇' || item.entityModel === '无人通信艇'|| item.entityModel ==='小船') {
            manager.add({
              id: item.entityId,
              name: item.entityName,
              position: {
                lon: item.longitude,
                lat: item.latitude,
                height: item.height * 3
              },
              modelType: 'CCV'
            });
          } 
          else if (item.entityModel == '中空无人机' || item.entityModel == '中空通信无人机'|| item.entityModel == '中型飞机') {
            manager.add({
              id: item.entityId,
              name: item.entityName,
              position: {
                lon: item.longitude,
                lat: item.latitude,
                height: item.height * 3
              },
              modelType: 'MUAV'
            });
          } else if (item.entityModel == '高空无人机' || item.entityModel == '高空通信无人机'|| item.entityModel =='大型飞机') {
            manager.add({
              id: item.entityId,
              name: item.entityName,
              position: {
                lon: item.longitude,
                lat: item.latitude,
                height: item.height * 3
              },
              modelType: 'HUAV'
            });
          }else if (item.entityModel == '中型步战车' || item.entityModel == 'SUV') {
            manager.add({
              id: item.entityId,
              name: item.entityName,
              position: {
                lon: item.longitude,
                lat: item.latitude,
                height: item.height * 3
              },
              modelType: 'IFV'
            });
          }
          else if (item.entityModel == '小型步战车' || item.entityModel == '轿车') {
            manager.add({
              id: item.entityId,
              name: item.entityName,
              position: {
                lon: item.longitude,
                lat: item.latitude,
                height: item.height * 3
              },
              modelType: 'IFV'
            });
          }
          return item.entityId;
        });

        terminalDeviceLandList.forEach(item => {
          manager.add({
            id: item.entityId,
            name: item.entityName,
            position: {
              lon: item.longitude,
              lat: item.latitude,
              height: item.height
            },
            modelType: 'IFV'
          });
        });

        terminalDeviceList.forEach(item => {
          if (item.entityModel === '无人艇' || item.entityModel === '无人通信艇'|| item.entityModel === '小船') {
            baseStationIDList.push(item.entityId);
          }
          manager.add({
            id: item.entityId,
            name: item.entityName,
            position: {
              lon: item.longitude,
              lat: item.latitude,
              height: item.height
            },
            modelType: 'Warship'
          });
        });

        console.log('baseStationIDList', baseStationIDList);
        console.log('manager.entities keys', Array.from(manager.entities.keys()));
        if (baseStationIDList.length > 0) {
          manager.connect(36933, baseStationIDList, {
            text: '---',
            fontSize: '14px',
            color: Cesium.Color.LIME,
            speed: 3000,
            spacing: 0.3
          });
        }
    
    
    // 这里可以添加新的if语句或其他逻辑
    
  } else if (res.type == 5) {
    // 新的if分支示例 - 您可以在这里添加type为2的处理逻辑
    console.log("收到热力图信息",res);
    if (cesiumHeatmap !=null){
      cesiumHeatmap.remove()
    }
    // const array =JSON.parse(res.msg);
    const array = res.msg;
    if(array.length != 0){
      let headData = [];
      headData = array.map(item => {
        return {
          x: item.J - 0.0,
          y: item.W - 0.0,
          value: item.S
        }
      })
      cesiumHeatmap = new CesiumHeatmap(viewer, {
        zoomToLayer: false,
        points: headData,
        heatmapDataOptions: { max: 1, min: 0 },
        heatmapOptions: {
          maxOpacity: 0.5,
          minOpacity: 0,
        },
      });
    }
    
  } else if (res.type == 3) {
    // 新的if分支示例 - 您可以在这里添加type为3的处理逻辑
     connectList = res.msg;
     res.msg.forEach(item => {
       manager.disconnectAllFor(item.entityId);
       manager.connect(item.entityId,item.childEntityIdList, {
         text: '010101',
         fontSize: '14px',
         color: Cesium.Color.LIME,
         speed: 3000,
         spacing: 0.1
       });
     });
    
  } else if (res.type == 8) {
    // 先移除旧的覆盖效果（如果有）
    console.log("收到覆盖范围信息", res);
    if (Array.isArray(coveragelist) && coveragelist.length > 0) {
      coveragelist.forEach(item1 => {
        if (item1.coverageType == 11) {
          manager.removeSignalCone(item1.entityId);
        }
        if (item1.coverageType == 12) {
          manager.removeUpwardDome(item1.entityId);
          manager.removeCircleWave(item1.entityId);
        }
      });
    }

    // 更新本地缓存并渲染新的覆盖效果
    coveragelist = Array.isArray(res.msg) ? res.msg : [];
    
    coveragelist.forEach(item => {
      if (item.coverageType == 11) {
        manager.addSignalCone(item.entityId, {
          height: item.height * 3 + 10,
          color: Cesium.Color.WHITE,
          bottomRadius: item.radius,
          ringCount: 2,
          ringSpeed: 10000,
          coneOpacity: 0.15,
          ringOpacity: 0.1
        });
      }
      if (item.coverageType == 12) {
        // 首先尝试通过ID查找实体
        let targetEntityId = item.entityId;
        let entity = manager.getEntityById(targetEntityId);
        
        // 如果通过ID找不到，尝试通过名称查找
        if (!entity && item.entityName) {
          const nameResult = manager.getEntityByName(item.entityName);
          if (nameResult) {
            targetEntityId = nameResult.id;
            entity = nameResult.entity;
          }
        }
        
        // // 如果还是找不到，尝试模糊匹配（比如SUV-1匹配SUV）
        // if (!entity && item.entityName) {
        //   const baseName = item.entityName.split('-')[0]; // 提取基础名称，如"SUV-1" -> "SUV"
        //   const patternResult = manager.findEntityByNamePattern(baseName);
        //   if (patternResult) {
        //     targetEntityId = patternResult.id;
        //     entity = patternResult.entity;
        //   }
        // }
        
        if (entity) {
          manager.addUpwardDome(targetEntityId, {
            radius: item.radius,
            height: item.radius,
            color: Cesium.Color.YELLOW,
            ringCount: 3,
            ringSpeed: 5000,
            ringOpacity: 0.3,
            domeOpacity: 0.3
          });
          manager.addCircleWave(targetEntityId, {
            color: "rgb(0, 255, 0)",
            maxRadius: item.radius,
            duration: 7000,
            count: 3
          });
        }
      }
    });
  }
},
onError: (error) => {
  console.error("WebSocket错误:", error);
},
onClose: () => {
  console.log("WebSocket连接已关闭");
}
});
});

</script>
<style>
#cesiumContainer {
  width: 100%;
  height: 100%;
  position: absolute;
  /* 确保绝对填满容器 */
  top: 0;
  left: 0;
  overflow: hidden;
}

.toggle-btn {
  position: absolute;
  z-index: 99;
  top: 30%;
  padding: 6px 8px;
  background-color: rgba(10, 31, 58, 0.8);
  color: #00ffff;
  border: 1px solid rgba(0, 255, 255, 0.4);
  border-radius: 6px;
  font-weight: bold;
  font-size: 14px;
  box-shadow: 0 0 10px rgba(0, 255, 255, 0.3);
  cursor: pointer;
  user-select: none;
  writing-mode: vertical-rl; /* 垂直文字，从右往左 */
  text-orientation: upright; /* 正立字符 */
  line-height: 1.2;
}

.toggle-btn:hover {
  background-color: rgba(0, 255, 255, 0.1);
  box-shadow: 0 0 12px rgba(0, 255, 255, 0.6);
}

.left-btn {
  left: 0;
  border-left: none;
}

.right-btn {
  right: 0;
  border-right: none;
}
</style>
