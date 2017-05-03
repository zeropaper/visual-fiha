/******/ (function(modules) { // webpackBootstrap
/******/ 	this["webpackChunk"] = function webpackChunkCallback(chunkIds, moreModules) {
/******/ 		for(var moduleId in moreModules) {
/******/ 			modules[moduleId] = moreModules[moduleId];
/******/ 		}
/******/ 		while(chunkIds.length)
/******/ 			installedChunks[chunkIds.pop()] = 1;
/******/ 	};
/******/
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// object to store loaded chunks
/******/ 	// "1" means "already loaded"
/******/ 	var installedChunks = {
/******/ 		5: 1
/******/ 	};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/ 	// This file contains only the entry chunk.
/******/ 	// The chunk loading function for additional chunks
/******/ 	__webpack_require__.e = function requireEnsure(chunkId) {
/******/ 		// "1" is the signal for "already loaded"
/******/ 		if(!installedChunks[chunkId]) {
/******/ 			importScripts("" + chunkId + ".worker-build.js");
/******/ 		}
/******/ 		return Promise.resolve();
/******/ 	};
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 17);
/******/ })
/************************************************************************/
/******/ ({

/***/ 17:
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* jshint worker:true */

var worker = self;
__webpack_require__.e/* require.ensure */(0).then((function() {
__webpack_require__.e/* require.ensure */(4).then((function() {
__webpack_require__.e/* require.ensure */(2).then((function() {
__webpack_require__.e/* require.ensure */(3).then((function() {
__webpack_require__.e/* require.ensure */(1).then((function() {
// ---------------------------------------------------------------
var resolve = __webpack_require__(0);
var fromYaml = __webpack_require__(16);

var Mappings = __webpack_require__(1);

var ScreenState = __webpack_require__(2);
worker.screen = new ScreenState();

worker.layers = worker.screen.layers;

var SignalCollection = __webpack_require__(3);
worker.signals = new SignalCollection({
  parent: worker.screen
});
worker.signals.listenTo(worker.screen.clock, 'change:frametime', function(...args) {
  worker.signals.trigger('change:frametime', ...args);
});
var localForage = __webpack_require__(15);


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
var _fps = 60;
var _prev = performance.now();
var _frameMillis = 1000 / _fps;
var _internalTimeout;
var _frameCounter = 0;
var _samplesCount = _fps * 2;
var _prevSamples = _prev;

function _animate() {
  __dataContext.frametime = worker.screen.clock.refresh().frametime;

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
  play: function() {
    worker.screen.clock.play();
  },
  pause: function() {
    worker.screen.clock.pause();
  },
  stop: function() {
    worker.screen.clock.stop();
  },
  setBPM: function(bpm) {
    worker.screen.clock.bpm = bpm;
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
      clock: worker.screen.clock.serialize(),
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
}).bind(null, __webpack_require__)).catch(__webpack_require__.oe);
}).bind(null, __webpack_require__)).catch(__webpack_require__.oe);
}).bind(null, __webpack_require__)).catch(__webpack_require__.oe);
}).bind(null, __webpack_require__)).catch(__webpack_require__.oe);
}).bind(null, __webpack_require__)).catch(__webpack_require__.oe);

/***/ })

/******/ });
//# sourceMappingURL=worker-build.js.map