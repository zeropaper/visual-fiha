'use strict';var myWorker = new Worker('canvas-worker.js');
myWorker.onmessage = function(e) {
  console.info('Message received from worker', performance.now() - e.timeStamp);
};

window.VF = window.VF || {};

window.VF.canvasTools = {};

window.VF.canvasTools.drawPoint = function(ctx, x, y, radius, borderWidth, num) {
  var fs  = ctx.fillStyle;
  ctx.fillStyle = '#000';
  var lw = ctx.lineWidth;
  ctx.lineWidth = borderWidth;


  ctx.textBaseline = 'middle';
  ctx.textAlign = 'center';
  ctx.beginPath();
  // ctx.moveTo(x - radius, y);
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.closePath();

  if (typeof num !== 'undefined') {
    ctx.fillStyle = '#fff';
    ctx.fillText(num, x, y);
  }

  ctx.lineWidth = lw;
  ctx.fillStyle = fs;
};

window.VF.canvasTools.drawLine = function(ctx, x1, y1, x2, y2, width, borderWidth) {
  var halfWidth = width * 0.5;
  var adj = Math.abs(y1 - y2);
  var opp = Math.abs(x1 - x2);
  var tilt = Math.atan(adj / opp) || 0;

  var a = (Math.PI * 0.5) + tilt;
  var b = (Math.PI * 1.5) + tilt;

  ctx.lineWidth = borderWidth;
  ctx.beginPath();

  ctx.arc(x1, y1, halfWidth, a, b);

  ctx.arc(x2, y2, halfWidth, b, a);

  ctx.closePath();
  ctx.fill();
  ctx.stroke();
};

var _cacheImgs = {};
window.VF.canvasTools.loadImg = function(url, done) {
  // loaded
  if (_cacheImgs[url]) {
    return done(null, _cacheImgs[url]);
  }
  // loading
  if (_cacheImgs[url] === false) {
    return done();
  }

  console.info('loading img %s', url);
  var img = new Image();
  _cacheImgs[url] = false;
  img.onload = function() {
    console.info('loaded img %s %sx%s', url, img.width, img.height);
    _cacheImgs[url] = img;
  };
  img.src = url;
};

var _cacheVideos = {};
window.VF.canvasTools.loadVideo = function(url, done) {
  // loaded
  if (_cacheVideos[url]) {
    return done(null, _cacheVideos[url]);
  }
  // loading
  if (_cacheVideos[url] === false) {
    return done();
  }

  console.info('loading video %s', url);
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
    console.info('loaded video %s %sx%s', url, video.videoWidth, video.videoHeight);
    video.width = video.videoWidth;
    video.height = video.videoHeight;
    _cacheVideos[url] = video;
  };
  video.src = url;
};





