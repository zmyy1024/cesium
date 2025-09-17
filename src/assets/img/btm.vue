<template>
  <div class="buttom">
    <div class="lightSwitch" @click="spotLightswitch">开启灯光</div>
    <div class="videoSwitch" @click="videoswitch">开启显示屏</div>
  </div>
</template>
<script>
import scene from "../three/scene";
import * as THREE from "three";
export default {
  name: "buttom",
  data() {
    return {};
  },
  methods: {
    spotLightswitch(e) {
      console.log(e);
      if (e.target.innerText == "开启灯光") {
        const loading = this.$loading({
          lock: true,
          text:  "开启灯光中",
          spinner: "el-icon-loading",
          background: "rgba(0, 0, 0, 0.7)",
        });
        setTimeout(() => {
          loading.close();
          e.target.innerText = "关闭灯光";
          scene.children.forEach((item, index) => {
            if (item.name == "light") {
              item.visible = true;
            }
          });
        }, 2000);
      } else {
        const loading = this.$loading({
          lock: true,
          text: "关闭灯光中",
          spinner: "el-icon-loading",
          background: "rgba(0, 0, 0, 0.7)",
        });
        setTimeout(() => {
          loading.close();
          e.target.innerText = "开启灯光";
          scene.children.forEach((item, index) => {
            if (item.name == "light") {
              item.visible = false;
            }
          });
        }, 2000);
      }
    },
    videoswitch(e) {
      //创建显示器贴图
      let video = document.createElement("video");
      // console.log(video);
      video.src = "/texture/15s.mp4"; // 设置显示屏地址
      video.autoplay = "autoplay"; //要设置播放
      video.loop = "loop"; //循环播放
      video.muted = true;
      // video对象作为VideoTexture参数创建纹理对象
      var texture = new THREE.VideoTexture(video);
      // texture.needsUpdate = true;
      texture.center.set(0.5, 0.5);
      texture.rotation = Math.PI / 1;
      if (e.target.innerText == "开启显示屏") {
        const loading = this.$loading({
          lock: true,
          text: "开启显示屏中",
          spinner: "el-icon-loading",
          background: "rgba(0, 0, 0, 0.7)",
        });
        setTimeout(() => {
          loading.close();
          e.target.innerText = "关闭显示屏";
          scene.children.forEach((item, index) => {
            if (item.name == "ludeng") {
              item.children.forEach((items) => {
                if (items.name == "LED") {
                  let ludengcaizhi = new THREE.MeshPhongMaterial({
                    map: texture,
                    side: THREE.DoubleSide,
                  });
                  items.material = ludengcaizhi;
                }
              });
            }
          });
        }, 2000);
      } else {
        const loading = this.$loading({
          lock: true,
          text:  "关闭显示屏中",
          spinner: "el-icon-loading",
          background: "rgba(0, 0, 0, 0.7)",
        });
        setTimeout(() => {
          loading.close();
          e.target.innerText = "开启显示屏";
          scene.children.forEach((item, index) => {
            if (item.name == "ludeng") {
              item.children.forEach((items) => {
                if (items.name == "LED") {
                  let ludengcaizhi = new THREE.MeshPhongMaterial({
                    // map: textureloaders,
                    color: "#fff",
                    side: THREE.DoubleSide,
                  });
                  items.material = ludengcaizhi;
                }
              });
            }
          });
        }, 2000);
      }
    },
  },
};
</script>

<style scoped>
.buttom {
  position: absolute;
  z-index: 100;
  left: 40vw;
  top: 90%;
  width: 20vw;
  height: 10%;
  display: flex;
  justify-content: space-between;
}
.lightSwitch,
.videoSwitch {
  width: 150px;
  height: 50px;
  background: url(../assets/img/switch.png) 0 0 no-repeat;
  background-size: 150px 50px;
  text-align: center;
  line-height: 50px;
  color: #fff;
  cursor: pointer;
  animation: bounce 2s infinite alternate;
}

@keyframes bounce {
  from {
    transform: translateY(0px);
  }
  to {
    transform: translateY(10px);
  }
}
</style>
