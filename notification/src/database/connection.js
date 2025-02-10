const mongoose = require('mongoose');

// configs
const config = require('../config');
const { Env } = config;

// connect to db
const connectDB = () => {
  mongoose
    .connect(Env.connectionString)
    .then(() => {
      console.log('Notification Service Mongo Connected!');
    })
    .catch(() => {
      console.log('Connection to User Service Mongo Failed!');
    });
};

module.exports = connectDB;
