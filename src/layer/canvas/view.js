'use strict';
var assign = require('lodash.assign');

var ScreenLayerView = require('./../view');
var programmableMixin = require('./../../programmable/mixin-view');
var programmable = require('./programmable');
var utils = require('./canvas-utils');
module.exports = ScreenLayerView.types.canvas = ScreenLayerView.extend(programmableMixin(programmable, {
  template: function() {
    return '<canvas id="' + this.model.getId() + '" view-id="' + this.cid + '"></canvas>';
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
    var layer = this;
    if (!layer.parent || !layer.parent.el) return;

    // ScreenLayerView.prototype.update.apply(this, arguments);

    // this ensures the screen has the right size for disblay and computation
    var cw = layer.width = layer.parent.el.clientWidth;
    var ch = layer.height = layer.parent.el.clientHeight;

    if (!layer.model.active) return layer;
    var ctx = layer.ctx;
    var clock = layer.model.screenState.clock;
    var audio = layer.model.screenState.audio || {};

    layer.callUpdate({
      frametime: clock.frametime,
      bpm: clock.bpm,
      beatnum: clock.beatnum,
      beatprct: clock.beatprct,
      beatlength: clock.beatlength,

      bufferLength: function() { return audio.bufferLength || 128; },
      vol: function(x) {
        return (audio.timeDomain || [])[x] || 0;
      },
      frq: function(x) {
        return (audio.frequency || [])[x] || 0;
      },

      param: function(...args) { return layer.model.parameters.getValue(...args); },

      ctx: ctx,
      utils: utils,

      grid: function(...args) { utils.grid(ctx.canvas.width, ctx.canvas.height, ...args); },
      distribute: function(...args) { utils.distribute(...args); },
      repeat: function(...args) { utils.repeat(...args); },
      log: function(...args) { console.log('update %s', layer.model.getId(), ...args); },
      txt: function(...args) { utils.txt(ctx, ...args); },
      dot: function(...args) { utils.dot(ctx, ...args); },
      circle: function(...args) { utils.circle(ctx, ...args); },
      polygone: function(...args) { utils.polygone(ctx, ...args); },
      line: function(...args) { utils.line(ctx, ...args); },
      cacheContext: function(...args) { utils.cacheContext(ctx, ...args); },
      restoreContexts: function(...args) { utils.restoreContexts(ctx, ...args); },
    });

    layer.frames++;
    if (layer.model.clear && layer.frames >= layer.model.clear) {
      layer.destCtx.clearRect(0, 0, cw, ch);
      layer.frames = 0;
    }

    layer.destCtx.drawImage(layer.offCanvas, 0, 0, cw, ch, 0, 0, cw, ch);

    return layer;
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
}));