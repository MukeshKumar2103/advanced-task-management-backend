const redisPool = require('../config/redis');

const getHashDataFromCache = async (key) => {
  const client = await redisPool.acquire();
  try {
    const values = await client.hgetall(key);
    return values;
  } catch (error) {
    console.error('Error fetching values from Redis hash:', error);
    return null;
  } finally {
    await redisPool.release(client);
  }
};

const getHashValueFromCache = async (key, field) => {
  const client = await redisPool.acquire();
  try {
    const values = await client.hget(key, field);
    return values;
  } catch (error) {
    console.warn(error);
  } finally {
    await redisPool.release(client);
  }
};

const setHashDataToCache = async (key, field, value) => {
  const client = await redisPool.acquire();
  try {
    const cacheValue = await client.hset(key, field, value);
    await client.expire(key, 1800);
    return cacheValue;
  } catch (error) {
    console.warn(error);
  } finally {
    await redisPool.release(client);
  }
};

const setRedisHashData = async (key, redisData, needToExpire) => {
  const client = await redisPool.acquire();
  try {
    const cacheValue = await client.hset(key, redisData);
    if (needToExpire) {
      await client.expire(key, 1800);
    }
    return cacheValue;
  } catch (error) {
    console.warn('Error storing data in Redis:', error);
  } finally {
    await redisPool.release(client);
  }
};

const getAllKeys = async () => {
  const keys = [];
  let cursor = '0';
  const client = await redisPool.acquire();
  try {
    do {
      const reply = await client.scan(cursor);
      cursor = reply[0];
      keys.push(...reply[1]);
    } while (cursor !== '0');
  } catch (error) {
    console.error('Error fetching keys from Redis:', error);
  } finally {
    await redisPool.release(client);
  }
  return keys;
};

const deleteKeyFromCache = async (key) => {
  const client = await redisPool.acquire();
  try {
    const result = await client.del(key);
    return result; // Returns the number of keys deleted
  } catch (error) {
    console.warn('Error deleting key from Redis:', error);
  } finally {
    await redisPool.release(client);
  }
};

module.exports = {
  getHashDataFromCache,
  getHashValueFromCache,
  setHashDataToCache,
  getAllKeys,
  setRedisHashData,
  deleteKeyFromCache,
};
