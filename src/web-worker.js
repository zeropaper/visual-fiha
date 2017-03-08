/* jshint worker:true */
'use strict';
// var logger = require('./logging')('orange');

var worker = self;
var resolve = require('./resolve');

var Mappings = require('./mapping/data');

var ScreenState = require('./screen/state');
worker.screen = new ScreenState();

worker.layers = worker.screen.layers;

var SignalCollection = require('./signal/collection');
worker.signals = new SignalCollection({
  parent: worker.screen
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






// var localForage = require('./storage');
// function snapshot() {
//   localForage.setItem('snapshot', {
//     screen: worker.screen.serialize(),
//     signals: worker.signals.serialize()
//   });//.then(console.info.bind(console), console.error.bind(console));
// }
// setInterval(snapshot, 5000);


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
    frametime: __dataContext.frametime,
    audio: worker.audio,
    layers: worker.layers.serialize().filter(o => o.name)
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
  bootstrap: function(layers, signals, mappings) {
    worker.layers.set(layers);
    worker.signals.set(signals);
    worker.mappings.import(mappings, true);

    broadcastCommand('bootstrap', {
      signals: worker.signals.serialize(),
      mappings: worker.mappings.export(),
      layers: worker.layers.serialize()
    });
  },


  midi: function(deviceName, property, velocity) {
    worker.mappings.processMIDI(deviceName, property, velocity);
  },



  heartbeat: function(frametime, audio) {
    worker.frametime = frametime;
    worker.audio = audio;
  },



  propChange: function(path, property, value) {
    var obj = resolve(path, __dataContext);
    if (!obj) return;
    if (obj[property] && obj[property].isCollection) return obj[property].set(Array.isArray(value) ? value : [value]);
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

  // if (['heartbeat'].indexOf(commandName) === -1) {
  //   _executedCommands.push({
  //     time: Date.now(),
  //     command: commandName,
  //     payload: evt.data.payload
  //   });
  // }

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
