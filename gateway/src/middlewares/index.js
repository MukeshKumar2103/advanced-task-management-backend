const routes = require('./routes');
const redis = require('./redis');
const callServices = require('./callServices');
const sessions = require('./sessions');
const auth = require('./auth');

module.exports = { routes, redis, callServices, sessions, auth };
