import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  base: '/',
  server: {
    proxy: {
      '/dictvoice': {
        target: 'https://dict.youdao.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/dictvoice/, '/dictvoice'),
        secure: true,
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            // console.log('代理有道API请求:', req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, res) => {
            // console.log('有道API响应状态:', proxyRes.statusCode);
            // 添加CORS头
            proxyRes.headers['Access-Control-Allow-Origin'] = '*';
            proxyRes.headers['Access-Control-Allow-Methods'] = 'GET, OPTIONS';
            proxyRes.headers['Access-Control-Allow-Headers'] = 'Content-Type';
          });
          proxy.on('error', (err, req, res) => {
            console.error('代理错误:', err);
          });
        }
      }
    }
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html')
      }
    }
  }
})