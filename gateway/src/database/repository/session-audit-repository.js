const { Redis, Logs } = require('../../helpers');
const sessionAudit = require('../models/session_audit.model');

const { logDetails } = Logs;

const createSessionAudit = async (req, session = null) => {
  const traceId = req.traceId;
  const forwardedFor = req.headers['x-forwarded-for'];
  const clientIp = forwardedFor
    ? forwardedFor.split(',')[0].trim()
    : req.ip || req.connection.remoteAddress;
  const userAgent = req.headers['user-agent'];

  let resourceId = null;
  const authToken = await req?.headers['authorization'];
  const token = await authToken?.split('Bearer ');

  if (authToken && token?.[1] && token?.[1]?.length > 0) {
    resourceId = await Redis.getHashValueFromCache(token?.[1], 'resourceId');
  }

  const newAudit = {
    ipAddress: clientIp,
    agent: userAgent,
    path: req.path,
    method: req.method,
    resourceId,
  };

  logDetails({
    traceId: traceId,
    message: 'Before audit session creation',
    data: JSON.stringify(newAudit),
  });

  return await sessionAudit.create(newAudit, { session });
};

module.exports = {
  createSessionAudit,
};
