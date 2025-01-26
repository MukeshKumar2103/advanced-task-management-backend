const { APIBusMasterModel } = require('../database/index');
const { Logs, Redis } = require('../helpers');

const { logDetails } = Logs;
const { getHashValueFromCache } = Redis;

const getActualRoute = async (req, res, next) => {
  const traceId = req.traceId;

  await logDetails({
    traceId: traceId,
    message: 'Inside get actual url',
  });

  const path = req.path;
  const method = req.method?.toLowerCase();
  const params = req.params;

  await logDetails({
    traceId: traceId,
    message: 'Before get actual url',
    data: JSON.stringify({
      path: path,
      isActive: true,
      method: method,
    }),
  });

  const cacheKey = `${path}:${req.method?.toString()?.toUpperCase()}`;
  let api = await getHashValueFromCache('activeApiRoutes', cacheKey);

  if (api) {
    await logDetails({
      traceId: traceId,
      message: 'API route found in redis cacheKey',
    });
    const parsedApi = JSON.parse(api);
    api = new APIBusMasterModel(parsedApi);
  } else {
    await logDetails({
      traceId: traceId,
      message: 'API route found in DB',
    });
    const getApi = await APIBusMasterModel.findOne({
      path: path,
      isActive: true,
      method: req.method?.toString()?.toUpperCase(),
    });
    api = getApi;
  }

  if (api) {
    req.original_api = api;
    await logDetails({
      traceId: traceId,
      message: 'Actual Url',
      data: JSON.stringify(api),
    });
    next();
  } else {
    const logObject = {
      url: path,
      method: method,
      params: params,
      body: req.body,
    };

    await logDetails({
      level: 'error',
      traceId: traceId,
      message: 'Route not found. Request data:',
      data: JSON.stringify(logObject),
    });
    res.status(404).send(`${traceId}: Route not found`);
  }
};

const verifyRoute = async function (req, res, next) {
  const traceId = req.traceId;

  await logDetails({
    traceId: traceId,
    message: 'Inside verify route',
  });

  const api = req.original_api;

  if (api?.isPublic) {
    req.userIsVerified = true;
    await logDetails({
      traceId: traceId,
      message: 'Public route: Token verified',
    });
    next();
  } else {
    req.userIsVerified = false;
    await logDetails({
      traceId: traceId,
      message: 'Private route: Token not verified',
    });
    next();
  }
};

module.exports = { getActualRoute, verifyRoute };
