'use strict';
var ScreenLayerState = require('./../state');
// var CanvasLayer = ScreenLayerState.extend({
var MappableState = require('./../../mappable/state');
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

  props: {
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
    var obj = ScreenLayerState.prototype.serialize.apply(this, arguments);

    var type = typeof this.drawFunction;
    if (type === 'function') {
      obj.drawFunction = this.drawFunction.toString();
    }
    else if (type === 'string') {
      obj.drawFunction = this.drawFunction;
    }

    return obj;
  },

  derived: {
    width: {
      deps: ['collection', 'collection.parent', 'collection.parent.width'],
      fn: function() {
        return this.collection.parent.width || 400;
      }
    },
    height: {
      deps: ['collection', 'collection.parent', 'collection.parent.height'],
      fn: function() {
        return this.collection.parent.height || 300;
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
  }
});

var _CanvasLayersCache = {};
var CanvasLayers = VFDeps.Collection.extend({
  mainIndex: CanvasLayer.prototype.idAttribute,

  comparator: 'weight',

  model: function (attrs, options) {
    var def = {
      props: attrs.props || {},
      session: attrs.session || {},
      derived: attrs.derived || {}
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