// vite.config.js
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
          target: 'https://api-free.deepl.com',
          changeOrigin: true,
          secure: true,
          rewrite: (path) => path.replace(/^\/api\/deepl/, ''),
          configure: (proxy, _options) => {
            proxy.on('error', (err, _req, _res) => {
              console.log('proxy error', err);
            });
            proxy.on('proxyReq', (proxyReq, req, _res) => {
              // Remove old Authorization header if exists
              proxyReq.removeHeader('Authorization');
              // Add new Authorization header
              proxyReq.setHeader('Authorization', `DeepL-Auth-Key ${env.VITE_DEEPL_API_KEY}`);
              
              // Don't modify Content-Type for multipart/form-data requests
              if (!req.headers['content-type']?.includes('multipart/form-data')) {
                proxyReq.setHeader('Content-Type', req.headers['content-type'] || 'application/json');
              }
              
              console.log('Sending Request to the Target:', req.method, req.url);
              
              // Log request headers for debugging
              console.log('Request Headers:');
              const headers = proxyReq.getHeaders();
              for (const header in headers) {
                console.log(`${header}: ${headers[header]}`);
              }
            });
            proxy.on('proxyRes', (proxyRes, req, _res) => {
              console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
              
              // Log response headers for debugging
              console.log('Response Headers:');
              for (const header in proxyRes.headers) {
                console.log(`${header}: ${proxyRes.headers[header]}`);
              }
            });
          },
        }
      }
    }
  };
});
