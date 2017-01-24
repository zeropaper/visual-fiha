'use strict';



require.ensure([
  './controller/settings',
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

var DetailsView = require('./layer/details-view');
var Settings = require('./controller/settings');

var VF = window.VF || {};
VF.setups = VF.setups || {};


var AppRouter = require('ampersand-router').extend({
  _workerInit: false,


  _handleBroadcastMessages: function(evt) {
    var router = this;
    var screen = router.model;
    var command = evt.data.command;
    var payload = evt.data.payload || {};
    console.info('%capp incoming broadcast command "%s"', 'color:purple', command);

    switch (command) {
      case 'bootstrap':
        screen.layers.reset(payload.layers || []);
        signals.reset(payload.signals || []);
        mappings.import(payload.mappings || [], screen, true);
        break;

      case 'addLayer':
        screen.layers.add(payload.layer);
        var model = screen.layers.get(payload.layer.name);
        console.info('add layer model', model);
        router.view.showDetails(new DetailsView({
          parent: router.view.layersView,
          model: model
        }));
        break;
      case 'updateLayers':
        payload.layers.forEach(function(obj) {
          var layer = screen.layers.get(obj.name);
          if (!layer) {
            console.warn('missing layer', obj.name);
          }
          else {
            layer.set(obj);
          }
        });
        break;
    }
  },

  _handleWorkerMessages: function(evt) {
    var router = this;
    var command = evt.data.command;
    var payload = evt.data.payload || {};
    console.info('%capp incoming worker command "%s"', 'color:purple', command);

    switch (command) {
      case 'addSignal':
        router.model.signals.add(payload.signal);
        router.view.showDetails(new DetailsView({
          parent: router.view.signalsView,
          model: router.model.signals.get(payload.signal.name)
        }));
        break;
      case 'updateSignals':
        payload.signals.forEach(function(obj) {
          var layer = router.model.signals.get(obj.name);
          if (!layer) {
            console.warn('missing layer', obj.name);
          }
          else {
            layer.set(obj);
          }
        });
        break;
      default:
        console.info('%cunsupported command', 'color:purple', command, payload);
    }
  },

  initialize: function(options) {
    var router = this;

    router.worker = new LoadedWorker();
    router.settings = new Settings('vf');

    var screen = router.model = new ScreenState();

    router.broadcastChannel = new BroadcastChannel('spike');

    router.broadcastChannel.addEventListener('message', this._handleBroadcastMessages.bind(this));

    router.worker.addEventListener('message', this._handleWorkerMessages.bind(this));

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
      layers: options.setup.layers,
      signals: options.setup.signals,
      mappings: options.setup.mappings
    });
  },

  sendCommand: function(name, payload, callback) {
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
