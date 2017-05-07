'use strict';
var SignalState = require('./../state');
function _255(name) {
  return {
    name: name,
    type: 'number',
    default: 180,
    min: 0,
    max: 255
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

var RGBASignalState = SignalState.types.rgba = SignalState.extend({
  baseParameters: [
    _255('red'),
    _255('green'),
    _255('blue'),
    _1('alpha')
  ],

  mappable: {
    source: ['result', 'red', 'green', 'blue', 'alpha'],
    target: ['parameters']
  },

  derived: {
    red: derivedParameter('red'),
    green: derivedParameter('green'),
    blue: derivedParameter('blue'),
    alpha: derivedParameter('alpha'),
    result: {
      deps: ['red', 'green', 'blue', 'alpha'],
      fn: function() {
        return this.computeSignal();
      }
    }
  },
  // parseInput: function() {
  //   var values = _colorValues(this.input);
  //   return {
  //     red: values[0],
  //     green: values[1],
  //     blue: values[2],
  //     alpha: values[3]
  //   };
  // },
  computeSignal: function() {
    return 'rgba(' + Math.round(this.red) + ',' + Math.round(this.green) + ',' + Math.round(this.blue) + ',' + (Math.round(100 * this.alpha) / 100) + ')';
  }
});
module.exports = RGBASignalState;