'use strict';
var ScreenLayerState = require('./../state');
// var CanvasLayer = ScreenLayerState.extend({
var MappableState = require('./../../mappable/state');
var CanvasLayerMapState = MappableState.State.extend({
  derived: {
    targetModel: {
      deps: ['collection', 'collection.parent'],
      fn: function () {
        return this.collection.parent;
      }
    },
    observedModel: {
      deps: ['targetModel', 'targetModel.collection', 'targetModel.collection.parent'],
      fn: function() {
        return this.targetModel.collection.parent.collection.parent;
      }
    }
  }
});


var CanvasLayer = MappableState.extend({
  idAttribute: 'name',

  fillCollection: function() {
    var mappings = this.mappings;
    var propNames = Object.keys(this.constructor.prototype._definition).filter(function (propName) {
      return ['drawFunction', 'name'].indexOf(propName) < 0;
    });

    propNames.forEach(function (propName) {
      if (!mappings.get(propName)) {
        mappings.add({
          targetProperty: propName
        });
      }
    });
    return this;
  },

  session: {
    frametime: ['number', true, 0],
    duration: ['number', true, 1000],
  },

  props: {
    fps: ['number', true, 16],
    weight: ['number', true, 0],
    name: ['string', true, null],
    active: ['boolean', true, true],
    opacity: ['number', true, 100],
    shadowOffsetX: ['number', true, 0],
    shadowOffsetY: ['number', true, 0],
    shadowBlur: ['number', true, 0],
    shadowColor: ['string', true, 'rgba(0,0,0,0.5)'],
    blending: {
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
        'xor'
      ]
    },
    drawFunction: 'any'
  },


  serialize: function() {
    var obj = MappableState.prototype.serialize.apply(this, arguments);
    var returned = {};


    var props = this.serializationProps.props || [];
    // if (props.length) {
    //   returned.props = {};
    //   props.forEach(function(propName) {
    //     returned.props[propName] = obj[propName];
    //   });
    // }

    // var propName;
    // for (propName in obj) {
    //   if (props.indexOf(propName) < 0) {
    //     returned[propName] = obj[propName];
    //   }
    // }

    // better like that??
    if (props.length) {
      returned.props = {};
    }

    var propName;
    var def = this.constructor.prototype._definition;
    for (propName in obj) {
      // if (props.indexOf(propName) < 0) {
      returned[propName] = obj[propName];
      // }
      // else {
      //   console.info();
      //   returned.props[propName] = obj[propName];
      // }
      if (props.indexOf(propName) > -1) {
        returned.props[propName] = def[propName];
      }
    }
    returned.props = def;
    var type = typeof this.drawFunction;
    if (type === 'function') {
      returned.drawFunction = this.drawFunction.toString();
    }
    else if (type === 'string') {
      returned.drawFunction = this.drawFunction;
    }
    return returned;
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
    screenState: {
      deps: ['collection', 'collection.parent', 'collection.parent.collection', 'collection.parent.collection.parent'],
      fn: function() {
        return this.collection.parent.collection.parent;
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
        var fn = this.drawFunction;
        if (typeof fn === 'string') {
          try {
            eval('fn = (function() { return ' + this.drawFunction + '; })()');// jshint ignore:line
          }
          catch(err) {
            console.warn('draw function error', err);
          }
        }
        return (typeof fn === 'function' ? fn : function() {}).bind(this);
      }
    }
  },

  collections: {
    mappings: MappableState.Collection.extend({
      model: function (attrs, options) {
        var model = new CanvasLayerMapState(attrs, options);
        if (options.init === false) model.initialize();
        return model;
      }
    })
  }
});

var _CanvasLayersCache = {};
var CanvasLayers = VFDeps.Collection.extend({
  mainIndex: CanvasLayer.prototype.idAttribute,

  comparator: 'weight',

  model: function (attrs, options) {
    var def = {
      props: attrs.props || {},
      // session: attrs.session || {},
      // derived: attrs.derived || {},
      serializationProps: {
        props: Object.keys(attrs.props || {}),
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


module.exports = ScreenLayerState.canvas = ScreenLayerState.extend({
  collections: {
    canvasLayers: CanvasLayers
  }
});