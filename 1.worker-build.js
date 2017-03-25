webpackChunk([1],{

/***/ 10:
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var ScreenLayerState = __webpack_require__(5);
module.exports = ScreenLayerState.types.img = ScreenLayerState.extend({
  props: {
    src: ['string', false, null]
  },

  initialize: function() {
    ScreenLayerState.prototype.initialize.apply(this, arguments);
  }
});

/***/ }),

/***/ 11:
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var ScreenLayerState = __webpack_require__(5);
var Extractor = __webpack_require__(568);

module.exports = ScreenLayerState.types.SVG = ScreenLayerState.extend({
  props: {
    svgStyles: ['object', true, function() { return {}; }],
    src: ['string', false, null]
  },
  session: {
    content: ['string', false, '']
  },

  derived: {
    mappable: {
      deps: [],
      fn: function() {
        return {
          source: [],
          target: [
            'active',
            'styleProperties'
          ]
        };
      }
    }
  },

  initialize: function() {
    var svgState = this;
    ScreenLayerState.prototype.initialize.apply(svgState, arguments);

    // only load SVG content on the worker
    if (!svgState.hasDOM) {
      svgState.listenToAndRun(svgState, 'change:src', function() {
        if (svgState.src) svgState.loadSVG();
      });
    }
    // only create an extractor for the state used in the controller
    else if (svgState.isControllerState) {
      svgState.extractor = new Extractor({
        model: svgState
      });
    }
  },

  loadSVG: function(done) {
    var state = this;
    done = done || function(err/*, obj*/) {
      if (err) {
        state.content = '';
        console.warn(err.message);
      }
    };

    if (!state.src) {
      state.content = '';
      return done(new Error('No src to load for ' + state.getId() + ' SVG layer'));
    }

    fetch(state.src)
      .then(function(res) {
        return res.text();
      })
      .then(function(string) {
        state.set({
          content: string
        });
        done(null, state);
      })
      .catch(done);
  },

  serialize: function() {
    var obj = ScreenLayerState.prototype.serialize.apply(this, arguments);
    obj.content = this.content;
    return obj;
  },

  toJSON: function() {
    var obj = ScreenLayerState.prototype.toJSON.apply(this, arguments);
    delete obj.content;
    return obj;
  }
});

/***/ }),

/***/ 12:
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var LayerState = __webpack_require__(5);
var TxtLayerState = LayerState.types.txt = LayerState.extend({
  props: {
    text: ['string', false, null]
  }
});
module.exports = TxtLayerState;

/***/ }),

/***/ 13:
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var ScreenLayerState = __webpack_require__(5);
module.exports = ScreenLayerState.types.video = ScreenLayerState.extend({
  props: {
    src: ['string', false, null]
  },

  initialize: function() {
    ScreenLayerState.prototype.initialize.apply(this, arguments);
  }
});

/***/ }),

/***/ 227:
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var noop = function(){};
var mockedCtx = {
  save: noop,
  restore: noop,
  scale: noop,
  rotate: noop,
  translate: noop,
  transform: noop,
  setTransform: noop,
  resetTransform: noop,
  createLinearGradient: noop,
  createRadialGradient: noop,
  createPattern: noop,
  clearRect: noop,
  fillRect: noop,
  strokeRect: noop,
  beginPath: noop,
  fill: noop,
  stroke: noop,
  drawFocusIfNeeded: noop,
  clip: noop,
  isPointInPath: noop,
  isPointInStroke: noop,
  fillText: noop,
  strokeText: noop,
  measureText: noop,
  drawImage: noop,
  createImageData: noop,
  getImageData: noop,
  putImageData: noop,
  getContextAttributes: noop,
  setLineDash: noop,
  getLineDash: noop,
  closePath: noop,
  moveTo: noop,
  lineTo: noop,
  quadraticCurveTo: noop,
  bezierCurveTo: noop,
  arcTo: noop,
  rect: noop,
  arc: noop,
  ellipse: noop,
  // properties
  globalAlpha: 1,
  globalCompositeOperation: 'source-over',
  filter: 'none',
  imageSmoothingEnabled: true,
  imageSmoothingQuality: 'low',
  strokeStyle: '#000000',
  fillStyle: '#000000',
  shadowOffsetX: 0,
  shadowOffsetY: 0,
  shadowBlur: 0,
  shadowColor: 'rgba(0, 0, 0, 0)',
  lineWidth: 1,
  lineCap: 'butt',
  lineJoin: 'miter',
  miterLimit: 10,
  lineDashOffset: 0,
  font: '10px sans-serif',
  textAlign: 'start',
  textBaseline: 'alphabetic',
  canvas: {width: 400, height: 300},
  // utilities
  _: {}
};
mockedCtx._.methods = Object.keys(mockedCtx)
  .filter(function(name) {
    return typeof mockedCtx[name] === 'function';
  });
mockedCtx._.properties = Object.keys(mockedCtx)
  .filter(function(name) {
    return name != '_' && typeof mockedCtx[name] !== 'function';
  });
module.exports = mockedCtx;

/***/ }),

/***/ 5:
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var State = __webpack_require__(4);
var State = __webpack_require__(4);
var Collection = __webpack_require__(6);

var PropertyState = State.extend({
  idAttribute: 'name',

  mappable: {
    target: ['value']
  },

  props: {
    name: ['string', true, ''],
    value: ['string', false, ''],
    default: ['string', true, '']
  }
});

var PropertyCollection = Collection.extend({
  mainIndex: 'name',
  model: PropertyState
});

var LayerState = State.extend({
  idAttribute: 'name',
  typeAttribute: 'type',

  initialize: function() {
    State.prototype.initialize.apply(this, arguments);
    var state = this;
    state.listenToAndRun(state.styleProperties, 'change', function() {
      state.trigger('change:styleProperties', state, state.styleProperties, {styleProperties: true});
    });
  },

  collections: {
    styleProperties: PropertyCollection
  },

  props: {
    name: ['string', true, null],
    type: ['string', true, 'default'],
    active: ['boolean', true, true],
    opacity: {
      type: 'number',
      default: 100
    },
    zIndex: ['number', true, 0],
    layerStyles: ['string', false, '']
  },

  derived: {
    screenState: {
      deps: ['collection', 'collection.parent'],
      fn: function() {
        return this.collection.parent;
      }
    },
    hasDOM: {
      deps: ['screenState'],
      fn: function() {
        return this.screenState && this.screenState.hasDOM;
      }
    },
    isControllerState: {
      deps: ['screenState'],
      fn: function() {
        return this.screenState && this.screenState.isControllerState;
      }
    },
    location: {
      deps: ['isControllerState', 'hasDOM'],
      fn: function() {
        return this.screenState ? this.screenState.location : false;
      }
    },

    mappable: {
      deps: [],
      fn: function() {
        var proto = this.constructor.prototype;
        var keys = Object.keys(proto._definition || {}).concat(
          Object.keys(proto._children || {}),
          Object.keys(proto._collections || {})
        ).filter(function(key) {
          return key !== this.idAttribute && key !== this.typeAttribute;
        }, this);

        return {
          source: [],
          target: keys
        };
      }
    }
  },

  _log: function(...args) {
    this.screenState._log(...args);
  },

  toJSON: function() {
    return State.prototype.toJSON.apply(this, arguments);
  }
});

LayerState.types = {};

module.exports = LayerState;

/***/ }),

/***/ 556:
/***/ (function(module, exports, __webpack_require__) {

"use strict";

function noop() {}
var mockedCtx = __webpack_require__(227);


var utils = {};
utils.random = function random(multi = 100) {
  return Math.random() * multi;
};

utils.between = function between(val, min, max) {
  return Math.max(min, Math.min(max, val));
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
var ramda = __webpack_require__(8);
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
    var between = utils.between;
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

/***/ }),

/***/ 557:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = {
  lines: __webpack_require__(559),
  loaders: __webpack_require__(561),
  text: __webpack_require__(562),
  utils: __webpack_require__(566)
};

if (typeof window !== 'undefined') {
  window.VF = window.VF || {};
  window.VF.canvas = module.exports;
}


/***/ }),

/***/ 558:
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/* global module */
module.exports = function lineGrid(ctx) {
  ctx.strokeStyle = this.lineColor || '#000';
  ctx.fillStyle = this.lineColor || '#000';
  var rows = Math.max(this.pointRows || 4, 1);
  var lw = this.lineWidth || 0;
  var radius = Math.max(this.pointRadius || lw, 1);
  var vol = this.screenState.audio.timeDomain;
  var freq = this.screenState.audio.frequency;
  var count = vol.length;//Math.max(this.pointsCount || 1, 1);
  var twoPI = Math.PI * 2;
  var w = ctx.canvas.width;
  var h = ctx.canvas.height;
  var sh = h / rows;
  var cols = Math.round(count / rows);
  var sw = w / cols;
  var row = -0.5;
  var prow;
  // var rand = this.randFactor || 0;
  var i;
  var x;
  var y;
  var px;
  var py;
  var p;
  var point;
  var points = [];


  // function random(factor) {
  //   factor = factor || rand;
  //   return Math.random() * rand * (Math.random() > 0.5 ? 1 : -1);
  // }

  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.lineWidth = lw;
  for (i = 0; i < count; i++) {
    if (i % cols < 1) {
      row++;
    }
    y = (sh * row) + (freq[i] - 12);// + random(freq[i]);
    x = (sw * 0.5) + (sw * (i % cols));// + (freq[i] - 12);// + random(freq[i]);
    points.push([x, y]);

    if (lw) {
      if (!px) {
        ctx.beginPath();
        ctx.moveTo(x, y);
      }
      else {
        if (row != prow) {
          ctx.stroke();
          ctx.moveTo(x, y);
        }
        else {
          ctx.lineTo(x, y);
        }
      }
    }

    px = x;
    py = y;
    prow = row;
  }
  ctx.stroke();
  ctx.closePath();

  for (p in points) {
    point = points[p];
    ctx.beginPath();
    ctx.arc(point[0], point[1], Math.min(Math.max(vol[p] * radius * 0.01, 1), sh * 0.5), 0, twoPI);
    ctx.closePath();
    ctx.fill();
  }
};


/***/ }),

/***/ 559:
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/*global module, require*/
module.exports = {
  grid: __webpack_require__(558),
  roundFrequencies: __webpack_require__(560)
};

/***/ }),

/***/ 560:
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/* global module */
module.exports = function roundFrequencies(ctx) {
  var audio = this.screenState.audio || {};
  var bufferLength = audio.bufferLength;
  var freqArray = audio.frequency;
  var timeDomainArray = audio.timeDomain;

  if (!bufferLength || !freqArray || !timeDomainArray) return;

  var x = ctx.canvas.width * 0.5;
  var y = ctx.canvas.height * 0.5;
  var r = Math.min(x, y) - 20;
  // var first;
  var rad = Math.PI * 2;

  var i = 0, a, td, lx, ly;
  var original = {
    lineWidth: ctx.lineWidth,
    lineCap: ctx.lineCap,
    lineJoin: ctx.lineJoin,
    strokeStyle: ctx.strokeStyle,
  };

  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';

  ctx.strokeStyle = 'red';
  var col;
  for (var lw = y*2; lw >= y*0.2; lw-=y*0.2) {
    col = col === 'white' ? 'black' : 'white';
    ctx.strokeStyle = col;
    ctx.lineWidth = lw;

    // ctx.beginPath();
    // for (i = 0; i < bufferLength; i++) {
    //   a = ((rad / bufferLength) * i) - Math.PI;
    //   f = (r / 100) * (freqArray[i] / 2);
    //   lx = Math.round(x + Math.cos(a) * f);
    //   ly = Math.round(y + Math.sin(a) * f);
    //   ctx.lineTo(lx, ly);
    // }
    // ctx.stroke();

    ctx.beginPath();
    for (i = 0; i < bufferLength; i++) {
      a = ((rad / bufferLength) * i) - Math.PI;
      td = (r / 100) * (timeDomainArray[i] / 2);
      lx = Math.round(x + Math.cos(a) * td);
      ly = Math.round(y + Math.sin(a) * td);
      ctx.lineTo(lx, ly);
    }
    ctx.stroke();
  }

  ctx.lineWidth = original.lineWidth;
  ctx.lineCap = original.lineCap;
  ctx.lineJoin = original.lineJoin;
  ctx.strokeStyle = original.strokeStyle;
};


/***/ }),

/***/ 561:
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/* global module */
var _cacheImgs = {};
function loadImg(url, done) {
  // loaded
  if (_cacheImgs[url]) {
    return done(null, _cacheImgs[url]);
  }
  // loading
  if (_cacheImgs[url] === false) {
    return done();
  }

  var img = new Image();
  _cacheImgs[url] = false;
  img.onload = function() {
    _cacheImgs[url] = img;
  };
  img.src = url;
}

var _cacheVideos = {};
function loadVideo(url, done) {
  // loaded
  if (_cacheVideos[url]) {
    return done(null, _cacheVideos[url]);
  }
  // loading
  if (_cacheVideos[url] === false) {
    return done();
  }

  var video = document.createElement('video');
  _cacheVideos[url] = false;

  video.loop = true;
  video.autoplay = true;
  video.autostart = true;
  video.muted = true;
  video.volume = 0;
  video.controls = false;
  video.oncanplaythrough = function() {
    if (_cacheVideos[url]) return;
    video.width = video.videoWidth;
    video.height = video.videoHeight;
    _cacheVideos[url] = video;
  };
  video.src = url;
}



module.exports = {
  img: loadImg,
  video: loadVideo
};

/***/ }),

/***/ 562:
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/*global module, require*/
module.exports = {
  wrap: __webpack_require__(563)
};

/***/ }),

/***/ 563:
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* global module */

// borrowed from http://www.html5canvastutorials.com/tutorials/html5-canvas-wrap-text-tutorial/
module.exports = function wrapText(context, text, x, y, maxWidth, lineHeight) {
  var words = text.split(' ');
  var line = '';

  for(var n = 0; n < words.length; n++) {
    var testLine = line + words[n] + ' ';
    var metrics = context.measureText(testLine);
    var testWidth = metrics.width;
    if (testWidth > maxWidth && n > 0) {
      context.fillText(line, x, y);
      line = words[n] + ' ';
      y += lineHeight;
    }
    else {
      line = testLine;
    }
  }
  context.fillText(line, x, y);
};

/***/ }),

/***/ 564:
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/*global module */
module.exports = function fps(ctx) {
  var cx = ctx.canvas.width * 0.5;
  var cy = ctx.canvas.height * 0.5;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = (cy * 0.25) + 'px monospace';

  var cache = this.cache;
  var screen = this.screenState;

  cache.previous = cache.previous || 0;
  var fps = Math.round(1000 / (screen.frametime - cache.previous)) + 'fps';
  ctx.lineWidth = 3;
  ctx.fillStyle = '#000';
  ctx.strokeStyle = '#fff';
  ctx.fillText(fps, cx, cy);
  ctx.strokeText(fps, cx, cy);
  cache.previous = screen.frametime;
};

/***/ }),

/***/ 565:
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/*global module */
module.exports = function frametime(ctx) {
  var cx = ctx.canvas.width * 0.5;
  var cy = ctx.canvas.height * 0.5;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = (cy * 0.25) + 'px monospace';
  var ft = Math.round(this.screenState.frametime) + 'ms';
  ctx.fillStyle = '#000';
  ctx.strokeStyle = '#fff';
  ctx.fillText(ft, cx, cy);
  ctx.strokeText(ft, cx, cy);
};

/***/ }),

/***/ 566:
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/*global module, require*/
module.exports = {
  fps: __webpack_require__(564),
  frametime: __webpack_require__(565)
};

/***/ }),

/***/ 568:
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var State = __webpack_require__(4);

var Extractor = State.extend({
  autoRender: true,
  template: '<div style="display: none"></div>',

  extractStyles: function() {
    var styles = {};

    this.svg.querySelectorAll('[style][id]').forEach(function(styledEl) {
      styles['#' + styledEl.id] = styledEl.getAttribute('style');
      styledEl.style = null;
    });

    return styles;
  },

  removeStylesFromContent: function() {
    this.svg.querySelectorAll('[style][id]').forEach(function(styledEl) {
      styledEl.style = null;
    });
    return this;
  },

  setPathLengths: function() {
    var paths = this.el.querySelectorAll('path');
    for (var p = 0; p < paths.length; p++) {
      paths[p].style.setProperty('--path-length', paths[p].getTotalLength());
    }
    return this;
  },

  extractProps: function() {
    var props = [];
    var name, value;

    for (var p = 0; p < this.svg.style.length; p++) {
      name = this.svg.style[p];
      value = this.svg.style.getPropertyValue(name).trim();

      props.push({
        name: name,
        value: value,
        default: value
      });
    }

    this.svg.style = null;
    return props;
  },

  extract: function() {
    if (!this.el || this.el.innerHTML === this.model.content) return;
    this.el.innerHTML = this.model.content;

    this.svg = this.el.querySelector('svg');
    if (!this.svg) return;
    var svgState = this.model;

    var layer = {};
    layer[svgState.idAttribute] = svgState.getId();

    layer.svgStyles = Object.keys(svgState.svgStyles).length ? this.removeStylesFromContent().model.svgStyles : this.extractStyles();

    this.model.styleProperties.set(this.setPathLengths().extractProps());
    layer.styleProperties = this.model.styleProperties.serialize();

    layer.content = this.el.innerHTML;

    svgState.once('change:svgStyles', function() { svgState.trigger('svg:extracted'); });
    svgState.trigger('sendCommand', 'updateLayer', {layer: layer, broadcast: true});

    svgState.set('content', layer.content, {silent: true});

    return this;
  },

  initialize: function(options) {
    this.model = options.model;
    this.el = document.createElement('div');
    this.listenToAndRun(this.model, 'change:content', this.extract);
  }
});
module.exports = Extractor;

/***/ }),

/***/ 9:
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var State = __webpack_require__(4);
var Collection = __webpack_require__(6);
var ScreenLayerState = __webpack_require__(5);
var mockedCtx = __webpack_require__(227);
var compileFunction = __webpack_require__(556);
function drawLayerCtx() {
  /*
    You can access the canvas 2d context with the global ctx
  */
}

var CanvasLayer = State.extend({
  scripts: __webpack_require__(557),

  idAttribute: 'name',
  cache: {},

  props: {
    zIndex: ['number', true, 0],
    name: ['string', true, null],
    active: ['boolean', true, true],
    drawFunction: ['any', true, function() { return drawLayerCtx; }]
  },

  serialize: function() {
    var obj = State.prototype.serialize.apply(this, arguments);
    var returned = {};
    var propName;


    var props = this.serializationProps.props || [];
    if (props.length) {
      returned.props = {};
    }

    // var propName;
    var def = this.constructor.prototype._definition;
    for (propName in obj) {
      returned[propName] = obj[propName];

      if (props.indexOf(propName) > -1) {
        returned.props[propName] = def[propName];
      }
    }

    var type = typeof this.drawFunction;
    if (type === 'function') {
      returned.drawFunction = this.drawFunction.toString();
    }
    else if (type === 'string') {
      returned.drawFunction = this.drawFunction;
    }
    returned.name = this.name;
    return returned;
  },

  toJSON: function(...args) {
    return this.serialize(...args);
  },

  derived: {
    mappable: {
      deps: ScreenLayerState.prototype._derived.mappable.deps,
      fn: function() {
        var mappable = ScreenLayerState.prototype._derived.mappable.fn.apply(this, arguments);
        var targets = mappable.target.filter(function(key) {
          return [
            'drawFunction',
            'screenState', // would make a circular reference if not excluded!
            'draw'
          ].indexOf(key) < 0;
        });

        return {
          source: [],
          target: targets
        };
      }
    },

    screenState: {
      deps: [],
      fn: function() {
        return this.collection.parent.screenState;
      }
    },

    frametime: {
      cache: false,
      deps: ['screenState'],
      fn: function() {
        if (!this.screenState) return 0;
        return this.screenState.frametime || 0;
      }
    },
    audio: {
      cache: false,
      deps: ['screenState'],
      fn: function() {
        if (!this.screenState) return {};
        return this.screenState.audio || {};
      }
    },

    width: {
      deps: ['screenState', 'screenState.width'],
      fn: function() {
        return this.screenState.width || 400;
      }
    },
    height: {
      deps: ['screenState', 'screenState.height'],
      fn: function() {
        return this.screenState.height || 300;
      }
    },
    draw: {
      deps: ['drawFunction'],
      fn: function() {
        var fn, result, err;

        try {
          fn = compileFunction(this.drawFunction);
          result = fn.call(this, mockedCtx);
          err = result instanceof Error ? result : null;
        }
        catch(e) {
          err = e;
        }

        if (err) {
          console.warn('draw function error', err.stack);
          fn = function() { return err; };
        }

        return fn.bind(this);
      }
    }
  }
});

var _CanvasLayersCache = {};
var CanvasLayers = Collection.extend({
  mainIndex: CanvasLayer.prototype.idAttribute,

  comparator: 'zIndex',

  model: function (attrs, options) {
    var def = {
      props: attrs.props || {},
      serializationProps: {
        props: [].concat([
          'active',
        ], Object.keys(attrs.props || {})),
      }
    };
    var Constructor = _CanvasLayersCache[attrs.name] || CanvasLayer.extend(def);
    _CanvasLayersCache[attrs.name] = Constructor;
    var inst =  new Constructor(attrs, options);
    if (options.init === false) inst.initialize();
    return inst;
  }
});


module.exports = ScreenLayerState.types.canvas = ScreenLayerState.extend({
  props: {
    clear: ['number', true, 1]
  },

  collections: {
    canvasLayers: CanvasLayers
  }
});

/***/ })

});
//# sourceMappingURL=1.worker-build.js.map