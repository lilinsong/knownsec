const R = require('ramda');
const Promise = require('bluebird');
const Task = require('./app/mongo/task');
const Machine = require('./app/mongo/machine');
global.logger = require('./app/logger');
global.Promise = Promise;
global.Task = Promise.promisifyAll(Task);
global.Machine = Promise.promisifyAll(Machine);
const {onTaskSchedule, getMachineInfo} = require('./app/scheduler');
const init = require('./app/init');
const bodyParser = require('body-parser');
const express = require('express');
const app = express();

init() // 每次重启的时候初始化machine，并且拿取未执行的任务执行
  .then(() => Task.find({ 'machineId': null }))
  .then(res => {
    res.forEach(task => {
      onTaskSchedule(task._doc);
    });
  })
  .catch(err => logger.error(err));

setInterval(() => { // 定时检测是否有machine空闲，是否有task待运行，如果都有，则调度任务
  getMachineInfo()
    .then(machines => {
      let unusedCpus = 0;
      for (let machine of machines) {
        unusedCpus += machine.cpus - machine.usedCpus;
      }
      if (unusedCpus > 0) {
        Task.find({ 'machineId': null })
          .then(res => {
            if (!R.isEmpty(res)) {
              res.forEach(task => {
                onTaskSchedule(task._doc);
              });
            }
          });
      }
      return Promise.resolve();
    });
}, 1000);

// 启动服务，便于将新的任务请求过来
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.post('/task', function (req, res) {
  if (R.isEmpty(req.body)) {
    throw new Error('请求参数不能为空！');
  }
  if (!req.body.id || !req.body.group || !req.body.times) {
    throw new Error('请求参数id, group, times不能为空！');
  }
  const re = /^[1-9]+[0-9]*]*$/;
  if (!re.test(req.body.id) || !re.test(req.body.times)) {
    throw new Error('请求参数id 或 times不合法！');
  }
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
      res.send('插入成功!');
    }
  });
}).listen(8081, () => logger.debug('app is now listening on port 8081!'));
