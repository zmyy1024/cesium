import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import cesium from 'vite-plugin-cesium';
import { fileURLToPath, URL } from 'node:url'
export default defineConfig({
  plugins: [vue(),cesium()],
  resolve:{
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.json', '.vue'],
    alias:{
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
});
