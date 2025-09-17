<template>
  <div class="set-wp" v-if="$store.state.setWpBol">
    <div class="animate__animated animate__fadeInRight back" @click="back()">
      <img
        src="../assets/img/back_delete.png"
        alt=""
        width="100"
        height="100"
      />
    </div>
    <div class="b-left animate__animated animate__fadeInLeft"></div>
    <div class="b-right animate__animated animate__fadeInRight"></div>
    <div class="animation-wp1 animate__animated animate__fadeInLeft">
      <div class="c-left">
        <div>
          <img src="../assets/img/1.png" alt="" />
          <img src="../assets/img/pedestal.gif" alt="" />
          <div>
            <h2>摄像头</h2>
            <el-button type="primary" size="mini" @click="bolChange(3)"
              >查看</el-button
            >
          </div>
        </div>
        <div>
          <img src="../assets/img/3.png" alt="" />
          <img src="../assets/img/pedestal.gif" alt="" />
          <div>
            <h2>气象监控设备</h2>
            <el-button type="primary" size="mini" @click="bolChange(5)"
              >查看</el-button
            >
          </div>
        </div>
        <div>
          <img src="../assets/img/5.png" alt="" />
          <img src="../assets/img/pedestal.gif" alt="" />
          <div>
            <h2>倾斜一体化设备</h2>
            <el-button type="primary" size="mini" @click="bolChange(7)"
              >查看</el-button
            >
          </div>
        </div>
        <div>
          <img src="../assets/img/7.png" alt="" />
          <img src="../assets/img/pedestal.gif" alt="" />
          <div>
            <h2>设备</h2>
            <!-- <el-button type="primary" size="mini" @click="bolChange(7)"
              >查看</el-button
            > -->
          </div>
        </div>
        <div>
          <img src="../assets/img/9.png" alt="" />
          <img src="../assets/img/pedestal.gif" alt="" />
          <div>
            <h2></h2>
            <el-button type="primary" size="mini" @click="resetting()"
              >重置</el-button
            >
          </div>
        </div>
      </div>
    </div>
    <div class="animation-wp2 animate__animated animate__fadeInRight">
      <div class="c-right">
        <div>
          <img src="../assets/img/2.png" alt="" />
          <img src="../assets/img/pedestal.gif" alt="" />
          <div>
            <h2>智能控灯</h2>
            <el-radio-group v-model="$store.state.lampOnOff" @input="lampSw">
              <el-radio-button label="开"></el-radio-button>
              <el-radio-button label="关"></el-radio-button>
            </el-radio-group>
          </div>
        </div>
        <div>
          <img src="../assets/img/4.png" alt="" />
          <img src="../assets/img/pedestal.gif" alt="" />
          <div>
            <h2>显示屏控制</h2>
            <el-radio-group
              v-model="$store.state.screenOnOff"
              @input="screenSw"
            >
              <el-radio-button label="开"></el-radio-button>
              <el-radio-button label="关"></el-radio-button>
            </el-radio-group>
          </div>
        </div>
        <div>
          <img src="../assets/img/6.png" alt="" />
          <img src="../assets/img/pedestal.gif" alt="" />
          <div>
            <h2>MEMS设备</h2>
            <el-button type="primary" size="mini" @click="bolChange6"
              >查看</el-button
            >
          </div>
        </div>
        <div>
          <img src="../assets/img/8.png" alt="" />
          <img src="../assets/img/pedestal.gif" alt="" />
          <div>
            <h2>设备</h2>
            <!-- <el-button type="primary" size="mini" @click="bolChange(8)"
              >查看</el-button -->
            >
          </div>
        </div>
        <div>
          <img src="../assets/img/10.png" alt="" />
          <img src="../assets/img/pedestal.gif" alt="" />
          <div>
            <h2>设备</h2>
          </div>
        </div>
      </div>
    </div>
    <div class="animate__animated animate__pulse info" v-if="infoBol == 1">
      <img src="../assets/img/quit.png" alt="" @click="infoBol = 0" />
      <h2>设备详情</h2>
      <div>
        <div class="">设备名称:</div>
        <div>智慧合杆</div>
      </div>
      <div>
        <div class="">设备编号:</div>
        <div>1102460301</div>
      </div>
      <div>
        <div class="">设备状态:</div>
        <div>在线</div>
      </div>
    </div>
    <div class="animate__animated animate__pulse info" v-if="infoBol == 3">
      <img src="../assets/img/quit.png" alt="" @click="infoBol = 0" />
      <player
        ref="videoPlayer"
        :videoUrl="videoUrl"
        :error="videoError"
        :message="videoError"
        fluent
        autoplay
        live
      ></player>
    </div>
    <div class="animate__animated animate__pulse info" v-if="infoBol == 5">
      <img src="../assets/img/quit.png" alt="" @click="infoBol = 0" />
      <h2>{{ weatherData.deviceName }}</h2>
      <div v-for="(item, index) in weatherData.propertyList" v-bind:key="index">
        <div class="">{{ item.propertyName }}</div>
        <div>{{ item.formatValue }}</div>
      </div>
    </div>
    <div class="animate__animated animate__pulse info2" v-show="infoBol == 6">
      <img src="../assets/img/quit.png" alt="" @click="infoBol = 0" />
      <h2>{{ windspeedData.deviceName }}</h2>
      <div class="left">
        <div class="leftcenter" id="device">
          <div style="height: 20px"></div>
          <div id="deviceEcharts"></div>
          <div class="lesstu" v-if="bol">
            <span  :style="{'color': lesstu=='数据可用' ? '#67c23a':'red'}"
              >{{lesstu}}</span
            >
            <!-- <span v-if="lesstu == false" style="color: #f56c6c"
              >数据不可用舍弃</span
            > -->
          </div>
          <div style="position: absolute; right: 27px; top: 16px" v-if="bol">
            <span :style="{'color': state=='正常' ? '#67c23a':'red'}"
              >{{state}}</span
            >
            <!-- <span v-if="state!= 0" style="color: #f56c6c"
              >异常</span
            > -->
          </div>
        </div>
        <!--  -->
        <div id="device1">
          <!-- <h2>待定</h2> -->
          <div style="height: 20px"></div>
          <div id="deviceEcharts1"></div>
        </div>
      </div>
    </div>
    <div class="animate__animated animate__pulse info" v-if="infoBol == 7">
      <img src="../assets/img/quit.png" alt="" @click="infoBol = 0" />
      <h2>{{ inclineData.deviceName }}</h2>
      <div v-for="(item, index) in inclineData.propertyList" v-bind:key="index">
        <div class="">{{ item.propertyName }}</div>
        <div>{{ item.formatValue }}</div>
      </div>
    </div>
    <div class="animate__animated animate__pulse info" v-if="infoBol == 8">
      <img src="../assets/img/quit.png" alt="" @click="infoBol = 0" />
      <h2>水位计</h2>
      <div>
        <div class="">设备状态:</div>
        <div>在线</div>
      </div>
      <div>
        <div class="">距离:(cm)</div>
        <div>
          {{
            sensorData == null ? "0" : sensorData.payload.properties.tem_water
          }}
        </div>
      </div>
    </div>
    <div class="pedestalbottom">
      <img src="../assets/img/pedestalbottom.gif" alt="" />
    </div>
    <div class="downgif" v-if="$store.state.policeOff">
      <img src="../assets/img/down.gif" alt="" />
    </div>
    <!-- <el-button
      class="resetting"
      style="background: 0; color: #fff"
      @click="resetting()"
      >重置</el-button
    > -->
  </div>
</template>
<script>
import countTo from "vue-count-to";
import player from "../components/easyPlayer.vue";
import { post } from "../axios/http";
import axios from "axios";
import mqtt from "mqtt";
export default {
  name: "set",
  components: {
    countTo: countTo,
    player,
  },
  data() {
    return {
      infoBol: 0,
      token: "66",
      sensorData: null,
      videoUrl: "",
      weatherData: {},
      inclineData: {},
      windspeedData: {},
      myChart4: null,
      myChart5: null,
      datamain2: [],
      datamain3: [],
      loading4: null,
      loading5: null,
      lesstu:'',
      state:'',
      bol: false,
    };
  },

  created() {
    this.hangingDevice();
    // this.login()
    // this.WebSocket();
    this.WebSocket(
      "ws://10.0.3.169:8630/messaging/" + localStorage.getItem("Token")
    );
  },
  mounted() {
    // document.getElementById("deviceEcharts1").style.backgroundColor=
    // this.loading4 = this.$loading({
    //   visible: true,
    //   text: "拼命加载中",
    //   spinner: "el-icon-loading",
    //   background: "rgba(0, 0, 0, 0.3)",
    //   target: document.querySelector("#deviceEcharts1"),
    // });
    // this.loading5 = this.$loading({
    //   visible: true,
    //   text: "拼命加载中",
    //   spinner: "el-icon-loading",
    //   background: "rgba(0, 0, 0, 0.3)",
    //   target: document.querySelector("#deviceEcharts1"),
    // });
    window.addEventListener("resize", () => {
      this.myChart4.resize();
      this.myChart5.resize();
    });
  },
  methods: {
    resetting() {
      const topic = "test",
        qos = 0,
        payload = '{ "msg": "a"}';
      this.$store.state.client.publish(topic, payload, { qos: 0 }, (error) => {
        console.log(error);
        if (error) {
          console.log("发布错误", error);
        } else {
          const loading = this.$loading({
            lock: true,
            text: "重置中",
            spinner: "el-icon-loading",
            background: "rgba(0, 0, 0, 0.7)",
          });
          setTimeout(() => {
            loading.close();
          }, 1500);
        }
      });
    },
    //30秒请求一次数据
    hangingDevice() {
      this.axios({
        method: "get",
        url:
          "http://10.0.3.169:80/api/lamp-post/hangingDevice/" +
          this.$store.state.deviceId,
        headers: {
          "Content-Type": "application/json",
          // Cookie: "JSESSIONID=dcc1ef0b-8d65-458f-a1cc-36e45b3b875e",
        },
      }).then((res) => {
        console.log(res);
        if (res.result.length != 0) {
          this.bol = true;
        } else {
          this.bol = false;
        }
        let sensorData = {
          payload: {
            properties: {},
          },
        };
        if (res.result.length == 0) {
          this.weatherData.deviceName = "设备已离线";
          this.inclineData.deviceName = "设备已离线";
          this.windspeedData.deviceName = "设备已离线";
          // this.weatherData.propertyList.push({
          //   propertyName: "设备状态",
          //   formatValue: "无设备",
          // });
        } else {
          res.result.forEach((item) => {
            // console.log(item);
            if (item.propertyList.length == 0) {
              item.propertyList.push({
                propertyName: "设备状态",
                formatValue: "已离线",
              });
            }
            if (item.classifyKey == "AirCollect") {
              this.weatherData = item;
            } else if (item.classifyKey == "TiltSensor") {
              this.inclineData = item;
            } else if (item.classifyKey == "MemsSensor") {
              this.windspeedData = item;
              if (item.propertyList.length != 0) {
                let datamain2 = [];
                let datamain3 = [];
                let init=[]
                let fourier=[]
                // console.log(item.propertyList[2]);
                item.propertyList.forEach((item2) => {
                  if (item2.property == "init") {
                    console.log(JSON.parse(item2.formatValue));
                    let formatValue=JSON.parse(item2.formatValue)
                    formatValue[0].forEach((items) => {
                      datamain2.push([items.time, items.value]);
                    });
                    formatValue[1].forEach((items) => {
                      init.push([items.time, items.value]);
                    });
                    this.gain2(datamain2,init);
                  }
                  if (item2.property == "fourier") {
                    console.log(JSON.parse(item2.formatValue));
                    let formatValuefourier=JSON.parse(item2.formatValue)
                    formatValuefourier[0].forEach((items) => {
                      datamain3.push([items.time, items.value]);
                    });
                    formatValuefourier[1].forEach((items) => {
                      fourier.push([items.time, items.value]);
                    });
                    this.gain3(datamain3,fourier);
                  }
                  if (item2.property == "state") {
                    this.state=item2.formatValue
                  }
                  if (item2.property == "lesstu") {
                    this.lesstu=item2.formatValue
                  }
                });
              } else {
              }
            }
          });
        }
        // console.log(sensorData, res);
        if (this.infoBol == 6) {
          setTimeout(() => {
            this.hangingDevice();
          }, 10000);
        }
      });
      // .catch((err) => {
      //   console.log(err);
      //   this.weatherData.deviceName = "设备已离线";
      //   this.inclineData.deviceName = "设备已离线";
      //   this.windspeedData.deviceName = "设备已离线";
      // });
    },

    videoError: function (e) {
      console.log("播放器错误：" + JSON.stringify(e));
    },
    bolChange(e) {
      this.infoBol = e;
    },
    bolChange6() {
      this.infoBol = 6;
      this.$nextTick(() => {
        this.myChart4 = this.echarts.init(
          document.getElementById("deviceEcharts")
        );
        // this.gain2(this.datamain2);
        this.myChart5 = this.echarts.init(
          document.getElementById("deviceEcharts1")
        );
        console.log(this.datamain3, 123123);
        // this.gain3(this.datamain3);
      });
      this.hangingDevice();
    },
    WebSocket(url) {
      var _this = this;
      console.log(this.token);
      var ws = new WebSocket(url);
      var data = {
        type: "sub",
        topic: "/device/ggtaeqb/40234068/**",
        parameter: {},
        id: "reques132ytre2-001",
      };
      var data2 = {
        type: "sub",
        topic: "/device/gmdsxdn/leida_ch32/**",
        parameter: {},
        id: "reques132ytre2-002",
      };
      var datajosn = JSON.stringify(data);
      var datajosn2 = JSON.stringify(data2);
      // console.log(datajosn);
      ws.onopen = function () {
        console.log("连接成功");
        ws.send(datajosn);
        // ws.send(datajosn2)
      };
      ws.onmessage = function (res) {
        console.log(res);
        var ress = JSON.parse(res.data);
        console.log(ress);
        _this.sensorData = ress;
        // console.log(this.sensorData,"56465");
        // console.log(this.data.sensorData.payload.properties.node_so2);
      };
      ws.onclose = function () {
        console.log("连接失败");
      };
    },
    // 路灯开关
    lampSw(value) {
      console.log(value);
      const loading = this.$loading({
        lock: true,
        text: value == "开" ? "开启灯光中" : "关闭灯光中",
        spinner: "el-icon-loading",
        background: "rgba(0, 0, 0, 0.7)",
      });
      setTimeout(() => {
        loading.close();
        this.$emit("lampSw", value);
      }, 2000);
    },
    screenSw(value) {
      const loading = this.$loading({
        lock: true,
        text: value == "开" ? "开启显示屏中" : "关闭显示屏中",
        spinner: "el-icon-loading",
        background: "rgba(0, 0, 0, 0.7)",
      });
      setTimeout(() => {
        loading.close();
        this.$emit("screenSw", value);
      }, 2000);
    },
    // set返回
    back() {
      setTimeout(() => {
        this.$store.state.setWpBol = false;
      }, 150);
      this.$emit("back");
    },
    gain2(datamain2,init) {
      this.myChart4.setOption({
        title: {
          text: "加速度分布",
          left: "4%",
          textStyle: {
            color: "#099DCD",
          },
        },
        tooltip: {
          trigger: "axis",
        },
        grid: {
          left: "12%",
          right: "3%",
          bottom: "10%",
        },
        xAxis: {
          data: datamain2.map(function (item) {
            return item[0];
          }),
          axisLabel: {
            textStyle: {
              color: "#00B1DA",
              fontWeight: 800,
            },
          },
        },
        yAxis: {
          axisTick: {
            length: 3, // 坐标轴刻度的长度
            lineStyle: {
              color: "#FFF", // 刻度线的颜色
              width: 10, // 坐标轴刻度线宽
              type: "solid", // 坐标轴线线的类型（'solid'，实线类型；'dashed'，虚线类型；'dotted',点状类型）
            },
          },
          axisLabel: {
            textStyle: {
              color: "#00B1DA",
              fontWeight: 800,
            },
          },
        },
        series: [{
          name: "初始值",
          type: "line",
          color:"yellow",
          data: datamain2.map(function (item) {
            return item[1];
          }),
          markLine: {
            silent: true,
          },
        },{
          name: "初始值2",
          type: "line",
          color:"#009cff",
          data: init.map(function (item) {
            return item[1];
          }),
          markLine: {
            silent: true,
          },
        }],
      });
    },
    gain3(datamain3,fourier) {
      // this.myChart3 = this.echarts.init(
      //   document.getElementById("deviceEcharts1")
      // );
      this.myChart5.setOption({
        title: {
          text: "傅里叶变换分布",
          left: "4%",
          textStyle: {
            color: "#099DCD",
          },
        },
        tooltip: {
          trigger: "axis",
        },
        grid: {
          left: "12%",
          right: "3%",
          bottom: "10%",
        },
        xAxis: {
          // length:10,
          data: datamain3.map(function (item) {
            return item[0];
          }),
          axisLabel: {
            textStyle: {
              color: "#00B1DA",
              fontWeight: 800,
            },
          },
        },
        yAxis: {
          axisTick: {
            length: 3, // 坐标轴刻度的长度
            lineStyle: {
              color: "#FFF", // 刻度线的颜色
              width: 10, // 坐标轴刻度线宽
              type: "solid", // 坐标轴线线的类型（'solid'，实线类型；'dashed'，虚线类型；'dotted',点状类型）
            },
          },
          axisLabel: {
            textStyle: {
              color: "#00B1DA",
              fontWeight: 800,
            },
          },
        },
        series: [{
          name: "傅里叶值",
          type: "line",
          color:"yellow",
          data: datamain3.map(function (item) {
            return item[1];
          }),
          markLine: {
            silent: true,
          },
        },{
          name: "傅里叶值2",
          type: "line",
          color:"#009cff",
          data: fourier.map(function (item) {
            return item[1];
          }),
          markLine: {
            silent: true,
          },
        }],
      });
    },
  },
};
</script>

<style scoped>
.leftcenter {
  position: relative;
}
.leftcenter .lesstu {
  position: absolute;
  top: 16px;
  width: 100%;
  text-align: center;
}
.leftcenter .lesstu > span {
  width: 100%;
  text-align: center;
  margin-left: 20px;
}

.left {
  width: 100%;
  height: 90%;
  display: flex;
  justify-content: space-evenly;
  z-index: 888;
  /* background: url(../assets/img/wp-bg.png) no-repeat 0 0; */
  /* background-size: 100% 100%; */
}
#device,
#device1 {
  width: 45%;
  height: 90%;
}
#deviceEcharts {
  width: 100%;
  height: 100%;
}
#deviceEcharts1 {
  width: 100%;
  height: 100%;
}
.main-wp {
  width: 60%;
  height: 90%;
  position: relative;
}
.main-wp > img {
  position: absolute;
  /* width: 100%; */
  height: 100%;
  left: 50%;
  transform: translateX(-50%);
  animation: circle 5s linear infinite;
}
@keyframes circle {
  from {
    transform: translateX(-50%) rotate(0);
  }
  to {
    transform: translateX(-50%) rotate(360deg);
  }
}
#main1,
#main2,
#main3 {
  width: 100%;
  height: 100%;
}
.sum {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  font-size: 12px;
  color: #fff;
  text-align: center;
}
.main1-data {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
.main1-data > div {
  font-size: 14px;
  color: #fff;
  color: rgba(255, 255, 255, 0.428);
}

.main1-data > div > div {
  display: flex;
  align-items: center;
}
.main1-data > div > div > img {
  width: 20px;
  height: 20px;
  margin-right: 10px;
}
.main1-data > div > p {
  padding-left: 30px;
}
.main1-data > div > p > span:nth-child(1) {
  font-size: 20px;
  color: rgba(43, 48, 188, 0.64);
}

.a {
  position: absolute;
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
.info2 {
  width: 60vw;
  height: 500px;
  background: url(../assets/img/set-bg.png) 0 0 no-repeat;
  background-size: 100% 100%;
  position: absolute;
  left: 20vw;
  top: 25%;
  /* transform: translateY(-50%) !important; */
  padding: 20px;
  box-sizing: border-box;
  z-index: 8;
}
.info {
  width: 600px;
  /* height: 400px; */
  background: url(../assets/img/set-bg.png) 0 0 no-repeat;
  background-size: 100% 100%;
  position: absolute;
  left: calc(50% - 300px);
  top: 25%;
  /* transform: translateY(-50%) !important; */
  padding: 20px;
  box-sizing: border-box;
  z-index: 8;
}
.info > img,.info2 > img  {
  width: 20px;
  height: 20px;
  position: absolute;
  right: 20px;
}
.info2 h2,.info h2 {
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
  right: 100px;
  transform: translateX(50%);
  z-index: 9;
  animation: bounce 1.5s infinite alternate;
}
.c-left > div > img:nth-child(2) {
  position: absolute;
  width: 80px;
  height: 80px;
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
  right: 150px;
  bottom: -10px;
}
.c-left > div > div > h2 {
  font-size: 18px;
  color: #fff;
  padding-bottom: 5px;
  border-bottom: 3px #1361a7 solid;
  margin-bottom: 10px;
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
  left: 100px;
  transform: translateX(-50%) !important;
  z-index: 9;
  animation: bounce 1.5s infinite alternate;
}
.c-right > div > img:nth-child(2) {
  position: absolute;
  width: 80px;
  height: 80px;
  left: 60px;
  bottom: -30px;
}
.c-right > div > div {
  position: absolute;
  width: 200px;
  height: 60px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: flex-start;
  left: 150px;
  bottom: -10px;
}
.c-right > div > div > h2 {
  font-size: 18px;
  color: #fff;
  padding-bottom: 5px;
  border-bottom: 3px #1361a7 solid;
  margin-bottom: 10px;
}
.pedestalbottom {
  width: 400px;
  height: 200px;
  position: absolute;
  bottom: 8%;
  left: 50%;
  transform: translateX(-50%);
  z-index: 8;
  /* background-color: #eee; */
}
.pedestalbottom img {
  width: 100%;
  height: 100%;
}
.downgif {
  width: 200px;
  height: 200px;
  position: absolute;
  top: 40%;
  left: 40%;
  transform: translateY(-50%);
  z-index: 7;
}
.downgif img {
  width: 100%;
  height: 100%;
}

@keyframes bounce {
  from {
    bottom: 25px;
  }
  to {
    bottom: 10px;
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
.resetting {
  position: absolute;
  z-index: 100;
  bottom: 30%;
  left: 40%;
}
</style>
<style>
.home .el-radio-button__inner {
  padding: 6px 10px;
  background: 0;
}
</style>
