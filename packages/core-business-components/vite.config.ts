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
      tsconfigPath: resolve(__dirname, 'tsconfig.app.json'), // 明确指定 tsconfig 路径
    }),
  ],
  resolve: {
    alias: {
      '@': '/src',
    },
    extensions: ['.ts', '.tsx', '.js', '.json'],
  },
  worker: {
    // format: 'es', // 明确指定 worker 格式
    plugins: () => [react()], // 为Worker添加插件支持
    // rollupOptions: {
    //   output: {
    //     assetFileNames: (assetInfo) => {
    //       // 将 worker 文件输出到 worker 目录
    //       if (assetInfo.name?.endsWith('.js') && assetInfo.name.includes('worker')) {
    //         return 'worker/[name][extname]';
    //       }
    //       return assetInfo.name || '[name][extname]';
    //     }
    //   }
    // }
  },
  build: {
    outDir: 'lib',
    // 1. 启用库模式
    lib: {
      entry: resolve(__dirname, 'src/index.ts'), // 库的入口文件
      name: 'CoreBusinessComponents', // 库的全局变量名（UMD格式时需要）
      formats: ['es'], // 只生成 ES 模块格式
      fileName: (format) => `index.${format}.js`, // 简化为固定命名，输出到lib根目录
    },
    // 2. 代码压缩混淆
    minify: 'terser',
    // 通过 terserOptions 移除 console 并深度压缩
    terserOptions: {
      compress: {
        drop_console: true, // 移除所有 console.*
        drop_debugger: true, // 移除 debugger
        pure_funcs: ['console.log', 'console.warn'], // 也可以指定移除特定函数
        // 启用所有压缩变换，会移除空格、换行、未使用的变量等
        defaults: true,
      },
      format: {
        comments: false, // 移除所有注释
      },
      mangle: {
        // 保留可能与 React DevTools 冲突的标识符
        reserved: [
          'recentlyCreatedOwnerStacks',
          '__reactInternalInstance$',
          // '__reactFiber$',
          // '__reactMemoCache$',
          // '__reactProfilerDevTools',
          // '__REACT_DEVTOOLS_GLOBAL_HOOK__'
        ],
        // keep_fnames: true, // 保留函数名，防止 React DevTools 冲突
        // keep_classnames: true // 保留类名，防止 React DevTools 冲突
      },
    },
    rollupOptions: {
      // 3. 不将依赖打包进库，由宿主项目提供（重要！）
      external: ['react', 'react-dom', '@eggshell/antd-ui'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          '@eggshell/antd-ui': 'AntdUI',
        },
      },
    },
    sourcemap: true,
    cssCodeSplit: false, // 是否将 CSS 代码分割为单独的文件
  },
  server: {
    host: true, // 启用所有地址，包括本地IP和localhost
    proxy: {
      '/api': {
        target: 'http://localhost:7000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
});
