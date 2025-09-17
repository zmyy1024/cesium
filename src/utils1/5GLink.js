import * as Cesium from 'cesium'

export function createFlowingTextBetweenModels(viewer, modelA, modelB, options = {}) {
  const {
    text = '0101->',
    fontSize = '24px',
    color = Cesium.Color.CYAN,
    speed = 30000,
    spacing = 1.0
  } = options

  const startTime = Date.now()
  const textLength = text.length
  const approxCharSize = parseInt(fontSize) * 600 * spacing

  // 初始估算 A-B 距离（用于字符数估计）
  const currentTime = viewer.clock.currentTime;
  const posAInit = modelA.position.getValue(currentTime)
  const posBInit = modelB.position.getValue(currentTime)

  let totalDistanceInit = 100000 // fallback 默认值
  if (posAInit && posBInit) {
    totalDistanceInit = Cesium.Cartesian3.distance(posAInit, posBInit)
  }

  const maxChars = Math.min(Math.max(Math.ceil(totalDistanceInit / approxCharSize) + textLength, 5), 300)

  const labels = []

  for (let i = 0; i < maxChars; i++) {
    const charIndex = i % textLength

    const labelEntity = viewer.entities.add({
      label: {
        text: text[charIndex],
        font: fontSize + ' sans-serif',
        fillColor: color,
        style: Cesium.LabelStyle.FILL,
        rotation: 0,
        heightReference: Cesium.HeightReference.NONE,
        disableDepthTestDistance: Number.POSITIVE_INFINITY,
        distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0.0, 1e8),
        verticalOrigin: Cesium.VerticalOrigin.CENTER,
        horizontalOrigin: Cesium.HorizontalOrigin.CENTER
      },
      position: new Cesium.CallbackProperty(() => {
        const time = viewer.clock.currentTime;
        const posA = modelA.position.getValue(time)
        const posB = modelB.position.getValue(time)

        if (!posA || !posB) return Cesium.Cartesian3.ZERO

        const direction = Cesium.Cartesian3.subtract(posB, posA, new Cesium.Cartesian3())
        const totalDistance = Cesium.Cartesian3.distance(posA, posB)
        Cesium.Cartesian3.normalize(direction, direction)

        const elapsed = (Date.now() - startTime) / 1000
        const travelDistance = (elapsed * speed + i * approxCharSize) % totalDistance

        const offset = Cesium.Cartesian3.multiplyByScalar(direction, travelDistance, new Cesium.Cartesian3())
        return Cesium.Cartesian3.add(posA, offset, new Cesium.Cartesian3())
      }, false)
    })

    labelEntity.label.rotation = new Cesium.CallbackProperty(() => {
      const time = viewer.clock.currentTime;
      const posA = modelA.position.getValue(time)
      const posB = modelB.position.getValue(time)
      if (!posA || !posB) return 0
      const cartoA = Cesium.Cartographic.fromCartesian(posA)
      const cartoB = Cesium.Cartographic.fromCartesian(posB)
      return Math.atan2(cartoB.longitude - cartoA.longitude, cartoB.latitude - cartoA.latitude)
    }, false)

    labels.push(labelEntity)
  }

  function destroy() {
    labels.forEach(e => viewer.entities.remove(e))
    labels.length = 0
  }

  return {
    labels,
    destroy
  }
}
