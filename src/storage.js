'use strict';
var localForage = require('localforage');

localForage.config({
  // driver      : localforage.WEBSQL, // Force WebSQL; same as using setDriver()
  name        : 'visualFiha',
  version     : 1.0,
  size        : 4980736, // Size of database, in bytes. WebSQL-only for now.
  storeName   : 'keyvaluepairs', // Should be alphanumeric, with underscores.
  description : 'Visual Fiha storage'
});

var setups = {};


setups.empty = {mappings: {}, layers: {}, signals: {}};
setups.algorave = require('json-loader!yaml-loader!./setups/algorave.yml');
setups['demo-css'] = require('json-loader!yaml-loader!./setups/demo-css.yml');
setups['demo-canvas'] = require('json-loader!yaml-loader!./setups/demo-canvas.yml');
setups['demo-3d-zeropaper'] = require('json-loader!yaml-loader!./setups/demo-3d-zeropaper.yml');


function toArr(obj) {
  var keys = Object.keys(obj);
  return keys.map(function(key) {
    obj[key].name = key;
    return obj[key];
  });
}

function setupArr(setup) {
  return {
    layers: toArr(setup.layers || {}),
    mappings: toArr(setup.mappings || {}),
    signals: toArr(setup.signals || {})
  };
}


function localForageCallback(name) {
  return function(err) {
    if(err) console.error('localforage "%s" error', name, err);
  };
}

function saveSetup(setupId, setup, done) {
  return localForage.setItem('local-' + setupId, setupArr(setup))
          .then(function() {
            done();
          })
          .catch(done);
}

function registerSetups(setupIds) {
  Object.keys(setups).forEach(function (setupId) {
    // if (setupIds.indexOf('local-' + setupId) > -1) return;
    saveSetup(setupId, setups[setupId], localForageCallback(setupId));
  });
}

localForage.keys()
            .then(registerSetups)
            .catch(localForageCallback('keys'));

module.exports = localForage;