const mongoose = require('mongoose');

// configs
const config = require('../config');
const { Env } = config;

// connect to db
const connectDB = () => {
  mongoose
    .connect(Env.connectionString)
    .then(() => {
      console.log('Auth Service Mongo Connected!');
    })
    .catch(() => {
      console.log('Connection to Auth Service Mongo Failed!');
    });
};

module.exports = connectDB;
