const cacheManager = require('cache-manager');

/**
 * 缓存实例
 */
const cache = cacheManager.createCache({
  store: 'memory', // 使用内存存储
  max: 100, // 最大缓存数量
  ttl: 10 /* seconds */ // 过期时间
});

module.exports = cache;
