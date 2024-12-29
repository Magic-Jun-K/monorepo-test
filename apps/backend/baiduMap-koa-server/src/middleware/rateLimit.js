const rateLimit = require('koa-ratelimit');

/**
 * 速率限制中间件
 */
const limiter = rateLimit({
  driver: 'memory',
  db: new Map(),
  duration: 60000, // 1分钟
  errorMessage: 'Too many requests, please try again later.',
  id: (ctx) => ctx.ip,
  headers: {
    remaining: 'Rate-Limit-Remaining',
    reset: 'Rate-Limit-Reset',
    total: 'Rate-Limit-Total'
  },
  max: 100, // 限制100个请求
  disableHeader: false,
  // whitelist: (ctx) => {
  //   // some logic that returns a boolean
  // },
  // blacklist: (ctx) => {
  //   // some logic that returns a boolean
  // }
});

module.exports = limiter;
