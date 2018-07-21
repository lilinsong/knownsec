# 变更记录(CHANGELOG)

所有显著的更改需要在该文档中记录。变更内容优先用中文描述，可能的情况下添加对应英文描述。

## [1.0.0] - 2018-7-21
1. 完成onTaskSchedule和onTaskDone方法
2. 增加服务，便于新任务请求过来
3. 定时检测是否有空闲machine，是否有任务待执行
4. 增加insertMachines和insertTasks脚本，便于将任务导入mongodb
