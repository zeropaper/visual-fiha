'use strict';
var mockedCtx = require('./mocked-canvas-2d-context');
var utils = require('./canvas-utils');// jshint ignore:line

// proxy the method and properties of the canvas context
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
    var width = (ctx.canvas || {}).width || 400;
    var height = (ctx.canvas || {}).height || 300;
    var layer = this;
    var store = layer.cache;
    var frametime = layer ? layer.frametime : 0;
    var audio = layer ? layer.audio : {};
    var bufferLength = function() { return ((layer.audio || {}).bufferLength) || 128; };
    var frequency = function(x) {
      return ((layer.audio || {}).frequency || [])[x] || 0;
    };
    var timeDomain = function(x) {
      return ((layer.audio || {}).timeDomain || [])[x] || 0;
    };

    ${ ctxProperties }
    var random = utils.random;
    var between = utils.between;
    var midiMinMax = utils.midiMinMax;
    var midi2rad = utils.midi2rad;
    var midi2prct = utils.midi2prct;

    var grid = function(...args) { utils.grid(width, height, ...args); };
    var distribute = function(...args) { utils.distribute(...args); };
    var repeat = function(...args) { utils.repeat(...args); };
    var log = function(...args) { utils.log(ctx, ...args); };
    var txt = function(...args) { utils.txt(ctx, ...args); };
    var dot = function(...args) { utils.dot(ctx, ...args); };
    var circle = function(...args) { utils.circle(ctx, ...args); };
    var polygone = function(...args) { utils.polygone(ctx, ...args); };
    var line = function(...args) { utils.line(ctx, ...args); };
    var cacheContext = function(...args) { utils.cacheContext(ctx, ...args); };
    var restoreContexts = function(...args) { utils.restoreContexts(ctx, ...args); };


    return (${ drawFunction.toString() })(ctx);
  };
})();`;
  eval(evaled);// jshint ignore:line
  return fn;
}

module.exports = compileFunction;