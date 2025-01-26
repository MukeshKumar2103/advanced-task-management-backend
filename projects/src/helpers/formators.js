const JwtHelpers = require('./jwt-helpers');
const Logs = require('./logDetails');
const Redis = require('./redis');

const { logDetails } = Logs;
const { getHashDataFromCache } = Redis;
const { decryptObject } = JwtHelpers;

// Format the request for logging
const formatRequestForLog = async (req, res, next) => {
  const { headers, path, query, body } = req;
  const traceId = Array.isArray(headers['x-trace-id'])
    ? headers['x-trace-id'][0]
    : headers['x-trace-id'] || '-';
  const ip = headers['x-forwarded-for'] || req.ip || '-';
  const userAgent = headers['user-agent'];
  const authToken = headers['authorization'] || '';

  await logDetails({
    traceId,
    message: 'Before split',
    data: JSON.stringify({ authToken }),
  });

  const token = authToken.split('Bearer ')[1];

  await logDetails({
    traceId,
    message: 'After split',
    data: JSON.stringify({ token }),
  });

  const tokenExist = await getHashDataFromCache(token);

  if (!tokenExist || isEmptyObject(tokenExist)) {
    return res.status(403).json(
      formatResponse({
        action: 'Verify token.',
        code: 0,
        data: [{ message: 'Token verification failed.' }],
      })
    );
  }

  await logDetails({
    traceId,
    message: 'tokenExist',
    data: JSON.stringify({ tokenExist }),
  });

  const parsedToken = await decryptObject(token, tokenExist?.resource_secret);

  if (!parsedToken || isEmptyObject(parsedToken)) {
    return res.status(403).json(
      formatResponse({
        action: 'Verify token.',
        code: 0,
        data: [{ message: 'Token verification failed.' }],
      })
    );
  }

  await logDetails({
    traceId,
    message: 'parsedToken',
    data: JSON.stringify({ parsedToken }),
  });

  const logObject = {
    traceId,
    url: path || '',
    query: query || {},
    body: body || {},
    ip: ip || '',
    userAgent: userAgent || '',
    data: parsedToken,
  };

  req.formatedData = logObject;
  next();
};

// Format the response
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

// Check if an object is empty
const isEmptyObject = (obj) => {
  return Object.keys(obj).length === 0;
};

// Export the functions using module.exports
module.exports = {
  formatRequestForLog,
  formatResponse,
  isEmptyObject,
};
