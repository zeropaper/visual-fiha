'use strict';
var SignalState = require('./../state');

var _360 = {
  type: 'number',
  required: true,
  default: 180,
  min: 0,
  max: 360
};
var _100 = {
  type: 'number',
  required: true,
  default: 100,
  min: 0,
  max: 100
};

var HSLASignalState = SignalState.types.hsla = SignalState.extend({
  session: {
    hue: _360,
    saturation: _100,
    lightness: _100,
    alpha: _100
  },

  mappable: {
    source: ['result', 'hue', 'saturation', 'lightness', 'alpha'],
    target: ['hue', 'saturation', 'lightness', 'alpha']
  },

  derived: {
    result: {
      deps: ['hue', 'saturation', 'lightness', 'alpha'],
      fn: function() {
        return this.computeSignal();
      }
    }
  },
  // parseInput: function() {
  //   var values = _colorValues(this.input);
  //   return {
  //     hue: values[0],
  //     saturation: values[1],
  //     lightness: values[2],
  //     alpha: values[3]
  //   };
  // },
  computeSignal: function() {
    return 'hsla(' + Math.round(this.hue) + ',' + Math.round(this.saturation) + '%,' + Math.round(this.lightness) + '%,' + (Math.round(this.alpha) / 100) + ')';
  }
});

module.exports = HSLASignalState;