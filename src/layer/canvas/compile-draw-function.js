'use strict';
var mockedCtx = require('./mocked-canvas-2d-context');
var utils = require('./canvas-utils');// jshint ignore:line
var layerPrologue = require('./../function-prologue');
// proxy the method and parameters of the canvas context
var ctxProperties = '';
mockedCtx._.methods
  .forEach(function(name) {
    ctxProperties += '\nvar ' + name + ' = function(...args) { try { ctx.' + name + '(...args); } catch(e){} };';
  });
mockedCtx._.properties
  .forEach(function(name) {
    if (name !== 'canvas') ctxProperties += '\nvar ' + name + ' = function(val) { if (val !== undefined) { ctx.' + name + ' = val; } return ctx.' + name + '; };';
  });

function compileFunction(updateFunction) {
  var fn;// jshint ignore:line

  var evaled = `fn = (function() {
  // override some stuff that should not be used
  var navigator, window, global, document, module, exports;

  return function(ctx) {
    ${ layerPrologue }

    ${ ctxProperties }
    const random = utils.random;
    const between = utils.between;

    const grid = function(...args) { utils.grid(width, height, ...args); };
    const distribute = function(...args) { utils.distribute(...args); };
    const repeat = function(...args) { utils.repeat(...args); };
    const log = function(...args) { utils.log(ctx, ...args); };
    const txt = function(...args) { utils.txt(ctx, ...args); };
    const dot = function(...args) { utils.dot(ctx, ...args); };
    const circle = function(...args) { utils.circle(ctx, ...args); };
    const polygone = function(...args) { utils.polygone(ctx, ...args); };
    const line = function(...args) { utils.line(ctx, ...args); };
    const cacheContext = function(...args) { utils.cacheContext(ctx, ...args); };
    const restoreContexts = function(...args) { utils.restoreContexts(ctx, ...args); };


    ${ updateFunction }
  };
})();`;
  eval(evaled);// jshint ignore:line
  return fn;
}

module.exports = compileFunction;