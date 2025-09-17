import * as Cesium from 'cesium';

export function createSignalWaveConeWithTarget(viewer, modelEntity, targetEntity, options = {}) {
  const {
    bottomRadius = 5000,
    color = Cesium.Color.CYAN,
    ringCount = 5,
    ringSpeed = 4000,
    ringSegments = 64,
    coneOpacity = 0.1,
    ringOpacity = 0.7,
    ringWidth = 1.5,
    ringColor = Cesium.Color.YELLOW
  } = options;

  // 1. 长度计算（从 model 到 target）
  const coneHeightCallback = new Cesium.CallbackProperty((time) => {
    const modelPos = Cesium.Property.getValueOrUndefined(modelEntity.position, time);
    const targetPos = Cesium.Property.getValueOrUndefined(targetEntity.position, time);
    if (!modelPos || !targetPos) return 0;
    return Cesium.Cartesian3.distance(modelPos, targetPos);
  }, false);

  // 2. 方向计算（model → target）
  const coneOrientationCallback = new Cesium.CallbackProperty((time) => {
    const modelPos = Cesium.Property.getValueOrUndefined(modelEntity.position, time);
    const targetPos = Cesium.Property.getValueOrUndefined(targetEntity.position, time);
    if (!modelPos || !targetPos) return Cesium.Quaternion.IDENTITY;

    const dir = Cesium.Cartesian3.subtract(targetPos, modelPos, new Cesium.Cartesian3());
    Cesium.Cartesian3.normalize(dir, dir);

    // default Y轴方向
    const defaultAxis = Cesium.Cartesian3.UNIT_Y;

    // 旋转向量 A → B（Y → dir）
    const dot = Cesium.Cartesian3.dot(defaultAxis, dir);
    if (dot > 0.9999) {
      return Cesium.Quaternion.IDENTITY; // 已对齐
    } else if (dot < -0.9999) {
      // 反向，需要绕 X 轴或 Z 轴转180°
      return Cesium.Quaternion.fromAxisAngle(Cesium.Cartesian3.UNIT_Z, Math.PI);
    }

    const axis = Cesium.Cartesian3.cross(defaultAxis, dir, new Cesium.Cartesian3());
    Cesium.Cartesian3.normalize(axis, axis);
    const angle = Math.acos(dot);

    return Cesium.Quaternion.fromAxisAngle(axis, angle);
  }, false);

  // 3. 创建锥体实体，底部在 model，方向为 dir
  const coneEntity = viewer.entities.add({
    position: modelEntity.position,
    orientation: coneOrientationCallback,
    cylinder: {
      length: coneHeightCallback,
      topRadius: 0,
      bottomRadius,
      material: color.withAlpha(coneOpacity),
      outline: false
    }
  });

  // 4. 创建动态圆环（附着于锥体）
  const ringEntities = [];

  for (let i = 0; i < ringCount; i++) {
    const delay = (i / ringCount) * ringSpeed;

    const ringEntity = viewer.entities.add({
      polyline: {
        positions: new Cesium.CallbackProperty((time) => {
          const now = performance.now();
          const t = ((now - delay) % ringSpeed) / ringSpeed;

          const modelPos = Cesium.Property.getValueOrUndefined(modelEntity.position, time);
          const targetPos = Cesium.Property.getValueOrUndefined(targetEntity.position, time);
          if (!modelPos || !targetPos) return [];

          const direction = Cesium.Cartesian3.subtract(targetPos, modelPos, new Cesium.Cartesian3());
          const totalLength = Cesium.Cartesian3.magnitude(direction);
          Cesium.Cartesian3.normalize(direction, direction);

          const localZ = (1 - t) * totalLength; 
          const radius = bottomRadius * ((totalLength - localZ) / totalLength);

          const center = Cesium.Cartesian3.add(
            modelPos,
            Cesium.Cartesian3.multiplyByScalar(direction, localZ, new Cesium.Cartesian3()),
            new Cesium.Cartesian3()
          );

          const enuMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(center);
          const positions = [];

          for (let j = 0; j <= ringSegments; j++) {
            const angle = (j / ringSegments) * Math.PI * 2;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            const local = new Cesium.Cartesian3(x, y, 0);
            const world = Cesium.Matrix4.multiplyByPoint(enuMatrix, local, new Cesium.Cartesian3());
            positions.push(world);
          }

          return positions;
        }, false),
        width: ringWidth,
        material: new Cesium.PolylineGlowMaterialProperty({
          glowPower: 0.2,
          color: ringColor.withAlpha(ringOpacity)
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
