<template>
  <div id="home" class="home" ref="home">
    <Top></Top>
    <Left v-show="!$store.state.setWpBol"></Left>
    <Right v-show="!$store.state.setWpBol"></Right>
    <Set
      v-if="$store.state.setWpBol"
      @lampSw="lampSw($event)"
      @screenSw="screenSw($event)"
      @back="back()"
    ></Set>
    <Btm v-show="!$store.state.setWpBol"></Btm>
    <div class="css-render"></div>
  </div>
</template>
<script>
import * as THREE from "three";
import gsap from "gsap";
import scene from "../three/scene";
import camera from "../three/camera";
import axesHelper from "../three/axesHelper";
import renderer from "../three/renderer";
import css3dRender from "../three/css3dRenderer";
import controls from "../three/controls";
import raycaster from "../three/raycaster";
import Map from "../three/setModel/map";
import Car from "../three/setModel/car";
import StreetLamp from "../three/setModel/streetLamp";
import {streetLampList2} from "../three/setModel/streetLampList";
import Light from "../three/setModel/light";
import Arrows from "../three/setModel/arrows";
import Tag from "../three/setModel/tag";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import * as dat from "dat.gui";
// import modifyCityMaterial from "../three/modify/modifyCityMaterial";
import countTo from "vue-count-to";
import Top from "../components/top.vue";
import Left from "../components/left.vue";
import Right from "../components/right.vue";
import Set from "../components/set.vue";
import Btm from "../components/btm.vue";
import {get,post} from '../axios/http'
export default {
  name: "Home",
  components: {
    countTo: countTo,
    Top: Top,
    Left: Left,
    Right: Right,
    Set: Set,
    Btm: Btm,
  },
  data() {
    return {
      mouse: "",
      ludengMaterial: [],
      ludengId: 0,
      cameraPos: { x: "", y: "", z: "" },
      controlsPos: { x: "", y: "", z: "" },
      points1: null,
      lampListid:[23,9,24,10,22,8,25,11,21,7],
      lampList:[]
    };
  },
  methods: {
    init() {
      scene.add(camera);
      // scene.add(axesHelper);
      document.getElementById("home").appendChild(renderer.domElement);
       document.querySelector(".css-render").appendChild(css3dRender.domElement);

      // 载入纹理
      let textureLoader = new THREE.TextureLoader();
      let texture = textureLoader.load(require("../assets/img/xh.png"));
      // ////////// 设置点材质
      let pointMaterial = new THREE.PointsMaterial({
        size: 20,
        color: 0xffffff,
        sizeAttenuation: false, //是否根据视觉衰减
        transparent: true, // 是否设置透明度
        opacity: 1, // 透明
        map: texture, //设置点材质纹理
        alphaMap: texture, //透明纹理
        depthWrite: true, //是否挡住后面的粒子
        blending: THREE.AdditiveBlending, //叠加更亮
        vertexColors: true, //启用顶点着色
      });
      function createPoints(url, size = 0.5) {
        for (let i = 0; i < 1000; i++) {
          // 创建粒子星河
          let particlesGeometry = new THREE.BufferGeometry();
          // 设置位置数组
          let positions = new Float32Array(3);
          //设置顶点颜色
          let color = new Float32Array(3);
          positions[0] = Math.random() * 1500 - 700;
          positions[1] = Math.random() * 400;
          positions[2] = Math.random() * 1500 - 750;
          // positions[0] = 0;
          // positions[1] = 200;
          // positions[2] = 0;
          color[0] = 0.5;
          color[1] = 0.5;
          color[2] = 0.5;
          particlesGeometry.setAttribute(
            "position",
            new THREE.BufferAttribute(positions, 3)
          );
          particlesGeometry.setAttribute(
            "color",
            new THREE.BufferAttribute(color, 3)
          );

          let points = new THREE.Points(particlesGeometry, pointMaterial);
          scene.add(points);
          let num = Math.random() * 10 + 10;
          // gsap.to(points.position, {
          //   y: -100,
          //   duration: 2,
          //   repeat: -1,
          // });
          setInterval(() => {
            if (points.position.y <= 0) {
              points.position.y = 0;
              setTimeout(() => {
                points.position.y = Math.random() * 200;
              }, 2000);
            } else {
              points.position.y -= 5;
            }
          }, 100);
        }
      }
      // createPoints();
      // const points2 = createPoints("xh", 1);
      Map();
      Car();
      Arrows();
      const loading = this.$loading({
        lock: true,
        text: "加载中",
        spinner: "el-icon-loading",
        background: "rgba(0, 0, 0, 0.7)",
      });
     
      let ludengMaterialTime = setInterval(() => {
        if (scene.children.length >= 29) {
          let aarr = scene.children.filter((item) => {
            return item.name == "ludeng";
          });
          console.log(aarr);
          if (aarr.length!=0) {
            aarr[0].children.forEach((Item, index) => {
            this.ludengMaterial.push(Item.material.color.getHex());
          });
          }
          loading.close();
          clearInterval(ludengMaterialTime);
        }
      }, 100);
      this.mousemove();
      this.click();
      this.render();
      this.resize();
    },
    // 鼠标移动事件
    mousemove() {
      this.mouse = new THREE.Vector2();
      let _this = this;
      // 鼠标移动事件
      window.addEventListener("mousemove", () => {
        _this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        _this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        // 根据摄像头和鼠标位置更新射线
        raycaster.setFromCamera(_this.mouse, camera);
        // 检查与鼠标交汇的一组物体
        //intersectObject个体intersectObjects数组
        let arr = scene.children.filter((item) => {
          return item.name == "ludeng";
        });
        let result = raycaster.intersectObjects(arr);
        // // console.log(result);
        // 设置材质
        if (result[0]) {
          // if (result[0].object.name == "ludeng") {
          //   result[0].object.material = ludengMaterial;
          // } else
          if (
            result[0].object.parent.name == "ludeng" &&
            _this.$store.state.setWpBol == false
          ) {
            scene.children.forEach((item) => {
              if (item.name == "ludeng" && item.number ==result[0].object.parent.number) {
                  _this.$store.state.SelectedLight=item.deviceId}
              if (item.name == "arrows") {
                item.visible = true;
                item.position.x = result[0].object.parent.position.x;
                // item.position.y = result[0].object.parent.position.y + 50;
                item.position.z = result[0].object.parent.position.z;
              }
            });
          }
        } else {
          scene.children.forEach((item) => {
            if (item.name == "arrows") {
              item.visible = false;
            }
          });
        }
      });
    },
    // 鼠标点击事件
    click() {
      this.mouse = new THREE.Vector2();
      let _this = this;
      window.addEventListener("click", function (event) {
        // console.log(scene.children.length);
        // 停止控制器转动
        if (controls.autoRotate) {
          controls.autoRotate = false;
          setTimeout(() => {
            if (_this.$store.state.setWpBol == false) {
              controls.autoRotate = true;
            }
          }, 5000);
        }
        //将鼠标点击位置的屏幕坐标转换成threejs中的标准坐标
        _this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        _this.mouse.y = -((event.clientY / window.innerHeight) * 2 - 1);
        //console.log("mouse:"+mouse.x+","+mouse.y)
        // 通过鼠标点的位置和当前相机的矩阵计算出raycaster
        raycaster.setFromCamera(_this.mouse, camera);
        // 获取raycaster直线和所有模型相交的数组集合
        var result = raycaster.intersectObjects(scene.children);
        if (result.length > 0) {
          //判断点击模型不为空
          if (result[0]) {
            if (
              result[0].object.parent.name == "ludeng" &&
              _this.$store.state.setWpBol == false
            ) {
              controls.autoRotate = false;
              _this.$store.state.setWpBol = true;
              const obj = result[0].object.parent;
              const pos = result[0].object.parent.position;
              const rot = result[0].object.parent.rotation;
              _this.ludengId = result[0].object.parent.number;
              // camera.position.add(direction);
              // console.log(new TWEEN.Tween(controls.target));
              // new TWEEN.Tween(controls.target).to(pos).start();
              // console.log(scene);
              // 获取当前控制器位置
              _this.controlsPos.x = controls.target.x;
              _this.controlsPos.y = controls.target.y;
              _this.controlsPos.z = controls.target.z;
              // 获取当前相机位置
               if (_this.ludengId%3==0) {
                  _this.$store.state.policeOff = true
                }else{
                  _this.$store.state.policeOff = false
                }
              scene.children.forEach((item) => {
                // console.log(item);
                if (item.type == "PerspectiveCamera") {
                  _this.cameraPos.x = item.position.x;
                  _this.cameraPos.y = item.position.y;
                  _this.cameraPos.z = item.position.z;
                }
                if (
                  item != obj &&
                  item.type != "PerspectiveCamera" &&
                  item.type != "AmbientLight" &&
                  item.type != "DirectionalLight" &&
                  item.type != "AxesHelper" &&
                  item.name != "car1" &&
                  item.type != "SpotLight"
                ) {
                  item.visible = false;
                }
                if (item.name == "light" && item.number == _this.ludengId) {
                  _this.$store.state.lampOnOff = item.visible ? "开" : "关";
                }
                if (item.name == "ludeng" && item.number == _this.ludengId) {
                  _this.$store.state.deviceId=item.deviceId
                  item.children.forEach((Item) => {
                    if (Item.name == "LED") {
                      // console.log(Item);
                      if (Item.material.map) {
                        _this.$store.state.screenOnOff = "开";
                      } else {
                        _this.$store.state.screenOnOff = "关";
                      }
                    }
                  });
                }
              });

              gsap.to(controls.target, { x: pos.x, duration: 1 });
              gsap.to(controls.target, { y: pos.y, duration: 1 });
              gsap.to(controls.target, { z: pos.z, duration: 1 });
              gsap.to(camera.position, { x: pos.x, duration: 1 });
              gsap.to(camera.position, { y: pos.y + 30, duration: 1 });
              gsap.to(camera.position, { z: pos.z + 70, duration: 1 });
              // console.log(camera);
              gsap.to(camera.rotation, { x: rot.x, duration: 1 });
              gsap.to(camera.rotation, { y: rot.y, duration: 1 });
              gsap.to(camera.rotation, { z: rot.z, duration: 1 });
              let gltfLoader = new GLTFLoader();
              // gltfLoader.load("/model/car004.gltf", (car) => {
              //   car.scene.name = "car1";
              //   car.scene.position.set(pos.x - 15, pos.y - 20, pos.z - 240);
              //   car.scene.rotation.set(rot.x, rot.y, rot.z);
              //   car.scene.scale.set(0.08, 0.08, 0.08);
              //   // console.log(car);
              //   scene.add(car.scene);
              //   gsap.to(car.scene.position, {
              //     z: "+=" + 215,
              //     // 完成时间
              //     duration: 1.5,
              //     // 重复次数 无限次就是-1
              //     repeat: 0,
              //     // 运动速度
              //     ease: "power1.inOut",
              //   });
              // });

              // console.log(obj);
              // var direction = new THREE.Vector3();
              // camera.getWorldDirection(direction);
              // console.log(direction, direction.multiplyScalar(20));
              // gsap.to(obj.position, {
              //   x: camera.position.x + direction.x * 12,
              //   duration: 1,
              // });
              // gsap.to(obj.position, {
              //   y: camera.position.y + direction.y * 12,
              //   duration: 1,
              // });
              // gsap.to(obj.position, {
              //   z: camera.position.z + direction.z * 12,
              //   duration: 1,
              // });

              // gsap.to(obj.rotation, { x: camera.rotation.x, duration: 1 });
              // gsap.to(obj.rotation, { y: camera.rotation.y, duration: 1 });
              // gsap.to(obj.rotation, { z: camera.rotation.z, duration: 1 });

              // console.log(clicklamp);
              // console.log(scene.children);
              // scene.children.forEach((item) => {
              //   if (item.number == clicklamp.number + "spotlight") {
              //     item.visible = !item.visible; //单个路灯开关灯
              //   }
              // });
            }
          }
        }
      });
    },
    // 点击路灯开关
    lampSw(value) {
      scene.children.forEach((item) => {
        if (item.name == "light" && item.number == this.ludengId) {
          item.visible = value == "开" ? true : false;
          console.log(item);
        }
      });
    },
    // 点击显示屏开关
    screenSw(value) {
      scene.children.forEach((item) => {
        if (item.name == "ludeng" && item.number == this.ludengId) {
          item.children.forEach((Item) => {
            if (Item.name == "LED") {
              if (value == "开") {
                //创建显示器贴图
                let video = document.createElement("video");
                // console.log(video);
                video.src = "/texture/15s.mp4"; // 设置视频地址
                video.autoplay = "autoplay"; //要设置播放
                video.loop = "loop"; //循环播放
                video.muted = true;
                // video.muted='muted';
                // video对象作为VideoTexture参数创建纹理对象
                var texture = new THREE.VideoTexture(video);
                // texture.needsUpdate = true;
                texture.center.set(0.5, 0.5);
                texture.rotation = Math.PI / 1;
                let ludengcaizhi = new THREE.MeshPhongMaterial({
                  map: texture,
                  side: THREE.DoubleSide,
                });
                Item.material = ludengcaizhi;
              } else {
                let ludengcaizhi = new THREE.MeshPhongMaterial({
                  // map: textureloaders,
                  color: "#fff",
                  side: THREE.DoubleSide,
                });
                Item.material = ludengcaizhi;
              }
            }
          });
        }
      });
    },

    // 不断渲染
    render() {
      // this.points1.position.y -= 1;
      // if (this.points1.position.y < 0) {
      //   this.points1.position.y = 200;
      // }
      controls.update();
      renderer.render(scene, camera);
         css3dRender.render(scene, camera);
      // 不断渲染
      requestAnimationFrame(this.render);
    },
    // 画面变化
    resize() {
      // 监听画面变化,更新渲染画面
      window.addEventListener("resize", () => {
        // console.log("画面变化了");
        // 更新摄像头
        camera.aspect = window.innerWidth / window.innerHeight;
        // 更新摄像机投影矩阵
        camera.updateProjectionMatrix();
        // 更新渲染器
        renderer.setSize(window.innerWidth, window.innerHeight);
        // 设置渲染器像素比
        renderer.setPixelRatio(window.devicePixelRatio);
        css3dRender.setSize(window.innerWidth, window.innerHeight);
      });
    },
      // 点击设置框返回
    back() {
      // controls.autoRotate = true;
      gsap.to(controls.target, { x: this.controlsPos.x, duration: 1 });
      gsap.to(controls.target, { y: this.controlsPos.x, duration: 1 });
      gsap.to(controls.target, { z: this.controlsPos.y, duration: 1 });
      gsap.to(camera.position, { x: this.cameraPos.x, duration: 1 });
      gsap.to(camera.position, { y: this.cameraPos.y, duration: 1 });
      gsap.to(camera.position, { z: this.cameraPos.z, duration: 1 });
      scene.children.forEach((item) => {
        if (
          item.name != "car1" &&
          item.name != "light" &&
          item.name != "cube"
        ) {
          item.visible = true;
        } else if (item.name == "car1") {
          item.visible = false;
        }
      });
    },
    login(){
      this.axios({
      method: "post",
      url: "http://10.0.3.169:8630/authorize/login",
      headers: {
        "Content-Type": "application/json",
        // Cookie: "JSESSIONID=dcc1ef0b-8d65-458f-a1cc-36e45b3b875e",
      },
      data: {
        expires: 3600000,
        password: "admin",
        tokenType: "default",
        username: "admin",
        verifyCode: "",
        verifyKey: "",
      },
    }).then((res) => {
      console.log(res);
      localStorage.setItem('Token',res.result.token)
      this.axios({
         method: 'post',
            url: 'http://10.0.3.169:8630/lamp-post/_query',
            data: {
                "pageIndex": 0,
                "pageSize": 20,
            },
            headers: {
                'Content-Type': 'application/json',
                'X-Access-Token': res.result.token,
            },
      }).then(ress=>{
        console.log(ress,1111111111111);
        this.$store.state.ludengNum=ress.result.total
        ress.result.data.forEach((item)=>{
          if (item.hangingDeviceId) {
            this.$store.state.hangingDeviceId.push({
              key:item.id,
              value:item.hangingDeviceId
            })
          }
        })
        console.log(this.$store.state.hangingDeviceId);
      //  let quantity=res.result.data.length
       for (let i = 0; i < ress.result.data.length; i++) {
        streetLampList2.forEach((item)=>{
          if (this.lampListid[i]==item.id) {
            item.deviceId=ress.result.data[i].id,
            item.lampPostNo=ress.result.data[i].lampPostNo
                StreetLamp(
                  item.name,
                  item.id,
                  item.positionX,
                  item.positionY,
                  item.positionZ,
                  item.deviceId,
                  item.lampPostNo
                );
                Light(item.id, item.positionX, item.positionY, item.positionZ);
                Tag(item.lampPostNo, item.positionX, item.positionY, item.positionZ);
          }
        })
       }
      })
    });
  },
  },
  mounted() {
    this.init();
    // this.lampList()
  },
  created(){
    this.login()
    // get('/api/play/start/34020000002000000001/34020000001320000002').then(res=>{
    //   console.log(res);
    // })
  }
};
</script>

<style scoped>
.home {
  width: 100%;
  height: 100vh;
  position: absolute;
}
.spotLightOFF {
  width: 100px;
  height: 100px;
  position: relative;
  top: 10px;
  left: 10px;
  z-index: 99;
}

.set-wp {
  width: 100%;
  height: 100vh;
  background: rgba(0, 0, 0, 0.16);
  position: relative;
  z-index: 100;
}
.back {
  position: absolute;
  left: 60px;
  top: 60px;
}
.info {
  width: 450px;
  /* height: 400px; */
  background: url(../assets/img/info-bg.png) 0 0 no-repeat;
  background-size: 100% 100%;
  position: absolute;
  left: calc(50% - 225px);
  top: 25%;
  /* transform: translateY(-50%) !important; */
  padding: 20px;
  box-sizing: border-box;
}
.info > img {
  width: 20px;
  height: 20px;
  position: absolute;
  right: 20px;
}
.info h2 {
  text-align: center;
  color: #fff;
}
.info > div {
  margin-top: 20px;
  display: flex;
  font-size: 20px;
}
.info > div > div:nth-child(1) {
  width: 60%;
  color: rgb(9, 157, 205);
}
.info > div > div:nth-child(2) {
  color: red;
}
.b-left,
.b-right,
.c-left,
.c-right {
  position: absolute;
  box-shadow: 0px 0px 10px 3px #1361a7;
}
.b-left {
  border-top: 3px #1361a7 solid;
  width: 20%;
  bottom: 20%;
  right: 50.7%;
}
.b-right {
  border-top: 3px #1361a7 solid;
  width: 20%;
  bottom: 20%;
  left: 50.7%;
}
.animation-wp1,
.animation-wp2 {
  width: 50%;
  height: 100vh;
  position: fixed;
  z-index: -1;
}
.animation-wp2 {
  right: 0;
}
.c-left {
  border-right: 3px #1361a7 solid;
  height: 80%;
  left: 67.5%;
  bottom: 7%;
  transform: rotate(20deg);
}
.c-left > div {
  position: absolute;
  width: 60px;
  border-top: 3px #1361a7 solid;
  transform: rotate(-20deg);
  left: -58px;
  box-shadow: 0px 0px 10px 3px #1361a7;
}
.c-left > div:nth-child(1) {
  top: 10px;
}
.c-left > div:nth-child(2) {
  top: 26.5%;
}
.c-left > div:nth-child(3) {
  top: 51.5%;
}
.c-left > div:nth-child(4) {
  top: 76.5%;
}
.c-left > div:nth-child(5) {
  top: 101.5%;
}
.c-left > div > img:nth-child(1) {
  position: absolute;
  width: 35px;
  height: 35px;
  right: 73px;
  bottom: 10px;
  z-index: 9;
  animation: bounce 2s infinite alternate;
}
.c-left > div > img:nth-child(2) {
  position: absolute;
  width: 60px;
  height: 60px;
  right: 60px;
  bottom: -30px;
}
.c-left > div > div {
  position: absolute;
  width: 200px;
  height: 60px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: flex-end;
  right: 130px;
  bottom: -10px;
}
.c-left > div > div > h2 {
  font-size: 18px;
  color: #fff;
  padding-bottom: 5px;
  border-bottom: 3px #1361a7 solid;
}
.c-right {
  border-right: 3px #1361a7 solid;
  height: 80%;
  right: 67.5%;
  bottom: 7%;
  transform: rotate(-20deg);
}
.c-right > div {
  position: absolute;
  width: 60px;
  border-top: 3px #1361a7 solid;
  transform: rotate(20deg);
  right: -59px;
  box-shadow: 0px 0px 10px 3px #1361a7;
}

.c-right > div:nth-child(1) {
  top: 10px;
}
.c-right > div:nth-child(2) {
  top: 26.5%;
}
.c-right > div:nth-child(3) {
  top: 51.5%;
}
.c-right > div:nth-child(4) {
  top: 76.5%;
}
.c-right > div:nth-child(5) {
  top: 101.5%;
}
.c-right > div > img:nth-child(1) {
  position: absolute;
  width: 35px;
  height: 35px;
  right: -45px;
  bottom: 20px;
  z-index: 9;
  animation: bounce 2s infinite alternate;
}
.c-right > div > img:nth-child(2) {
  position: absolute;
  width: 60px;
  height: 60px;
  left: 60px;
  bottom: -20px;
}
.c-right > div > div {
  position: absolute;
  width: 200px;
  height: 60px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: flex-start;
  left: 130px;
  bottom: -10px;
}
.c-right > div > div > h2 {
  font-size: 18px;
  color: #fff;
  padding-bottom: 5px;
  border-bottom: 3px #1361a7 solid;
}
@keyframes bounce {
  from {
    transform: translateY(0px);
  }
  to {
    transform: translateY(10px);
  }
}
@keyframes Ami {
  0% {
    transform: scale(0);
  }
  20% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.5);
  }
  100% {
    transform: scale(1);
  }
}
.css-render {
  display: flex;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 100;
  pointer-events: none;
}
</style>
<style>
.home .el-radio-button__inner {
  padding: 6px 10px;
  background: 0;
}
</style>
