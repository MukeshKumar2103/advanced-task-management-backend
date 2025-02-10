const mongoose = require('mongoose');
const { userAppEvents } = require('./user_app_events');
const { Env } = require('../config');
const {
  Common,
  Formators,
  Logs,
  JwtHelpers,
  DateUtil,
  Redis,
  Notification,
} = require('../helpers');
const {
  userSessionRepository,
  verificationSessionRepository,
} = require('../database');

const { createVerificationSession } = verificationSessionRepository;
const { getSession, createUserSession, getSessionAndUpdateAll } =
  userSessionRepository;
const { generateAesKey } = Common;
const { generateExpiryTimeUTC, validateDates } = DateUtil;
const { formatResponse } = Formators;
const { logDetails } = Logs;
const {
  generateAccessToken,
  encryptObject,
  hashPassword,
  comparePassword,
  decryptObject,
} = JwtHelpers;
const { setHashDataToCache } = Redis;
const { sendNotification } = Notification;

const signUp = async (req, res) => {
  const { traceId, ...logObject } = await req['formatedData'];

  const session = await mongoose.startSession();
  session.startTransaction();

  await logDetails({
    traceId: traceId,
    message: 'Inside sign-up',
    data: JSON.stringify(logObject),
  });

  try {
    const { email, firstName, lastName, password } = req.body;

    const payload = {
      email,
      firstName,
      lastName,
      isActive: true,
      isEmailVerified: false,
      password: await hashPassword(password),
    };

    const isUserExist = await userAppEvents({
      payload: {
        event: 'CHECK_USER_EXIST',
        data: { email },
      },
      session,
    });

    // check user is exist
    if (isUserExist?.result?.length > 0) {
      await logDetails({
        traceId: traceId,
        message: 'User already exist',
      });
      throw new Error('User already exists');
    }

    await logDetails({
      traceId: traceId,
      message: 'User not exist',
    });

    // create new user
    const result = await userAppEvents({
      payload: {
        event: 'CREATE_USER',
        data: { user: payload },
      },
    });

    const user = result?.result?.[0];

    // create a verification session
    const secret = Env.email.verificationKey;
    const startTime = generateExpiryTimeUTC(0);
    const expirationTime = generateExpiryTimeUTC(
      Env.email.verificationExiprationTime
    );
    const encryptionObject = {
      id: user?._id,
      email,
      startTime,
      expirationTime,
    };

    const verificationToken = encryptObject(encryptionObject, secret);

    const verificationSessionData = {
      userId: user?._id,
      code: verificationToken,
      expirationTime: expirationTime,
      startTime: startTime,
      status: 'active',
      isActive: true,
    };

    const sessionCreated = await createVerificationSession({
      data: verificationSessionData,
      session,
    });

    if (!sessionCreated) {
      await logDetails({
        traceId: traceId,
        message:
          'After created the verification session for email verification',
        data: JSON.stringify(sessionCreated),
      });
      throw new Error('email verification session creation error');
    }

    await logDetails({
      traceId: traceId,
      message: 'After created the verification session for email verification',
      data: JSON.stringify(sessionCreated),
    });

    await setHashDataToCache(user?._id, 'user', user);
    // await setHashDataToCache(user?._id, 'token', token);

    await logDetails({
      traceId: traceId,
      message: 'After created user',
      data: JSON.stringify({ user }),
    });

    // send verification email
    const notificationPayload = {
      sendTo: email,
      event: 'SIGN-UP',
      data: {
        firstName,
        lastName,
        content: signUpContent({
          data: { firstName, lastName, token: verificationToken },
        }),
      },
    };

    const isVerificationEmailSend = await sendNotification({
      traceId,
      payload: notificationPayload,
    });

    await logDetails({
      traceId: traceId,
      message: 'After send verification email notification',
      data: JSON.stringify({ isVerificationEmailSend }),
    });

    const formatedResponse = formatResponse({
      action: 'Signup',
      code: 1,
      data: [{ message: 'User successfully signed up' }],
    });

    await session.commitTransaction();

    return res.status(200).json(formatedResponse);
  } catch (error) {
    const responseData = formatResponse({
      action: 'signUp',
      code: 1,
      data: [{ message: error.message }],
    });
    await session.abortTransaction();
    return res.status(500).json(responseData);
  } finally {
    session.endSession();
  }
};

const verifyEmail = async (req, res) => {
  const { traceId, ...logObject } = await req['formatedData'];

  const session = await mongoose.startSession();
  session.startTransaction();

  const { token } = req.body;

  await logDetails({
    traceId: traceId,
    message: 'Inside verify email',
    data: JSON.stringify({ token, logs: logObject, body: req.body }),
  });

  try {
    const emailVerificationSecret = Env.email.verificationKey;

    const tokenValues = decryptObject(token, emailVerificationSecret);

    const isTokenExist =
      await verificationSessionRepository.getVerificationSession(
        tokenValues?.id,
        { code: token }
      );

    if (isTokenExist?.length === 0) throw new Error('Invalid token');

    if (
      !isTokenExist?.[0]?.isActive &&
      isTokenExist?.[0]?.status === 'in-active'
    )
      throw new Error('Token expired');

    const currentTime = generateExpiryTimeUTC();

    const isTokenExpired = validateDates(
      currentTime,
      tokenValues?.expirationTime
    );

    await logDetails({
      traceId: traceId,
      message: 'verified token expiration time',
      data: JSON.stringify({
        currentTime,
        expirationTime: tokenValues?.expirationTime,
      }),
    });

    if (!isTokenExpired) throw new Error('Token expired');

    const isUserExist = await userAppEvents({
      payload: {
        event: 'CHECK_USER_EXIST',
        data: { email: tokenValues?.email },
      },
      session,
    });

    if (isUserExist?.result?.length === 0) {
      await logDetails({
        traceId: traceId,
        message: 'User not found',
      });
      throw new Error('User not found');
    }

    const user = isUserExist?.result?.[0];

    await logDetails({
      traceId: traceId,
      message: 'User exist',
      data: JSON.stringify({ user }),
    });

    const isUserEmailVerificationStatusUpdated = await userAppEvents({
      payload: {
        event: 'UPDATE_USER',
        data: {
          user: { id: user?._id, updatedData: { isEmailVerified: true } },
        },
      },
      session,
    });

    await logDetails({
      traceId: traceId,
      message: 'After verified token',
      data: JSON.stringify({
        token: token,
      }),
    });

    const updatedSessionExpiration =
      await verificationSessionRepository.updateVerificationSession(
        tokenValues?.id
      );

    if (!updatedSessionExpiration)
      throw new Error('Error while updating session information');

    const formatedResponse = formatResponse({
      action: 'Email verification completed',
      code: 1,
    });

    await session.commitTransaction();

    return res.status(200).json(formatedResponse);
  } catch (error) {
    const responseData = formatResponse({
      action: 'Email verification failed',
      code: 0,
      data: [{ message: error.message }],
    });
    await session.abortTransaction();
    return res.status(500).json(responseData);
  } finally {
    session.endSession();
  }
};

const signIn = async (req, res) => {
  const { traceId, ...logObject } = await req['formatedData'];

  const session = await mongoose.startSession();
  session.startTransaction();

  await logDetails({
    traceId: traceId,
    message: 'Inside login',
    data: JSON.stringify(logObject),
  });

  try {
    const { email, password } = req.body;

    const isUserExist = await userAppEvents({
      payload: {
        event: 'CHECK_USER_EXIST',
        data: { email },
      },
      session,
    });

    if (isUserExist?.result?.length === 0) {
      await logDetails({
        traceId: traceId,
        message: 'User not found',
      });
      throw new Error('User not found');
    }

    await logDetails({
      traceId: traceId,
      message: 'User exist',
    });

    const user = isUserExist?.result?.[0];

    const isPasswordValid = await comparePassword(password, user?.password);

    if (!isPasswordValid) throw new Error('Password is not valid');

    await logDetails({
      traceId: traceId,
      message: 'Password verified',
    });

    const secret = generateAesKey();

    // auth token
    const token = await generateAccessToken({
      id: user?._id,
      traceId,
      email,
      secret,
    });

    const sessionData = {
      userId: user?._id,
      authToken: token,
      expirationTime: generateExpiryTimeUTC(Env.session.exiprationTime),
      startTime: generateExpiryTimeUTC(0),
      status: 'active',
      isActive: true,
      secret: secret,
    };

    const isSessionExist = await getSession(user?._id, session);

    if (isSessionExist?.length === 0) {
      const sessionCreated = await createUserSession(sessionData, session);
      await logDetails({
        traceId: traceId,
        message: 'After created the session',
        data: JSON.stringify(sessionCreated),
      });
    }

    // session exist
    if (isSessionExist?.length > 0) {
      await getSessionAndUpdateAll(user?._id, session);

      const sessionCreated = await createUserSession(sessionData, session);

      await logDetails({
        traceId: traceId,
        message: 'After created the session',
        data: JSON.stringify(sessionCreated),
      });
    }

    await setHashDataToCache(user?._id, 'token', token);

    await logDetails({
      traceId: traceId,
      message: 'After generated token',
      data: JSON.stringify({
        token: token,
      }),
    });

    const formatedResponse = formatResponse({
      action: 'Signup',
      code: 1,
      data: [
        {
          authToken: token,
          user: { id: user?._id },
        },
      ],
    });

    await session.commitTransaction();

    return res.status(200).json(formatedResponse);
  } catch (error) {
    const responseData = formatResponse({
      action: 'signUp',
      code: 1,
      data: [{ message: error.message }],
    });
    await session.abortTransaction();
    return res.status(500).json(responseData);
  } finally {
    session.endSession();
  }
};

module.exports = { signUp, verifyEmail, signIn };

const signUpContent = ({ data }) => {
  const baseUrl = 'http://localhost:3000/auth/verify-email';

  const link = `${baseUrl}?token=${data?.token}`;

  return `<div>
                Hello ${data?.first_name} ${data?.last_name || ''}
                <br/>
                Are you ready to gain access to all of the assets we prepared for clients of [company]?
                <br/>
                First, you must complete your registration by clicking on the button below:
                <br/>
                <a href=${link}>Click Here</a>
                <br/>
                This link will verify your email address, and then you’ll officially be a part of the [customer portal] community.
                <br/>
                See you there!
                <br/>
                Best regards, the [company] team</h3>
              </div>`;
};
