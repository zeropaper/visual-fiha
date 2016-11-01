'use strict';
var MappableState = require('./../mappable/state');
var LayerState = MappableState.extend({
  idAttribute: 'name',
  typeAttribute: 'type',

  props: {
    active: ['boolean', true, true],
    backfaceVisibility: ['boolean', true, false],
    name: ['string', true, null],
    opacity: {
      type: 'number',
      default: 1,
      min: 0,
      max: 1
    },
    perspective: {
      type: 'number',
      default: 0,
      min: -100,
      max: 100
    },
    rotateX: {
      type: 'number',
      default: 0,
      min: -360,
      max: 360
    },
    rotateY: {
      type: 'number',
      default: 0,
      min: -360,
      max: 360
    },
    rotateZ: {
      type: 'number',
      default: 0,
      min: -360,
      max: 360
    },
    translateX: {
      type: 'number',
      default: 0,
      min: -100,
      max: 100
    },
    translateY: {
      type: 'number',
      default: 0,
      min: -100,
      max: 100
    },
    // translateZ: {
    //   type: 'number',
    //   default: 0,
    //   min: -100,
    //   max: 100
    // },
    scaleX: {
      type: 'number',
      default: 100,
      min: -1000,
      max: 1000
    },
    scaleY: {
      type: 'number',
      default: 100,
      min: -1000,
      max: 1000
    },
    // scaleZ: {
    //   type: 'number',
    //   default: 100,
    //   min: -1000,
    //   max: 1000
    // },
    originX: {
      type: 'number',
      required: false,
      default: 0
    },
    originY: {
      type: 'number',
      required: false,
      default: 0
    },
    skewX: {
      type: 'number',
      required: false,
      default: 0,
      min: -360,
      max: 360
    },
    skewY: {
      type: 'number',
      required: false,
      default: 0,
      min: -360,
      max: 360
    },
    type: ['string', true, 'default']
  },

  derived: {
    width: {
      deps: ['collection', 'collection.parent', 'collection.parent.width'],
      fn: function() {
        if (!this.screenView) { return 400; }
        return this.screenView.width || this.screenView.el.clientWidth;
      }
    },
    height: {
      deps: ['collection', 'collection.parent', 'collection.parent.height'],
      fn: function() {
        if (!this.screenView) { return 300; }
        return this.screenView.height || this.screenView.el.clientHeight;
      }
    }
  },

  collections: MappableState.prototype.collections
});
module.exports = LayerState;