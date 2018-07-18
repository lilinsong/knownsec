// 利用该脚本向mongodb插入初始Task信息
const Task = require('../mongo/task');
global.logger = require('../logger');
const tasks = [
    {
        'id': 0,
        'group': 'group2',
        'cpus': 1,
        'times': 10,
    },
    {
        'id': 1,
        'group': 'group1',
        'cpus': 1,
        'times': 11,
    },
    {
        'id': 2,
        'group': 'group1',
        'cpus': 1,
        'times': 10,
    },
    {
        'id': 3,
        'group': 'group2',
        'cpus': 1,
        'times': 10,
    },
    {
        'id': 4,
        'group': 'group2',
        'cpus': 1,
        'times': 10,
    },
    {
        'id': 5,
        'group': 'group1',
        'cpus': 1,
        'times': 10,
    },
];

Task.insertMany(tasks, function(error) {
  if (error) {
    logger.error('插入失败!');
  }
  logger.debug('插入成功!');
});
