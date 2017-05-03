webpackJsonp([3],{

/***/ 336:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Promise.resolve().then((function() {
Promise.resolve().then((function() {
__webpack_require__.e/* require.ensure */(0).then((function() {
__webpack_require__.e/* require.ensure */(6).then((function() {
__webpack_require__.e/* require.ensure */(4).then((function() {
__webpack_require__.e/* require.ensure */(5).then((function(require) {
// ---------------------------------------------------------------



// almost unique id
function auid() {
  return parseInt((Math.random() + '.' + performance.now()).replace(/\./g, ''), 10);
}
var LoadedWorker = __webpack_require__(335);
var ControllerView = __webpack_require__(339);
var ScreenState = __webpack_require__(14);
var MIDIAccessState = __webpack_require__(87);
var Mappings = __webpack_require__(85);
var Tour = __webpack_require__(337);
var fromYaml = __webpack_require__(164);

var DetailsView = __webpack_require__(151);
var Settings = __webpack_require__(86);

var SignalCollection = __webpack_require__(343);

var signals = new SignalCollection([]);

var VF = window.VF || {};
VF.setups = VF.setups || {};

// var _executedCommands = [];

var AppRouter = __webpack_require__(53).extend({
  _workerInit: false,

  _handleBroadcastMessages: function(evt) {
    var router = this;
    var screen = router.model;
    var command = evt.data.command;
    var payload = evt.data.payload || {};

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
        screen.layers.set(payload.layers);
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
    var command = evt.data.command;
    var payload = evt.data.payload || {};

    switch (command) {
      case 'health':
        router.view.workerPerformance = `~${ ((payload.samplesCount / payload.elapsed) * 1000).toFixed(2) }/${ payload.fps }fps`;
        break;

      case 'updateLayer':
        var layerState = screen.layers.get(payload.layer.name);
        if(layerState) {
          layerState.set(payload.layer);
        }
        else {
          screen.layers.add(payload.layer);
        }
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

      case 'storageSetupInstalled':
        router.history.start({
          root: location.pathname,
          pushState: false
        });
        break;

      case 'storageSave':
      case 'storageLoad':
        router.navigate('/setup/' + payload.setupId, {trigger: false, replace: false});
        break;

      case 'yamlLoad':
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
    router.on('all', function(...args) {
      if (args[0] && args[0].indexOf('app:') === 0) screen.trigger(...args);
    });

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
    var steps = __webpack_require__(338)(router.view).map(function(item, i) {
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
}).bind(null, __webpack_require__)).catch(__webpack_require__.oe);
}).bind(null, __webpack_require__)).catch(__webpack_require__.oe);
}).bind(null, __webpack_require__)).catch(__webpack_require__.oe);
}).bind(null, __webpack_require__)).catch(__webpack_require__.oe);
}).bind(null, __webpack_require__)).catch(__webpack_require__.oe);
}).bind(null, __webpack_require__)).catch(__webpack_require__.oe);

/***/ })

},[336]);
//# sourceMappingURL=controller-build.js.map