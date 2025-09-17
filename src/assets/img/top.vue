<template>
  <div class="top">
    <div class="time">
      <div>{{ date }}</div>
      <div style="margin:0 20px">{{ week }}</div>
      <div>{{ strDate }}</div>
    </div>
    <div class="wp">合 杆 健 康 监 测 系 统</div>
    <div class="light">
      <img src="../assets/img/light.png" alt="" width="100%" height="100%" />
    </div>
  </div>
</template>

<script>
export default {
  name: "top",
  data() {
    return {
      date: "",
      strDate: "",
      week: "",
    };
  },
  methods: {
    // 日期时间
    timeGet() {
      var date = new Date(); //时间戳为10位需*1000，时间戳为13位的话不需乘1000
      var N = date.getFullYear() + "年";
      var M = date.getMonth() + 1 + "月";
      var D = date.getDate() + "日";
      var h =
        date.getHours() < 10
          ? "0" + date.getHours() + ":"
          : date.getHours() + ":";
      var min =
        date.getMinutes() < 10
          ? "0" + date.getMinutes() + ":"
          : date.getMinutes() + ":";
      var sec =
        date.getSeconds() < 10 ? "0" + date.getSeconds() : date.getSeconds();
      var week = date.getDay();
      if (week == 1) {
        this.week = "周一";
      } else if (week == 2) {
        this.week = "周二";
      } else if (week == 3) {
        this.week = "周三";
      } else if (week == 4) {
        this.week = "周四";
      } else if (week == 5) {
        this.week = "周五";
      } else if (week == 6) {
        this.week = "周六";
      } else if (week == 7) {
        this.week = "周日";
      }
      let day = N + M + D;
      let strDate = h + min + sec;
      this.date = day;
      this.strDate = strDate;
    },
  },
  created() {
    this.timeGet();
    setInterval(() => {
      this.timeGet();
    }, 1000);
  },
};
</script>

<style scoped>
.top {
  position: absolute;
  z-index: 100;
  width: 100%;
}
.time {
  position: absolute;
  height: 60px;
  left: 20px;
  line-height: 80px;
  font-size: 20px;
  color: #01c4f7;
  display: flex;
}
.wp {
  font-size: 28px;
  width: 100%;
  height: 60px;
  color: #01c4f7;
  line-height: 60px;
  text-align: center;
  padding: 0 67px;
  box-sizing: border-box;
  background: url(../assets/img/header-bg.png) no-repeat 0 0;
  background-size: 100% 100%;
}
.light {
  position: absolute;
  z-index: 999;
  top: 27px;
  left: 0%;
  animation: flow 6s linear infinite alternate;
  width: 70%;
  height: 100%;
}
@keyframes flow {
  0% {
    top: 27px;
    left: -3%;
    /* opacity: 1; */
  }
  100% {
    top: 27px;
    left: 22%;
    /* opacity: .5; */
  }
}
</style>
