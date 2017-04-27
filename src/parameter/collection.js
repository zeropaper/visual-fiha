'use strict';
var ParamState = require('./state');
var Collection = require('ampersand-collection');

var ParamCollection = Collection.extend({
  mainIndex: 'name',
  model: ParamState,

  comparator: 'name',

  toJSON: function (...args) {
    return this.map(model => model.toJSON(...args));
  },

  getValue: function(name, defaultVal) {
    var param = this.get(name);
    if (!param) return defaultVal;
    var val = param.value;
    defaultVal = arguments.length === 2 ? defaultVal : param.default;
    return val === null || typeof val === 'undefined' ? defaultVal : val;
  }
});

module.exports = ParamCollection;