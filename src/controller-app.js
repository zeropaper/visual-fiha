'use strict';



require.ensure([
  './storage',
  './layer/canvas/scripts',
  './screen/state',
  './midi/state',
  './midi/view',
  './signal/control-view',
  './signal/beat/control-view',
  './signal/hsla/control-view',
  './signal/rgba/control-view'
], function(require) {
// ---------------------------------------------------------------

var localForage = require('./storage');
localForage.config({
  // driver      : localforage.WEBSQL, // Force WebSQL; same as using setDriver()
  name        : 'visualFiha',
  version     : 1.0,
  size        : 4980736, // Size of database, in bytes. WebSQL-only for now.
  storeName   : 'keyvaluepairs', // Should be alphanumeric, with underscores.
  description : 'Visual Fiha storage'
});




// almost unique id
function auid() {
  return parseInt((Math.random() + '.' + performance.now()).replace(/\./g, ''), 10);
}
var LoadedWorker = require('worker-loader!./web-worker.js');
var ControllerView = require('./controller/view');
var ScreenState = require('./screen/state');
var MIDIAccessState = require('./midi/state');

var mappings = require('./mapping/service');

var VF = window.VF || {};
VF.setups = VF.setups || {};


var AppRouter = require('ampersand-router').extend({
  _workerInit: false,

  initialize: function(options) {
    var router = this;

    router.worker = new LoadedWorker();

    var screen = router.model = new ScreenState({
      signals: options.setup.signals,// TODO: move that
      layers: options.setup.layers
    });

    var midi = router.midi || new MIDIAccessState({});
    console.info('midi', midi);

    router.listenTo(midi, 'change:inputs', function() {
      var _mappings = mappings.length ? mappings.export() : options.mappings || [];
      router.sendCommand('resetMappings', {mappings: _mappings});
    });

    router.view = new ControllerView({
      model: screen,
      router: router,
      el: document.querySelector('.controller')
    });

    router.sendCommand('bootstrap', {
      screen: screen.serialize(),
      mappings: mappings.export()
    });
  },

  sendCommand: function(name, payload, callback) {
    // console.info('%ccontroller send command "%s"', 'color:green', name);
    var worker = this.worker;
    var message = {
      command: name,
      payload: payload
    };

    function makeListener(id, done) {
      function eventListener(evt) {
        if (evt.data.eventId !== id) return;
        done(null, evt.data.payload);
        worker.removeEventListener('message', eventListener);
      }
      return eventListener;
    }

    if (callback) {
      message.eventId = auid();
      worker.addEventListener('message', makeListener(message.eventId, callback));
    }
    worker.postMessage(message);
  },


  routes: {
    '': 'loadSetup',
    'setup/:setupId': 'loadSetup',
    'gist/:gistId': 'loadGist'
  },

  loadSetup: function(setupId) {
    console.info('use setup?', setupId, VF);
    // window.VF._defaultSetup

    // var gistView = this.view.gistView;
    // var same = gistView.gistId = gistId;
    // gistView.gistId = gistId;
    // if (!same) gistView._loadGist();

  },

  loadGist: function(gistId) {
    var gistView = this.view.gistView;
    var same = gistView.gistId = gistId;
    gistView.gistId = gistId;
    if (!same) gistView._loadGist();
  }
});



localForage.getItem('snapshot').then(function(value) {
  console.info('snapshot found', value);

  var controllerSetup = VF._defaultSetup;
  controllerSetup.el = document.querySelector('.controller');

  // if (value && confirm('Load previous state?')) {
  //   controllerSetup.layers = value.screen.layers;
  //   controllerSetup.signals = value.signals;
  // }

  var vf = window.visualFiha = new AppRouter({
    setup: controllerSetup
  });
  vf.history.start({
    root: location.pathname,
    pushState: false
  });
});




// ---------------------------------------------------------------
});
