import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import UnoCSS from '@unocss/vite';
import dts from 'vite-plugin-dts';
import { fileURLToPath, URL } from 'node:url';
import { resolve } from 'node:path';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  plugins: [
    UnoCSS({ mode: 'global' }),
    react(),
    dts({
      include: ['src'],
      exclude: ['src/**/*.test.tsx', 'src/**/*.test.ts'],
      outDir: 'lib/types',
      rollupTypes: true, // 自动生成类型声明
      insertTypesEntry: true // 自动插入类型声明
    })
  ],
  build: {
    outDir: 'lib',
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      formats: ['es'],
      fileName: 'index'
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
        defaults: true
      },
      format: {
        comments: false, // 移除所有注释
      },
      // mangle: {
      //   // 保留可能与 React DevTools 冲突的标识符
      //   reserved: [
      //     'recentlyCreatedOwnerStacks',
      //     '__reactInternalInstance$',
      //     '__reactFiber$',
      //     '__reactMemoCache$',
      //     '__reactProfilerDevTools',
      //     '__REACT_DEVTOOLS_GLOBAL_HOOK__'
      //   ],
      //   keep_fnames: true, // 保留函数名，防止 React DevTools 冲突
      //   keep_classnames: true // 保留类名，防止 React DevTools 冲突
      // }
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'react/jsx-runtime'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          'react/jsx-runtime': 'jsxRuntime'
        },
        assetFileNames: 'index.css' // 指定输出文件的名称
      }
    },
    cssCodeSplit: false // 是否将 CSS 代码分割为单独的文件
  }
});