const { logDetails } = require('../helpers/logDetails');

const axios = require('axios');

const verifyToken = async (req, res, next) => {
  const traceId = req.traceId;
  const api = req.original_api;

  await logDetails({
    traceId: traceId,
    message: 'Inside verify token',
    data: JSON.stringify({ userIsVerified: req.userIsVerified }),
  });

  if (!req.userIsVerified) {
    try {
      const authToken = await req?.headers['authorization'];

      const checkBearer = authToken.includes('Bearer');

      if (!checkBearer) {
        await logDetails({
          level: 'error',
          traceId: traceId,
          message: 'Token not valid',
          data: JSON.stringify({
            check: checkBearer,
          }),
        });
        return res.status(403).send(`${traceId}: Forbidden`);
      }

      if (authToken?.length === 0 || !authToken) {
        await logDetails({
          level: 'error',
          traceId: traceId,
          message: 'Token not found',
        });
        return res.status(403).send(`${traceId}: Forbidden - Token not found`);
      }

      await logDetails({
        traceId: traceId,
        message: 'Token exist',
        data: JSON.stringify(api),
      });

      if (api?.service === 'user-services') {
        try {
          const res = await axios.post(
            'http://localhost:8001/user-service/api/v1/auth/user/token/verify',
            {},
            {
              headers: {
                authorization: authToken,
                'x-trace-id': traceId,
              },
            }
          );

          if (res?.data?.responseCode === 1) {
            req.userIsVerified = true;
            await logDetails({
              traceId: traceId,
              message: 'Private route: Token verified',
            });
            next();
          } else {
            await logDetails({
              traceId: traceId,
              message: 'Error while verifyToken',
              data: JSON.stringify(res.data),
            });
            return res.status(403).json(res.data);
          }
        } catch (error) {
          // Handle errors
          await logDetails({
            traceId: traceId,
            message: 'Error verifying token:',
            data: JSON.stringify(
              error.response ? error.response.data : error.message
            ),
          });
          return res
            .status(403)
            .json(error.response ? error.response.data : error.message);
        }
      }
    } catch (error) {
      await logDetails({
        level: 'error',
        traceId: traceId,
        message: error?.message,
      });
      return res.status(403).send(`${traceId}: Invalid token`);
    }
  } else {
    await logDetails({
      traceId: traceId,
      message: 'Public route: Token verified',
    });
    next();
  }
};

module.exports = { verifyToken };
