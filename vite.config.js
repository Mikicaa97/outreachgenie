import path from 'path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vercel from 'vite-plugin-vercel'

export default defineConfig({
  plugins: [vue(), vercel()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        // 👇 koristi Railway API URL kad si na deploy-u
        target: process.env.VITE_API_URL || 'http://localhost:4242',
        changeOrigin: true,
      },
    },
  }
})
