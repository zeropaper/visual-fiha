webpackJsonp([3],{

/***/ 645:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Promise.resolve().then((function() {
Promise.resolve().then((function() {
__webpack_require__.e/* require.ensure */(1).then((function() {
__webpack_require__.e/* require.ensure */(5).then((function() {
__webpack_require__.e/* require.ensure */(0).then((function() {
__webpack_require__.e/* require.ensure */(4).then((function(require) {
// ---------------------------------------------------------------



// almost unique id
function auid() {
  return parseInt((Math.random() + '.' + performance.now()).replace(/\./g, ''), 10);
}
var LoadedWorker = __webpack_require__(644);
var ControllerView = __webpack_require__(648);
var ScreenState = __webpack_require__(32);
var MIDIAccessState = __webpack_require__(146);
var Mappings = __webpack_require__(143);
var Tour = __webpack_require__(646);
var installSetups = __webpack_require__(144).installSetups;

var DetailsView = __webpack_require__(267);
var Settings = __webpack_require__(145);

var SignalCollection = __webpack_require__(650);

var signals = new SignalCollection([]);

var VF = window.VF || {};
VF.setups = VF.setups || {};

// var _executedCommands = [];

var AppRouter = __webpack_require__(96).extend({
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
    screen.trigger('app:broadcast:' + command, payload);
  },

  _handleWorkerMessages: function(evt) {
    var router = this;
    var screen = router.model;
    var command = evt.data.command;
    var payload = evt.data.payload || {};
    // logger.info('app incoming worker command "%s"', command);

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

      default:
        console.info('unrecognized worker command "%s"', command);
    }
    router.trigger('app:worker:' + command, payload);
    screen.trigger('app:worker:' + command, payload);
  },

  initialize: function(options) {
    var router = this;

    router.worker = new LoadedWorker();
    router.settings = new Settings('vf');

    var screen = router.model = new ScreenState({}, {
      router: this
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
    'setup/:setupId': 'loadSetup',
    'tour': 'tour',
    'tour/': 'tour',
    'tour/:step': 'tour'
  },

  tour: function(step) {
    var router = this;
    var steps = __webpack_require__(647)(router.view).map(function(item, i) {
      item.index = i;
      return item;
    });

    function tourReady() {
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
      router._tourBotstrapped = true;
    }

    if (router._tourBotstrapped) return tourReady();
    router._sendBootstrap(router.defaultSetup, tourReady);
  },

  _sendBootstrap: function(setup, done) {
    done = typeof done === 'function' ? done : function() { console.info('APP bootstraped'); };
    this.once('app:broadcast:bootstrap', done);
    this.sendCommand('bootstrap', {
      layers: setup.layers,
      signals: setup.signals,
      mappings: setup.mappings
    });
  },

  _defaultBootstrap: function() {
    console.time();
    this._sendBootstrap(this.defaultSetup, function() {
      console.timeEnd();
    });
  },

  loadSetup: function(setupId) {
    var router = this;

    function done(err, setup) {
      if (err || !setup || !setup.layers || !setup.signals || !setup.mappings) {
        return router._defaultBootstrap();
      }

      console.time();
      router._sendBootstrap(setup, function() {
        console.timeEnd();
        router.navigate('setup/' + setupId, {replace: false, trigger: false});
      });
    }

    if (!setupId) {
      router._defaultBootstrap();
    }
    else if (setupId.indexOf('local-') === 0) {
      router.loadLocal(setupId, done);
    }
    else {
      router.loadGist(setupId, done);
    }
  },

  loadLocal: function(localId, done) {
    var localforageView = this.view.menuView.localforageView;
    localforageView.loadLocal(localId, done);
  },

  loadGist: function(gistId, done) {
    var gistView = this.view.gistView;
    var same = gistView.gistId === gistId;
    gistView.gistId = gistId;
    if (!same) gistView._loadGist(done);
  }
});




var controllerSetup = VF._defaultSetup;
controllerSetup.el = document.querySelector('.controller');

var vf = window.visualFiha = new AppRouter({
  setup: controllerSetup
});
installSetups(function(err) {
  vf.history.start({
    root: location.pathname,
    pushState: false
  });
});



// ---------------------------------------------------------------
}).bind(null, __webpack_require__)).catch(__webpack_require__.oe);
}).bind(null, __webpack_require__)).catch(__webpack_require__.oe);
}).bind(null, __webpack_require__)).catch(__webpack_require__.oe);
}).bind(null, __webpack_require__)).catch(__webpack_require__.oe);
}).bind(null, __webpack_require__)).catch(__webpack_require__.oe);
}).bind(null, __webpack_require__)).catch(__webpack_require__.oe);

/***/ })

},[645]);
//# sourceMappingURL=build.js.map