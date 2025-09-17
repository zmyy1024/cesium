<template>
  <div class="left">
    <!--  -->
    <div>
      <h2>设备状态</h2>
      <div>
        <div class="main-wp">
          <img src="../assets/img/circle-wp.png" alt="" />
          <div id="main1"></div>
          <div class="sum">
            <p>总台数</p>
            <p>
              <countTo
                :starVal="0"
                :endVal="$store.state.ludengNum"
                :duration="5000"
                style="font-size: 20px"
              ></countTo
              >台
            </p>
          </div>
        </div>
        <div class="main1-data">
          <div>
            <div>
              <img src="../assets/img/on.png" alt="" />
              <span style="color: #03f838">正在运行的灯杆</span>
            </div>
            <p>
              <countTo
                style="color: #03f838"
                :starVal="0"
                :endVal="$store.state.ludengNum - this.errorLampNumber"
                :duration="5000"
              ></countTo>
              <span style="color: #03f838">台</span>
            </p>
          </div>
          <div>
            <div>
              <img src="../assets/img/off.png" alt="" />
              <span style="color: #ff0000">发生故障的灯杆</span>
            </div>
            <p>
              <countTo
                style="color: #ff0000"
                :starVal="0"
                :endVal="errorLampNumber"
                :duration="5000"
              ></countTo>
              <span style="color: #ff0000">台</span>
            </p>
          </div>
        </div>
      </div>
    </div>
    <!--  -->
    <div class="leftcenter" id="left2">
      <!-- <div class="loading"></div> -->
      <h2>加速度分布</h2>
      <!-- <div style="height: 20px"></div> -->
      <div id="main2"></div>
      <div class="lesstu" v-if="bol">
        <span v-if="SelectLight[0].lesstu == true" style="color: #67c23a"
          >数据可用</span
        >
        <span v-if="SelectLight[0].lesstu == false" style="color: #f56c6c"
          >数据不可用舍弃</span
        >
      </div>
      <div style="position: absolute; right: 27px; top: 16px" v-if="bol">
        <span v-if="SelectLight[0].state == 0" style="color: #67c23a">正常</span>
        <span v-if="SelectLight[0].state != 0" style="color: #f56c6c">异常</span>
      </div>
    </div>
    <!--  -->
    <div id="left3">
      <!-- <h2>待定</h2> -->
      <h2>傅里叶变换分布</h2>
      <div class="device" v-if="bol && SelectLight.length != 0">
        设备ID:{{ SelectLight[0].device }}
      </div>
      <!-- <div style="height: 20px"></div> -->
      <div id="main3"></div>
    </div>
  </div>
</template>

<script>
import countTo from "vue-count-to";
import Img from "../assets/img/light1.png";
import data1 from "../static/1";
import mqtt from "mqtt";
import scene from "../three/scene";
export default {
  name: "left",
  components: {
    countTo: countTo,
  },
  data() {
    return {
      myChart1: null,
      myChart2: null,
      myChart3: null,
      datamain2: [],
      datamain3: [],
      loading2: null,
      loading3: null,
      series2: [],
      series3: [],
      bol: false,
      errorLampNumber: 0,
      SelectLight: [],
    };
  },
  created() {
    let wid = new Date().getTime();
    // 122.9.37.177 192.168.168.183
    // const WebSocket_URL = "ws://192.168.10.30:15675/ws";
    // const WebSocket_URL = "ws://222.88.186.81:23507/ws";
    const WebSocket_URL = "ws://81.70.48.111:8083/mqtt";
    const options = {
      // 超时时间
      connectTimeout: 1000,
      // 认证信息
      clientId: wid,
      username: "yunzhisheng",
      password: "yunzhisheng",
      // 心跳时间
      keepalive: 60,
      clean: true,
    };
    this.$store.state.client = mqtt.connect(WebSocket_URL, options);
    // 连接成功后初始化订阅
    this.$store.state.client.subscribe("test/#", (err) => {
      console.log(err || "订阅成功", "test/mems_sensor");
    });
    this.$store.state.client.on("message", (topic, message) => {
      this.bol = true;
      this.loading3.close();
      this.loading2.close();
      var json = JSON.parse(message.toString());
      console.log(json,'json');
      if (
        this.$store.state.LampDeviceList.some(
          (item) => item.device == json.device
        )
      ) {
        this.$store.state.LampDeviceList.forEach((item, index) => {
          if (item.device == json.device) {
            this.$store.state.LampDeviceList.splice(index, 1);
          }
        });
      }
      this.$store.state.LampDeviceList.unshift(json);
      if (
        this.$store.state.LampDeviceList.some(
          (item) => item.device == this.$store.state.SelectedLight
        )
      ) {
        this.SelectLight = this.$store.state.LampDeviceList.filter((item) => {
          return item.device == this.$store.state.SelectedLight;
        });
      } else {
        this.SelectLight = [this.$store.state.LampDeviceList[0]];
      }
      this.gain1();
      //错误灯杆显示红色
      this.$store.state.hangingDeviceId.forEach((item) => {
        item.value.forEach((items) => {
          if (items == json.device) {
            scene.children.forEach((item2) => {
              if (item2.name == "ludeng" && item2.deviceId == item.key) {
                item2.children.forEach((Item3) => {
                  if (json.state != 0) {
                    Item3.material.color.set(0xff0000);
                  } else {
                    Item3.material.color.set(0x0df046);
                  }
                });
              }
            });
          }
        });
      });
      //异常灯杆数量
      // let errorLampNumber = 0;
      // this.$store.state.LampDeviceList.forEach((item) => {
      //   if (item.type == "异常") {
      //     errorLampNumber = errorLampNumber + 1;
      //   }
      // });
      var errorLampList=this.$store.state.LampDeviceList.filter((item)=>{
         return item.state !=0
      })
      this.errorLampNumber = errorLampList.length;
      //mqtt实时显示多条数据
      // let datamain2 = [];
      // let datamain3 = [];
      // Object.keys(json[0]).forEach((item) => {
      //   console.log(item);
      //   datamain2.push([item.slice(0, 5), json[0][item]]);
      // });
      // Object.keys(json[2])
      //   .forEach((item) => {
      //     datamain3.push([item.slice(0, 4), json[2][item]]);
      //   });
      // let arr = [
      //   "#14ffec",
      //   "#14ffec",
      //   "#ff5722",
      //   "#fff",
      //   "#ca6924",
      //   "#bddd22",
      //   "#057748",
      //   "#ff2d51",
      //   "#44cef6",
      //   "#801dae",
      // ];
      // if (
      //   JSON.stringify(this.series2).indexOf(
      //     '"device":' + JSON.stringify(json.device)
      //   ) == -1
      // ) {
      //   this.series2.push({
      //     name: json.id,
      //     type: "line",
      //     device: json.device,
      //     lineStyle: {
      //       color: arr[json.device],
      //     },
      //     data: datamain2.map(function (item) {
      //       return item[1];
      //     }),
      //     markLine: {
      //       silent: true,
      //     },
      //   });
      //   this.series3.push({
      //     name: json.id,
      //     type: "line",
      //     device: json.device,
      //     lineStyle: {
      //       color: arr[json.device],
      //     },
      //     data: datamain3.map(function (item) {
      //       return item[1];
      //     }),
      //     markLine: {
      //       silent: true,
      //     },
      //   });
      // } else {
      //   this.series2.forEach((item) => {
      //     if (item.device == json.device) {
      //       item.data = datamain2.map(function (item) {
      //         return item[1];
      //       });
      //     }
      //   });
      //   this.series3.forEach((item) => {
      //     if (item.device == json.device) {
      //       item.data = datamain3.map(function (item) {
      //         return item[1];
      //       });
      //     }
      //   });
      // }
      this.gain2();
      this.gain3();
      // console.log(datamain2, datamain3);
    });
  },
  methods: {
    gain1() {
      this.myChart1 = this.echarts.init(document.getElementById("main1"));
      let option = {
        legend: {
          show: false,
          orient: "",
          right: "20%",
          y: "center",
          data: ["在线", "故障"],
          textStyle: {
            color: "#fff",
          },
        },
        color: ["#03f838", "#ee6447"],
        series: [
          {
            type: "pie",
            radius: ["50%", "70%"],
            center: ["center", "center"],
            avoidLabelOverlap: false,
            itemStyle: {
              shadowOffsetX: 0, // 折线的X偏移
              shadowOffsetY: 0, // 折线的Y偏移
              shadowWidth: 10,
              shadowBlur: 20, // 折线模糊
              shadowColor: "rgba(145, 132, 132, 1)", //折线颜色
              borderRadius: 10,
              borderColor: "#fff",
              borderWidth: 2,
            },
            label: {
              show: false,
              position: "center",
            },
            labelLine: {
              show: false,
            },
            emphasis: {
              label: {
                show: false,
                fontSize: "30",
                fontWeight: "bold",
              },
            },
            data: [
              { value: 29, name: "在线" },
              { value: this.$store.state.errorLamp, name: "故障" },
            ],
          },
        ],
      };
      this.myChart1.setOption(option);
      // myChart.resize();
    },
    gain2() {
      let list = this.SelectLight;
      let data1 = [];
      let data2 = [];
      for (let i in list[0][0]) {
        data1.push([i, list[0][0][i]]);
      }
      for (let i in list[0][1]) {
        data2.push([i, list[0][1][i]]);
      }
      this.myChart2.setOption({
        tooltip: {
          trigger: "axis",
        },
        grid: {
          top: "3%",
          left: "15%",
          right: "3%",
          bottom: "15%",
        },
        xAxis: {
          // length:10,
          data: data1.map(function (item) {
            return Number(item[0]).toFixed(2);
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
        series: [
          {
            name: this.SelectLight[0].device + "[0]",
            type: "line",
            color:"yellow",
            data: data1.map(function (item) {
              return item[1];
            }),
            markLine: {
              silent: true,
            },
          },
          {
            name: this.SelectLight[0].device + "[1]",
            type: "line",
            color:"#009cff",
            data: data2.map(function (item) {
              return item[1];
            }),
            markLine: {
              silent: true,
            },
          },
        ],
      });
    },
    gain3() {
      let list = this.SelectLight;
      let data1 = [];
      let data2 = [];
      for (let i in list[0][2]) {
        data1.push([i, list[0][2][i]]);
      }
      for (let i in list[0][3]) {
        data2.push([i, list[0][3][i]]);
      }
      this.myChart3.setOption({
        tooltip: {
          trigger: "axis",
        },
        grid: {
          top: "3%",
          left: "15%",
          right: "3%",
          bottom: "15%",
        },
        xAxis: {
          // length:10,
          data: data1.map(function (item) {
            return Number(item[0]).toFixed(2);
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
        series: [
          {
            name: this.SelectLight[0].device + "[0]",
            type: "line",
             color:"yellow",
            data: data1.map(function (item) {
              return item[1];
            }),
            markLine: {
              silent: true,
            },
          },
          {
            name: this.SelectLight[0].device + "[1]",
            type: "line",
             color:"#009cff",
            data: data2.map(function (item) {
              return item[1];
            }),
            markLine: {
              silent: true,
            },
          },
        ],
      });
    },
  },
  mounted() {
    this.gain1();
    // this.gain2();
    // this.gain3();
    // this.loading()
    this.myChart2 = this.echarts.init(document.getElementById("main2"));
    this.myChart3 = this.echarts.init(document.getElementById("main3"));
    this.loading2 = this.$loading({
      visible: true,
      text: "拼命加载中",
      spinner: "el-icon-loading",
      background: "rgba(0, 0, 0, 0.3)",
      target: document.querySelector("#left2"),
    });
    this.loading3 = this.$loading({
      visible: true,
      text: "拼命加载中",
      spinner: "el-icon-loading",
      background: "rgba(0, 0, 0, 0.3)",
      target: document.querySelector("#left3"),
    });
    window.addEventListener("resize", () => {
      this.myChart1.resize();
      this.myChart2.resize();
      this.myChart3.resize();
    });
  },
};
</script>

<style scoped>
/* .loading{
  width: 100%;
  position: absolute;
  left: 0;
  top: 0;
  background-color: red;
  z-index: 99
} */
#left3 {
  position: relative;
}
#left3 .device {
  position: absolute;
  right: 27px;
  /* left: 180px; */
  top: 16px;
  color: #099DCD;
}
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
  position: absolute;
  z-index: 100;
  left: 20px;
  top: 60px;
  width: 20vw;
  height: calc(100vh - 60px);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
}
.left > div {
  width: 100%;
  flex: 1;
  background: url(../assets/img/wp-bg.png) no-repeat 0 0;
  background-size: 100% 100%;
}
.left > div:nth-child(2) {
  margin: 10px 0;
}
.left > div > h2 {
  height: 20%;
  font-size: 18px;
  color: rgb(9, 157, 205);
  padding-top: 0.8em;
  padding-left: 1.2em;
  box-sizing: border-box;
  cursor: pointer;
}
.left > div > div {
  height: 80%;
  display: flex;
  position: relative;
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
#main1 {
  width: 100%;
  height: 100%;
}
#main2,
#main3 {
  width: 100%;
  height: 80%;
  z-index: 99;
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

/* .hint {
  position: absolute;
  right: 0;
  top: -10px;
  color: #fff;
  display: flex;
}
.hint > div {
  display: flex;
  align-items: center;
  margin-right: 10px;
}
.hint > div:nth-child(2) {
  margin-right: 20px;
}
.hint .line {
  width: 30px;
  height: 3px;
  background: #1b5a8b;
  margin-right: 5px;
}
.hint .line1 {
  background: #00a394;
  
} */
.a {
  position: absolute;
}
</style>
