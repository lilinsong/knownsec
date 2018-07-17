// 当任务完成时调用, 当任务被分配到机器上 Task.times 之后调用
function onTaskDone(Task) {

}

// 当需要任务开始执行时调用, 返回当前可执行该任务的 Machine, 如没有满足条件的 Machine 则返回 null
function onTaskSchedule(Task) {

}

module.exports = {
  onTaskDone,
  onTaskSchedule
};
