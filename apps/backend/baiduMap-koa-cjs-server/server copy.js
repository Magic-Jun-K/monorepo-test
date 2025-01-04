// const Koa = require('koa');
// const staticServe = require('koa-static');
// const cors = require('@koa/cors');
// const path = require('path');

// // 创建 Koa 应用实例
// const app = new Koa();

// // Use CORS middleware
// app.use(
//   cors({
//     origin: '*' // Allow all origins, you can restrict this to specific origins if needed
//   })
// );

// // 设置静态文件目录，这里的 public 文件夹应该包含你的图片资源
// app.use(staticServe(path.join(__dirname, 'public')));

// // 启动服务器
// const port = 7000; // 你可以选择任何未被占用的端口
// app.listen(port, () => {
//   console.log(`Server running on http://localhost:${port}`);
// });

// // 访问 http://localhost:7000/image.png，如果你能看到图片，则表明你的静态文件服务器配置成功。
