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
      // 更明确地指定入口点，避免处理配置文件
      entryRoot: resolve(__dirname, 'src'),
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/*.test.*', 
        'src/**/*.spec.*', 
        'src/**/*.example.*',
        'vite.config.ts'
      ],
      outDir: 'lib/types',
      insertTypesEntry: true,
      rollupTypes: true,
      // 明确指定要处理的文件，避免处理配置文件
      tsconfigPath: resolve(__dirname, 'tsconfig.app.json')
    })
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src')
    }
  },
  build: {
    outDir: 'lib',
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      formats: ['es'],
      fileName: 'index'
    },
    rollupOptions: {
      // 正确external react和react-dom，避免重复打包
      external: ['react', 'react-dom', 'react/jsx-runtime'],
      output: {
        format: 'es',
        // 确保所有模块都使用 ES 模块格式
        exports: 'auto',
        // 明确指定外部依赖的全局变量名
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          'react/jsx-runtime': 'jsxRuntime'
        },
        assetFileNames: '[name][extname]'
      }
    },
    // 浏览器兼容性
    target: 'es2022',
    // 确保CSS被正确处理
    cssCodeSplit: false
  }
});