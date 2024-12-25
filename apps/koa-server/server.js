const Koa = require('koa');
const path = require('path');
const fs = require('fs');
const koaStatic = require('koa-static');
const cors = require('@koa/cors');

const app = new Koa();

// 使用 @koa/cors 中间件来允许跨域请求
app.use(cors({
  origin: '*',  // 允许所有来源进行跨域请求，或者改成具体的 URL
}));

// 提供静态文件服务
app.use(koaStatic(path.join(__dirname, 'public')));

// 路由处理静态资源请求
app.use(async ctx => {
  const requestPath = ctx.request.path;

  // 处理 HTML 请求
  // if (requestPath === '/index.html') {
  //   ctx.type = 'html';
  //   ctx.body = fs.createReadStream(path.join(__dirname, 'public', 'index.html'));
  // }

  // 处理 CSS 请求
  // else if (requestPath === '/styles.css') {
  //   ctx.type = 'css';
  //   ctx.body = fs.createReadStream(path.join(__dirname, 'public', 'styles.css'));
  // }

  // 处理 JS 请求
  // else if (requestPath === '/script.js') {
  //   ctx.type = 'javascript';
  //   ctx.body = fs.createReadStream(path.join(__dirname, 'public', 'script.js'));
  // }

  // 处理图片请求
  if (requestPath === 'image.png') {
    ctx.type = 'image/jpeg';
    ctx.body = fs.createReadStream(path.join(__dirname, 'public', 'image.png'));
  }
  if (requestPath === 'iconCluster.png') {
    ctx.type = 'image/jpeg';
    ctx.body = fs.createReadStream(path.join(__dirname, 'public', 'iconCluster.png'));
  }

  // 如果请求的资源不存在
  else {
    ctx.status = 404;
    ctx.body = 'Resource not found';
  }
});

// 启动服务
app.listen(7000, () => {
  console.log('Server is running at http://localhost:7000');
});
