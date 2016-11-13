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
        'luminosity'
      ]
    },
    name: ['string', true, null],
    opacity: {
      type: 'number',
      default: 100,
      min: 0,
      max: 100
    },
    // perspective: {
    //   type: 'number',
    //   default: 0,
    //   min: -100,
    //   max: 100
    // },
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
    // // translateZ: {
    // //   type: 'number',
    // //   default: 0,
    // //   min: -100,
    // //   max: 100
    // // },
    scaleX: {
      type: 'number',
      default: 1,
      min: -10,
      max: 10
    },
    scaleY: {
      type: 'number',
      default: 1,
      min: -10,
      max: 10
    },
    // // scaleZ: {
    // //   type: 'number',
    // //   default: 1,
    // //   min: -10,
    // //   max: 10
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
    type: ['string', true, 'default'],
    zIndex: ['number', true, 0]
  }
});
module.exports = LayerState;