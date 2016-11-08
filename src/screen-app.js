'use strict';
var ScreenState = require('./screen/state');
var ScreenView = require('./screen/view');

var screenView = new ScreenView({
  broadcastId: window.location.hash.slice(1),
  el: document.querySelector('.screen'),
  model: new ScreenState({})
});

var bdy = document.body;
function resize() {
  screenView.set({
    width: bdy.clientWidth,
    height: bdy.clientHeight
  });
  screenView.render();
}
window.addEventListener('resize', VFDeps.throttle(resize, 100));
setTimeout(resize, 1500);