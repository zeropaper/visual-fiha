'use strict';
var _view;
var ControllerView = require('./controller/view');

function setupController(options) {
  options = options || {};
  if (!options.reboot && options.record) {
    var stored = window.localStorage.getItem('zwv');
    stored = stored ? JSON.parse(stored) : false;
    options.screenLayers = stored ? stored.screenLayers : options.screenLayers;
    options.screenSignals = stored ? stored.screenSignals : options.screenSignals;
    console.info('import stored settings?', stored);
  }

  options.audioSource = 'https://archive.org/download/compilation_017/yttaaq_-_break_it.mp3';
  if (!_view) {
    _view = new ControllerView(options);
  }

  if (options.record) {
    var prev;
    var record = VFDeps.throttle(function(){
      if (arguments[0] === 'frametime') return;
      console.time('write json');
      var json = JSON.stringify(_view.toJSON());
      if (json !== prev) {
        window.localStorage.setItem('zwv', json);
      }
      prev = json;
      console.timeEnd('write json');
    }, 1000 / 16);
    _view.screenView.off('all', record);
    _view.screenView.on('all', record);
  }

  return _view;
}

var VF = window.VF || {};
var controllerSetup = VF._defaultSetup;
controllerSetup.el = document.querySelector('.controller');
// controllerSetup.record = window.location.hash === '#record';
window.visualFiha = setupController(controllerSetup);
