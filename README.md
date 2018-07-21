# knownsec

## 说明

### 目录结构说明
  1. app

    1. mongo

      mongo目录是mongoose连接mongodb的连接，以及Task和Machine的model
    2. scripts

      scripts编写了两个脚本文件，分别用于将初始的machine信息和task信息插入mongodb
    3. init文件

      init是项目启动时初始化machine信息，本例中暂时认为项目启动时所有machine均已完成任务，实际中应该检验任务是否真实完成
    4. logger文件

      logger文件是用于打印日志信息所用
    5. scheduler文件

      该项目的核心文件，该文件主要包含了onTaskDone()和onTaskSchedule()方法，以及一些其他调用方法

  2. config

    config目录是mongodb的一些配置信息
  3. test

    test目录下为mocha单元测试

### 项目运行说明

  1. 项目拷贝到本地以后，需要根据个人mongodb的配置，将config目录下default.json文件改成个人配置
  2. 我的mongodb没有设置密码，如果您的mongodb设有密码，请将mongo目录下db文件第4，5，11三行的注释取消，并注释掉第10行的代码
  3. 启动项目之前，请先运行两个脚本，将tasks信息和machines信息设置到mongodb，脚本运行命令如下：
    ```
      npm run start-insert-task,
      npm run start-insert-machine
    ```
  4. 输入npm start启动项目，启动之前请确保您本地8081端口未被占用，可通过`lsof -i:8081`命令查看，若有占用可先kill相应进程或者修改项目监听端口
  5. 项目启动之后会自动运行预先设置到mongodb的任务，此时您也可以访问localhost:8081/task发送post请求，将正确的任务信息请求过来，项目亦会对新来的任务进行分配
