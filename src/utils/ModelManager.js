import * as Cesium from 'cesium';
import { createFlowingTextBetweenModels } from './createFlowingTextBetweenModels';
import { addCustomEntityModel } from './addCustomEntityModel';
import { createSignalWaveCone } from './createDynamicSignalCone';
import { createUpwardSignalDome } from './createUpwardSignalWave';
import { startModelMoverToFixedTarget } from './startModelMoverToFixedTarget';
import { createSignalWaveConeWithTarget } from './createSignalWaveConeWithTarget'; // 引入新的方法
import { CircleWave } from './CircleWave';

class ModelManager {
    constructor(viewer) {
        this.viewer = viewer;
        this.entities = new Map();
        this.links = new Map();
        this.timer = null;
        this.signalCones = new Map();
        this.signalDomes = new Map();
        this.circleWaves = new Map();
        this.signalWaveConesWithTarget = new Map();  // 新增一个Map来管理带目标的信号波锥
    }

    // 全局重置方法：清除所有模型和特效
    reset() {
        this.stopAutoUpdate();
        this.clearAll();
        console.log('[ModelManager] 所有模型与特效已重置');
    }

    _makeLinkKey(id1, id2) {
        const [a, b] = [String(id1), String(id2)].sort();
        return `${a}-${b}`;
    }

    add(config) {
        const entity = addCustomEntityModel(this.viewer, config);
        if (entity) {
            this.entities.set(config.id, entity);
        }
        return entity;
    }

    getProperties(id) {
        const entity = this.entities.get(id);
        if (!entity) {
            console.warn(`[ModelManager] 未找到实体 ${id}`);
            return null;
        }
        const props = {};
        if (entity.properties) {
            entity.properties.propertyNames.forEach(name => {
                props[name] = entity.properties[name]?.getValue?.(this.viewer.clock.currentTime);
            });
        }
        return props;
    }

    getEntityById(id) {
        return this.entities.get(id) || null;
    }

    getAllEntities() {
        return Array.from(this.entities.values());
    }

    getAllEntityIds() {
        return Array.from(this.entities.keys());
    }

    updateProperty(id, key, value) {
        const entity = this.entities.get(id);
        if (!entity) {
            console.warn(`[ModelManager] 更新失败，未找到实体 ${id}`);
            return;
        }

        if (!entity.properties) {
            entity.properties = new Cesium.PropertyBag({});
        }

        if (Cesium.defined(entity.properties[key])) {
            entity.properties[key].setValue(value);
        } else {
            entity.properties.addProperty(key);
            entity.properties[key] = new Cesium.ConstantProperty(value);
        }
    }

    remove(id) {
        const entity = this.entities.get(id);
        if (entity) {
            this.viewer.entities.remove(entity);
            this.entities.delete(id);
        }

        this.disconnectAllFor(id);
        this.removeSignalCone(id);
        this.removeUpwardDome(id);
        this.removeCircleWave(id);
        this.removeSignalWaveConeWithTarget(id); // 调用删除带目标信号波锥的方法
    }

    clearAll() {
        this.entities.forEach(e => this.viewer.entities.remove(e));
        this.links.forEach(link => link.destroy?.());
        this.entities.clear();
        this.links.clear();
        this.signalCones.forEach(cone => cone.destroy?.());
        this.signalCones.clear();
        this.signalDomes.forEach(dome => dome.destroy?.());
        this.signalDomes.clear();
        this.circleWaves.forEach(wave => wave.destroy?.());
        this.circleWaves.clear();
        this.signalWaveConesWithTarget.forEach(cone => cone.destroy?.()); // 清理带目标信号波锥
        this.signalWaveConesWithTarget.clear(); // 清空Map
    }

    connect(startId, endIds, options = {}) {
        const modelA = this.entities.get(startId);
        if (!modelA) {
            console.warn(`[ModelManager] 链接失败：起点模型 ${startId} 不存在`);
            return;
        }

        const endIdList = Array.isArray(endIds) ? endIds : [endIds];
        for (const endId of endIdList) {
            const modelB = this.entities.get(endId);
            if (!modelB) {
                console.warn(`[ModelManager] 链接失败：终点模型 ${endId} 不存在`);
                continue;
            }

            const key = this._makeLinkKey(startId, endId);
            if (this.links.has(key)) {
                console.warn(`[ModelManager] 已存在链接 ${key}`);
                continue;
            }

            const lineEntity = createFlowingTextBetweenModels(this.viewer, modelA, modelB, options);
            if (lineEntity) {
                this.links.set(key, lineEntity);
            }
        }
    }

    removeLink(id1, id2) {
        const key = this._makeLinkKey(id1, id2);
        this.removeLinkByKey(key);
    }

    removeLinkByKey(key) {
        const link = this.links.get(key);
        if (link && typeof link.destroy === 'function') {
            link.destroy();
        }
        this.links.delete(key);
    }

    disconnectAllFor(id) {
        const toRemove = [];
        this.links.forEach((_, key) => {
            const [a, b] = key.split('-');
            if (a === String(id) || b === String(id)) {
                toRemove.push(key);
            }
        });
        toRemove.forEach(key => {
            this.removeLinkByKey(key);
            console.log(`[ModelManager] 已移除与模型 ${id} 相关的连线: ${key}`);
        });
    }

    updateHealthColors() {
        this.entities.forEach(entity => {
            const status = entity.properties?.healthStatus?.getValue() || '未知';
            let color = Cesium.Color.WHITE;
            switch (status) {
                case '正常': color = Cesium.Color.GREEN; break;
                case '异常': color = Cesium.Color.YELLOW; break;
                case '离线': color = Cesium.Color.RED; break;
            }
            if (entity.model) {
                entity.model.color = new Cesium.ConstantProperty(color);
            }
        });
    }

    simulateMovement() {
        this.entities.forEach(entity => {
            const speed = entity.properties?.speed?.getValue();
            if (speed > 0 && entity.position) {
                const pos = entity.position.getValue(this.viewer.clock.currentTime);
                if (pos) {
                    const cartographic = Cesium.Cartographic.fromCartesian(pos);
                    cartographic.longitude += Cesium.Math.toRadians(0.00001 * speed);
                    const newPos = Cesium.Cartesian3.fromRadians(
                        cartographic.longitude,
                        cartographic.latitude,
                        cartographic.height
                    );
                    entity.position = new Cesium.ConstantPositionProperty(newPos);
                }
            }
        });
    }

    startAutoUpdate(intervalMs = 1000) {
        this.stopAutoUpdate();
        this.timer = setInterval(() => {
            this.updateHealthColors();
            this.simulateMovement();
        }, intervalMs);
    }

    stopAutoUpdate() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }

    addSignalCone(id, options = {}) {
        const entity = this.entities.get(id);
        if (!entity) {
            console.warn(`[ModelManager] addSignalCone: 实体 ${id} 不存在`);
            return;
        }
        this.removeSignalCone(id);
        const coneObj = createSignalWaveCone(this.viewer, entity, options);
        if (coneObj) {
            this.signalCones.set(id, coneObj);
        }
    }

    removeSignalCone(id) {
        const coneObj = this.signalCones.get(id);
        if (coneObj && typeof coneObj.destroy === 'function') {
            coneObj.destroy();
        }
        this.signalCones.delete(id);
    }

    addUpwardDome(id, options = {}) {
        const entity = this.entities.get(id);
        if (!entity) {
            console.warn(`[ModelManager] addUpwardDome: 实体 ${id} 不存在`);
            return;
        }
        this.removeUpwardDome(id);
        const domeObj = createUpwardSignalDome(this.viewer, entity, options);
        if (domeObj) {
            this.signalDomes.set(id, domeObj);
        }
    }

    removeUpwardDome(id) {
        const domeObj = this.signalDomes.get(id);
        if (domeObj && typeof domeObj.destroy === 'function') {
            domeObj.destroy();
        }
        this.signalDomes.delete(id);
    }

    addCircleWave(id, options = {}) {
        const entity = this.entities.get(id);
        if (!entity) {
            console.warn(`[ModelManager] addCircleWave: 实体 ${id} 不存在`);
            return;
        }
        this.removeCircleWave(id);
        const wave = new CircleWave(this.viewer, entity, `circle-wave-${id}`);
        wave.add(options);
        this.circleWaves.set(id, wave);
    }

    removeCircleWave(id) {
        const wave = this.circleWaves.get(id);
        if (wave) wave.destroy();
        this.circleWaves.delete(id);
    }

    startEntityFollow(id, targetPositionRef, intervalMs = 1000) {
        const entity = this.entities.get(id);
        if (!entity) {
            console.warn(`[ModelManager] startEntityFollow: 实体 ${id} 不存在`);
            return;
        }
        startModelMoverToFixedTarget(this.viewer, entity, targetPositionRef, intervalMs);
    }
    /**
 * ✅ 新增方法：添加“信号波锥（带目标）”
 */
    addSignalWaveConeWithTarget(sourceId, targetId, options = {}) {
        const sourceEntity = this.entities.get(sourceId);
        const targetEntity = this.entities.get(targetId);
        if (!sourceEntity || !targetEntity) {
            console.warn(`[ModelManager] addSignalWaveConeWithTarget: 模型 ${sourceId} 或 ${targetId} 不存在`);
            return;
        }
        this.removeSignalWaveConeWithTarget(sourceId); // 先删除旧的
        const obj = createSignalWaveConeWithTarget(this.viewer, sourceEntity, targetEntity, options);
        if (obj) {
            this.signalWaveConesWithTarget.set(sourceId, obj);
        }
    }

    /**
     * ✅ 新增方法：删除“信号波锥（带目标）”
     */
    removeSignalWaveConeWithTarget(sourceId) {
        const coneObj = this.signalWaveConesWithTarget.get(sourceId);
        if (coneObj && typeof coneObj.destroy === 'function') {
            coneObj.destroy();
        }
        this.signalWaveConesWithTarget.delete(sourceId);
    }
}

export default ModelManager;



// const manager = new ModelManager(viewer);

// // 添加多个实体
// entityList.forEach(cfg => manager.add(cfg));


// modelManager.updateProperty('A001', 'healthStatus', '异常');
// modelManager.updateProperty('A001', 'speed', 20);

// const props = modelManager.getProperties('A001');
// console.log('模型 A001 的属性：', props);


// // 连接两个实体
// manager.connect('entity-1001', 'entity-1002', {
//   text: '0101->',
//   color: Cesium.Color.CYAN,
//   speed: 30000
// });

// // 启动自动更新
// manager.startAutoUpdate(1000);

// manager.removeLink('entityA-id', 'entityB-id');

//添加锥体
// manager.addSignalCone('entity-1001', {
//   height: 8000,
//   bottomRadius: 3000,
//   color: Cesium.Color.CYAN,
//   ringCount: 6,
//   ringSpeed: 5000
// });

// // 移除锥体
// manager.removeSignalCone('entity-1001');

//添加半球
// manager.addUpwardDome('entity-2001', {
//   radius: 5000,
//   height: 2500,
//   color: Cesium.Color.YELLOW.withAlpha(0.8),
//   ringCount: 6,
//   ringSpeed: 6000
// });

// // 移除
// manager.removeUpwardDome('entity-2001');

// 模型移动
// manager.startEntityFollow('drone-1', targetRef, 1000);
