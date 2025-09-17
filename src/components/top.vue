<template>
  <div class="top">
    <div class="time">
      <div>{{ date }}</div>
      <div style="margin:0 20px">{{ week }}</div>
      <div>{{ strDate }}</div>
    </div>
    <div class="wp">5 G 通 讯 仿 真</div>
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
    // 获取日期和时间
    timeGet() {
      const date = new Date();
      const year = date.getFullYear() + "年";
      const month = (date.getMonth() + 1) + "月";
      const day = date.getDate() + "日";

      const h = date.getHours().toString().padStart(2, '0');
      const m = date.getMinutes().toString().padStart(2, '0');
      const s = date.getSeconds().toString().padStart(2, '0');

      const weeks = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];

      this.date = year + month + day;
      this.strDate = `${h}:${m}:${s}`;
      this.week = weeks[date.getDay()];
    },
  },
  created() {
    this.timeGet();
    setInterval(this.timeGet, 1000);
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
  }
  100% {
    top: 27px;
    left: 22%;
  }
}
</style>
