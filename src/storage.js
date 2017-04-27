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
setups['demo-3d-cubes'] = require('json-loader!yaml-loader!./setups/demo-3d-cubes.yml');
setups['demo-p5js'] = require('json-loader!yaml-loader!./setups/demo-p5js.yml');


function toArr(obj) {
  var keys = Object.keys(obj);
  return keys.map(function(key) {
    obj[key].name = key;
    return obj[key];
  });
}

function setupArr(setup) {
  setup = setup || {};
  return {
    layers: toArr(setup.layers || {}),
    mappings: toArr(setup.mappings || {}),
    signals: toArr(setup.signals || {})
  };
}


function saveSetup(setupId, setup, done) {
  return localForage.setItem('local-' + setupId, setupArr(setup))
          .then(function() {
            done();
          })
          .catch(done);
}

localForage.installSetups = function(done) {
  done = typeof done === 'function' ? done : function() { console.info('...finished'); };
  var funcs = Object.keys(setups)
    .map(setupId => {
      return function(done) {
        saveSetup(setupId, setups[setupId], function(err) {
          if (err) return done(err);
          if (funcs.length) return funcs.shift()(done);
          done();
        });
      };
    });
  funcs.shift()(done);
};

module.exports = localForage;
