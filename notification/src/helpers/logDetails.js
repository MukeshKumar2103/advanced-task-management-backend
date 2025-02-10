const configs = require('../config');
const { Logger } = configs;

const logDetails = async ({
  level = 'info',
  traceId,
  message = '',
  data = null,
}) => {
  const e = new Error();
  const regex = /\((.*):(\d+):(\d+)\)$/;
  const value = e?.stack?.split('\n')[2];
  let fileObject = {};

  if (value) {
    const match = regex.exec(value);

    const line = match?.[2];
    // const column = match?.[3];
    // const fullPath = match?.[1];
    const path = getPathAfterSrc(match?.[1] || '');

    fileObject = {
      // filepath: fullPath,
      fileName: path || 'undefined',
      lineNumber: line || 'undefined',
      // column: column,
    };
  }

  let logMessage = '';

  if (typeof data === 'object')
    logMessage = `[${traceId}]: ${message} ${JSON.stringify(
      data
    )} file:${JSON.stringify(fileObject)}`;
  if (typeof data === 'string')
    logMessage = `[${traceId}]: ${message} ${data} file:${JSON.stringify(
      fileObject
    )}`;
  else
    logMessage = `[${traceId}]: ${message} file:${JSON.stringify(fileObject)}`;

  const normalizedLevel = level.toLowerCase();

  if (Logger[normalizedLevel]) {
    return await Logger[normalizedLevel](logMessage);
  } else {
    throw new Error('Invalid log level');
  }
};

const getPathAfterSrc = (str) => {
  let newStr = str?.split('/');

  const indexOfSrc = newStr?.indexOf('src');
  const path = newStr?.slice(indexOfSrc - newStr.length);

  return str ? path?.join('/') : 'undefined';
};

module.exports = {
  logDetails,
  getPathAfterSrc,
};
