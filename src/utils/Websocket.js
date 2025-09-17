// WebSocketClient.js
export default class WebSocketClient {
  constructor(url, options = {}) {
    this.url = url;
    this.socket = null;
    this.heartbeatInterval = options.heartbeatInterval || 30000; // 心跳间隔
    this.reconnectInterval = options.reconnectInterval || 5000;   // 重连间隔
    this.maxRetries = options.maxRetries || 10;
    this.currentRetries = 0;

    this.onMessage = options.onMessage || (() => {});
    this.onOpen = options.onOpen || (() => {});
    this.onClose = options.onClose || (() => {});
    this.onError = options.onError || (() => {});

    this.heartbeatTimer = null;
    this.connect();
  }

  connect() {
    this.socket = new WebSocket(this.url);

    this.socket.onopen = () => {
      this.onOpen();
      this.currentRetries = 0;
    //   this.startHeartbeat();
    };

    this.socket.onmessage = (event) => {
      this.onMessage(event.data);
    };

    this.socket.onclose = () => {
      this.onClose();
      this.stopHeartbeat();
      this.reconnect();
    };

    this.socket.onerror = (error) => {
      this.onError(error);
    };
  }

  reconnect() {
    if (this.currentRetries >= this.maxRetries) return;
    this.currentRetries++;
    setTimeout(() => this.connect(), this.reconnectInterval);
  }

  startHeartbeat() {
    this.heartbeatTimer = setInterval(() => {
      this.send(JSON.stringify({ type: 'ping' }));
    }, this.heartbeatInterval);
  }

  stopHeartbeat() {
    clearInterval(this.heartbeatTimer);
    this.heartbeatTimer = null;
  }

  send(data) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(data);
    }
  }

  close() {
    this.stopHeartbeat();
    if (this.socket) {
      this.socket.close();
    }
  }
}


  
// const ws = new WebSocketClient('ws://192.168.1.8:8080/ws', {
//   onOpen: () => console.log('✅ Connected'),
//   onMessage: (msg) => {
//     console.log('📨 Received:', msg)
//   },
//   onClose: () => console.log('🔌 Disconnected'),
//   onError: (err) => console.error('❌ Error', err)
// });

// // 发送消息
// ws.send(JSON.stringify({ type: 'hello', data: 'world' }));
