const { DateUtils, Logs, Common, Formators } = require('../helper');
const {
  ResourcesRepository,
  ResourcesSessionRepository,
} = require('../database');
const { getCurrentUTC } = require('../helper/dateUtil');

const { getResource } = ResourcesRepository;
const { getSession } = ResourcesSessionRepository;

const { validateDates } = DateUtils;
const { logDetails } = Logs;
const { isEmptyObject } = Common;
const { formatResponse } = Formators;

const mongoose = require('mongoose');

const verifyResourceToken = async (req, res) => {
  const { traceId, data } = await req.formatedData;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    await logDetails({
      traceId: traceId,
      message: 'Inside verify token',
      data: JSON.stringify({
        traceId,
        data,
      }),
    });

    if (isEmptyObject(data) || !data) {
      await logDetails({
        traceId: traceId,
        message: 'Token not exist in redis',
      });
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
      message: 'Token exists in redis',
      data: JSON.stringify(data),
    });

    const isUserExist = await getResource(
      {
        id: data?.userId,
        isActive: true,
      },
      session
    );

    if (isUserExist?.length === 0) {
      await logDetails({
        traceId: traceId,
        message: 'User not exist',
      });
      await session.abortTransaction();
      return res.status(403).json(
        formatResponse({
          action: 'Verify token.',
          code: 0,
          data: [{ message: 'Forbidden' }],
        })
      );
    }

    const isSessionExist = await getSession(data?.userId, session);

    if (isSessionExist?.length === 0) {
      await logDetails({
        traceId: traceId,
        message: 'Session not exist',
        data: JSON.stringify(
          formatResponse({
            action: 'Verify token.',
            code: 0,
            data: [{ message: 'Forbidden' }],
          })
        ),
      });
      await session.abortTransaction();
      return res.status(403).json(
        formatResponse({
          action: 'Verify token.',
          code: 0,
          data: [{ message: 'Forbidden' }],
        })
      );
    }

    if (validateDates(getCurrentUTC(), isSessionExist?.[0]?.expiryTime)) {
      await session.commitTransaction();
      const responseData = formatResponse({
        action: 'Verify token.',
        code: 1,
        data: [{ message: 'Token verified Successfully.' }],
      });
      return res.status(200).json(responseData);
    } else {
      await session.abortTransaction();
      return res.status(403).json(
        formatResponse({
          action: 'Verify token.',
          code: 0,
          data: [{ message: 'Forbidden' }],
        })
      );
    }
  } catch (error) {
    await session.abortTransaction();
    await logDetails({
      level: 'error',
      traceId: traceId,
      message: 'Error verifying token',
      data: error.message,
    });
    return res.status(500).json(
      formatResponse({
        action: 'Verify token.',
        code: 0,
        data: [{ message: error?.message || 'Internal Server Error' }],
      })
    );
  } finally {
    session.endSession();
  }
};

module.exports = {
  verifyResourceToken,
};
