// 利用该脚本向mongodb插入machine信息
const Machine = require('../mongo/machine');
global.logger = require('../logger');
const machines = [
  {
    'cpus': 2,
    'usedCpus': 0,
    'id': 0,
    'group': '',
  },
  {
    'cpus': 1,
    'usedCpus': 0,
    'id': 1,
    'group': 'group1',
  },
  {
    'cpus': 1,
    'usedCpus': 0,
    'id': 2,
    'group': 'group1',
  }
];

Machine.remove({})
  .then(() => Machine.insertMany(machines, function(error) {
    if (error) {
      logger.error('插入失败!');
    }
    logger.debug('插入成功!');
  }));
