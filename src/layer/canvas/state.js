'use strict';
var ScreenLayerState = require('./../state');

var parameterizedState = require('./../../parameter/mixin');
var baseParameters = ScreenLayerState.prototype.baseParameters.concat([
  {name: 'clear', type: 'number', default: 1, min: 0, max: Infinity}
]);

var programmableState = require('./../../programmable/mixin-state');

var prototype = {
};

var programmable = require('./programmable');
ScreenLayerState.types.canvas = parameterizedState(baseParameters, ScreenLayerState)
                                .extend(programmableState(programmable, prototype));

module.exports = ScreenLayerState.types.canvas;