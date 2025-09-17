import * as Cesium from 'cesium';

export function createSignalWaveCone(viewer, modelEntity, options = {}) {
  const {
    height = 10000,
    bottomRadius = 5000,
    color = Cesium.Color.CYAN,
    ringCount = 5,
    ringSpeed = 4000,
    ringSegments = 64,
    coneOpacity = 0.1,
    ringOpacity = 0.7
  } = options;

  // 动态锥体位置计算
  const conePositionCallback = new Cesium.CallbackProperty((time, result) => {
    const antennaPosition = Cesium.Property.getValueOrUndefined(modelEntity.position, time);
    if (!antennaPosition) return result;

    const enuMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(antennaPosition);
    const up = Cesium.Matrix4.getColumn(enuMatrix, 2, new Cesium.Cartesian3());
    return Cesium.Cartesian3.add(
      antennaPosition,
      Cesium.Cartesian3.multiplyByScalar(up, -height / 2, new Cesium.Cartesian3()),
      result || new Cesium.Cartesian3()
    );
  }, false);

  // 添加锥体（动态位置）
  const coneEntity = viewer.entities.add({
    position: conePositionCallback,
    cylinder: {
      length: height,
      topRadius: 0,
      bottomRadius: bottomRadius,
      material: new Cesium.Color(color.red, color.green, color.blue, coneOpacity),
      outline: false
    }
  });

  const ringEntities = [];

  for (let i = 0; i < ringCount; i++) {
    const delay = (i / ringCount) * ringSpeed;

    const ringEntity = viewer.entities.add({
      polyline: {
        positions: new Cesium.CallbackProperty((time) => {
          const now = performance.now();
          const t = ((now - delay) % ringSpeed) / ringSpeed;

          const antennaPosition = Cesium.Property.getValueOrUndefined(modelEntity.position, time);
          if (!antennaPosition) return [];

          // ENU 和方向计算
          const enuMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(antennaPosition);
          const up = Cesium.Matrix4.getColumn(enuMatrix, 2, new Cesium.Cartesian3());

          // 锥体中心点
          const centerPosition = Cesium.Cartesian3.add(
            antennaPosition,
            Cesium.Cartesian3.multiplyByScalar(up, -height / 2, new Cesium.Cartesian3()),
            new Cesium.Cartesian3()
          );

          // 当前环高度
          const localZ = height / 2 - t * height;
          const radius = bottomRadius * ((height / 2 - localZ) / height);

          const localToWorld = Cesium.Transforms.eastNorthUpToFixedFrame(centerPosition);
          const positions = [];

          for (let j = 0; j <= ringSegments; j++) {
            const angle = (j / ringSegments) * Math.PI * 2;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            const localPos = new Cesium.Cartesian3(x, y, localZ);

            const worldPos = Cesium.Matrix4.multiplyByPoint(
              localToWorld,
              localPos,
              new Cesium.Cartesian3()
            );

            positions.push(worldPos);
          }

          return positions;
        }, false),
        width: 1.5,
        material: new Cesium.PolylineGlowMaterialProperty({
          glowPower: 0.2,
          color: color.withAlpha(ringOpacity)
        })
      }
    });

    ringEntities.push(ringEntity);
  }

  return {
    coneEntity,
    ringEntities,
    destroy() {
      viewer.entities.remove(coneEntity);
      ringEntities.forEach(e => viewer.entities.remove(e));
    }
  };
}
