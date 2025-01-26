const { logDetails } = require('../helpers/logDetails');
const { auditSession } = require('../services/session_audit');

const sessionAudit = async function (req, res, next) {
  const traceId = req.traceId;
  try {
    await logDetails({
      level: 'info',
      traceId: traceId,
      message: 'Inside session audit',
    });

    const result = await auditSession(req, res);

    await logDetails({
      traceId: traceId,
      message: 'Session audit completed result',
      data: result,
    });
  } catch (error) {
    await logDetails({
      level: 'error',
      traceId: traceId,
      message: `Session audit error ${error?.message}`,
    });
  }
  next();
};

module.exports = { sessionAudit };
