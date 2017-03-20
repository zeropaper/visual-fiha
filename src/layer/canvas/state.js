'use strict';
var State = require('ampersand-state');
var Collection = require('ampersand-collection');
var ScreenLayerState = require('./../state');
var mockedCtx = require('./mocked-canvas-2d-context');
var compileFunction = require('./compile-draw-function');
function drawLayerCtx() {
  /*
    You can access the canvas 2d context with the global ctx
  */
}

var CanvasLayer = State.extend({
  scripts: require('./scripts'),

  idAttribute: 'name',
  cache: {},

  props: {
    zIndex: ['number', true, 0],
    name: ['string', true, null],
    active: ['boolean', true, true],
    drawFunction: ['any', true, function() { return drawLayerCtx; }]
  },

  serialize: function() {
    var obj = State.prototype.serialize.apply(this, arguments);
    var returned = {};
    var propName;


    var props = this.serializationProps.props || [];
    if (props.length) {
      returned.props = {};
    }

    // var propName;
    var def = this.constructor.prototype._definition;
    for (propName in obj) {
      returned[propName] = obj[propName];

      if (props.indexOf(propName) > -1) {
        returned.props[propName] = def[propName];
      }
    }

    var type = typeof this.drawFunction;
    if (type === 'function') {
      returned.drawFunction = this.drawFunction.toString();
    }
    else if (type === 'string') {
      returned.drawFunction = this.drawFunction;
    }
    returned.name = this.name;
    return returned;
  },

  toJSON: function(...args) {
    return this.serialize(...args);
  },

  derived: {
    mappable: {
      deps: ScreenLayerState.prototype._derived.mappable.deps,
      fn: function() {
        var mappable = ScreenLayerState.prototype._derived.mappable.fn.apply(this, arguments);
        var targets = mappable.target.filter(function(key) {
          return [
            'drawFunction',
            'screenState', // would make a circular reference if not excluded!
            'draw'
          ].indexOf(key) < 0;
        });

        return {
          source: [],
          target: targets
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
        return this.screenState.frametime || 0;
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

var _CanvasLayersCache = {};
var CanvasLayers = Collection.extend({
  mainIndex: CanvasLayer.prototype.idAttribute,

  comparator: 'zIndex',

  model: function (attrs, options) {
    var def = {
      props: attrs.props || {},
      serializationProps: {
        props: [].concat([
          'active',
        ], Object.keys(attrs.props || {})),
      }
    };
    var Constructor = _CanvasLayersCache[attrs.name] || CanvasLayer.extend(def);
    _CanvasLayersCache[attrs.name] = Constructor;
    var inst =  new Constructor(attrs, options);
    if (options.init === false) inst.initialize();
    return inst;
  }
});


module.exports = ScreenLayerState.types.canvas = ScreenLayerState.extend({
  props: {
    clear: ['number', true, 1]
  },

  collections: {
    canvasLayers: CanvasLayers
  }
});