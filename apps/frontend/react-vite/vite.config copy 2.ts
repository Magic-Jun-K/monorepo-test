// vite.config.ts
import { defineConfig, /* loadEnv */ } from 'vite';
import react from '@vitejs/plugin-react-swc';
import { visualizer } from 'rollup-plugin-visualizer';
// import svgr from 'vite-plugin-svgr';
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer';
import { resolve } from 'node:path';

export default defineConfig(({ mode }) => {
  // const env = loadEnv(mode, process.cwd(), '');
  const isProd = mode === 'production';

  return {
    root: __dirname,
    publicDir: 'public',
    plugins: [
      react({
        tsDecorators: true,
        jsxImportSource: '@emotion/react',
        plugins: [['@swc/plugin-styled-components', {}]]
      }),
      // svgr({
      //   svgrOptions: {
      //     svgoConfig: {
      //       plugins: [
      //         { name: 'removeViewBox', active: false },
      //         { name: 'convertColors', params: { currentColor: true } }
      //       ]
      //     }
      //   },
      //   include: '**/*.svg?react'
      // }),
      ViteImageOptimizer({
        jpg: { quality: 80 },
        png: { quality: 85 },
        webp: { quality: 80 },
        avif: { quality: 70 },
        cache: true,
        includePublic: true
      }),
      isProd &&
        visualizer({
          open: true,
          filename: 'dist/stats.html'
        })
    ],
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src')
      },
      extensions: ['.ts', '.tsx', '.js', '.json']
    },
    css: {
      modules: {
        localsConvention: 'camelCase',
        generateScopedName: isProd ? '[hash:base64:5]' : '[local]--[hash:base64:5]'
      },
      preprocessorOptions: {
        scss: {
          additionalData: `@import "@/styles/variables.scss";`
        }
      }
    },
    build: {
      outDir: resolve(__dirname, 'build'),
      assetsInlineLimit: 4096,
      sourcemap: true,
      minify: isProd ? 'terser' : false,
      cssCodeSplit: true,
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
            if (id.includes('node_modules')) {
              if (id.includes('react-dom') || id.includes('scheduler')) {
                return 'react-core';
              }
              if (id.includes('@glideapps')) {
                return 'data-grid';
              }
              if (id.includes('echarts')) {
                return 'echarts';
              }
              if (id.includes('axios')) {
                return 'axios';
              }
              if (id.includes('core-js')) {
                return 'core-js';
              }
              if (id.includes('lodash')) {
                return 'lodash';
              }
              return 'vendor';
            }
          }
        },
        external: ['BMapGL']
      },
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true
        },
        format: {
          comments: /@license/i
        }
      }
    },
    server: {
      host: true, // 启用所有地址，包括本地IP和localhost
      port: 3000,
      open: true,
      proxy: {
        '/api': {
          target: 'http://localhost:7000',
          changeOrigin: true,
          rewrite: path => path.replace(/^\/api/, '')
        }
      },
      // 热更新
      hmr: {
        // 禁用或配置 HMR 连接
        overlay: false
      }
    }
  };
});
