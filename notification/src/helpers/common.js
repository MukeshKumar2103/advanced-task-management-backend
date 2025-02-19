const crypto = require('crypto');

function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

const generateAesKey = () => {
  const aesKey = crypto.randomBytes(32);
  return crypto
    .createHash('sha256')
    .update(aesKey)
    .digest('base64')
    .substring(0, 32);
};

const isEmptyObject = (obj) => {
  return Object.keys(obj).length === 0;
};

module.exports = { generateUUID, generateAesKey, isEmptyObject };
