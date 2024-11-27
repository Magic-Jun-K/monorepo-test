import path from 'node:path';
import { fileURLToPath } from 'node:url';

// 模拟 CommonJS 的 __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
  mode: 'development',
  devtool: 'source-map', // 方便调试的 Source Map
  devServer: {
    static: path.resolve(__dirname, 'dist'),
    port: 3000,
    open: true, // 启动时自动打开浏览器
    hot: true, // 热更新
  },
}