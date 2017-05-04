'use strict';
var Collection = require('ampersand-collection');
var ScreenLayerState = require('./../state');
var mockedCtx = require('./mocked-canvas-2d-context');
var compileFunction = require('./compile-draw-function');

var parameterizedState = require('./../../parameter/mixin');

function drawLayerCtx() {
  /*
    You can access the canvas 2d context with the global ctx
  */
}

var CanvasLayer = ScreenLayerState.extend({
  idAttribute: 'name',
  cache: {},

  props: {
    drawFunction: ['any', true, function() { return drawLayerCtx; }]
  },

  toJSON: function(...args) {
    return this.toJSON(...args);
  },

  derived: {
    mappable: {
      deps: ScreenLayerState.prototype._derived.mappable.deps,
      fn: function() {
        return {
          source: [],
          target: ['parameters']
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
        return this.screenState.clock.frametime || 0;
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

var CanvasLayers = Collection.extend({
  mainIndex: 'name',
  comparator: 'zIndex',

  model: function (attrs, options) {
    var inst =  new CanvasLayer(attrs, options);
    if (options.init === false) inst.initialize();
    return inst;
  }
});


module.exports = ScreenLayerState.types.canvas = parameterizedState(ScreenLayerState.prototype.baseParameters.concat([
  {name: 'clear', type: 'number', default: 1}
]), ScreenLayerState).extend({
  collections: {
    canvasLayers: CanvasLayers
  }
});