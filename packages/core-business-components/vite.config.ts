import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import wasm from 'vite-plugin-wasm';
import dts from 'vite-plugin-dts';
import { resolve } from 'node:path';

import assemblyscriptPlugin from './plugins/vite-plugin-assemblyscript';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    wasm(),
    assemblyscriptPlugin(),
    dts({
      include: ['src'],
      exclude: ['src/**/*.test.tsx', 'src/**/*.test.ts'],
      outDir: 'lib/types',
      rollupTypes: true, // 自动生成类型声明
      insertTypesEntry: true, // 自动插入类型声明
      tsconfigPath: resolve(__dirname, 'tsconfig.app.json') // 明确指定 tsconfig 路径
    })
  ],
  resolve: {
    alias: {
      '@': '/src'
    },
    extensions: ['.ts', '.tsx', '.js', '.json']
  },
  worker: {
    format: 'es', // 明确指定 worker 格式
    plugins: () => [react()] // 为Worker添加插件支持
  },
  build: {
    outDir: 'lib',
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'CoreBusinessComponents',
      formats: ['es'], // 只生成 ES 模块格式
      fileName: (format) => {
        const formatMap: Record<string, string> = {
          es: 'es/index.js'
          // 移除了 cjs 相关配置
        };
        return formatMap[format] || `${format}/index.js`;
      }
    },
    rollupOptions: {
      external: ['react', 'react-dom'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM'
        }
      }
    },
    sourcemap: true,
    minify: true,
    cssCodeSplit: false // 是否将 CSS 代码分割为单独的文件
  },
  server: {
    host: true, // 启用所有地址，包括本地IP和localhost
    proxy: {
      '/api': {
        target: 'http://localhost:7000',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/api/, '')
      }
    }
  }
});