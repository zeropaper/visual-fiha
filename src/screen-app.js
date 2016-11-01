'use strict';
var ScreenState = require('./screen/state');
var ScreenView = require('./screen/view');

var screenView = new ScreenView({
  el: document.querySelector('.screen'),
  model: new ScreenState({})
});
screenView.render();
