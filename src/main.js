
import './style.css'
import { createApp } from 'vue'
import App from './App.vue'
import { createPinia } from 'pinia'

const app = createApp(App)

// 创建并安装 Pinia
const pinia = createPinia()
app.use(pinia)

app.mount('#app')
