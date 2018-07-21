var winston = require('winston');
var path = require('path');
var BASE_DIR = path.join(__dirname, '../app');
const DailyRotateFile = require('winston-daily-rotate-file');

function patchLocation(logger, method) {
  var _method = logger[method];
  logger[method] = function() {
    var {relativePath, line} = getStackInfo(0);

    var prefix = `[${relativePath}:${line}]:`;

    Array.prototype.unshift.call(arguments, prefix);
    return _method.apply(this, arguments);
  };
}

function getStackInfo(stackIndex) {
  var stacklist = (new Error()).stack.split('\n').slice(3);

  var stackReg = /at\s+(.*)\s+\((.*):(\d*):(\d*)\)/gi;
  var stackReg2 = /at\s+()(.*):(\d*):(\d*)/gi;

  var s = stacklist[stackIndex] || stacklist[0];
  var sp = stackReg.exec(s) || stackReg2.exec(s);

  if (sp && sp.length === 5) {
    return {
      method: sp[1],
      path: sp[2],
      relativePath: path.relative(BASE_DIR, sp[2]),
      line: sp[3],
      pos: sp[4],
      file: path.basename(sp[2])
    };
  }
}

var logger = new (winston.Logger)({
  level: 'silly',
  transports: [
    new (winston.transports.Console)({
      colorize: true,
      prettyPrint: true
    }),
    new DailyRotateFile({
      filename: '/var/log/scheduling/worker.log',
      prepend: true,
      colorize: false
    })
  ]
});

patchLocation(logger, 'error');
patchLocation(logger, 'debug');
patchLocation(logger, 'silly');

module.exports = logger;
