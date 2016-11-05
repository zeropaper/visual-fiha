'use strict';

var ScreenLayerView = require('./../view');
module.exports = ScreenLayerView.canvas = ScreenLayerView.extend({
  template: '<canvas></canvas>',

  session: {
    duration: ['number', true, 1000],
    fps: ['number', true, 16],
    frametime: ['number', true, 0]
  },

  derived: {
    frames: {
      deps: ['duration', 'fps'],
      fn: function() {
        return Math.round(this.duration / 1000 * this.fps);
      }
    },
    frame: {
      deps: ['frametime', 'fps'],
      fn: function() {
        return Math.round(((this.frametime % this.duration) / 1000) * this.fps);
      }
    },


    direction: {
      deps: ['frametime', 'duration'],
      fn: function() {
        return this.frame < this.frames * 0.5 ? 1 : -1;
      }
    },


    offCanvas: {
      deps: ['width', 'height'],
      fn: function() {
        var canvas = document.createElement('canvas');
        canvas.width = this.el.width;
        canvas.height = this.el.height;
        return canvas;
      }
    },
    ctx: {
      deps: ['offCanvas'],
      fn: function() {
        return this.offCanvas.getContext('2d');
      }
    }
  },

  remove: function() {
    return ScreenLayerView.prototype.remove.apply(this, arguments);
  },

  update: function(options) {
    options = options || {};
    this.frametime = options.frametime || 0;

    var ctx = this.ctx;
    var cw = ctx.canvas.width;
    var ch = ctx.canvas.height;
    ctx.clearRect(0, 0, cw, ch);
    if (!this.model.active) { return this; }

    this.model.canvasLayers.filter(function (layer) {
      return layer.active;
    }).forEach(function(layer) {
      ctx.shadowOffsetX = layer.shadowOffsetX;
      ctx.shadowOffsetY = layer.shadowOffsetY;
      ctx.shadowBlur = layer.shadowBlur;
      ctx.shadowColor = layer.shadowColor;

      ctx.globalAlpha = layer.opacity / 100;
      ctx.globalCompositionOperation = layer.blending;

      layer.draw(ctx);
    });

    var destCtx = this.el.getContext('2d');
    destCtx.clearRect(0, 0, cw, ch);
    destCtx.drawImage(this.offCanvas, 0, 0, cw, ch, 0, 0, cw, ch);

    return this;
  // },

  // render: function() {
  //   if (!this.el) {
  //     this.renderWithTemplate();
  //   }

  //   return this.update();
  }
});