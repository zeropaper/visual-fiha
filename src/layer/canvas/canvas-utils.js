'use strict';

function noop() {}

var utils = module.exports = {};

utils.random = function random(multi = 100) {
  return Math.random() * multi;
};

utils.between = function between(val, min, max) {
  return Math.max(min, Math.min(max, val));
};


utils.log = function log(ctx, ...args) {
  console.info(...args);
};


utils.midiMinMax = require('./../../utils/midi-min-max');
utils.midi2Rad = require('./../../utils/midi2rad');
utils.midi2Prct = require('./../../utils/midi2prct');

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
  var r;
  var s = -10;
  fillStyle('#fff');
  distribute(cx, cy, 12, cy, (layer.frametime % (360 * s)) / s, function(x, y, a) {
    r = (cy / 12) * i;
    fillText(a.toFixed(2), cx + (Math.cos(a) * r), cy + (Math.sin(a) * r));
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
