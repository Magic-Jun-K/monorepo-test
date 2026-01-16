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
//       exclude: [
//         'src/**/*.test.*', 
//         'src/**/*.spec.*', 
//         'src/**/*.example.*',
//         'vite.config.ts'
//       ],
//       outDir: 'lib/types',
//       insertTypesEntry: true,
//       rollupTypes: true,
//       // 明确指定要处理的文件，避免处理配置文件
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
//     // 代码压缩混淆
//     // minify: 'terser',
//     // // 通过 terserOptions 移除 console 并深度压缩
//     // terserOptions: {
//     //   compress: {
//     //     drop_console: true, // 移除所有 console.*
//     //     drop_debugger: true, // 移除 debugger
//     //     pure_funcs: ['console.log', 'console.warn'], // 也可以指定移除特定函数
//     //     // 启用所有压缩变换，会移除空格、换行、未使用的变量等
//     //     defaults: true
//     //   },
//     //   format: {
//     //     comments: false, // 移除所有注释
//     //   },
//     //   mangle: {
//     //     // 保留可能与 React DevTools 冲突的标识符
//     //     reserved: [
//     //       'recentlyCreatedOwnerStacks',
//     //       '__reactInternalInstance$'
//     //     ]
//     //   }
//     // },
//     rollupOptions: {
//       // 正确external react和react-dom，避免重复打包
//       external: ['react', 'react-dom', 'react/jsx-runtime'/* , 'clsx', 'lucide-react' */],
//       output: {
//         format: 'es',
//         // 确保所有模块都使用 ES 模块格式
//         exports: 'auto',
//         // 明确指定外部依赖的全局变量名
//         globals: {
//           react: 'React',
//           'react-dom': 'ReactDOM',
//           'react/jsx-runtime': 'jsxRuntime',
//           // 'clsx': 'clsx',
//           // 'lucide-react': 'lucideReact'
//         },
//         assetFileNames: '[name][extname]'
//       }
//     },
//     // 浏览器兼容性
//     target: 'es2022',
//     // 确保CSS被正确处理
//     cssCodeSplit: false,
//   }
// });