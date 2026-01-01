// import { defineConfig } from 'vite';
// import react from '@vitejs/plugin-react';
// import { visualizer } from 'rollup-plugin-visualizer';

// // https://vite.dev/config/
// export default defineConfig(({ mode }) => ({
//   plugins: [react(), visualizer({ open: true })],
//   resolve: {
//     alias: {
//       '@': '/src'
//     }
//   },
//   server: {
//     host: '0.0.0.0', // 允许通过 IP 访问
//     // port: 3000,
//     // open: true, // 启动自动打开浏览器
//     proxy: {
//       '/api': {
//         target: 'http://localhost:7100',
//         changeOrigin: true,
//         rewrite: path => path.replace(/^\/api/, '')
//       }
//     }
//   },
//   worker: {
//     format: 'es' // 明确指定 worker 格式
//   },
//   build: {
//     outDir: 'dist',
//     assetsDir: 'static',
//     sourcemap: mode !== 'production',
//     manifest: true,
//     rollupOptions: {
//       output: {
//         manualChunks: {
//           react: ['react', 'react-dom'],
//           vendor: ['axios', 'clsx', 'hash-wasm'],
//           routing: ['react-router-dom'],
//           state: ['@reduxjs/toolkit', 'react-redux']
//         }
//       },
//       external: [/^node:.*/]
//     },
//     terserOptions: {
//       compress: {
//         drop_console: true,
//         drop_debugger: true
//       }
//     }
//   }
// }));
