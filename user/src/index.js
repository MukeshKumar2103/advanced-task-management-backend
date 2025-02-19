const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const config = require('./config');
const routes = require('./routes');
const { databaseConnection } = require('./database');
const { DateUtil } = require('./helpers');

const { RoutesV1 } = routes;
const { getCurrentUTC, getLocalTimeFromUTC } = DateUtil;

const { Env, Logger } = config;

const app = express();
databaseConnection();

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Logger middleware
morgan.token('ip', (req) => req.headers['x-forwarded-for'] || req.ip);
morgan.token('user-agent', (req) => req.headers['user-agent'] || '-');
morgan.token('traceId', (req) => req?.traceId);

const morganFormat =
  ':traceId :method :url :status :response-time ms :ip ":user-agent"';

app.use(
  morgan(morganFormat, {
    stream: {
      write: async (message) => {
        const [
          traceId,
          method,
          url,
          status,
          responseTime,
          seconds,
          ip,
          ...rest
        ] = message.split(' ');
        const userAgent = rest.join(' ').match(/"(.*)"/)?.[1];

        const e = new Error();
        const regex = /\((.*):(\d+):(\d+)\)$/;
        const value = e?.stack?.split('\n')[2];

        if (value) {
          const match = regex.exec(value);

          // const fileName = match[1];
          const line = match?.[2];

          const logObject = {
            method: method,
            url: url,
            status: status,
            responseTime: `${responseTime} ${seconds}`,
            ip: ip,
            userAgent: userAgent,
          };

          Logger.info(
            `[${traceId}]: Request completed ${JSON.stringify(
              logObject
            )} file:${JSON.stringify({
              fileName: 'src/index.js',
              lineNumber: line,
            })}`
          );
        }
      },
    },
  })
);

app.listen(Env.port, () => {
  console.log(`User Service is Listening to Port ${Env.port}`);
});

app.get('/', (req, res) => {
  res.send({
    status: 'OK',
    service: 'User Service',
    'utc timestamp': getCurrentUTC(),
    'local timestamp': getLocalTimeFromUTC(
      getCurrentUTC(),
      'd, DD MMM YYYY HH:mm:ss'
    ),
    // timestamp: getLocalTimeFromUTC(getCurrentUTC()),
  });
});

app.use('/user-service', RoutesV1);
