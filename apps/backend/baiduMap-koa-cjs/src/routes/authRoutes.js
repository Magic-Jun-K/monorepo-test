const Router = require('@koa/router');
const router = new Router();

/**
 * 认证相关路由
 */
router.post('/login', async (ctx) => {
  ctx.body = 'Login';
});

module.exports = router;
