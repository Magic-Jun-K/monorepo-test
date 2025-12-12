/**
 * Redis配置
 */
import { registerAs } from '@nestjs/config';

export default registerAs('redis', () => ({
  // Redis连接配置
  connection: {
    url: process.env.REDIS_URL || 'localhost',
    port: Number.parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || undefined,
    db: Number.parseInt(process.env.REDIS_DB || '0', 10),
  },

  // LRU缓存配置
  lru: {
    // 默认过期时间（秒）
    defaultTTL: Number.parseInt(process.env.REDIS_DEFAULT_TTL || '3600', 10),

    // 最大内存策略设置为LRU
    // 注意：这需要在Redis配置文件中设置 maxmemory-policy allkeys-lru
    // 以及设置适当的 maxmemory 值
    maxMemoryPolicy: 'allkeys-lru',

    // 缓存键前缀
    keyPrefix: process.env.REDIS_KEY_PREFIX || 'app:',

    // 不同类型数据的缓存时间（秒）
    ttl: {
      user: Number.parseInt(process.env.REDIS_USER_TTL || '3600', 10), // 用户数据缓存1小时
      product: Number.parseInt(process.env.REDIS_PRODUCT_TTL || '7200', 10), // 产品数据缓存2小时
      config: Number.parseInt(process.env.REDIS_CONFIG_TTL || '86400', 10), // 配置数据缓存1天
    },
  },
}));
