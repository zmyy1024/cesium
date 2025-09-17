import * as Cesium from 'cesium';
/**
 * 添加一个带有名称提示框的 glb 模型
 * @param {Cesium.Viewer} viewer - Cesium Viewer 实例
 * @param {Object} options
 * @param {Cesium.Cartesian3} options.position - 模型位置
 * @param {string} options.modelUrl - 模型 glb 路径
 * @param {string} options.name - 显示的名称
 * @param {Cesium.Color} [options.labelColor] - 文字颜色
 * @param {number} [options.labelPixelOffsetY] - 垂直偏移
 */
export default function modelMethod(viewer, data, name) {
  const entity = viewer.entities.add({
    name: name,
    position: data,
    model: {
      uri: '../../public/models/无人机.glb',
      scale: 1.0,
      minimumPixelSize: 128,// 最小像素大小
      maximumScale: 10000,// 最大比例尺
      silhouetteColor: Cesium.Color.GREEN,// 设置边框颜色
      silhouetteSize: 2,
    },
    label: {
      text: name,
      font: '20px sans-serif',
      fillColor: Cesium.Color.WHITE,
      showBackground: true,
      backgroundColor: Cesium.Color.BLACK.withAlpha(0.5),
      horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
      verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
      pixelOffset: new Cesium.Cartesian2(0, -30), // 向上偏移避免遮挡模型
      // distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0.0, 100000.0), // 可视距离范围
      scaleByDistance: new Cesium.NearFarScalar(100.0, 1.2, 500000.0, 0.5),
    }
  });

  return entity;

};


