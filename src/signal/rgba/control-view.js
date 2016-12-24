'use strict';
var SignalControlView = require('./../control-view');
var HSLASignalControlView = require('./../hsla/control-view');

var RGBASignalControlView = SignalControlView.types.rgbaSignal = HSLASignalControlView.extend({});

module.exports = RGBASignalControlView;