import { defineConfig } from 'tsup';

export default defineConfig({
  // 多入口点配置
  entry: {
    'web/index': 'src/web/index.ts',
    'node/index': 'src/node/index.ts',
  },
  dts: true, // 生成类型声明文件
  splitting: false, // 禁用代码拆分，因为我们只有一个入口文件
  sourcemap: false, // 禁用 sourcemap，因为我们不需要在生产环境中调试
  clean: true, // 每次构建前清理输出目录
  // format: ['esm', 'cjs'], // 输出 ES 模块和 CommonJS 格式
  format: ['esm'], // 输出 ES 模块格式
  outDir: 'lib', // 输出目录
  treeshake: true, // 启用摇树优化
  minify: true, // 启用压缩
  tsconfig: 'tsconfig.json', // 指定 tsup 使用的 tsconfig.json 配置文件
  external: ['argon2'], // 外部依赖，不打包进输出文件
});
