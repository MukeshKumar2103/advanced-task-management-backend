const { createLogger, format, transports } = require('winston');

const ENV_CONFIG = require('./env');
const environmentVariables = ENV_CONFIG();

const formatOptions = {
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:SSS' }),
    format.align(),
    format.printf((info) => {
      return `${info.timestamp} ${info.level.toUpperCase()} ${info.message}`;
    }),
    format.colorize()
  ),
};

const logger = createLogger({
  level: 'debug',
  transports: [
    new transports.File({
      filename: 'logs/server.log',
      format: formatOptions.format,
    }),
  ],
});

// Add console transport in non-production environments
if (environmentVariables.env !== 'production') {
  logger.add(
    new transports.Console({
      format: formatOptions.format,
    })
  );
}

module.exports = logger;
