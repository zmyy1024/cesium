<template>
  <div class="right">
    <!--  -->
    <div>
      <h2>设备列表</h2>
      <div>
        <div class="title">
          <div>设备编号</div>
          <div>设备状态</div>
          <div>数据状态</div>
        </div>
        <div ref="cntWp" class="cnt-wp">
          <!-- <div ref="cnt" class="cnt" :style="{ top: top + 'px' }"> -->
          <div ref="cnt" class="cnt" >
            <div v-for="(item, index) in list" :key="index">
              <div>{{ item.device }}</div>
              <div>{{ item.state==0?'正常':'异常' }}</div>
              <div>{{ item.lesstu==true?"数据可用":'数据不可用舍弃' }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!--  -->
    <div>
      <h2>实时天气</h2>
      <div ref="weatherWp" class="weatherWp">
        <div id="he-plugin-standard"></div>
      </div>
    </div>
    <!--  -->
    <div>
      <h2>设备布控</h2>
      <div>
        <div id="main4"></div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "right",
  data() {
    return {
      list:this.$store.state.LampDeviceList,
      top: 0,
      myChart: null,
      info: [
        {
          name: "郑州市",
          children: [
            {
              name: "终端产业园",
              value: 15,
              children: [
                {
                  name: "灯杆",
                  value: 4,
                },
                {
                  name: "传感器",
                  value: 5,
                },
                {
                  name: "显示屏",
                  value: 4,
                },
              ],
            },
            {
              name: "研究院",
              value: 10,
              children: [
                {
                  name: "灯杆",
                  value: 5,
                },
                {
                  name: "显示屏",
                  value: 1,
                },
              ],
            },
          ],
        },
        {
          name: "鹤壁",
          children: [
            {
              name: "子罕大街",
              value: 5,
              children: [
                {
                  name: "灯杆",
                  value: 1,
                },
                {
                  name: "显示屏",
                  value: 2,
                },
              ],
            },
          ],
        },
      ],
      info1: [],
      color: ["#1b5a8b", "#00a394"],
    };
  },
  methods: {
    gain() {
      this.myChart = this.echarts.init(document.getElementById("main4"));
      const treemapOption = {
        // backgroundColor: "none",
        series: [
          {
            type: "treemap",
            width: "90%",
            height: "90%",
            top: "0",
            id: "echarts-package-size",
            animationDurationUpdate: 1000,
            roam: false,
            nodeClick: undefined,
            data: this.info1,
            universalTransition: true,
            // color: ["#000", "#ff0000"],
            levels: [
              {
                itemStyle: {
                  borderColor: "#6fd3f6",
                  borderWidth: 0,
                  gapWidth: 1,
                },
                upperLabel: {
                  show: false,
                },
              },
              {
                itemStyle: {
                  borderColor: "none",
                  borderWidth: 5,
                  gapWidth: 1,
                },
              },
              {
                colorSaturation: [0.35, 0.5],
                itemStyle: {
                  borderWidth: 5,
                  gapWidth: 1,
                  borderColorSaturation: 0.6,
                },
              },
            ],
            label: {
              show: true,
            },
            upperLabel: {
              show: true,
            },
            breadcrumb: {
              show: false,
            },
          },
        ],
      };
      const sunburstOption = {
        series: [
          {
            type: "sunburst",
            id: "echarts-package-size",
            radius: ["20%", "90%"],
            animationDurationUpdate: 1000,
            nodeClick: undefined,
            data: this.info,
            universalTransition: true,
            itemStyle: {
              borderWidth: 2,
              borderRadius: 5,
              borderColor: "rgba(255,255,255,.5)",
            },
            label: {
              show: true,
              fontSize: "12",
              color: "#fff",
              // rotate: 0,
            },
            levels: [
              {},
              {
                label: {
                  rotate: "tangential",
                },
              },
              {
                label: {
                  rotate: "tangential",
                },
              },
              {
                label: {
                  rotate: "tangential",
                },
              },
              {
                label: {
                  rotate: "tangential",
                },
              },
            ],
            color: this.color.reverse(),
          },
        ],
      };
      let currentOption = treemapOption;
      this.myChart.setOption(sunburstOption);
      setInterval(() => {
        currentOption =
          currentOption === treemapOption ? sunburstOption : treemapOption;
        this.myChart.setOption(currentOption);
      }, 3000);
    },
  },
  created() {},
  mounted() {
    // setInterval(() => {
    //   if (this.$refs.cnt && this.$refs.cntWp) {
    //     this.top -= 4;
    //     if (
    //       this.top <
    //       -(this.$refs.cnt.clientHeight - this.$refs.cntWp.clientHeight)
    //     ) {
    //       // this.top = 0;
    //       if (this.list.length < 5) {
    //         this.list.push(...this.$store.state.LampDeviceList);
    //         // console.log( this.list);
    //       } else {
    //         this.top=0
    //         this.list = this.$store.state.LampDeviceList
    //       }
    //     }
    //   }
    // }, 500);
    window.WIDGET = {
      CONFIG: {
        layout: "1",
        width: "450",
        height: this.$refs.weatherWp.clientHeight,
        background: "5",
        dataColor: "00FFFF",
        borderRadius: "5",
        // city: "CN101180101",
        key: "e475771048aa4206ad0cdd89e62086c2",
      },
    };
    let script = document.createElement("script");
    script.type = "text/javascript";
    script.src =
      "https://widget.qweather.net/standard/static/js/he-standard-common.js?v=2.0";
    document.getElementsByTagName("head")[0].appendChild(script);

    let arr = this.info.map((item) => {
      return {
        name: item.name,
        children: item.children.map((Item) => {
          return { ...Item };
        }),
      };
    });
    this.info1 = arr.map((item, index) => {
      item.children.forEach((Item, Index) => {
        Item.itemStyle = { color: this.color[index] };
      });
      return item;
    });
    arr[0].children.aa = 1;
    this.gain();
    window.addEventListener("resize", () => {
      this.myChart.resize();
    });
  },
};
</script>

<style scoped>
.right {
  position: absolute;
  z-index: 100;
  right: 20px;
  top: 60px;
  width: 20vw;
  height: calc(100vh - 60px);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
}
.right > div {
  width: 100%;
  flex: 1;
  background: url(../assets/img/wp-bg.png) no-repeat 0 0;
  background-size: 100% 100%;
}
.right > div:nth-child(2) {
  margin: 10px 0;
}
.right > div > h2 {
  height: 20%;
  font-size: 18px;
  color: rgb(9, 157, 205);
  padding-top: 0.8em;
  padding-left: 1.2em;
  box-sizing: border-box;
  cursor: pointer;
}
.right > div > div {
  height: 80%;
}
.title {
  width: 100%;
  height: 20%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-left: 1.2em;
  box-sizing: border-box;
  color: #fff;
}
.title > div {
  flex: 1;
}
.cnt-wp {
  height: 65%;
  padding-left: 1.2em;
  overflow: hidden;
  position: relative;
}
.cnt {
  position: absolute;
  width: calc(100% - 1.2em);
}
.cnt > div {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 5px 0;
}
.cnt > div > div {
  flex: 1;
  color: aliceblue;
}
.weatherWp {
  padding: 0 1.2em;
  box-sizing: border-box;
}
#main4 {
  width: 100%;
  height: 100%;
}
</style>
<style>
#he-plugin-standard {
  width: 100% !important;
  /* height: 100% !important; */
}
.wv-lt-refresh {
  display: none;
}
.wv-v-h-col-right {
  border: 0 !important;
}
.right .wv-n-h-now-tmp > span {
  font-size: 1.8em;
}
.right .wv-f-forecast-date > a {
  font-size: 1.4em;
}
.right .wv-n-h-now-txt > span,
.right .wv-n-h-now-aqi-item > span,
.right .wv-n-h-now-aqi-item > .wv-n-h-label {
  font-size: 2em;
}
.right .wv-f-forecast-img > a > img {
  width: 30px;
}
</style>
