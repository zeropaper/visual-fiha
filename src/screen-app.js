'use strict';
var ScreenState = require('./screen/state');
var ScreenView = require('./screen/view');
var bdy = document.body;

// if ('serviceWorker' in navigator) {
//   navigator.serviceWorker.register('/service-worker.js', {scope: '/'})
//   .then(function(reg) {
//     // registration worked
//     console.info('Registration succeeded. Scope is ' + reg.scope);
//   }).catch(function(error) {
//     // registration failed
//     console.warn('Registration failed with ' + error);
//   });
// }

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
window.addEventListener('resize', VFDeps.debounce(resize, 100));
setTimeout(resize, 1500);