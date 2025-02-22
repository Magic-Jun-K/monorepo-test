import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': '/src'
    }
  },
  worker: {
    format: 'es', // 明确指定 worker 格式
  },
  server: {
    host: '0.0.0.0', // 允许通过 IP 访问
    // port: 3000,
    // open: true, // 启动自动打开浏览器
    proxy: {
      '/api': {
        target: 'http://localhost:7000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
})
