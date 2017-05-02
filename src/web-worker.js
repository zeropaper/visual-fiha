/* jshint worker:true */
'use strict';
var worker = self;
require.ensure([
  'lodash.assign',
  'ampersand-state',
  'ampersand-collection'
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
  './utils/resolve',
  './signal/collection'
], function() {
// ---------------------------------------------------------------
var resolve = require('./utils/resolve');
var fromYaml = require('./utils/yaml-to-setup');

var Mappings = require('./mapping/data');

var ScreenState = require('./screen/state');
worker.screen = new ScreenState();

worker.layers = worker.screen.layers;

var SignalCollection = require('./signal/collection');
worker.signals = new SignalCollection({
  parent: worker.screen
});
var localForage = require('./storage');


localForage.installSetups(function(err) {
  if (err) return emitCommand('storageSetupInstalled', {error: err});
  emitCommand('storageSetupInstalled');
});


var __dataContext = {
  frametime: 0,
  firstframetime: 0,
  audio: {},
  layers: worker.layers,
  signals: worker.signals
};


worker.mappings = new Mappings([], {
  context: __dataContext
});


function signature(fn) {
  var args = fn.toString().match('function[^(]*\\(([^)]*)\\)');
  if (!args || !args[1].trim()) { return []; }
  return args[1].split(',').map(function(a){ return a.trim(); });
}

var signatures = {};
function registerCommand(commandName, command) {
  if (arguments.length === 1) {
    if (typeof arguments[0] === 'function') {
      command = arguments[0];
      commandName = command.name;
    }
    else {
      command = commands[arguments[0]];
    }
  }
  else if (typeof command !== 'function') {
    command = commands[commandName];
  }
  signatures[commandName] = signature(command);
}



function emitCommand(name, payload) {
  worker.postMessage({
    command: name,
    payload: payload
  });
}


var screens = {};
var channel = new BroadcastChannel('spike');
function broadcastCommand(name, payload) {
  channel.postMessage({
    command: name,
    payload: payload
  });
}



/******************************************************\
 * Worker   clock                                     *
\******************************************************/
var _fps = 45;
var _prev = performance.now();
var _frameMillis = 1000 / _fps;
var _internalTimeout;
var _frameCounter = 0;
var _samplesCount = _fps * 2;
var _prevSamples = _prev;
var _animationStartTime = performance.now();

function _animate() {
  worker.screen.frametime = __dataContext.frametime = performance.now() - _animationStartTime;
  worker.signals.trigger('frametime', __dataContext.frametime);

  emitCommand('updateSignals', {
    signals: worker.signals.serialize().filter(o => o.name)
  });

  broadcastCommand('updateLayers', {
    layers: worker.layers.serialize()
  });


  var _now = performance.now();
  var elapsed = _now - _prev;
  var timeDiff = _frameMillis - (elapsed - _frameMillis);
  _prev = _now;
  _internalTimeout = setTimeout(_animate, timeDiff);

  _frameCounter++;
  if (_frameCounter === _samplesCount) {
    // inform the controller of the health of the worker
    emitCommand('health', {
      frametime: worker.screen.frametime,
      elapsed: _now - _prevSamples,
      fps: _fps,
      frameCounter: _frameCounter,
      samplesCount: _samplesCount
    });

    _frameCounter = 0;
    _prevSamples = _now;
  }
}
_internalTimeout = setTimeout(_animate, _frameMillis);


// var _bootstrapTime = Date.now();
// var _executedCommands = [];
// var _previousCommandIndex = 0;

// setInterval(function() {
//   if (_previousCommandIndex < _executedCommands.length) {
//     console.info('send %s timelineCommands', _executedCommands.length - _previousCommandIndex);
//     emitCommand('timelineCommands', {
//       commands: _executedCommands.slice(_previousCommandIndex, _executedCommands.length)
//     });
//     _previousCommandIndex = _executedCommands.length;
//   }
// }, 100);


/******************************************************\
 * Screen registration                                *
\******************************************************/
channel.addEventListener('message', function(evt) {
  var command = evt.data.command;
  if (command !== 'register') return;

  var payload = evt.data.payload;
  if (screens[payload.id]) {
    return;
  }

  screens[payload.id] = payload.id;
});



/******************************************************\
 * Worker commands                                    *
\******************************************************/
var commands = {
  play: function(ft) {
    if (ft) screen.layers.frametime = __dataContext.frametime = ft;

  },
  pause: function() {

  },
  stop: function() {

  },
  storageKeys: function() {
    localForage
      .keys()
        .then(function(keys) {
          emitCommand('storageKeys', {keys: keys});
        })
        .catch(function(err) {
          emitCommand('storageKeys', {error: err});
        });
  },

  storageSave: function(setupId) {
    var setup = {
      layers: worker.layers.serialize(),
      signals: worker.signals.serialize(),
      mappings: worker.mappings.serialize()
    };

    localForage
      .setItem(setupId, setup)
        .then(function() {
          emitCommand('storageSave', {setup: setup, setupId: setupId});
        })
        .catch(function(err) {
          emitCommand('storageSave', {error: err, setupId: setupId});
        });
  },

  storageLoad: function(setupId) {
    localForage
      .getItem(setupId)
        .then(function(setup) {
          worker.layers.reset(setup.layers);
          worker.signals.reset(setup.signals);
          worker.mappings.reset(setup.mappings);

          setup = {
            signals: worker.signals.serialize(),
            mappings: worker.mappings.serialize(),
            layers: worker.layers.serialize()
          };
          broadcastCommand('bootstrap', {layers: setup.layers});
          emitCommand('storageLoad', {setup: setup, setupId: setupId});
        })
        .catch(function(err) {
          emitCommand('storageLoad', {error: err, setupId: setupId});
        });
  },

  yamlLoad: function(yamlStr) {
    var setup = fromYaml(yamlStr);
    worker.layers.reset(setup.layers);
    worker.signals.reset(setup.signals);
    worker.mappings.reset(setup.mappings);

    setup = {
      signals: worker.signals.serialize(),
      mappings: worker.mappings.serialize(),
      layers: worker.layers.serialize()
    };
    broadcastCommand('bootstrap', {layers: setup.layers});
    emitCommand('yamlLoad', {setup: setup});
  },


  midi: function(deviceName, property, velocity) {
    worker.mappings.processMIDI(deviceName, property, velocity);
  },



  heartbeat: function(audio) {
    worker.audio = audio;
    broadcastCommand('heartbeat', {
      frametime: worker.screen.frametime || 0,
      audio: audio
    });
  },



  propChange: function(path, property, value) {
    var obj = resolve(path, __dataContext);
    if (!obj) return;
    if (obj[property] && obj[property].isCollection) {
      return obj[property].set(Array.isArray(value) ? value : [value]);
    }
    obj.set(property, value);
  },



  addMapping: function(mapping) {
    worker.mappings.add(mapping);
    emitCommand('addMapping', {mapping: mapping});
  },
  updateMapping: function(mapping) {
    var state = worker.mappings.get(mapping.name);
    if (state) state.set(mapping);
    emitCommand('updateMapping', {mapping: mapping});
  },
  removeMapping: function(name) {
    worker.mappings.remove(name);
    emitCommand('removeMapping', {name: name});
  },
  resetMappings: function(mappings) {
    worker.mappings.import(mappings, true);
  },





  resetSignals: function(signals) {
    worker.signals.reset(signals);
    emitCommand('resetSignals', {
      signals: signals
    });
  },
  addSignal: function(signal) {
    worker.signals.add(signal);
    emitCommand('addSignal', {
      signal: signal
    });
  },
  removeSignal: function(signalName) {
    var collection = worker.signals;
    collection.remove(collection.get(signalName));
    emitCommand('removeSignal', {
      signalName: signalName
    });
  },
  updateSignal: function(signal, signalName) {
    var state = worker.signals.get(signalName);
    state.set(signal);
    emitCommand('updateSignal', {
      signalName: signalName,
      signal: signal
    });
  },
  updateSignals: function(signals) {
    worker.signals.set(signals);
    emitCommand('updateSignals', {
      signals: signals
    });
  },





  resetLayers: function(layers) {
    worker.layers.reset(layers);

    broadcastCommand('resetLayers', {
      layers: layers
    });
  },
  addLayer: function(layer) {
    worker.layers.add(layer);

    broadcastCommand('addLayer', {
      layer: layer
    });
  },
  removeLayer: function(layerName) {
    var collection = worker.layers;
    collection.remove(collection.get(layerName));

    broadcastCommand('removeLayer', {
      layerName: layerName
    });
  },
  updateLayer: function(layer, broadcast) {
    var state = worker.layers.get(layer.name);
    state.set(layer);
    if (broadcast) broadcastCommand('updateLayer', {layer: layer});
  },

  addParameter: function(path, parameter) {
    var obj = resolve(path, __dataContext);
    if (!obj || !obj.parameters) return;
    obj.parameters.add(parameter);
  }
};



Object.keys(commands).forEach(registerCommand);





worker.addEventListener('message', function(evt) {
  var eventId = evt.data.eventId;

  var commandName = evt.data.command;
  var command = commands[commandName];


  if (typeof command !== 'function') {
    return worker.postMessage({
      type: 'error',
      command: commandName,
      message: 'Unknown command "' + commandName + '"',
      eventId: eventId
    });
  }

  if (!signatures[commandName]) {
    return worker.postMessage({
      type: 'result',
      command: commandName,
      payload: command(evt.data),
      eventId: eventId
    });
  }

  var commandArgs = signatures[commandName].map(function(argName) {
    return evt.data.payload[argName];
  });

  var result = command.apply(worker, commandArgs);
  if (!eventId) return;
  worker.postMessage({
    type: 'result',
    command: commandName,
    payload: result,
    eventId: eventId
  });
}, {
  passive: true,
  capture: false
});

worker.layers.on('emitCommand', emitCommand);
worker.layers.on('broadcastCommand', broadcastCommand);
// --------------------------------------------------------------
}, 'worker-deps');
}, 'screen-state');
}, 'layer-state');
}, 'mapping-data');
}, 'ampersand-data');