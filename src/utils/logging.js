'use strict';
module.exports = function(color) {
  var logger = {};
  'info warn log error'.split(' ').forEach(function(name) {
    logger[name] = function(...args) {
      var label = args.shift();
      console[name].call(console, '%c'+ label, 'color:' + color, ...args);
    };
  });
  return logger;
};