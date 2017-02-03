'use strict';
var State = require('ampersand-state');
var Collection = require('ampersand-collection');
var ScreenLayerState = require('./../state');
var mockedCtx = require('./mocked-canvas-2d-context');
var compileFunction = require('./compile-draw-function');


var CanvasLayer = State.extend({
  scripts: require('./scripts'),

  idAttribute: 'name',

  initialize: function() {
    State.prototype.initialize.apply(this, arguments);
    var canvasLayer = this;
    var screenLayer = canvasLayer.collection.parent;

    canvasLayer.on('change', function() {
      // trigger change on the screen layer
      screenLayer._changed = {
        canvasLayers: screenLayer.canvasLayers.serialize()
      };
      screenLayer.trigger('change');
    });
  },

  cache: {},

  props: {
    /*
    duration: ['number', true, 1000],
    fps: ['number', true, 16],
    */
    zIndex: ['number', true, 0],
    name: ['string', true, null],
    active: ['boolean', true, true],

    fillStyle: {
      type: 'string',
      default: '#000000'
    },
    filter: {
      type: 'string',
      default: 'none'
    },
    font: {
      type: 'string',
      default: '1vw monospace'// hehehe
    },
    globalAlpha: {
      type: 'number',
      default: 1
    },
    globalCompositeOperation: {
      type: 'string',
      required: true,
      default: 'source-over',
      values: [
        'source-over',
        'source-in',
        'source-out',
        'source-atop',
        'destination-over',
        'destination-in',
        'destination-out',
        'destination-atop',
        'lighter',
        'copy',
        'xor',
        ''
      ]
    },
    imageSmoothingEnabled: {
      type: 'boolean',
      default: true
    },
    imageSmoothingQuality: {
      type: 'string',
      default: 'low'
    },
    lineCap: {
      type: 'string',
      default: 'butt'
    },
    lineDashOffset: {
      type: 'number',
      default: 0
    },
    lineJoin: {
      type: 'string',
      default: 'miter'
    },
    lineWidth: {
      type: 'number',
      default: 1
    },
    miterLimit: {
      type: 'number',
      default: 10
    },
    shadowBlur: {
      type: 'number',
      default: 0
    },
    shadowColor: {
      type: 'string',
      default: 'rgba(0, 0, 0, 0)'
    },
    shadowOffsetX: {
      type: 'number',
      default: 0
    },
    shadowOffsetY: {
      type: 'number',
      default: 0
    },
    strokeStyle: {
      type: 'string',
      default: '#000000'
    },
    textAlign: {
      type: 'string',
      default: 'start'
    },
    textBaseline: {
      type: 'string',
      default: 'alphabetic'
    },




    drawFunction: 'any'
  },

  serialize: function() {
    var obj = State.prototype.serialize.apply(this, arguments);
    var returned = {};
    var propName;


    var props = this.serializationProps.props || [];
    /*
    if (props.length) {
      returned.props = {};
      props.forEach(function(propName) {
        returned.props[propName] = obj[propName];
      });
    }

    for (propName in obj) {
      if (props.indexOf(propName) < 0) {
        returned[propName] = obj[propName];
      }
    }
    */

    // better like that??
    if (props.length) {
      returned.props = {};
    }

    // var propName;
    var def = this.constructor.prototype._definition;
    for (propName in obj) {
      // if (props.indexOf(propName) < 0) {
      returned[propName] = obj[propName];
      // }
      // else {
      //   returned.props[propName] = obj[propName];
      // }
      if (props.indexOf(propName) > -1) {
        returned.props[propName] = def[propName];
      }
    }
    // returned.props = def;
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
        return this.collection.parent.collection.parent;
      }
    },

    frametime: {
      deps: ['screenState'],
      fn: function() {
        // console.info(this.screenState);
        if (!this.screenState) return 0;
        return this.screenState.frametime || 0;
      }
    },
    audio: {
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
        var fn;
        try {
          fn = compileFunction(this.drawFunction);
          fn.call(this, mockedCtx);
        }
        catch(err) {
          console.warn('draw function error', err.stack);
          fn = function() {
            return err;
          };
        }
        return fn.bind(this);
      }
    }
  }
});

var _CanvasLayersCache = {};
var CanvasLayers = Collection.extend({
  mainIndex: CanvasLayer.prototype.idAttribute,

  comparator: 'weight',

  model: function (attrs, options) {
    var def = {
      props: attrs.props || {},
      // session: attrs.session || {},
      // derived: attrs.derived || {},
      serializationProps: {
        props: [].concat([
          'active',
          //
          'fillStyle',
          'filter',
          'font',
          'globalAlpha',
          'globalCompositeOperation',
          'imageSmoothingEnabled',
          'imageSmoothingQuality',
          'lineCap',
          'lineDashOffset',
          'lineJoin',
          'lineWidth',
          'miterLimit',
          'shadowBlur',
          'shadowColor',
          'shadowOffsetX',
          'shadowOffsetY',
          'strokeStyle',
          'textAlign',
          'textBaseline'
        ], Object.keys(attrs.props || {})),
        // session: Object.keys(attrs.session),
        // derived: Object.keys(attrs.prderived)
      }
    };
    var Constructor = _CanvasLayersCache[attrs.name] || CanvasLayer.extend(def);
    _CanvasLayersCache[attrs.name] = Constructor;
    var inst =  new Constructor(attrs, options);
    inst.on('change:weight', function() {
      inst.collection.sort();
    });
    if (options.init === false) inst.initialize();
    return inst;
  }
});


module.exports = ScreenLayerState.types.canvas = ScreenLayerState.extend({
  collections: {
    canvasLayers: CanvasLayers
  }
});