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

// var logger = require('./logging')('purple');



// almost unique id
function auid() {
  return parseInt((Math.random() + '.' + performance.now()).replace(/\./g, ''), 10);
}
var LoadedWorker = require('worker-loader?name=worker-build.js!./web-worker.js');
var ControllerView = require('./controller/view');
var ScreenState = require('./screen/state');
var MIDIAccessState = require('./midi/state');
var Mappings = require('./mapping/data');


var DetailsView = require('./layer/details-view');
var Settings = require('./controller/settings');

var SignalCollection = require('./signal/collection');

var signals = new SignalCollection([]);

var VF = window.VF || {};
VF.setups = VF.setups || {};

// var _executedCommands = [];

var AppRouter = require('ampersand-router').extend({
  _workerInit: false,

  _handleBroadcastMessages: function(evt) {
    var router = this;
    var screen = router.model;
    var command = evt.data.command;
    var payload = evt.data.payload || {};
    // logger.info('app incoming broadcast command "%s"', command);

    switch (command) {
      case 'bootstrap':
        screen.layers.reset(payload.layers || []);
        signals.reset(payload.signals || []);
        router.mappings.import(payload.mappings || [], true);
        break;

      case 'updateLayer':
        screen.layers.get(payload.layer.name).set(payload.layer);
        break;

      case 'addLayer':
        screen.layers.add(payload.layer);
        var model = screen.layers.get(payload.layer.name);
        router.view.showDetails(new DetailsView({
          parent: router.view.layersView,
          model: model
        }));
        break;

      case 'updateLayers':
        var ft = payload.frametime || 0;
        signals.trigger('frametime', ft);
        screen.layers.trigger('frametime', ft);
        screen.layers.set(payload.layers);
        break;

      default:
        console.info('unrecognized broadcast command "%s"', command);
    }
    router.trigger('app:broadcast:' + command, payload);
  },

  _handleWorkerMessages: function(evt) {
    var router = this;
    var command = evt.data.command;
    var payload = evt.data.payload || {};
    // logger.info('app incoming worker command "%s"', command);

    switch (command) {
      case 'health':
        router.view.workerPerformance = `~${ ((payload.samplesCount / payload.elapsed) * 1000).toFixed(2) }/${ payload.fps }fps`;
        break;

      case 'addSignal':
        signals.add(payload.signal);
        router.view.showDetails(new DetailsView({
          parent: router.view.signalsView,
          model: signals.get(payload.signal.name)
        }));
        break;
      case 'updateSignal':
        var signalState = signals.get(payload.signal.name);
        if (signalState) {
          signalState.set(payload.signal);
        }
        break;
      case 'updateSignals':
        signals.set(payload.signals);
        break;
      case 'removeSignal':
        signals.remove(payload.name);
        break;

      case 'addMapping':
        router.mappings.add(payload.mapping);
        break;
      case 'updateMapping':
        var mappingState = router.mappings.get(payload.mapping.name);
        if (mappingState) {
          mappingState.set(payload.mapping);
          mappingState.trigger('change:targets');
        }
        break;
      case 'removeMapping':
        router.mappings.remove(payload.name);
        break;

      case 'timelineCommands':
        router.view.timeline.addEntries(payload.commands);
        break;

      default:
        console.info('unrecognized worker command "%s"', command);
    }
    router.trigger('app:worker:' + command, payload);
  },

  initialize: function(options) {
    var router = this;

    router.worker = new LoadedWorker();
    router.settings = new Settings('vf');

    var screen = router.model = new ScreenState();

    var mappingContext = {
      context: {
        signals: signals,
        layers: screen.layers
      }
    };
    router.mappings = new Mappings([], mappingContext);

    router.broadcastChannel = new BroadcastChannel('spike');

    router.broadcastChannel.addEventListener('message', this._handleBroadcastMessages.bind(this));

    router.worker.addEventListener('message', this._handleWorkerMessages.bind(this));

    var midi = router.midi = (router.midi || new MIDIAccessState({}));

    midi.on('midi:change', function(deviceName, property, velocity) {
      router.sendCommand('midi', {
        deviceName: deviceName,
        property: property,
        velocity: velocity
      });
    });

    router.listenTo(midi, 'change:inputs', function() {
      var _mappings = router.mappings.length ? router.mappings.export() : options.mappings || [];
      if (!_mappings.length) return;
      router.sendCommand('resetMappings', {
        mappings: _mappings
      });
    });

    router.view = new ControllerView({
      midi: midi,
      model: screen,
      router: router,
      signals: signals,
      mappings: router.mappings,
      el: document.querySelector('.controller')
    });

    router.defaultSetup = options.setup || {
      layers: [],
      signals: [],
      mappings: []
    };
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
    'setup/:setupId': 'loadSetup'
  },

  _loadDefaultSetup: function() {
    this.sendCommand('bootstrap', {
      layers: this.defaultSetup.layers,
      signals: this.defaultSetup.signals,
      mappings: this.defaultSetup.mappings
    });
  },

  loadSetup: function(setupId) {
    var router = this;
    console.info('loadSetup', setupId);
    if (!setupId) {
      router._loadDefaultSetup();
    }
    else if (setupId.indexOf('local-') === 0) {
      localForage.getItem(setupId)
        .then(function(setup) {
          router.sendCommand('bootstrap', {
            layers: setup.layers,
            signals: setup.signals,
            mappings: setup.mappings
          });
        })
        .catch(router._loadDefaultSetup.bind(router));
    }
    else {
      this.loadGist(setupId);
    }
  },

  loadGist: function(gistId) {
    var gistView = this.view.gistView;
    var same = gistView.gistId === gistId;
    gistView.gistId = gistId;
    if (!same) gistView._loadGist();
  }
});




var controllerSetup = VF._defaultSetup;
controllerSetup.el = document.querySelector('.controller');

var vf = window.visualFiha = new AppRouter({
  setup: controllerSetup
});
vf.history.start({
  root: location.pathname,
  pushState: false
});



// ---------------------------------------------------------------
});