'use strict';
require.ensure([
  'lodash.assign',
  'ampersand-state',
  'ampersand-collection'
], function() {
require.ensure([
  'ampersand-view',
  'ampersand-view-switcher'
], function() {
require.ensure([
  'p5',
], function() {
require.ensure([
  'three',
], function() {
require.ensure([
  './screen/state',
], function() {
require.ensure([
  './screen/view',
], function() {
// ---------------------------------------------------------------
var ScreenState = require('./screen/state');
var ScreenView = require('./screen/view');

var bdy = document.body;

var screenView = new ScreenView({
  model: new ScreenState({}),
  broadcastId: window.location.hash.slice(1) || 'vfBus',
  el: document.querySelector('.screen'),
  width: bdy.clientWidth,
  height: bdy.clientHeight
});
screenView.render();

function resize() {
  screenView.resize(bdy);
}
window.addEventListener('resize', require('lodash.debounce')(resize, 100));
setTimeout(resize, 1500);
// ---------------------------------------------------------------
}, 'screen-view');
}, 'screen-state');
}, 'threejs');
}, 'p5');
}, 'ampersand-view');
}, 'ampersand-data');