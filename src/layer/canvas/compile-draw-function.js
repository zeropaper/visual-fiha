'use strict';
var mockedCtx = require('./mocked-canvas-2d-context');
var utils = require('./canvas-utils');// jshint ignore:line

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

function compileFunction(drawFunction) {
  var fn;// jshint ignore:line

  var evaled = `fn = (function() {
  // override some stuff that should not be used
  var navigator, window, global, document, module, exports;

  return function(ctx) {
    const width = (ctx.canvas || {}).width || 400;
    const height = (ctx.canvas || {}).height || 300;
    const layer = this;
    const store = layer.cache;
    const frametime = layer ? layer.frametime : 0;
    const audio = layer ? layer.audio : {};
    const bufferLength = function() { return ((layer.audio || {}).bufferLength) || 128; };
    const frequency = function(x) {
      return ((layer.audio || {}).frequency || [])[x] || 0;
    };
    const timeDomain = function(x) {
      return ((layer.audio || {}).timeDomain || [])[x] || 0;
    };

    const parameter = function(name, defaultVal) {
      return layer.parameters.getValue(name, defaultVal);
    };

    ${ ctxProperties }
    const random = utils.random;
    const between = utils.between;
    const midiMinMax = utils.midiMinMax;
    const midi2rad = utils.midi2rad;
    const midi2prct = utils.midi2prct;

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


    ${ drawFunction }
  };
})();`;
  eval(evaled);// jshint ignore:line
  return fn;
}

module.exports = compileFunction;