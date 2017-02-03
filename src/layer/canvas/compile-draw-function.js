'use strict';
/* global ctx: false */







function log(...args) {
  console.info(...args);
}

/**
 * txt
 * @param [x]
 * @param [y]
 * @param text
 */
function txt(...args) {
  var text = args.pop();
  var x, y;
  [
    x = ctx.canvas.width / 2,
    y = ctx.canvas.height / 2,
  ] = args;
  ctx.fillText(text, x, y);
}

/**
 * dot
 * @param [x]
 * @param [y]
 * @param [radius]: 10
 * @param [start]: 0
 * @param [end]: 360
 */
function dot(...args) {
  var x, y, radius, start, end;
  [
    x = ctx.canvas.width / 2,
    y = ctx.canvas.height / 2,
    radius = 10,
    start = 0,
    end = Math.PI * 2
  ] = args;
  ctx.beginPath();
  ctx.arc(x, y, radius, start, end);
  ctx.closePath();
  ctx.fill();
}

function loop(...args) {

}

/**
 * circle
 * @param [x]
 * @param [y]
 * @param [radius]: 10
 * @param [start]: 0
 * @param [end]: 360
 */
function circle(...args) {
  var x, y, radius, start, end;
  [
    x = ctx.canvas.width / 2,
    y = ctx.canvas.height / 2,
    radius = 10,
    start = 0,
    end = Math.PI * 2
  ] = args;
  ctx.beginPath();
  ctx.arc(x, y, radius, start, end);
  ctx.closePath();
  ctx.stroke();
}

function compileFunction(drawFunction) {
  var fn;// jshint ignore:line
  var evaled = `fn = (function() {
  // override some stuff that should not be used
  var navigator, window, global, document, module, exports;

  return function(ctx) {
    // declare utilities which can be used
    var log = ${ log.toString() };
    var txt = ${ txt.toString() };
    var dot = ${ dot.toString() };
    var circle = ${ circle.toString() };

    var loop = ${ loop.toString() };

    // scope vars
    var width = ctx.canvas.width;
    var height = ctx.canvas.height;

    var layer = this;
    var frametime = layer ? layer.frametime : 0;

    (${ drawFunction.toString() })(ctx);
  };
})();`;
  eval(evaled);// jshint ignore:line
  return fn;
}

module.exports = compileFunction;