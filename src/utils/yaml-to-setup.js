'use strict';
var toArr = require('./obj-to-arr');
var jsYAML = require('js-yaml');

module.exports = function(newStr) {
  var obj = {};
  try {
    obj = jsYAML.safeLoad(newStr);
    obj.signals = toArr(obj.signals || {});
    obj.layers = toArr(obj.layers || {});
    obj.mappings = toArr(obj.mappings || {});
  }
  catch(e) {
    console.warn(e);
  }
  return obj;
};