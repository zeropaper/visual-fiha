'use strict';
function noop() {}
var mockedCtx = require('./mocked-canvas-2d-context');


var utils = {};
utils.random = function random(multi = 100) {
  return Math.random() * multi;
};


utils.log = function log(ctx, ...args) {
  console.info(...args);
};

/**
 * txt
 * @param [text]
 * @param [x]
 * @param [y]
 */
utils.txt = function txt(ctx, ...args) {
  var text, x, y;
  [
    text = '',
    x = ctx.canvas.width / 2,
    y = ctx.canvas.height / 2,
  ] = args;
  ctx.fillText(text, x, y);
};

/**
 * dot
 * @param [x]
 * @param [y]
 * @param [radius]: 10
 * @param [start]: 0
 * @param [end]: 360
 */
utils.dot = function dot(ctx, ...args) {
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
};

/**
 * circle
 * @param [x]: <center>
 * @param [y]: <center>
 * @param [radius]: 10
 * @param [start]: 0
 * @param [end]: 360
 */
utils.circle = function circle(ctx, ...args) {
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
};


utils.line = function line(ctx, ...args) {
  ctx.beginPath();
  if (typeof args[0] === 'string') {
    ctx.strokeStyle = args.shift();
  }
  if (typeof args[0] === 'number') {
    ctx.lineWidth = args.shift();
  }
  if (!args.length) return;
  var point = args.shift();
  ctx.moveTo(point[0], point[1]);
  args.forEach(function(point) {
    ctx.lineTo(point[0], point[1]);
  });
  ctx.stroke();
};

/**
 * polygone
 * @param [x]: <center>
 * @param [y]: <center>
 * @param [size]: 30
 * @param [sides]: 3
 */
utils.polygone = function polygone(ctx, ...args) {
  ctx.beginPath();
  var sides, angle, i, x, y, lx, ly, size;
  [
    x,
    y,
    size = 30,
    sides = 3
  ] = args;
  var shift = Math.PI * 0.5;
  var rad = (Math.PI * 2) / sides;
  for (i = 0; i < sides; i++) {
    angle = rad * i + shift;
    lx = Math.round(x + Math.cos(angle) * size);
    ly = Math.round(y + Math.sin(angle) * size);
    if (!i) {
      ctx.beginPath();
    }
    ctx.lineTo(lx, ly);
  }

  ctx.closePath();
  ctx.stroke();
};


utils.grid = function grid(width, height, itemsCount, rowsCount, process) {
  process = typeof process === 'function' ? process : noop;
  var r = 0,
      c = 0,
      xy = [0,0],
      rowHeight = height / rowsCount,
      columnsCount = itemsCount / rowsCount,
      columnWidth = width / columnsCount
  ;

  // var args = [].slice.apply(arguments).map(item => typeof item);
  // console.info(...args);
  for (r = 0; r < rowsCount; r++) {
    for (c = 0; c < columnsCount; c++) {
      xy[1] = rowHeight * (r + 0.5);
      xy[0] = columnWidth * (c + 0.5);
      process(...xy);
    }
  }
};


/*
function () {
  var cx = width / 2;
  var cy = height / 2;
  var i = 0;
  fillStyle('#fff');
  distribute(cx, cy, 12, cy, 0, function(x, y, a) {
    fillText(a.toFixed(2), x, y);
    i++;
  });
}
*/
utils.distribute = function distribute(x, y, itemsCount, r, tilt, process) {
  itemsCount = itemsCount || 2;
  tilt = tilt || 0;
  process = typeof process === 'function' ? process : noop;
  var i, a, args;
  var rad = Math.PI * 2;
  for (i = 0; i < itemsCount; i++) {
    a = ((rad / itemsCount) * i) - Math.PI + ((rad / 360) * tilt);
    args = [
      x + (Math.cos(a) * r),
      y + (Math.sin(a) * r),
      a
    ];
    process(...args);
  }
};



utils.repeat = function repeat(times, process, ...args) {
  process = typeof process === 'function' ? process : noop;
  for (var i = 0; i < times; i++) {
    process(i, ...args);
  }
};


utils.cacheContext = function cacheContext(ctx, cache, max) {
  max = max || 0;
  if (!max) return;

  var w = ctx.canvas.width;
  var h = ctx.canvas.height;
  cache.unshift(ctx.getImageData(0, 0, w, h));
  if (cache.length >= max) cache.pop();
};

utils.restoreContexts = function restoreContexts(ctx, cache, count, preprocess, postprocess) {
  count = count || 1;
  preprocess = preprocess || noop;
  postprocess = postprocess || noop;
  // console.info(cache.length);
  for (var c = 1; c < count && c < cache.length; c++) {
    if (cache[c] instanceof ImageData) {
      try {
        ctx.putImageData(preprocess(cache[c]), 0, 0);
        postprocess();
      }
      catch (e) {
        console.info(e.message, cache[c] instanceof ImageData);
      }
    }
  }
};


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


// proxy the ramda functions
var ramdaMethods = '';
var ramda = require('ramda');
Object.keys(ramda)
  .filter(function(name) {
    return name.length > 1 && typeof ramda[name] === 'function';
  })
  .forEach(function(name) {
    ramdaMethods += '\nvar ' + name + ' = ramda.' + name + ';';
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
    /*
    ${ ramdaMethods }
    */
    var random = utils.random;
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