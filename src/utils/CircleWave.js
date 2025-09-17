// CircleWave.js
import * as Cesium from "cesium";

function CircleWaveMaterialProperty(ob) {
  this._definitionChanged = new Cesium.Event();
  this._color = undefined;
  this._colorSubscription = undefined;
  this.color = ob.color;
  this.duration = Cesium.defaultValue(ob.duration, 1000);
  this.count = Cesium.defaultValue(ob.count, 2);
  if (this.count <= 0) this.count = 1;
  this.gradient = Cesium.defaultValue(ob.gradient, 0.1);
  if (this.gradient > 1) this.gradient = 1;
  this._time = new Date().getTime();
}
Object.defineProperties(CircleWaveMaterialProperty.prototype, {
  isConstant: { get: () => false },
  definitionChanged: { get: function () { return this._definitionChanged; } },
  color: Cesium.createPropertyDescriptor("color"),
  duration: Cesium.createPropertyDescriptor("duration"),
  count: Cesium.createPropertyDescriptor("count"),
});
CircleWaveMaterialProperty.prototype.getType = () => Cesium.Material.CircleWaveMaterialType;
CircleWaveMaterialProperty.prototype.getValue = function (time, result) {
  if (!Cesium.defined(result)) result = {};
  result.color = Cesium.Property.getValueOrClonedDefault(this._color, time, Cesium.Color.WHITE, result.color);
  result.time = ((Date.now() - this._time) % this.duration) / this.duration;
  result.count = this.count;
  result.gradient = 1 + 10 * (1 - this.gradient);
  return result;
};
CircleWaveMaterialProperty.prototype.equals = function (other) {
  return this === other || (
    other instanceof CircleWaveMaterialProperty &&
    Cesium.Property.equals(this._color, other._color)
  );
};

Cesium.Material.CircleWaveMaterialType = "CircleWaveMaterial";
Cesium.Material.CircleWaveSource = `
czm_material czm_getMaterial(czm_materialInput materialInput) {
  czm_material material = czm_getDefaultMaterial(materialInput);
  material.diffuse = 1.5 * color.rgb;
  vec2 st = materialInput.st;
  vec3 str = materialInput.str;
  float dis = distance(st, vec2(0.5, 0.5));
  float per = fract(time);
  if (abs(str.z) > 0.001) discard;
  if (dis > 0.5) discard;
  else {
    float perDis = 0.5 / count;
    float disNum;
    float bl = 0.0;
    for (int i = 0; i <= 9; i++) {
      if (float(i) <= count) {
        disNum = perDis * float(i) - dis + per / count;
        if (disNum > 0.0) {
          if (disNum < perDis) {
            bl = 1.0 - disNum / perDis;
          } else if (disNum - perDis < perDis) {
            bl = 1.0 - abs(1.0 - disNum / perDis);
          }
          material.alpha = pow(bl, gradient);
        }
      }
    }
  }
  return material;
}`;
Cesium.Material._materialCache.addMaterial(Cesium.Material.CircleWaveMaterialType, {
  fabric: {
    type: Cesium.Material.CircleWaveMaterialType,
    uniforms: {
      color: Cesium.Color.RED,
      time: 0,
      count: 1,
      gradient: 0.1,
    },
    source: Cesium.Material.CircleWaveSource,
  },
  translucent: () => true,
});

export class CircleWave {
  constructor(viewer, modelEntity, id = Cesium.createGuid()) {
    this.viewer = viewer;
    this.modelEntity = modelEntity;
    this.id = id;
    this.entity = null;
  }

  /**
   * 添加波纹效果
   * @param {Object} options - 配置项
   * @param {String} options.color - 波纹颜色（CSS字符串）
   * @param {Number} options.maxRadius - 最大半径（米）
   * @param {Number} options.duration - 扩散周期（ms）
   * @param {Number} options.count - 同时存在的波纹数
   */
  add({ color = '#00ffff', maxRadius = 2000, duration = 3000, count = 3 } = {}) {
    const _this = this;

    this.entity = this.viewer.entities.add({
      id: this.id,
      position: new Cesium.CallbackProperty(function () {
        return _this.modelEntity?.position?.getValue(_this.viewer.clock.currentTime);
      }, false),
      ellipse: {
        semiMinorAxis: new Cesium.CallbackProperty(() => maxRadius, false),
        semiMajorAxis: new Cesium.CallbackProperty(() => maxRadius, false),
        material: new CircleWaveMaterialProperty({
          duration,
          gradient: 0.5,
          color: Cesium.Color.fromCssColorString(color),
          count
        }),
        height: 0,
        heightReference: Cesium.HeightReference.NONE
      }
    });
  }

  changeDuration(newDuration) {
    if (this.entity?.ellipse?.material) {
      this.entity.ellipse.material.duration = newDuration;
    }
  }

  changeWaveCount(newCount) {
    if (this.entity?.ellipse?.material) {
      this.entity.ellipse.material.count = newCount;
    }
  }

  destroy() {
    if (this.entity) {
      this.viewer.entities.remove(this.entity);
      this.entity = null;
    }
  }
}

// import { CircleWave } from './CircleWave';

// const waveEffect = new CircleWave(viewer, yourModelEntity);
// waveEffect.add({
//   color: '#00ffff',
//   maxRadius: 3000,
//   duration: 4000,
//   count: 4
// });

// // 可选动态控制
// waveEffect.changeDuration(6000);
// waveEffect.changeWaveCount(5);

// // 删除波纹
// // waveEffect.destroy();