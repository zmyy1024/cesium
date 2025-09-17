// WebSocket构造函数，创建WebSocket对象
let ws = new WebSocket('ws://localhost:8888')

// 连接成功后的回调函数
ws.onopen = function (params) {
  // console.log('客户端连接成功')
  // 向服务器发送消息
  // ws.send('hello')
};

// 从服务器接受到信息时的回调函数
ws.onmessage = function (e) {
  console.log('收到服务器响应', e.data)
};

// 连接关闭后的回调函数
ws.onclose = function(evt) {
  console.log("关闭客户端连接");
};

// 连接失败后的回调函数
ws.onerror = function (evt) {
  console.log("连接失败了");
};


// 监听窗口关闭事件，当窗口关闭时，主动去关闭websocket连接，防止连接还没断开就关闭窗口，这样服务端会抛异常。
window.onbeforeunload = function() {
    ws.close();
}  



//  gradient: {
//           // enter n keys between 0 and 1 here
//           // for gradient color customization
//          '.25': "rgb(255,173,173)",
//         '.30': "rgb(255,215,165)",
//         '.35': "rgb(253,255,182)",
//         '.40': "rgb(203,255,191)",
//         '.45': "rgb(155,246,255)",
//         '.50': "rgb(160,196,255)",
//         '.55': "rgb(218,176,255)",
//         '.70': "rgb(221,221,221)",
//         },