'use strict';
require.ensure([
  './screen/state'
], function() {
  require.ensure([
    './screen/view'
  ], function(require) {
    var ScreenState = require('./screen/state');
    var ScreenView = require('./screen/view');

    var bdy = document.body;

    // if ('serviceWorker' in navigator) {
    //   navigator.serviceWorker.register('/service-worker.js', {scope: '/'})
    //   .then(function(reg) {
    //     // registration worked
    //   }).catch(function(error) {
    //     // registration failed
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
    window.addEventListener('resize', require('lodash.debounce')(resize, 100));
    setTimeout(resize, 1500);
  });
});