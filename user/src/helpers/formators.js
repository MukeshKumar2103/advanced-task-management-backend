const JwtHelpers = require('./jwt-helpers');
const Logs = require('./logDetails');
const Redis = require('./redis');

const { logDetails } = Logs;
const { getHashDataFromCache } = Redis;
const { decryptJwtObject } = JwtHelpers;

const formatRequest = (isPublic) => {
  return async (req, res, next) => {
    const traceId = req.headers['x-trace-id'] || '-';
    const ip = req.headers['x-forwarded-for'] || req.ip;
    const userAgent = req.headers['user-agent'];
    const authToken = req.headers['authorization'] || '';
    const token = authToken?.split('Bearer ')?.[1];

    let obj = {};

    await logDetails({
      traceId: traceId,
      message: 'Inside theformat request',
    });

    if (token && !isPublic) {
      const tokenExist = await getHashDataFromCache(token);

      // if (!tokenExist || isEmptyObject(tokenExist)) {
      //   return res.status(403).json(
      //     formatResponse({
      //       action: 'Verify token.',
      //       code: 0,
      //       data: [{ message: 'Forbidden' }],
      //     })
      //   );
      // }

      // await logDetails({
      //   traceId: traceId,
      //   message: 'tokenExist',
      //   data: JSON.stringify({ tokenExist }),
      // });

      const parsedToken = await decryptJwtObject(token, tokenExist?.secret);

      if (!parsedToken || isEmptyObject(parsedToken)) {
        return res.status(403).json(
          formatResponse({
            action: 'Verify token.',
            code: 0,
            data: [{ message: 'Forbidden' }],
          })
        );
      }

      await logDetails({
        traceId: traceId,
        message: 'parsedToken',
        data: JSON.stringify({ parsedToken }),
      });

      obj['data'] = parsedToken;
      obj['token'] = token;
    }

    const logObject = {
      traceId: traceId,
      url: req?.path,
      query: req?.query || {},
      body: req?.body || {},
      ip: ip,
      userAgent: userAgent,
      ...obj,
    };
    req['formatedData'] = logObject;
    next();
  };
};

const formatResponse = ({
  action = '',
  code = 0,
  message = null,
  page = null,
  data = [],
}) => {
  return {
    action,
    responseCode: code,
    responseMessage: message || (code === 0 ? 'Failed' : 'Success'),
    totalSize: data.length,
    totalPage: page || 0,
    result: data,
  };
};

const isEmptyObject = (obj) => {
  return Object.keys(obj).length === 0;
};

module.exports = {
  formatRequest,
  formatResponse,
  isEmptyObject,
};
