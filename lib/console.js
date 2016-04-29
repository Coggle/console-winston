
var util = require('util');
var winston = require('winston');
var _ = require('underscore');

winston.setLevels({
 critical: 0,
    error: 0,
     warn: 1,
     info: 2,
  verbose: 3,
    debug: 4,
    silly: 5
});

winston.addColors({
  critical: 'magenta',
     error: 'red',
      warn: 'yellow',
      info: 'white',
   verbose: 'grey',
     debug: 'grey',
     silly: 'grey'
});

function processArgs(type, args, hostname) {

  args = _.values(args);
  // for error messages and critical error messages
  // we need should try and provide a backtace for debugging
  // also if the we've got a full error object, try to 
  // simplfy the message to something useful
  if(type == "error" || type == 'critical'){
    var err = args[0];
    var stack = err ? err.stack : undefined;
    if (!stack) {
      var error_info = {};
      Error.captureStackTrace(error_info, arguments.callee.caller);
      stack = error_info.stack;
    }

    // extract a useful error message
    if(err instanceof Error){
      err = err.message;
    }else if(typeof err === 'object' && err.message){
      err = err.message;
    }
    args[0] = err;
  }

  var meta = {timestamp:new Date(), hostname:(hostname)};
  if (stack) meta.stack = JSON.stringify(stack,null,'\t');
  args.push(meta);

  return args;
}


module.exports = function(hostname, stage) {

  if((!stage) || stage.toLowerCase() == 'development'){
    winston.remove(winston.transports.Console);
    winston.add(winston.transports.Console, {
      level: 'debug',
      colorize: true,
      // log everything to stderr (stdout seems to be buffered, and never
      // flushed)
      stderrLevels: ['silly', 'debug', 'verbose', 'info', 'warn', 'error', 'critical']
    });
  }

  console.debug = function(){
    winston.debug.apply(winston, processArgs('debug', arguments, hostname));
  };
  console.log = function(){
    winston.debug.apply(winston, processArgs('log', arguments, hostname));
  };
  console.info = function(){
    winston.info.apply(winston, processArgs('info', arguments, hostname));
  };
  console.warn = function(){
    winston.warn.apply(winston, processArgs('warn', arguments, hostname));
  };
  console.error = function(){
    winston.error.apply(winston, processArgs('error', arguments, hostname));
  };
  console.critical = function(){
    winston.critical.apply(winston, processArgs('critical', arguments, hostname));
  };

  return winston;

};

