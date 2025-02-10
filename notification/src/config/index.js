const EnvConfig = require('./env');
const Logger = require('./logger');
const Redis = require('./redis');

module.exports = {
  Env: EnvConfig(),
  Logger,
  Redis,
};
