const config = require('config');
var mongoose = require('mongoose');

// const user = config.get('mongo.user');
// const password = config.get('mongo.password');
const host = config.get('mongo.host');
const port = config.get('mongo.port');
const database = config.get('mongo.database');

const url = `mongodb://${host}:${port}/${database}`;
// const url = `mongodb://${user}:${password}@${host}:${port}/${database}`;

/**
 * 连接
 */
mongoose.connect(url);

/**
  * 连接成功
  */
mongoose.connection.on('connected', function () {
  logger.debug('Mongoose connection open to ' + url);
});

/**
 * 连接异常
 */
mongoose.connection.on('error',function (err) {
  logger.error('Mongoose connection error: ' + err);
});

/**
 * 连接断开
 */
mongoose.connection.on('disconnected', function () {
  logger.debug('Mongoose connection disconnected');
});

module.exports = mongoose;
