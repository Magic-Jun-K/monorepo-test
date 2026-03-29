import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import dts from 'vite-plugin-dts';
import { resolve } from 'node:path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    dts({
      entryRoot: resolve(__dirname, 'src'),
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/**/*.test.*', 'src/**/*.spec.*', 'src/**/*.example.*', 'vite.config.ts'],
      outDir: 'lib/types',
      insertTypesEntry: true,
      rollupTypes: true,
      tsconfigPath: resolve(__dirname, 'tsconfig.app.json'),
    }),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'lib',
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      formats: ['es'],
      fileName: 'index',
    },
    // 代码压缩配置 - 使用rolldown的oxc压缩器
    minify: 'oxc',
    rolldownOptions: {
      external: ['react', 'react-dom', 'react/jsx-runtime'],
      output: {
        format: 'es',
        exports: 'auto',
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          'react/jsx-runtime': 'jsxRuntime',
        },
        assetFileNames: '[name][extname]',
        manualChunks: undefined, // 禁用手动代码分割
        preserveModules: false,
      },
    },
    // CSS处理配置
    cssCodeSplit: false,
    // 启用CSS压缩
    cssMinify: true,
  },
  // CSS 配置优化 - 使用PostCSS处理和压缩CSS
  css: {
    // PostCSS配置
    postcss: './postcss.config.js',
  },
  esbuild: {
    drop: ['console', 'debugger'], // 移除console和debugger语句
    legalComments: 'none', // 移除所有注释
    minifyIdentifiers: true, // 压缩标识符
    minifySyntax: true, // 压缩语法
    minifyWhitespace: true, // 压缩空白字符
    target: 'es2022', // 启用额外的压缩选项
  },
  // 优化构建性能
  optimizeDeps: {
    // 排除某些依赖的优化
    exclude: ['react', 'react-dom', 'react/jsx-runtime'],
  },
});
