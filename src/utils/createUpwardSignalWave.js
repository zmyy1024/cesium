import * as Cesium from 'cesium'

export function createUpwardSignalDome(viewer, modelEntity, options = {}) {
  const {
    radius = 3000,
    height = 2000,
    color = Cesium.Color.CYAN,
    ringCount = 4,
    ringSpeed = 4000,
    ringSegments = 64,
    domeOpacity = 0.3,
    ringOpacity = 0.6
  } = options

  const clock = viewer.clock

  const getModelPosition = () => modelEntity.position?.getValue(clock.currentTime)
  const position = getModelPosition()
  if (!position) {
    console.warn('[createUpwardSignalDome] 模型位置获取失败')
    return null
  }

  const mainHalfSphere = viewer.entities.add({
    position: new Cesium.CallbackProperty(getModelPosition, false),
    ellipsoid: {
      radii: new Cesium.Cartesian3(radius, radius, height),
      maximumCone: Cesium.Math.PI_OVER_TWO,
      material: color.withAlpha(domeOpacity)
    }
  })

  const ringEntities = []
  const startTimes = []

  for (let i = 0; i < ringCount; i++) {
    const delay = i * (ringSpeed / ringCount)
    startTimes.push(performance.now() + delay)

    const ringEntity = viewer.entities.add({
      polyline: {
        positions: new Cesium.CallbackProperty(() => {
          const posNow = getModelPosition()
          if (!posNow) return []

          const matrix = Cesium.Transforms.eastNorthUpToFixedFrame(posNow)
          const now = performance.now()
          const t = ((now - startTimes[i]) % ringSpeed) / ringSpeed

          const theta = Cesium.Math.PI_OVER_TWO * (1 - t)
          const rOnSphere = radius * Math.sin(theta)
          const zOnSphere = height * Math.cos(theta)

          const positions = []
          for (let j = 0; j <= ringSegments; j++) {
            const angle = (j / ringSegments) * Math.PI * 2
            const x = rOnSphere * Math.cos(angle)
            const y = rOnSphere * Math.sin(angle)
            const localPos = new Cesium.Cartesian3(x, y, zOnSphere)
            const worldPos = Cesium.Matrix4.multiplyByPoint(
              matrix,
              localPos,
              new Cesium.Cartesian3()
            )
            positions.push(worldPos)
          }

          return positions
        }, false),
        width: 1.5,
        material: new Cesium.PolylineGlowMaterialProperty({
          glowPower: 0.2,
          color: color.withAlpha(ringOpacity)
        })
      }
    })

    ringEntities.push(ringEntity)
  }

  return {
    mainEntity: mainHalfSphere,
    ringEntities,
    destroy() {
      viewer.entities.remove(mainHalfSphere)
      ringEntities.forEach(e => viewer.entities.remove(e))
    },
    options,
    center: position
  }
}
