(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';
/* global module, require */

window.VF = window.VF || {};

window.VF.canvas = module.exports = {
  lines: require('./lines'),
  loaders: require('./loaders'),
  text: require('./text'),
  utils: require('./utils')
};

},{"./lines":3,"./loaders":5,"./text":6,"./utils":10}],2:[function(require,module,exports){
'use strict';
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

},{}],3:[function(require,module,exports){
'use strict';
/*global module, require*/
module.exports = {
  grid: require('./grid'),
  roundFrequencies: require('./round-frequencies')
};
},{"./grid":2,"./round-frequencies":4}],4:[function(require,module,exports){
'use strict';
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

},{}],5:[function(require,module,exports){
'use strict';
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
},{}],6:[function(require,module,exports){
'use strict';
/*global module, require*/
module.exports = {
  wrap: require('./wrap')
};
},{"./wrap":7}],7:[function(require,module,exports){
/* global module */
'use strict';
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
},{}],8:[function(require,module,exports){
'use strict';
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
},{}],9:[function(require,module,exports){
'use strict';
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
},{}],10:[function(require,module,exports){
'use strict';
/*global module, require*/
module.exports = {
  fps: require('./fps'),
  frametime: require('./frametime')
};
},{"./fps":8,"./frametime":9}]},{},[1]);
