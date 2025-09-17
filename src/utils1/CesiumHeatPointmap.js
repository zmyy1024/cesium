// ✅ Cesium 点阵热力图封装类：支持二维/三维坐标数据热力渲染，支持 RGB 映射和固定像素点大小，并自动贴合地形高度
import * as Cesium from 'cesium';

export default class CesiumHeatPointmap {
  constructor(viewer, options = {}) {
    this.viewer = viewer;
    this.maxValue = options.maxValue || 100;
    this.pixelSizeRange = options.pixelSizeRange || [10, 30];
    this.fixedPixelSize = typeof options.fixedPixelSize === 'number' ? options.fixedPixelSize : null;
    this.defaultHeight = options.defaultHeight || 0;
    this.pointSizeKey = options.pointSizeKey || null;
    this.colorKey = options.colorKey || null;
    this.colorStops = Array.isArray(options.colorStops) ? options.colorStops : null;
    this.pointCollection = viewer.scene.primitives.add(
      new Cesium.PointPrimitiveCollection({
        blendOption: Cesium.BlendOption.ONE // 修改为 ONE，避免颜色叠加发暗
      })
    );

    if (viewer.scene.highDynamicRange) {
      viewer.scene.highDynamicRange = false;
    }
  }

  getHeatColor(value, point = {}) {
    let mappedValue = (this.colorKey && typeof point[this.colorKey] === 'number') ? point[this.colorKey] : value;
    const safeValue = isFinite(mappedValue) ? mappedValue : 0;
    const safeMax = isFinite(this.maxValue) && this.maxValue !== 0 ? this.maxValue : 1;

    if (this.colorStops) {
      for (let i = 1; i < this.colorStops.length; i++) {
        const [v1, c1] = this.colorStops[i - 1];
        const [v2, c2] = this.colorStops[i];
        if (safeValue <= v2) {
          const t = (safeValue - v1) / (v2 - v1);
          const color1 = Cesium.Color.fromCssColorString(c1);
          const color2 = Cesium.Color.fromCssColorString(c2);
          return Cesium.Color.lerp(color1, color2, t, new Cesium.Color()).withAlpha(1.0);
        }
      }
      return Cesium.Color.fromCssColorString(this.colorStops[this.colorStops.length - 1][1]).withAlpha(1.0);
    } else {
      const hue = (1 - safeValue / safeMax) * 0.1;
      return Cesium.Color.fromHsl(hue, 1.0, 0.5, 1.0);
    }
  }

  async setData(data = []) {
    if (!this.pointCollection || !this.viewer) return;
    this.pointCollection.removeAll();

    const terrainProvider = this.viewer.terrainProvider;
    const positions = data.map(p => Cesium.Cartographic.fromDegrees(p.lon, p.lat));

    try {
      const updated = await Cesium.sampleTerrainMostDetailed(terrainProvider, positions);

      updated.forEach((carto, i) => {
        const point = data[i];
        const value = typeof point.value === 'number' ? point.value : 0;
        const color = this.getHeatColor(value, point);

        let size = this.fixedPixelSize;
        if (this.pointSizeKey && typeof point[this.pointSizeKey] === 'number') {
          size = point[this.pointSizeKey];
        } else if (this.fixedPixelSize == null) {
          const safeMax = isFinite(this.maxValue) && this.maxValue !== 0 ? this.maxValue : 1;
          size = this.pixelSizeRange[0] + (value / safeMax) * (this.pixelSizeRange[1] - this.pixelSizeRange[0]);
        }

        this.pointCollection.add({
          position: Cesium.Cartesian3.fromRadians(carto.longitude, carto.latitude, carto.height + 1.5),
          color: color,
          pixelSize: size,
          disableDepthTestDistance: Number.POSITIVE_INFINITY
        });
      });
    } catch (e) {
      console.error('地形采样失败:', e);
    }
  }

  clear() {
    if (this.pointCollection) this.pointCollection.removeAll();
  }

  destroy() {
    if (this.viewer && this.pointCollection) {
      this.viewer.scene.primitives.remove(this.pointCollection);
      this.pointCollection = null;
    }
  }
}
