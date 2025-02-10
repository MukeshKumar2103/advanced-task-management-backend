const redis = require('../config/redis');

const getDataFromCache = async (req, res, next) => {
  const key = `${req.route?.path}`;
  let response = null;

  try {
    const cache = await redis.get(key);
    if (cache) {
      response = JSON.parse(cache);
      return res.status(200).json(response);
    } else {
      next();
    }
  } catch (error) {
    next();
  }
};

module.exports = {
  getDataFromCache,
};
