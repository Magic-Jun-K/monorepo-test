import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import dts from 'vite-plugin-dts';
import { resolve } from 'node:path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), dts()],
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
        }
      }
    },
    // 使用现代ES语法
    target: 'es2022'
  }
});