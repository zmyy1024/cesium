import * as Cesium from 'cesium'

export function startModelMoverToFixedTarget(viewer, modelEntity, targetPositionRef) {
  if (!viewer || !modelEntity || !isValidTarget(targetPositionRef)) {
    console.warn('[modelMover] 参数不合法')
    return
  }

  const height = typeof targetPositionRef.height === 'number' ? targetPositionRef.height : 0
  const targetCartesian = Cesium.Cartesian3.fromDegrees(
    targetPositionRef.lng,
    targetPositionRef.lat,
    height
  )

  // 当前时间
  const now = Cesium.JulianDate.now()
  const nextTime = Cesium.JulianDate.addSeconds(now, 1, new Cesium.JulianDate())

  // 初始化 SampledPositionProperty 实现动画插值
  if (!(modelEntity.position instanceof Cesium.SampledPositionProperty)) {
    const position = new Cesium.SampledPositionProperty()
    position.setInterpolationOptions({
      interpolationDegree: 1,
      interpolationAlgorithm: Cesium.LagrangePolynomialApproximation
    })
    modelEntity.position = position
  }

  const positionProp = modelEntity.position
  const currentPosition = positionProp.getValue(now) || targetCartesian
  positionProp.addSample(now, currentPosition)
  positionProp.addSample(nextTime, targetCartesian)

  // ✅ 添加轨迹点
  if (!Array.isArray(modelEntity._trackPoints)) {
    modelEntity._trackPoints = []
  }
  modelEntity._trackPoints.push(targetCartesian)
  if (modelEntity._trackPoints.length > 15) {
    modelEntity._trackPoints.shift()
  }

  // ✅ 更新或创建轨迹线
  if (!modelEntity._trackLineEntity) {
    modelEntity._trackLineEntity = viewer.entities.add({
      polyline: {
        positions: new Cesium.CallbackProperty(() => modelEntity._trackPoints, false),
        width: 2,
        clampToGround: false,
        material: new Cesium.PolylineDashMaterialProperty({
          color: Cesium.Color.RED.withAlpha(0.9),
          dashLength: 8.0,
          dashPattern: 255
        })
      }
    })
  }
}

function isValidTarget(pos) {
  return pos &&
    typeof pos.lng === 'number' &&
    typeof pos.lat === 'number'
}
