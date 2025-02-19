const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const CircularJSON = require('circular-json');
const { Buffer } = require('buffer');

const Common = require('./common');
const Logs = require('./logDetails');

const { logDetails } = Logs;
const { generateUUID } = Common;

// Function to generate access token
const generateAccessToken = async (payload) => {
  const { traceId, id, email, secret } = payload;

  try {
    const accessToken = {
      email,
      secret,
    };

    const publicKey = generateUUID();
    const privateKey = generateUUID();

    // Log before encryption
    await logDetails({
      traceId,
      message: 'Before encrypt the data for JWT token',
      data: CircularJSON.stringify({
        userId: id,
        accessToken,
        publicKey,
        privateKey,
      }),
    });

    const encryptedData = encryptObject(
      {
        userId: id,
        accessToken: JSON.stringify(accessToken),
      },
      secret
    );

    const jwtObject = {
      accessToken: encryptedData,
      publicKey,
      privateKey,
    };

    const token = generateJWTToken(jwtObject, secret);

    // Log the generated token
    await logDetails({
      traceId,
      message: 'Access token',
      data: JSON.stringify({ token }),
    });

    return token;
  } catch (error) {
    // Error handling and logging
    await logDetails({
      level: 'error',
      traceId,
      message: `Access token creation failed due to this reason: ${error.message}`,
    });
    return `Access token creation failed due to this reason: ${error.message}`;
  }
};

// Function to generate JWT token
const generateJWTToken = (user, secret) => {
  return jwt.sign(user, secret, {
    expiresIn: '1h',
  });
};

// Function to hash password
const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  return hashedPassword;
};

// Function to compare passwords
const comparePassword = async (password1, password2) => {
  return await bcrypt.compare(password1, password2);
};

// Function to encrypt an object
function encryptObject(obj, key) {
  const jsonString = JSON.stringify(obj);
  const iv = crypto.randomBytes(16); // 16 bytes for AES block size
  const cipher = crypto.createCipheriv(
    'aes-256-cbc',
    crypto.createHash('sha256').update(key).digest(),
    iv
  );
  let encrypted = cipher.update(jsonString, 'utf8', 'base64');
  encrypted += cipher.final('base64');
  const encryptedData = `${iv.toString('base64')}:${encrypted}`;

  return encryptedData;
}

// Function to decrypt an object
function decryptObject(encryptedData, key) {
  console.log('encryptedData', encryptedData);
  if (!encryptedData || typeof encryptedData !== 'string') {
    throw new Error('Invalid encrypted data');
  }
  const [ivBase64, encryptedContent] = encryptedData.split(':');

  if (!ivBase64 || !encryptedContent) {
    throw new Error('Invalid encrypted data format');
  }

  const iv = Buffer.from(ivBase64, 'base64');
  const decipher = crypto.createDecipheriv(
    'aes-256-cbc',
    crypto.createHash('sha256').update(key).digest(),
    iv
  );

  let decrypted = decipher.update(encryptedContent, 'base64', 'utf8');
  decrypted += decipher.final('utf8');

  return JSON.parse(decrypted);
}

// Function to decrypt an jwt token
const decryptJwtObject = (token, secret) => {
  try {
    const encryptedData = jwt.verify(token, secret);

    const decryptedData = decryptObject(encryptedData.accessToken, secret);

    return decryptedData;
  } catch (error) {
    throw new Error(`Failed to decrypt object: ${error.message}`);
  }
};

// Export functions
module.exports = {
  generateAccessToken,
  generateJWTToken,
  hashPassword,
  comparePassword,
  encryptObject,
  decryptObject,
  decryptJwtObject,
};
