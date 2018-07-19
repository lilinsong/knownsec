const Promise = require('bluebird');
const Task = require('./app/mongo/task');
const Machine = require('./app/mongo/machine');
global.logger = require('./app/logger');
global.Promise = Promise;
global.Task = Promise.promisifyAll(Task);
global.Machine = Promise.promisifyAll(Machine);

// const init = require('./app/init');
// init();

// const opts = {'_id': 0, '__v': 0};
// Machine.find({}, opts)
// .then(res => {
//   res.forEach(data => {
//     logger.debug(data._doc);
//   });
// })
// .catch(err => logger.error(err));
const {onTaskSchedule} = require('./app/scheduler');
const task = {
  'id': 0,
  'group': 'group2',
  'cpus': 1,
  'times': 10
};
onTaskSchedule(task).then(res => logger.debug(task.id + ' --> ' + res));
