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

  // 2. 方向计算（model → target），默认轴改为 Z 轴
  const coneOrientationCallback = new Cesium.CallbackProperty((time) => {
    const modelPos = Cesium.Property.getValueOrUndefined(modelEntity.position, time);
    const targetPos = Cesium.Property.getValueOrUndefined(targetEntity.position, time);
    if (!modelPos || !targetPos) return Cesium.Quaternion.IDENTITY;

    const dir = Cesium.Cartesian3.subtract(targetPos, modelPos, new Cesium.Cartesian3());
    Cesium.Cartesian3.normalize(dir, dir);

    const defaultAxis = Cesium.Cartesian3.UNIT_Z;

    const dot = Cesium.Cartesian3.dot(defaultAxis, dir);
    if (dot > 0.9999) {
      return Cesium.Quaternion.IDENTITY;
    } else if (dot < -0.9999) {
      return Cesium.Quaternion.fromAxisAngle(Cesium.Cartesian3.UNIT_X, Math.PI);
    }

    const axis = Cesium.Cartesian3.cross(defaultAxis, dir, new Cesium.Cartesian3());
    Cesium.Cartesian3.normalize(axis, axis);
    const angle = Math.acos(dot);

    return Cesium.Quaternion.fromAxisAngle(axis, angle);
  }, false);

  // 3. 创建锥体实体
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

  // 4. 创建动态圆环（沿锥体方向移动，圆环平面垂直于锥体轴）
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

          // 反转 t 方向：从顶点到底部
          const localZ = (1 - t) * totalLength;

          // 圆环半径随着高度线性变化
          const radius = bottomRadius * ((totalLength - localZ) / totalLength);

          // 圆环中心点
          const center = Cesium.Cartesian3.add(
            modelPos,
            Cesium.Cartesian3.multiplyByScalar(direction, localZ, new Cesium.Cartesian3()),
            new Cesium.Cartesian3()
          );

          // 构造局部坐标系：右（X）、上（Y）、前（Z）三个轴
          let up = Cesium.Cartesian3.UNIT_Z;
          if (Math.abs(Cesium.Cartesian3.dot(direction, up)) > 0.9999) {
            up = Cesium.Cartesian3.UNIT_Y;
          }

          const right = Cesium.Cartesian3.cross(direction, up, new Cesium.Cartesian3());
          Cesium.Cartesian3.normalize(right, right);

          up = Cesium.Cartesian3.cross(right, direction, new Cesium.Cartesian3());
          Cesium.Cartesian3.normalize(up, up);

          const rotationMatrix = new Cesium.Matrix3();
          Cesium.Matrix3.setColumn(rotationMatrix, 0, right, rotationMatrix);
          Cesium.Matrix3.setColumn(rotationMatrix, 1, up, rotationMatrix);
          Cesium.Matrix3.setColumn(rotationMatrix, 2, direction, rotationMatrix);

          const rotationMatrix4 = Cesium.Matrix4.fromRotationTranslation(rotationMatrix, center);

          // 生成圆环点（局部XY平面）
          const positions = [];
          for (let j = 0; j <= ringSegments; j++) {
            const angle = (j / ringSegments) * 2 * Math.PI;
            const localPoint = new Cesium.Cartesian3(
              Math.cos(angle) * radius,
              Math.sin(angle) * radius,
              0
            );
            const worldPoint = Cesium.Matrix4.multiplyByPoint(rotationMatrix4, localPoint, new Cesium.Cartesian3());
            positions.push(worldPoint);
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
