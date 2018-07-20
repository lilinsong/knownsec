const co = require('co');
const R = require('ramda');
const AsyncLock = require('async-lock');
const lock = new AsyncLock();
// 当任务完成时调用, 当任务被分配到机器上 Task.times 之后调用
// 任务完成时应该做几件事： 1、从当前任务取得machineId，确认空闲出的machine；
// 2、将该空闲出的machine的当前使用cpu数减1； 3、确定该空闲出的machine能执行的任务； 4、取出对应任务类型的任务执行
function onTaskDone(task) {
  return lock.acquire('onTaskDone', () => {
    return co(function* () {
      const machineId = yield getTaskMachineId(task);
      return Machine.find({ 'id': machineId })
        .then(machines => {
          machines[0]._doc.usedCpus --; //task完成后，对应machine的当前使用cpu数减1
          return Machine.update({ 'id': machineId }, { 'usedCpus': machines[0]._doc.usedCpus })
            .then(() => {
              logger.debug(`释放machine ${machineId}成功！`);
              return machines[0];
            });
        })
        .then(machine => {
          return getNextTask(machine);
        })
        .then(nextTask => {
          if (R.isNil(nextTask)) {
            logger.debug('无下一任务运行！');
            return Promise.resolve();
          }
          logger.debug('执行下一个任务：', nextTask._doc.id);
          onTaskSchedule(nextTask._doc); // 继续调度下一任务，此时已可释放lock锁
          return Promise.resolve();
        })
        .catch(err => logger.error(err));
    });
  });
}

function getTaskMachineId(task) {
  return Task.find({'id': task.id})
    .then(res => {
      logger.debug(`task ${task.id} 在 machine ${res[0]._doc.machineId} 执行完成！`);
      return res[0]._doc.machineId;
    });
}

function getNextTask(machine) {
  // 如果machine.group为''说明当前空出的machine可以执行所有任务，否则取出当前空出的machine能执行的任务执行
  let query = { 'machineId': null }; // machineId为null说明该任务还没有执行
  if (machine.group !== '') {
    query = { 'group': machine.group, 'machineId': null };
  }
  return Task.findOne(query)
    .then(task => {
      return task;
    });
}

// 当需要任务开始执行时调用, 返回当前可执行该任务的 Machine, 如没有满足条件的 Machine 则返回 null
function onTaskSchedule(task) {
  return lock.acquire('onTaskSchedule', () => {
    return co(function* () {
      const usefulMachines = yield checkAvailableMachines(task);
      if (!usefulMachines) {
        logger.info(task.id + ' --> ' + null);
        return Promise.resolve(null);
      }
      // 优先使用group能分配上的machine，如果多个machine满足，则优先使用id更小的
      const sortMachines = R.sortWith([R.descend(R.prop('group')), R.ascend(R.prop('id'))])(usefulMachines);
      sortMachines[0].usedCpus ++;
      return Promise.all([
        Machine.update({ 'id': sortMachines[0].id }, { 'usedCpus': sortMachines[0].usedCpus })
          .then(res => logger.debug('更新usedCpus成功：', res))
          .catch(err => logger.error('更新usedCpus失败，原因为：', err)),
        Task.update({ 'id': task.id }, { '$set': { 'machineId': sortMachines[0].id }})
          .then(res => logger.debug('更新machineId成功：', res))
          .catch(err => logger.error('更新machineId失败，原因为：', err))
      ])
        .then(() => setTimeout(() => {
          onTaskDone(task);
        }, task.times * 1000))
        .then(() => {
          logger.info(task.id + ' --> ' + sortMachines[0].id);
          return sortMachines[0].id;
        });
    });
  });
}

function checkAvailableMachines(task) {
  return co(function* () {
    const machines = yield getMachineInfo();
    // 取得所有machine剩余cpu总数
    let unusedCpus = 0;
    let usefulMachines = [];
    for (let machine of machines) {
      unusedCpus += machine.cpus - machine.usedCpus;
      let usefulCpus = machine.cpus - machine.usedCpus;
      // task.cpus固定为1，此处这么写是考虑若某个任务task.cpus大于1，则该任务只能分配到具有多个cpu的machine
      if (usefulCpus >= task.cpus && (machine.group === '' || machine.group === task.group)) {
        usefulMachines.push(machine);
      }
    }
    logger.debug('可使用的cpu数为：', unusedCpus);
    if (unusedCpus <= 0 || R.isEmpty(usefulMachines)) {
      logger.debug('暂无可用machine');
      return false;
    }
    logger.debug('可用的machine有：', usefulMachines);
    return usefulMachines;
  });
}

// 从mongodb取得machine信息
function getMachineInfo() {
  const opts = {'_id': 0, '__v': 0};
  return Machine.find({}, opts)
    .then(res => {
      const machines = res.map(data => data._doc);
      return machines;
    })
    .catch(err => logger.error(err));
}

module.exports = {
  onTaskDone,
  onTaskSchedule,
  getMachineInfo,
  checkAvailableMachines
};
