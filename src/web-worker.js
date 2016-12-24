/* eslint-env worker */
'use strict';

var worker = /*module.exports =*/ self;
var VFDeps = worker.VFDeps = {};

// require.ensure(['ampersand-state'], function(require) {
// require.ensure(['ampersand-collection'], function(require) {
// require.ensure(['localforage', 'txml'], function(require) {

var localForage = VFDeps.localForage = require('localforage');
localForage.config({
  // driver      : localforage.WEBSQL, // Force WebSQL; same as using setDriver()
  name        : 'visualFiha',
  version     : 1.0,
  size        : 4980736, // Size of database, in bytes. WebSQL-only for now.
  storeName   : 'keyvaluepairs', // Should be alphanumeric, with underscores.
  description : 'Visual Fiha storage'
});
VFDeps.State = require('ampersand-state');
VFDeps.Collection = require('ampersand-collection');


var mappings = require('./mapping/state');

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


var ScreenState = require('./screen/state');
var workerScreen = new ScreenState();



var SignalCollection = require('./signal/collection');
var workerSignals = new SignalCollection();
workerSignals.parent = workerScreen;



// function snapshot() {
//   localForage.setItem('snapshot', {
//     screen: workerScreen.serialize(),
//     signals: workerSignals.serialize()
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
    layers: workerScreen.screenLayers.serialize()
  });
}, false);

var commands = {
  setup: function(state) {
    workerScreen.set(state);

    broadcastCommand('setup', {
      state: state
    });
  },
  midi: function(name, value) {
    console.info('midi event "%s", %s', name, value);
  },
  heartbeat: function(frametime, audio) {
    workerScreen.frametime = frametime;
    workerScreen.audioFrequency = audio.frequency;
    workerScreen.audioTimeDomain = audio.timeDomain;

    broadcastCommand('heartbeat', {
      frametime: frametime,
      audio: audio
    });
  },

  addMapping: function(info) {
    mappings.add(info);
  },
  updateMapping: function(info) {
    var state = mappings.find(function(mapping) {
      return info.id === mapping.id;
    });
    state.set(info);
  },

  resetSignals: function(signals) {
    workerSignals.reset(signals);
  },
  addSignal: function(signal) {
    workerSignals.add(signal);
  },
  removeSignal: function(signalName) {
    workerSignals.remove(workerSignals.get(signalName));
  },
  updateSignal: function(signal, signalName) {
    workerSignals.get(signalName).set(signal);
  },

  resetLayers: function(layers) {
    broadcastCommand('resetLayers', {
      layers: layers
    });
    workerScreen.screenLayers.reset(layers);
  },
  addLayer: function(layer) {
    var collection = workerScreen.screenLayers;
    broadcastCommand('addLayer', {
      layer: layer
    });

    collection.add(layer);

    var state = collection.get(layer.name);
    function filter(serialized) {
      var filtered = {};
      var obj = state.changedAttributes();
      Object.keys(obj).forEach(function(key) {
        if (typeof serialized[key] !== 'function') filtered[key] = serialized[key];
      });
      return filtered;
    }

    state.on('change', function() {
      broadcastCommand('updateLayer', {
        layer: filter(state.serialize()),
        layerName: layer.name
      });
    });

    collection.add(layer);
  },
  removeLayer: function(layerName) {
    var collection = workerScreen.screenLayers;
    broadcastCommand('removeLayer', {
      layerName: layerName
    });
    collection.remove(collection.get(layerName));
  },
  updateLayer: function(layer, layerName) {
    var state = workerScreen.screenLayers.get(layerName);
    state.set(layer);
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
// });
// });
// });
