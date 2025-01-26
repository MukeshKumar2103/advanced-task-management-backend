const axios = require('axios');
const CircularJSON = require('circular-json');

const { logDetails } = require('../helpers/logDetails');
const logger = require('../config/logger');

const makeBackendAPICall = async (req, res) => {
  const traceId = req.traceId;
  const api = req.original_api;

  try {
    logger.warn(CircularJSON.stringify(req?.headers));
    await logDetails({ traceId, message: 'Inside the make backend api call' });

    const dns = api?.dns?.endsWith('/') ? api.dns : `${api?.dns}/`;
    const updatedBackendApi = api?.backendAPI?.startsWith('/')
      ? api.backendAPI.substring(1)
      : api.backendAPI;
    const fullUrl = `${dns}${updatedBackendApi}`;
    const METHOD = api?.method;
    const headers = {
      'X-Trace-ID': traceId || '',
      authorization: req?.headers['authorization'],
    };

    await logDetails({
      traceId,
      message: 'before call the API',
      data: JSON.stringify({
        api,
        dns,
        backendAPI: updatedBackendApi,
        url: fullUrl,
        method: METHOD,
        body: req.body,
        query: req.query,
      }),
    });

    let result;
    switch (METHOD) {
      case 'GET':
        result = await axios.get(fullUrl, { params: req.query, headers });
        break;
      case 'POST':
        result = await axios.post(fullUrl, req.body, {
          params: req.query,
          headers,
        });
        break;
      case 'PUT':
        result = await axios.put(fullUrl, req.body, {
          params: req.query,
          headers,
        });
        break;
      case 'PATCH':
        result = await axios.patch(fullUrl, req.body, {
          params: req.query,
          headers,
        });
        break;
      case 'DELETE':
        result = await axios.delete(fullUrl, {
          data: req.body,
          params: req.query,
          headers,
        });
        break;

      default:
        throw new Error('Invalid method');
    }

    await logDetails({
      traceId,
      message: 'After call the API',
      data: JSON.stringify(result?.data),
    });

    return res.status(200).json(result?.data);
  } catch (error) {
    const errorData = error.response ? error?.response?.data : error.message;
    await logDetails({
      level: 'error',
      traceId: traceId,
      message: `Making api call error due to this reason ${CircularJSON.stringify(
        errorData
      )}`,
    });
    return res.status(400).json(errorData);
  }
};

module.exports = makeBackendAPICall;
