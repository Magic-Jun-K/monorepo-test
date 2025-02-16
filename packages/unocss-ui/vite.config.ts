import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import UnoCSS from '@unocss/vite';
import { presetUno, presetAttributify, transformerDirectives } from 'unocss';
import dts from 'vite-plugin-dts';
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    UnoCSS({
      mode: 'global',
      presets: [
        presetUno(),
        presetAttributify()
      ],
      // 启用 class 转换
      transformers: [
        transformerDirectives() // 启用指令转换器
      ],
      // 自定义规则
      rules: [
        ['flex-center', { display: 'flex', 'align-items': 'center', 'justify-content': 'center' }]
      ]
    }),
    react(),
    dts({
      include: ['src'],
      exclude: ['src/**/*.test.tsx', 'src/**/*.test.ts'],
      outDir: 'build/es/types',
      rollupTypes: true, // 自动生成类型声明
      insertTypesEntry: true // 自动插入类型声明
    })
  ],
  build: {
    outDir: 'build/es',
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      formats: ['es'],
      fileName: 'index'
    },
    rollupOptions: {
      external: ['react', 'react-dom'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM'
        },
        assetFileNames: 'index.css' // 指定输出文件的名称
      }
    },
    cssCodeSplit: false // 是否将 CSS 代码分割为单独的文件
  }
});
