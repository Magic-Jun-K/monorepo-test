import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import UnoCSS from '@unocss/vite';
import dts from 'vite-plugin-dts';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  plugins: [
    UnoCSS({ mode: 'global' }),
    react({
      jsxRuntime: 'automatic',
      babel: {
        plugins: [
          // 添加Babel运行时配置
          [
            '@babel/plugin-transform-runtime',
            {
              corejs: 3, // @babel/runtime-corejs3
              absoluteRuntime: true, // 重要：启用绝对路径解析
            },
          ],
        ],
      },
    }),
    dts({
      include: ['src'],
      exclude: ['src/**/*.test.tsx', 'src/**/*.test.ts'],
      outDir: 'lib/es/types',
      rollupTypes: true, // 自动生成类型声明
      insertTypesEntry: true, // 自动插入类型声明
    }),
  ],
  build: {
    target: 'es2015', // 确保兼容 IE
    outDir: 'lib/es',
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      // formats: ['es', 'cjs'],
      formats: ['es'],
      // fileName: (format) => `index.${format === 'es' ? 'mjs' : 'cjs'}`
      fileName: 'index',
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'clsx'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          clsx: 'clsx',
        },
        assetFileNames: 'index.css', // 指定输出文件的名称
      },
    },
    cssCodeSplit: false, // 是否将 CSS 代码分割为单独的文件
  },
});
