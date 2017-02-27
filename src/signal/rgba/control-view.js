'use strict';
var SignalControlView = require('./../control-view');
var HSLASignalControlView = require('./../hsla/control-view');

var RGBASignalControlView = SignalControlView.types.rgba = HSLASignalControlView.extend({});

module.exports = RGBASignalControlView;