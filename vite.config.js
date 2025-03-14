import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { loadEnv } from "vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [react()],
    define: {
      "process.env": {},
    },
    server: {
      proxy: {
        '/api/deepl': {
          target: 'https://api-free.deepl.com/v2',
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/api\/deepl/, ''),
          configure: (proxy, _options) => {
            proxy.on('error', (err, _req, _res) => {
              console.log('proxy error', err);
            });
            proxy.on('proxyReq', (proxyReq, req, _res) => {
              // Xóa header Authorization cũ nếu có
              proxyReq.removeHeader('Authorization');
              // Thêm header Authorization mới
              proxyReq.setHeader('Authorization', `DeepL-Auth-Key ${env.VITE_DEEPL_API_KEY}`);
              console.log('Sending Request to the Target:', req.method, req.url);
            });
            proxy.on('proxyRes', (proxyRes, req, _res) => {
              console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
            });
          },
        }
      }
    }
  };
});
