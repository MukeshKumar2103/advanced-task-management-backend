const dotenv = require('dotenv');
const Joi = require('joi');

const result = dotenv.config({ path: '.env' });

if (result.error) {
  throw new Error(`Failed to load .env file: ${result.error.message}`);
}

const envVarsSchema = Joi.object()
  .keys({
    NODE_ENV: Joi.string()
      .valid('production', 'development', 'test')
      .required(),
    PORT: Joi.number().default(3000),
    CONNECTION_STRING: Joi.string()
      .required()
      .description('Database connection string'),

    REDIS_HOST: Joi.string().required(),
    REDIS_PORT: Joi.number().default(6379),
    REDIS_DB: Joi.number().default(0),
  })
  .unknown();

function createConfig() {
  const { value: envVars, error } = envVarsSchema
    .prefs({ errors: { label: 'key' } })
    // eslint-disable-next-line no-undef
    .validate(process.env);

  if (error) {
    throw new Error(`Config validation error: ${error.message}`);
  }

  return {
    env: envVars.NODE_ENV,
    port: envVars.PORT,
    connectionString: envVars.CONNECTION_STRING,
    redis: {
      host: envVars.REDIS_HOST,
      port: envVars.REDIS_PORT,
      db: envVars.REDIS_DB,
    },
  };
}

module.exports = createConfig;
