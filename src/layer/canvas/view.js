'use strict';

var ScreenLayerView = require('./../view');
module.exports = ScreenLayerView.types.canvas = ScreenLayerView.extend({
  template: function() {
    return '<canvas layer-id="' + this.model.cid + '" view-id="' + this.cid + '"></canvas>';
  },

  derived: {
    offCanvas: {
      deps: ['width', 'height', 'el'],
      fn: function() {
        var canvas = document.createElement('canvas');
        canvas.width = this.width;
        canvas.height = this.height;
        return canvas;
      }
    },
    ctx: {
      deps: ['offCanvas'],
      fn: function() {
        return this.offCanvas.getContext('2d');
      }
    },
    destCtx: {
      deps: ['el', 'width', 'height'],
      fn: function() {
        return this.el.getContext('2d');
      }
    }
  },

  remove: function() {
    return ScreenLayerView.prototype.remove.apply(this, arguments);
  },

  update: function() {
    this.model.frametime = this.parent.model.frametime;
    if (!this.parent || !this.parent.el) return;

    var cw = this.width = this.parent.el.clientWidth;
    var ch = this.height = this.parent.el.clientHeight;
    var ctx = this.ctx;
    ctx.clearRect(0, 0, cw, ch);
    if (!this.model.active) { return this; }

    this.model.canvasLayers.filter(function (layer) {
      return layer.active;
    }).forEach(function(layer) {
      /*
      ctx.shadowOffsetX = layer.shadowOffsetX;
      ctx.shadowOffsetY = layer.shadowOffsetY;
      ctx.shadowBlur = layer.shadowBlur;
      ctx.shadowColor = layer.shadowColor;
      */
      ctx.globalAlpha = layer.opacity / 100;
      ctx.globalCompositeOperation = layer.blending;
      // try {
      var err = layer.draw(ctx);
      // }
      // catch (e) {
      //   console.info('canvas script error on "%s" layer', layer.getId(), e.message);
      // }
      if (err) console.warn('canvas script error on "%s" layer', layer.getId(), err.stack);
    });

    this.destCtx.clearRect(0, 0, cw, ch);
    this.destCtx.drawImage(this.offCanvas, 0, 0, cw, ch, 0, 0, cw, ch);

    return this;
  },


  bindings: require('lodash.assign')({
    width: {
      name: 'width',
      type: 'attribute'
    },
    height: {
      name: 'height',
      type: 'attribute'
    }
  }, ScreenLayerView.prototype.bindings)
});