const mongoose = require('mongoose');

// configs
const config = require('../config');
const { Env } = config;

// connect to db
const connectDB = () => {
  mongoose
    .connect(Env.connectionString)
    .then(() => {
      console.log('API Bus Mongo Connected!');
    })
    .catch(() => {
      console.log('Connection to API Bus Mongo Failed!');
    });
};

module.exports = connectDB;
