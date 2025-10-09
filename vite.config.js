import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { viteAwesomeSvgLoader } from 'vite-awesome-svg-loader'

// vite配置: https://vite.dev/config/
// vite-awesome-svg-loader插件配置: https://github.com/matafokka/vite-awesome-svg-loader
export default defineConfig({
  plugins: [vue(), viteAwesomeSvgLoader({ defaultImport: 'source' })],1
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  // 解决抛出警告“Deprecation Warning: The legacy JS API is deprecated and will be removed in Dart Sass 2.0.0.”
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler'
      }
    }
  },
  // 代理访问后端系统（开发测试用，build前需要删除或注释）
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:30000/',
        changeOrigin: true
      }
    }
  }
})
