'use strict';
var ScreenLayerView = require('./../view');
var _cacheImgs = {};
function loadImg(url, done) {
  if (_cacheImgs[url]) {
    return done(null, _cacheImgs[url]);
  }

  var img = new Image();
  _cacheImgs[url] = img;
  img.onload = function() {
    done(null, img);
  };
  img.onerror = function() {};
  img.src = url;
  return done(null, _cacheImgs[url]);
}

module.exports = ScreenLayerView.types.img = ScreenLayerView.extend({
  template: function() {
    return '<canvas class="layer-image" id="' + this.model.getId() + '" view-id="' + this.cid + '"></canvas>';
  },

  initialize: function() {
    var view = this;
    ScreenLayerView.prototype.initialize.apply(view, arguments);


    function load() {
      var src = view.model.src;
      if (!src) return view.clearImage();
      loadImg(src, function(err, img) {
        view.drawImage(img);
      });
    }

    view.on('change:width change:height', load);
    view.model.on('change:src', load);
    load();
  },

  derived: {
    ctx: {
      deps: ['el'],
      fn: function() {
        if (!this.el) return;
        return this.el.getContext('2d');
      }
    }
  },

  _resizeCanvas: function() {
    if (!this.el || !this.el.parentNode) return this;
    var cnv = this.el;
    var dw = cnv.parentNode.clientWidth;
    var dh = cnv.parentNode.clientHeight;
    if (cnv.width != dw) cnv.width = dw;
    if (cnv.height != dh) cnv.height = dh;
    return this;
  },

  clearImage: function() {
    var ctx = this.ctx;
    if (!ctx) return this;
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    return this;
  },

  drawImage: function(img) {
    var ctx = this._resizeCanvas().clearImage().ctx;
    if (!ctx) return this;
    ctx.drawImage(img, 0, 0, ctx.canvas.width, ctx.canvas.height);
    return this;
  }
});