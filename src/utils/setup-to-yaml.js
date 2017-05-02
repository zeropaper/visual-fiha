'use strict';
var toObj = require('./arr-to-obj');
var jsYAML = require('js-yaml');
module.exports = function(setup) {
  setup.signals = toObj(setup.signals || []);
  setup.layers = toObj(setup.layers || []);
  setup.mappings = toObj(setup.mappings || []);
  return jsYAML.safeDump(JSON.parse(JSON.stringify(setup)));
};