import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  plugins: [
    react(),
    dts({
      include: ['src'],
      exclude: ['src/**/*.test.tsx', 'src/**/*.test.ts'],
      outDir: 'lib',
      rollupTypes: true, // 自动生成类型声明
      insertTypesEntry: true, // 自动插入类型声明
    }),
  ],
  build: {
    outDir: 'lib',
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      formats: ['es'],
      fileName: 'index',
    },
    // 代码压缩混淆
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
        reserved: ['recentlyCreatedOwnerStacks', '__reactInternalInstance$'],
      },
    },
    rollupOptions: {
      // external 告诉 Rollup 哪些模块不需要被打包
      external: ['react', 'react-dom', 'antd', '@ant-design/icons', 'clsx'],
      output: {
        preserveModules: false, // 不保留模块结构
        // 确保外部化处理那些你不想打包进库的依赖
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          // 'antd': 'antd',
          // '@ant-design/icons': 'AntDesignIcons',
          clsx: 'clsx',
        },
        entryFileNames: 'index.mjs', // 固定入口文件名
        // assetFileNames: 'index.css' // 添加CSS输出文件名配置
        chunkFileNames: 'chunks/[name].[hash].mjs', // 非入口文件添加hash
        assetFileNames: 'index[extname]', // .css
      },
    },
    cssCodeSplit: true, // 将CSS代码分割为单独的文件，确保样式被正确加载
    sourcemap: false, // 不生成sourcemap
    emptyOutDir: true, // 构建前清空输出目录
  },
});
