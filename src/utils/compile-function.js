'use strict';
/**
 * compileFunction(name, prologue, [arg1, arg2, ...] body)
 */
module.exports = function compileFunction(...args) {
  var name = args.shift();
  var prologue = args.shift();
  var body = args.pop();
  var fn;

  console.time('compileFunction ' + name);
  try {
    fn = new Function(...args, prologue + body);// jshint ignore:line
    if (typeof fn !== 'function') throw new Error('Function compilation error, returned not function');
  }
  catch (e) {
    console.log('%c compilation error: %s', 'color:red', e.message);
    fn = e;
  }
  console.timeEnd('compileFunction ' + name);
  return fn;
};