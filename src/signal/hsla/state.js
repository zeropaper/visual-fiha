'use strict';
var SignalState = require('./../state');

function _360(name) {
  return {
    name: name,
    type: 'number',
    default: 180,
    min: 0,
    max: 360
  };
}
function _100(name) {
  return {
    name: name,
    type: 'number',
    default: 100,
    min: 0,
    max: 100
  };
}
function _1(name) {
  return {
    name: name,
    type: 'number',
    default: 1,
    min: 0,
    max: 1
  };
}
function derivedParameter(name) {
  return {
    deps: ['parameters.' + name],
    fn: function() {
      return this.parameters.getValue(name);
    }
  };
}

var HSLASignalState = SignalState.types.hsla = SignalState.extend({
  baseParameters: [
    _360('hue'),
    _100('saturation'),
    _100('lightness'),
    _1('alpha')
  ],

  mappable: {
    source: ['result', 'hue', 'saturation', 'lightness', 'alpha'],
    target: ['parameters']
  },

  derived: {
    hue: derivedParameter('hue'),
    saturation: derivedParameter('saturation'),
    lightness: derivedParameter('lightness'),
    alpha: derivedParameter('alpha'),
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
    return 'hsla(' + Math.round(this.hue) + ',' + Math.round(this.saturation) + '%,' + Math.round(this.lightness) + '%,' + (Math.round(100 * this.alpha) / 100) + ')';
  }
});

module.exports = HSLASignalState;