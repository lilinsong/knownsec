const Promise = require('bluebird');
const Task = require('./app/mongo/task');
const Machine = require('./app/mongo/machine');
global.logger = require('./app/logger');
global.Promise = Promise;
global.Task = Promise.promisifyAll(Task);
global.Machine = Promise.promisifyAll(Machine);
const {onTaskSchedule} = require('./app/scheduler');
const init = require('./app/init');


// const opts = {'_id': 0, '__v': 0};
init()
  .then(() => Task.find({ 'machineId': null }))
  .then(res => {
    res.forEach(task => {
      onTaskSchedule(task._doc)
        .then(machineId => logger.debug(task._doc.id + ' --> ' + machineId));
    });
  })
  .catch(err => logger.error(err));
