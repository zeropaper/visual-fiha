/* jshint worker:true */
'use strict';

var worker = self;


worker.mappings = require('./mapping/service');


var ScreenState = require('./screen/state');
worker.screen = new ScreenState();
worker.mappings.context = worker.screen;

worker.layers = worker.screen.layers;
worker.signals = worker.screen.signals;

// var clientCollectionMixin = {

// };
// var workerCollectionMixin = {

// };

// var LayerCollection = require('./layer/collection');
// worker.layers = new (LayerCollection.extend(clientCollectionMixin, workerCollectionMixin))({
//   parent: worker.screen
// });

// var SignalCollection = require('./signal/collection');
// worker.signals = new (SignalCollection.extend(workerCollectionMixin))({
//   parent: worker.screen
// });





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





var screens = {};
var channel = new BroadcastChannel('spike');
function broadcastCommand(name, payload) {
  // console.info('%cworker broadcast command "%s"', 'color:purple', name);
  channel.postMessage({
    command: name,
    payload: payload
  });
}
channel.addEventListener('message', function(evt) {
  var command = evt.data.command;
  if (command !== 'register') return;

  var payload = evt.data.payload;
  if (screens[payload.id]) {
    return;
  }

  screens[payload.id] = payload.id;
  broadcastCommand('resetLayers', {
    layers: worker.layers.serialize()
  });
}, false);

var commands = {
  bootstrap: function(layers, signals, mappings) {
    worker.layers.set(layers);
    worker.signals.set(signals);
    worker.mappings.import(mappings, worker.screen, true);

    broadcastCommand('bootstrap', {
      signals: worker.signals.serialize(),
      mappings: worker.mappings.export(),
      layers: worker.layers.serialize()
    });
  },
  // start: function() {
  //   if (this.refreshInterval) clearInterval(this.refreshInterval);
  //   this.refreshInterval = setInterval(function() {
  //     broadcastCommand('updateLayers', {
  //       layers: worker.layers.serialize()
  //     });
  //   }, 1000 / 30);
  // },
  midi: function(name, value) {
    console.info('midi event "%s", %s', name, value);
  },
  heartbeat: function(frametime, audio) {
    worker.frametime = frametime;
    worker.audio = audio;

    broadcastCommand('heartbeat', {
      frametime: frametime,
      audio: audio
    });
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
    worker.mappings.import(mappings, worker.screen, true);
  },

  resetSignals: function(signals) {
    worker.signals.reset(signals);
  },
  addSignal: function(signal) {
    worker.signals.add(signal);
  },
  removeSignal: function(signalName) {
    worker.signals.remove(worker.signals.get(signalName));
  },
  updateSignal: function(signal, signalName) {
    worker.signals.get(signalName).set(signal);
  },

  resetLayers: function(layers) {
    broadcastCommand('resetLayers', {
      layers: layers
    });
    worker.screen.layers.reset(layers);
  },
  addLayer: function(layer) {
    var layers = worker.screen.layers;

    layers.add(layer);

    broadcastCommand('addLayer', {
      layer: layer
    });

    // var state = layers.get(layer.name);
    // function filter(serialized) {
    //   var filtered = {};
    //   var obj = state.changedAttributes();
    //   Object.keys(obj).forEach(function(key) {
    //     if (typeof serialized[key] !== 'function') filtered[key] = serialized[key];
    //   });
    //   return filtered;
    // }

    // state.on('change', function() {
    //   broadcastCommand('updateLayer', {
    //     layer: filter(state.serialize()),
    //     layerName: layer.name
    //   });
    // });
  },
  removeLayer: function(layerName) {
    var collection = worker.screen.layers;
    broadcastCommand('removeLayer', {
      layerName: layerName
    });
    collection.remove(collection.get(layerName));
  },
  updateLayer: function(layer, layerName) {
    var state = worker.screen.layers.get(layerName);
    state.set(layer);
  },
  toggleLayer: function(layerName) {
    var state = worker.screen.layers.get(layerName);
    state.toggle('active');
  }
};


// worker.layers.on('reset', function() {
//   broadcastCommand('resetLayers', {
//     layers: worker.layers.serialize()
//   });
// });
// worker.layers.on('add remove change', function() {
//   broadcastCommand('resetLayers', {
//     layers: worker.layers.serialize()
//   });
// });


Object.keys(commands).forEach(registerCommand);

setInterval(function() {
  broadcastCommand('updateLayers', {
    layers: worker.layers.serialize()
  });
}, 1000 / 30);


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
