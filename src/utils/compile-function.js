'use strict';
/**
 * compileFunction(name, prologue, [arg1, arg2, ...] body, context)
 */
module.exports = function compileFunction(...args) {
  var name = args.shift();
  var prologue = args.shift();
  var context = args.pop();
  var body = args.pop();
  var fn;
  var template = `fn = function ${ name }(${ args.join(', ') }) {
  // override some stuff that should not be used
  var navigator, window, top, global, document, module, exports;

  // ${ name } prologue
  ${ prologue }

  // ${ name } body
  ${ body }
};`;
  try {
    eval(template);// jshint ignore:line
    var type = typeof fn;
    if (type !== 'function') throw new Error('Function compilation error, returned not function');
    fn.bind(context);
  }
  catch (e) {
    console.error('compilation error: %s\n%s', e.message, template);
    return e;
  }
  return fn;
};