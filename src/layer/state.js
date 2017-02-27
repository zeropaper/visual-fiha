'use strict';
var State = require('ampersand-state');
var LayerState = State.extend({
  idAttribute: 'name',
  typeAttribute: 'type',

  props: {
    name: ['string', true, null],
    type: ['string', true, 'default'],
    active: ['boolean', true, true],

    // backfaceVisibility: ['boolean', true, false],
    mixBlendMode: {
      type: 'string',
      default: 'normal',
      required: true,
      values: [
        'normal',
        'multiply',
        'screen',
        'overlay',
        'darken',
        'lighten',
        'color-dodge',
        'color-burn',
        'hard-light',
        'soft-light',
        'difference',
        'exclusion',
        'hue',
        'saturation',
        'color',
      ]
    },
    opacity: {
      type: 'number',
      default: 100
    },
    // // perspective: {
    // //   type: 'number',
    // //   default: 0
    // // },
    // rotateX: {
    //   type: 'number',
    //   default: 0
    // },
    // rotateY: {
    //   type: 'number',
    //   default: 0
    // },
    // rotateZ: {
    //   type: 'number',
    //   default: 0
    // },
    // translateX: {
    //   type: 'number',
    //   default: 0
    // },
    // translateY: {
    //   type: 'number',
    //   default: 0
    // },
    // // // translateZ: {
    // // //   type: 'number',
    // // //   default: 0
    // // // },
    // scaleX: {
    //   type: 'number',
    //   default: 100
    // },
    // scaleY: {
    //   type: 'number',
    //   default: 100
    // },
    // // // scaleZ: {
    // // //   type: 'number',
    // // //   default: 1
    // // // },
    // // originX: {
    // //   type: 'number',
    // //   required: false,
    // //   default: 0
    // // },
    // // originY: {
    // //   type: 'number',
    // //   required: false,
    // //   default: 0
    // // },
    // skewX: {
    //   type: 'number',
    //   required: false,
    //   default: 0
    // },
    // skewY: {
    //   type: 'number',
    //   required: false,
    //   default: 0
    // },
    zIndex: ['number', true, 0]
  },

  derived: {
    mappable: {
      deps: [],
      fn: function() {
        var proto = this.constructor.prototype;
        var keys = Object.keys(proto._definition || {}).concat(
          Object.keys(proto._children || {}),
          Object.keys(proto._collections || {})
        ).filter(function(key) {
          return key !== this.idAttribute && key !== this.typeAttribute;
        }, this);

        return {
          source: [],
          target: keys
        };
      }
    }
  }
});
LayerState.types = {};
module.exports = LayerState;