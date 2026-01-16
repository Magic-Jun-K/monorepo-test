// import { defineConfig } from 'vite';
// import react from '@vitejs/plugin-react';
// import tailwindcss from '@tailwindcss/vite';
// import dts from 'vite-plugin-dts';
// import { resolve } from 'node:path';

// // https://vite.dev/config/
// export default defineConfig({
//   plugins: [
//     react(),
//     tailwindcss(),
//     dts({
//       entryRoot: resolve(__dirname, 'src'),
//       include: ['src/**/*.{ts,tsx}'],
//       exclude: ['src/**/*.test.*', 'src/**/*.spec.*', 'src/**/*.example.*', 'vite.config.ts'],
//       outDir: 'lib/types',
//       insertTypesEntry: true,
//       rollupTypes: true,
//       tsconfigPath: resolve(__dirname, 'tsconfig.app.json')
//     })
//   ],
//   resolve: {
//     alias: {
//       '@': resolve(__dirname, './src')
//     }
//   },
//   build: {
//     outDir: 'lib',
//     lib: {
//       entry: resolve(__dirname, 'src/index.ts'),
//       formats: ['es'],
//       fileName: 'index'
//     },
//     // 代码压缩配置 - 使用rolldown的oxc压缩器
//     minify: 'esbuild', // rolldown-vite会自动使用oxc
//     rollupOptions: {
//       external: ['react', 'react-dom', 'react/jsx-runtime'],
//       output: {
//         format: 'es',
//         exports: 'auto',
//         globals: {
//           react: 'React',
//           'react-dom': 'ReactDOM',
//           'react/jsx-runtime': 'jsxRuntime'
//         },
//         assetFileNames: '[name][extname]',
//         // 启用更激进的代码分割和压缩
//         manualChunks: undefined,
//         // 移除不必要的代码
//         preserveModules: false
//       }
//     },
//     // CSS处理配置
//     cssCodeSplit: false,
//     // 启用CSS压缩
//     cssMinify: true
//   },
//   // CSS 配置优化 - 使用PostCSS处理和压缩CSS
//   css: {
//     // PostCSS配置
//     postcss: './postcss.config.js'
//   }
// });
