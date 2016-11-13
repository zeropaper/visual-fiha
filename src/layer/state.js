'use strict';
var MappableState = require('./../mappable/state');
var LayerState = MappableState.extend({
  idAttribute: 'name',
  typeAttribute: 'type',

  props: {
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
    name: ['string', true, null],
    opacity: {
      type: 'number',
      default: 100
    },
    // perspective: {
    //   type: 'number',
    //   default: 0
    // },
    rotateX: {
      type: 'number',
      default: 0
    },
    rotateY: {
      type: 'number',
      default: 0
    },
    rotateZ: {
      type: 'number',
      default: 0
    },
    translateX: {
      type: 'number',
      default: 0
    },
    translateY: {
      type: 'number',
      default: 0
    },
    // // translateZ: {
    // //   type: 'number',
    // //   default: 0
    // // },
    scaleX: {
      type: 'number',
      default: 100
    },
    scaleY: {
      type: 'number',
      default: 100
    },
    // // scaleZ: {
    // //   type: 'number',
    // //   default: 1
    // // },
    // originX: {
    //   type: 'number',
    //   required: false,
    //   default: 0
    // },
    // originY: {
    //   type: 'number',
    //   required: false,
    //   default: 0
    // },
    skewX: {
      type: 'number',
      required: false,
      default: 0
    },
    skewY: {
      type: 'number',
      required: false,
      default: 0
    },
    type: ['string', true, 'default'],
    zIndex: ['number', true, 0]
  }
});
module.exports = LayerState;