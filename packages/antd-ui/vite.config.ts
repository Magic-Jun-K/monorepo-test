import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';
import { resolve } from 'node:path';

export default defineConfig({
  plugins: [
    react(),
    dts({
      include: ['src'],
      exclude: ['src/**/*.test.tsx', 'src/**/*.test.ts'],
      outDir: 'es',
      rollupTypes: true, // 自动生成类型声明
      insertTypesEntry: true // 自动插入类型声明
    })
  ],
  build: {
    outDir: 'es',
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      formats: ['es'],
      fileName: 'index'
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'antd', '@ant-design/icons', 'clsx'],
      output: {
        preserveModules: false, // 不保留模块结构
        // 确保外部化处理那些你不想打包进库的依赖
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          // 'antd': 'antd',
          // '@ant-design/icons': 'AntDesignIcons',
          clsx: 'clsx'
        },
        entryFileNames: 'index.mjs', // 固定入口文件名
        // assetFileNames: 'index.css' // 添加CSS输出文件名配置
        chunkFileNames: 'chunks/[name].[hash].mjs', // 非入口文件添加hash
        assetFileNames: 'index[extname]' // .css
      }
    },
    cssCodeSplit: true, // 将CSS代码分割为单独的文件，确保样式被正确加载
    minify: true, // 压缩代码
    sourcemap: false, // 不生成sourcemap
    emptyOutDir: true // 构建前清空输出目录
  }
});
