const co = require('co');
const R = require('ramda');
// 当任务完成时调用, 当任务被分配到机器上 Task.times 之后调用
function onTaskDone(Task) {
  const machindeId = getTaskMachineId(Task);
  updateMachineUseCpusById(machindeId); //设置连接cpu减1
  const nextTask = getNextTask(machind.group); //取得当前machine能运行的任务运行
  onTaskSchedule(Task);
}

// 当需要任务开始执行时调用, 返回当前可执行该任务的 Machine, 如没有满足条件的 Machine 则返回 null
function onTaskSchedule(task) {
  return co(function* () {
    const usefulMachines = yield checkAvailableMachines(task);
    if (!usefulMachines) {
      return Promise.resolve(null);
    }
    // 优先使用group能分配上的machine，如果多个machine满足，则优先使用id更小的
    const sortMachines = R.sortWith([R.descend(R.prop('group')), R.ascend(R.prop('id'))])(usefulMachines);
    sortMachines[0].usedCpus ++;
    return Promise.all([
      Machine.update({ 'id': sortMachines[0].id }, { 'usedCpus': sortMachines[0].usedCpus })
        .then(res => logger.debug('更新usedCpus成功：', res))
        .catch(err => logger.error('更新usedCpus失败，原因为：', err)),
      Task.update({ 'id': task.id }, { 'machindeId': sortMachines[0].id })
        .then(res => logger.debug('更新machindeId成功：', res))
        .catch(err => logger.error('更新machindeId失败，原因为：', err))
    ])
      .then(() => {
        return sortMachines[0].id;
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
      logger.debug('取得的machine信息为：', machines);
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
