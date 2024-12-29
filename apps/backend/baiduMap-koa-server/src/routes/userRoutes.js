const Router = require('@koa/router');
const router = new Router();

/**
 * 用户相关路由
 */
router.get('/users', async (ctx) => {
  ctx.body = 'User list';
});

module.exports = router;
