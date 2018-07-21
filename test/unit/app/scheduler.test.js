const Promise = require('bluebird');
const Task = require('../../../app/mongo/task');
const Machine = require('../../../app/mongo/machine');
global.logger = require('../../../app/logger');
global.Promise = Promise;
global.Task = Promise.promisifyAll(Task);
global.Machine = Promise.promisifyAll(Machine);
const {onTaskSchedule} = require('../../../app/scheduler');
const expect = require('chai').expect;

const task = {
  'id': 0,
  'group': 'group2',
  'cpus': 1,
  'times': 10,
};

describe('onTaskSchedule函数的测试', function() {
  it('onTaskSchedule函数应该返回machineId 0', function() {
    return onTaskSchedule(task)
      .then(res => {
        expect(res).to.be.equal(0);
      });
  });
});
