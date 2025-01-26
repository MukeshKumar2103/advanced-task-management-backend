const { Redis: RedisClient } = require('ioredis');
const genericPool = require('generic-pool');
const EnvConfig = require('./env');

const env = EnvConfig();

const redisConfig = {
  host: env.redis.host,
  port: env.redis.port,
  db: env.redis.db,
};

const factory = {
  create: async () => new RedisClient(redisConfig),
  destroy: async (client) => await client.quit(),
};

const redisPool = genericPool.createPool(factory, {
  min: 10,
  max: 20,
  // You can uncomment these options if needed
  // idleTimeoutMillis: 30000,
  // acquireTimeoutMillis: 10000,
});

module.exports = redisPool;
