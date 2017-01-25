/* jshint worker:true */
'use strict';

var worker = self;


worker.mappings = require('./mapping/service');
worker.mappings.context = worker;


var ScreenState = require('./screen/state');
worker.screen = new ScreenState();

worker.layers = worker.screen.layers;

var SignalCollection = require('./signal/collection');
worker.signals = new SignalCollection({
  parent: worker.screen
});



var __dataContext = worker.mappings.context = {
  frametime: 0,
  firstframetime: 0,
  audio: {},
  layers: worker.layers,
  signals: worker.signals
};



// var tXML = require('txml');
// function loadSVG(url, done) {
//   done = done || function(err, obj) {
//     console.info('loadSVG', err ? err.stack : obj);
//   };

//   fetch(url)
//     .then(function(res) {
//       return res.text();
//     })
//     .then(function(string) {
//       var styles = {};

//       try {
//         tXML(string, {
//           filter: function(child) {
//             return child.attributes && child.attributes.id && child.attributes.style;
//           }
//         }).forEach(function(node) {
//           styles[node.attributes.id] = node.attributes.style;
//         });
//       }
//       catch (e) {
//         return done(e);
//       }

//       done(null, {
//         source: string,
//         styles: styles
//       });
//     })
//     .catch(done);
// }


// loadSVG('assets/zeropaper-fat.svg');




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
  console.info('%cworker emit command "%s"', 'color:red', name);
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



// if there's some magic in that software...
// it's probably in the following lines
var _fps = 45;
var _prev = performance.now();
var _frameMillis = 1000 / _fps;
var _internalTimeout;
// var _frameCounter = 0;
// var _samplesCount = 10;
// var _prevSamples = performance.now();

function _animate() {
  broadcastCommand('updateLayers', {
    layers: worker.layers.serialize()
  });

  var _now = performance.now();
  var timeDiff = _frameMillis - ((_now - _prev) - _frameMillis);
  // if (_frameCounter === _samplesCount) {
  //   console.info('%c_animating', 'color:red', _frameMillis, (_now - _prevSamples) / _samplesCount);
  //   _frameCounter = 0;
  //   _prevSamples = _now;
  // }
  // _frameCounter++;
  _prev = _now;
  _internalTimeout = setTimeout(_animate, timeDiff);
}
_internalTimeout = setTimeout(_animate, _frameMillis);



channel.addEventListener('message', function(evt) {
  var command = evt.data.command;
  if (command !== 'register') return;

  var payload = evt.data.payload;
  if (screens[payload.id]) {
    return;
  }

  screens[payload.id] = payload.id;
});




var commands = {
  bootstrap: function(layers, signals, mappings) {
    worker.layers.set(layers);
    worker.signals.set(signals);
    worker.mappings.import(mappings, __dataContext, true);

    broadcastCommand('bootstrap', {
      signals: worker.signals.serialize(),
      mappings: worker.mappings.export(),
      layers: worker.layers.serialize()
    });
  },







  midi: function(name, velocity) {
    console.info('midi event "%s", %s', name, velocity);
  },
  heartbeat: function(frametime, audio) {
    worker.frametime = frametime;
    worker.audio = audio;

    broadcastCommand('heartbeat', {
      frametime: frametime,
      audio: audio
    });
  },



  propChange: function(path, property, value) {
    if (!path || !property) {
      throw new Error('Missing arguments for propChange');
    }
    var objA = worker.mappings.resolve(path);
    console.info('%cchange "%s" on "%s(%s)" use %s(%s)', 'color:red', property, path, !!objA, value, objA[property]);
    objA.set(property, value);
  },



  addMapping: function(info) {
    worker.mappings.add(info);
  },
  updateMapping: function(info) {
    var state = worker.mappings.find(function(mapping) {
      return info.id === mapping.id;
    });
    state.set(info);
  },
  resetMappings: function(mappings) {
    worker.mappings.import(mappings, __dataContext, true);
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
    emitCommand('addSignal', {
      signalName: signalName,
      signal: signal
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
  updateLayer: function(layer, layerName) {
    var state = worker.layers.get(layerName);
    state.set(layer);

    broadcastCommand('updateLayer', {
      layer: layer,
      layerName: layerName
    });
  }
};





Object.keys(commands).forEach(registerCommand);





worker.addEventListener('message', function(evt) {
  var eventId = evt.data.eventId;

  var commandName = evt.data.command;
  var command = commands[commandName];

  // console.info('%cworker recieved command "%s"', 'color:red', commandName);

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
}, false);
