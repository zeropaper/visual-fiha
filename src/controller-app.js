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
  './mapping/data',
], function() {
require.ensure([
  './layer/state',
  './layer/svg/state',
  './layer/img/state',
  './layer/txt/state',
  './layer/p5/state',
  './layer/threejs/state',
  './layer/video/state',
  './layer/canvas/state',
], function() {
require.ensure([
  './screen/state',
], function() {
require.ensure([
  './controller/settings',
  './layer/canvas/scripts',
  './midi/state',
  './midi/view',
  './signal/control-view',
  './signal/beat/control-view',
  './signal/hsla/control-view',
  './signal/rgba/control-view'
], function(require) {
// ---------------------------------------------------------------



// almost unique id
function auid() {
  return parseInt((Math.random() + '.' + performance.now()).replace(/\./g, ''), 10);
}
var LoadedWorker = require('worker-loader?name=worker-build.js!./web-worker.js');
var ControllerView = require('./controller/view');
var ScreenState = require('./screen/state');
var MIDIAccessState = require('./midi/state');
var Mappings = require('./mapping/data');
var Tour = require('./controller/tour/index');
var fromYaml = require('./utils/yaml-to-setup');

var DetailsView = require('./layer/details-view');
var Settings = require('./controller/settings');

var SignalCollection = require('./signal/collection');


// var _executedCommands = [];

var AppRouter = require('ampersand-router').extend({
  _workerInit: false,

  _handleBroadcastMessages: function(evt) {
    var router = this;
    var screen = router.model;
    var layers = screen.layers;
    var command = evt.data.command;
    var payload = evt.data.payload || {};

    switch (command) {
      case 'bootstrap':
        layers.reset(payload.layers || []);
        break;

      case 'updateLayers':
        layers.set(payload.layers);
        break;

      case 'updateLayer':
        layers.get(payload.layer.name).set(payload.layer);
        break;

      case 'addLayer':
        layers.add(payload.layer);
        var model = layers.get(payload.layer.name);
        router.view.showDetails(new DetailsView({
          parent: router.view.layersView,
          model: model
        }));
        break;

      case 'updateLayers':
        layers.set(payload.layers);
        break;

      case 'heartbeat':
        screen.clock.set(payload.clock);
        break;

      default:
        console.info('unrecognized broadcast command "%s"', command);
    }
    router.trigger('app:broadcast:' + command, payload);
  },

  _handleWorkerMessages: function(evt) {
    var router = this;
    var screen = router.model;
    var signals = router.signals;
    var mappings = router.mappings;
    var layers = screen.layers;
    var command = evt.data.command;
    var payload = evt.data.payload || {};

    switch (command) {
      case 'health':
        router.view.workerPerformance = `~${ ((payload.samplesCount / payload.elapsed) * 1000).toFixed(2) }/${ payload.fps }fps`;
        break;

      case 'updateLayer':
        layers.get(payload.layer.name).set(payload.layer);
        break;

      case 'addSignal':
        signals.add(payload.signal);
        router.view.showDetails(new DetailsView({
          parent: router.view.signalsView,
          model: signals.get(payload.signal.name)
        }));
        break;
      case 'updateSignalResult':
        signals.get(payload.name).workerResult = payload.workerResult;
        break;
      case 'updateSignal':
        signals.get(payload.signal.name).set(payload.signal);
        break;
      case 'updateSignals':
        signals.set(payload.signals);
        break;
      case 'removeSignal':
        signals.remove(payload.name);
        break;

      case 'addMapping':
        mappings.add(payload.mapping);
        break;
      case 'updateMapping':
        var mappingState = mappings.get(payload.mapping.name);
        if (mappingState) {
          mappingState.set(payload.mapping);
          mappingState.trigger('change:targets');
        }
        break;
      case 'removeMapping':
        mappings.remove(payload.name);
        break;

      case 'timelineCommands':
        router.view.timeline.addEntries(payload.commands);
        break;

      case 'storageSetupInstalled':
        router.history.start({
          root: location.pathname,
          pushState: false
        });
        break;

      case 'storageSave':
      case 'storageLoad':
        if (command === 'storageLoad') {
          mappings.reset(payload.setup.mappings);
          signals.reset(payload.setup.signals);
        }
        router.navigate('/setup/' + payload.setupId, {trigger: false, replace: false});
        break;

      case 'yamlLoad':
        mappings.reset(payload.setup.mappings);
        signals.reset(payload.setup.signals);
        break;
      case 'storageKeys':
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

    var screen = router.model = new ScreenState({}, {
      router: this
    });
    var signals = router.signals = new SignalCollection([], {
      clock: screen.clock
    });


    router.on('all', function(...args) {
      if (args[0] && args[0].indexOf('app:') === 0) screen.trigger(...args);
    });

    var mappingContext = {
      context: {
        signals: router.signals,
        layers: screen.layers
      }
    };
    var mappings = router.mappings = new Mappings([], mappingContext);

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
      var _mappings = mappings.length ? mappings.export() : options.mappings || [];
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
      el: options.el
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
    'tour': 'tour',
    'tour/': 'tour',
    'tour/:step': 'tour'
  },

  tour: function(step) {
    var router = this;
    var steps = require('./controller/tour/steps')(router.view).map(function(item, i) {
      item.index = i;
      return item;
    });

    function tourReady(err) {
      if (err) throw err;
      if (!router.tourView) {
        router.tourView = new Tour({
          parent: router,
          steps: steps,
          onstepchange: function(step) {
            router.navigate('tour/' + step.name, {});
          }
        });
        document.body.appendChild(router.tourView.el);
        router.tourView.update();
      }

      router.tourView.step = step;
      router._tourBootstrapped = true;
    }

    if (router._tourBootstrapped) return tourReady();
    // load the default setup
    router.loadSetup(null, tourReady);
  },

  loadSetup: function(setupId, next) {
    console.time(setupId);

    var router = this;
    setupId = setupId || 'local-demo-3d-zeropaper';

    next = typeof next === 'function' ? next : function(){};

    function done(err, setup) {
      console.timeEnd(setupId);
      if (err) return next(err);
      // router.navigate('setup/' + setupId, {replace: false, trigger: false});
      router.view.getSetupEditor(setup);
      next();
    }

    if (setupId.indexOf('local-') === 0) {
      router._loadLocal(setupId, done);
    }
    else {
      router._loadGist(setupId, done);
    }
  },

  _loadLocal: function(setupId, done) {
    done = typeof done === 'function' ? done : function(err) {
      if(err) console.error('localforage error', err.message);
    };

    this.once('app:worker:storageLoad', function(data) {
      done(data.error, data.setup);
    });

    this.sendCommand('storageLoad', {setupId: setupId});
  },

  _loadGist: function(gistId, done) {
    var gistView = this.view.gistView;
    var same = gistView.gistId === gistId;
    gistView.gistId = gistId;
    if (!same) {
      gistView._loadGist(function(err, content) {
        if (err) return done(err);
        done(null, fromYaml(content));
      });
    }
  }
});


window.visualFiha = new AppRouter({
  el: document.querySelector('.controller')
});

// ---------------------------------------------------------------
}, 'controller-deps');
}, 'screen-state');
}, 'layer-state');
}, 'mapping-data');
}, 'ampersand-view');
}, 'ampersand-data');