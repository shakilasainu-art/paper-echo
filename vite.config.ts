import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

// GitHub Pages 相对路径部署 + hash 路由
export default defineConfig({
  base: './',
  plugins: [vue()],
})
