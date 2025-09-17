import * as Cesium from 'cesium';
export const entitiesLngLatList = {
     satellite: Cesium.Cartesian3.fromDegrees(
        121.572032,27.09037, 700000
    ),
     CommunicationBoat: Cesium.Cartesian3.fromDegrees(
        120.41733,24.540095, 15
    ),
    CommunicationDroneA: Cesium.Cartesian3.fromDegrees(
        119.446178,24.928226, 30000
    ),
    CommunicationDroneB: Cesium.Cartesian3.fromDegrees(
        119.880138,24.748766, 30000
    ),
    CommunicationDroneC: Cesium.Cartesian3.fromDegrees(
        120.292125,24.574041, 30000
    ),
    CommunicationDroneD: Cesium.Cartesian3.fromDegrees(
        120.75839,25.267783,30000
    ),
    CommunicationDroneE: Cesium.Cartesian3.fromDegrees(
        120.600106,24.236925,10000
    ),///四台无人机，D为补位备份无人机,E为中控补位无人机
    
    Ship1: Cesium.Cartesian3.fromDegrees(
       119.688824,24.576955, 10
    ),
    Ship2: Cesium.Cartesian3.fromDegrees(
        119.809673,24.666842, 10
    ),
    Ship3: Cesium.Cartesian3.fromDegrees(
        120.103558,24.58195, 10
    ),
    Ship4: Cesium.Cartesian3.fromDegrees(
        119.947003,24.504499, 10
    ),
    Ship5: Cesium.Cartesian3.fromDegrees(
        119.554241,24.848913, 10
    ),
    Ship6: Cesium.Cartesian3.fromDegrees(
        119.290569,25.00085, 10
    ),
    Ship7: Cesium.Cartesian3.fromDegrees(
        119.329022,24.811523, 10
    ),
    Ship8: Cesium.Cartesian3.fromDegrees(
        119.554241,24.721741, 10
    ),
    Ship9: Cesium.Cartesian3.fromDegrees(
        119.411419,24.734214, 10
    ),
    Ship10: Cesium.Cartesian3.fromDegrees(
        120.218914,24.472006, 10
    ),
    Car1:Cesium.Cartesian3.fromDegrees(
        120.672419,24.25025, 10
    ),
    Car2:Cesium.Cartesian3.fromDegrees(
        120.592081,24.193266, 10
    ),
    Car3:Cesium.Cartesian3.fromDegrees(
        120.545389,24.25338, 10
    ),
}

// <template>
//   <div>
//     <h2>WebSocket 接收消息测试</h2>
//     <p>连接状态：{{ isConnected ? '🟢 已连接' : '🔴 已断开' }}</p>
//     <p>最新消息：</p>
//     <pre>{{ message }}</pre>
//   </div>
// </template>

// <script setup>
// import { onMounted } from 'vue'
// import { useWebSocket } from '@/composables/useWebSocket.js'

// // 使用封装的 WebSocket，只用于接收
// const {
//   connect,
//   isConnected,
//   message
// } = useWebSocket('wss://echo.websocket.org', {
//   onMessage: (msg) => {
//     console.log('收到消息:', msg)
//     // 可加 JSON.parse(msg) 做解析
//   }
// })

// // 初始化连接
// onMounted(() => {
//   connect()
// })
// </script>

