import path from 'node:path';
import { fileURLToPath } from 'node:url';

// 模拟 CommonJS 的 __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
  mode: 'development',
  devtool: 'source-map', // 方便调试的 Source Map
  devServer: {
    static: { 
      directory: path.resolve(__dirname, 'public'),
      publicPath: '/', // 设置静态资源的公共路径
    },
    port: 3000,
    open: true, // 启动时自动打开浏览器
    hot: true, // 热更新
    historyApiFallback: true, // 处理SPA路由
    proxy: [{
      context: ['/api'],
      target: 'http://localhost:7000',
      changeOrigin: true,
      pathRewrite: { '^/api': '' }
    }]
  }
};
