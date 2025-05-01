import { defineConfig /* loadEnv */ } from 'vite';
import react from '@vitejs/plugin-react-swc';
import { visualizer } from 'rollup-plugin-visualizer';
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer';
import wasm from 'vite-plugin-wasm';
import path from 'node:path';
import tailwindcss from '@tailwindcss/vite';
// import UnoCSS from '@unocss/vite';

import assemblyscriptPlugin from './plugins/vite-plugin-assemblyscript';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // const env = loadEnv(mode, process.cwd(), '');
  const isProd = mode === 'production';
  console.log('mode', mode);
  // console.log('env', env);
  return {
    plugins: [
      // UnoCSS({ mode: 'global' }), // 确保UnoCSS使用全局模式
      react(),
      tailwindcss(),
      wasm(),
      assemblyscriptPlugin(),
      ViteImageOptimizer({
        jpg: { quality: 80 },
        png: { quality: 85 },
        webp: { quality: 80 },
        avif: { quality: 70 },
        cache: true,
        includePublic: true,
        cacheLocation: path.resolve(
          process.cwd(),
          'node_modules/.cache/vite-plugin-image-optimizer'
        )
      }),
      isProd &&
        visualizer({
          open: true,
          filename: 'build/stats.html'
        })
    ],
    resolve: {
      alias: {
        '@': '/src'
      },
      extensions: ['.ts', '.tsx', '.js', '.json']
    },
    worker: {
      format: 'es' // 明确指定 worker 格式
    },
    build: {
      outDir: 'build',
      sourcemap: !isProd, // 生成 sourcemap 文件
      manifest: true, // 生成 manifest.json 文件
      minify: isProd ? 'terser' : false, // 启用压缩
      cssCodeSplit: true, // 启用 CSS 代码拆分
      rollupOptions: {
        output: {
          chunkFileNames: 'js/[name].[hash].chunk.js',
          entryFileNames: 'js/[name].[hash].js',
          assetFileNames: ({ name }) => {
            if (/\.(woff2?|ttf)$/.test(name ?? '')) {
              return 'fonts/[name].[hash][extname]';
            }
            if (/\.(jpe?g|png|webp|gif|svg)$/.test(name ?? '')) {
              return 'images/[name].[hash][extname]';
            }
            return 'assets/[name].[hash][extname]';
          },
          manualChunks: id => {
            const patterns = [
              { name: 'react-core', test: /[\\/](react-dom|scheduler)[\\/]/ },
              { name: 'data-grid', test: /@glideapps[\\/]/ },
              { name: 'echarts', test: /echarts[\\/]/ },
              { name: 'axios', test: /axios[\\/]/ },
              { name: 'core-js', test: /core-js[\\/]/ },
              { name: 'lodash', test: /lodash[\\/]/ }
            ];
            if (id.includes('node_modules')) {
              const matched = patterns.find(p => p.test.test(id));
              return matched ? matched.name : 'vendor';
            }
          }
        },
        external: ['BMapGL']
      },
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true
        }
      }
    },
    server: {
      host: true, // 启用所有地址，包括本地IP和localhost
      // port: 3000,
      // open: true, // 启动自动打开浏览器
      proxy: {
        '/api': {
          target: 'http://localhost:7000',
          changeOrigin: true,
          rewrite: path => path.replace(/^\/api/, '')
        }
      }
    }
  };
});
