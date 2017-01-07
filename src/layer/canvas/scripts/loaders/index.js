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