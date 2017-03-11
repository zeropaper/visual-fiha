'use strict';
var assign = require('lodash.assign');

var ScreenLayerView = require('./../view');
module.exports = ScreenLayerView.types.canvas = ScreenLayerView.extend({
  template: function() {
    return '<canvas layer-id="' + this.model.getId() + '" view-id="' + this.cid + '"></canvas>';
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

  session: {
    frames: ['number', true, 0]
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
      layer.draw(ctx);
    });

    this.frames++;
    if (this.model.clear && this.frames >= this.model.clear) {
      this.destCtx.clearRect(0, 0, cw, ch);
      this.frames = 0;
    }

    this.destCtx.drawImage(this.offCanvas, 0, 0, cw, ch, 0, 0, cw, ch);

    return this;
  },


  bindings: assign({
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