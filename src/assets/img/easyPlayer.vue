<template>
  <div id="player">
    <div id="easyplayer"></div>
  </div>
</template>

<script>
import { get } from "../axios/http";
import { getPlayer } from "../api/api";
import axios from "axios";
import WasmPlayer from "@easydarwin/easywasmplayer"; //导入WasmPlayer.js
export default {
  name: "player",
  data() {
    return {
      easyPlayer: null,
      // index: ''
      videoUrl: "",
    };
  },
  created() {
    axios({
      method: "get",
      url: "/my/api/user/login",
      headers: {
        "Content-Type": "application/json",
      },
      params: {
        username: "admin",
        password: "21232f297a57a5a743894a0e4a801fc3",
      },
    }).then((res) => {
      console.log("", res.data);
      localStorage.setItem("wvp-token", res.data.data.accessToken);
      setTimeout(() => {
        axios({
          method: "get",
          url: "http://10.0.3.169:8083/my/api/play/start/34020000002000000001/34020000001320000002",
          headers: {
            "Content-Type": "application/json",
            "access-token":res.data.data.accessToken
          },
        }).then((res) => {
          this.easyPlayer.endLoading(this.videoUrl);
          console.log(res);
          this.videoUrl = res.data.data.flv;
        });
      }, 2000);
    });
  },
  props: ["error", "hasaudio"],
  mounted() {
    let paramUrl = decodeURIComponent(this.$route.params.url);
    this.$nextTick(() => {
      if (typeof this.videoUrl == "undefined") {
        this.videoUrl = paramUrl;
      }
      //   console.log("初始化时的地址为: " + this.videoUrl)
      let s = "easyplayer";
      //   this.easyPlayer = 'easyplayer'+this.index
      this.easyPlayer = new WasmPlayer(null, s, this.eventcallbacK);
      this.easyPlayer.play(this.videoUrl, 1);
      this.easyPlayer.startLoading(this.videoUrl);
      //   this.easyPlayer.play("ws://116.63.209.25:8083/rtp/0A41D6E3.flv", 1)
    });
  },
  watch: {
    videoUrl(newData, oldData) {
      // debugger
      console.log(newData, oldData);
      // console.log("this.$refs.videoPlayer.play(streamInfo.ws_flv)",this.easyPlayer,this.videoUrl)
      if (this.easyPlayer) {
        // if(oldData){
        this.easyPlayer.destroy();
        let s = "easyplayer";
        this.easyPlayer = new WasmPlayer(null, s, this.eventcallbacK);
        this.easyPlayer.play(newData, 1);
      }
      // else{
      //     this.play(newData,1)
      // }
    },
    immediate: true,
  },
  methods: {
    play: function (url) {
      // // url=this.videoUrl;
      // // debugger
      // // this.easyPlayer = 'easyPlayer'+index
      // console.log("this.videoUrl",this.videoUrl)
      // console.log("easyPlayer的play方法",this.easyPlayer,index)
      // // this.index = index+''
      // console.log("easyPlayer的play方法接收的",url)
      // let s = 'easyplayer'
      // //实例化easyPlayer
      this.easyPlayer = new WasmPlayer(null, s, this.eventcallbacK);
      // debugger
      //     console.log("实例化的easyPlayer对象",this.easyPlayer)
      //     //调用easyPlayer
      //     // this.easyPlayer.play(url, 1)
      //   //  this.easyPlayer.play("ws://116.63.209.25:8083/rtp/0A41D6E3.flv", 1)
      //     console.log("实例化的easyPlayer对象",this.easyPlayer,this.index)
      //     console.log("实例化的easyPlayer对象.play方法",this.easyPlayer.play())
    },
    pause: function () {
      this.easyPlayer.destroy();
    },
    eventcallbacK: function (type, message) {
      // console.log("player 事件回调")
      // console.log(type)
      // console.log(message)
    },
  },
  destroyed() {
    this.easyPlayer.destroy();
  },
};
</script>

<style>
.LodingTitle {
  min-width: 70px;
}
/* 隐藏logo */
/* .iconqingxiLOGO {
        display: none !important;
    } */
</style>