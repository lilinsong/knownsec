// 启动初始化，为了方便，项目启动的时候初始化machine信息(认为所以machine均为空闲状态)
// 实际运行过程中应该检测Task是否实际完成
const {getMachineInfo} = require('./scheduler');
function init() {
  return getMachineInfo()
    .then(machines => {
      let updates = [];
      machines.forEach(machine => {
        updates.push(Machine.update({ 'id': machine.id }, { 'usedCpus': 0 }));
      });
      return Promise.all(updates);
    })
    .then(() => logger.debug('初始化完成！'))
    .catch(err => logger.debug('初始化失败，原因为：', err));
}

module.exports = init;
