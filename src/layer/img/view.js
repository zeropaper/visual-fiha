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
    console.info('loaded', url);
    done(null, img);
  };
  img.onerror = function() {
  };
  img.src = url;
  return done(null, _cacheImgs[url]);
}

module.exports = ScreenLayerView.types.img = ScreenLayerView.extend({
  template: function() {
    return '<div class="layer-image" id="' + this.model.getId() + '" view-id="' + this.cid + '"><canvas></canvas></div>';
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
        return this.query('canvas').getContext('2d');
      }
    }
  },

  _resizeCanvas: function() {
    if (!this.el || !this.el.parentNode) return this;
    var cnv = this.query('canvas');
    var dw = this.el.parentNode.clientWidth;
    var dh = this.el.parentNode.clientHeight;
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