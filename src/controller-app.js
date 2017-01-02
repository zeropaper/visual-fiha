'use strict';

require.ensure([
  './screen/state',
], function(require) {
require.ensure([
  './midi/state',
  './midi/view'
], function(require) {
require.ensure([
  './signal/control-view',
  './signal/beat/control-view',
  './signal/hsla/control-view',
  './signal/rgba/control-view'
], function(require) {

require.ensure(['./screen/state'], function () {
require.ensure(['./screen/view'], function () {
require.ensure(['./controller/view'], function (require) {
var ControllerView = require('./controller/view');

var VF = window.VF || {};
var controllerSetup = VF._defaultSetup;

controllerSetup.el = document.querySelector('.controller');

VFDeps.localForage.getItem('snapshot').then(function(/*value*/) {
  // if (value && confirm('Load previous state?')) {
  //   controllerSetup.layers = value.screen.layers;
  //   controllerSetup.signals = value.signals;
  // }
  // console.info('snapshot found', value);
  window.visualFiha = new ControllerView(controllerSetup);
});
});
});
});

});
});
});
