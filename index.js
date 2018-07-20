const Promise = require('bluebird');
const Task = require('./app/mongo/task');
const Machine = require('./app/mongo/machine');
global.logger = require('./app/logger');
global.Promise = Promise;
global.Task = Promise.promisifyAll(Task);
global.Machine = Promise.promisifyAll(Machine);
const {onTaskSchedule} = require('./app/scheduler');
const init = require('./app/init');
const bodyParser = require('body-parser');
const express = require('express');
const app = express();

init()
  .then(() => Task.find({ 'machineId': null }))
  .then(res => {
    res.forEach(task => {
      onTaskSchedule(task._doc);
    });
  })
  .catch(err => logger.error(err));

// 启动服务，便于将新的任务请求过来
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.post('/task', function (req, res) {
  const task = new Task({
    'id': Number(req.body.id),
    'group': req.body.group,
    'cpus': 1,
    'times': Number(req.body.times),
  });
  task.save(function(error) {
    if (error) {
      logger.error('插入失败!');
      res.send('插入失败!');
    } else {
      logger.debug('插入成功!');
      onTaskSchedule(task._doc);
      res.send('插入成功!');
    }
  });
}).listen(8081, () => logger.debug('app is now listening on port 8081!'));
