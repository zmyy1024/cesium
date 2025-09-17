import * as Cesium from 'cesium';

// // 实体的唯一标识符，不能重复
// id: 'entity-2001',

// // 实体显示的名称，可用于调试或标注
// name: '基站A',

// // 实体的地理位置（经度、纬度、高度）
// position: {
//   lon: 119.88,      // 经度（单位：度）
//   lat: 24.74,       // 纬度（单位：度）
//   height: 80        // 高度（单位：米，以上地面）
// },

// // 模型类型（用于从本地模型路径映射中查找对应 glb 文件）
// modelType: 'antenna',

// // 链路名称，可表示与其他实体的连接关系
// link: '控制中心',

// // 实体的作用半径（例如信号覆盖半径，单位：米）
// radius: 1000,

// // 健康状态（例如：'正常'、'异常'、'离线' 等）
// healthStatus: '异常',

// // 信号增益（单位：dB，表示信号增强强度）
// gain: 18,

// // 信号损耗（单位：dB，表示信号衰减）
// loss: 6,

// // 移动速度（单位：米/秒，可用于后续动画）
// speed: 0,

// // IP 地址（例如网络编号，适合网络图拓扑等）
// ip: '192.168.0.2'


/**
 * 添加自定义实体模型（强校验必填字段）
 * @param {Cesium.Viewer} viewer - Cesium 视图对象
 * @param {Object} config - 实体配置对象
 */
export function addCustomEntityModel(viewer, config) {
  if (!viewer || typeof config !== 'object') {
    console.warn('[addCustomEntityModel] 参数无效');
    return null;
  }

  const requiredFields = ['id', 'name', 'position', 'modelType'];
  for (const field of requiredFields) {
    if (!config[field]) {
      console.warn(`[addCustomEntityModel] 缺少必填字段：${field}`);
      return null;
    }
  }

  const { id, name, position, modelType } = config;

  if (
    typeof position.lon !== 'number' ||
    typeof position.lat !== 'number' ||
    typeof position.height !== 'number'
  ) {
    console.warn('[addCustomEntityModel] position.lon / lat / height 必须是数字');
    return null;
  }

  const cartesianPosition = Cesium.Cartesian3.fromDegrees(position.lon, position.lat, position.height);
  const modelUrl = getModelUrlByType(modelType);

  const entity = viewer.entities.add({
    id,
    name,
    position: cartesianPosition,
    heightReference: Cesium.HeightReference.NONE,
    model: {
      uri: modelUrl,
      scale: 1.0,
      minimumPixelSize: 64
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
    },
    // 其余字段设为可选
    properties: {
      link: config.link || null,
      radius: config.radius || null,
      healthStatus: config.healthStatus || null,
      gain: config.gain || null,
      loss: config.loss || null,
      speed: config.speed || null,
      ip: config.ip || null,
      modelType
    }
  });

  return entity;
}

/**
 * 根据模型类型返回本地模型地址
 * @param {String} type - 模型类型
 * @returns {String} 模型文件路径
 */
function getModelUrlByType(type) {
  const modelMap = {
    HUAV: '/models/HUAV.glb',
    MUAV: '/models/MUAV.glb',
    CCV: '/models/CCV.glb',
    IFV: '/models/IFV.glb',
    Warship: '/models/Warship.glb',
    SATCOM: '/models/SATCOM.glb',
    Satellite: '/models/Satellite.glb',

  };
  return modelMap[type];
}

