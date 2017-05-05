'use strict';
var assign = require('lodash.assign');
var Collection = require('ampersand-collection');
var SignalState = require('./state');
require('./programmable/state');
require('./hsla/state');
require('./rgba/state');

var SignalCollection = Collection.extend({
  mainIndex: 'name',

  clock: null,

  model: function(attrs, opts) {
    var Constructor = SignalState.types[attrs.type] || SignalState;
    var state = new Constructor(attrs, opts);
    return state;
  },

  initialize: function(models, options) {
    this.clock = options.clock;
  },

  toJSON: function () {
    return this.map(function (model) {
      if (model.toJSON) {
        return model.toJSON();
      }
      else {
        var out = {};
        assign(out, model);
        delete out.collection;
        return out;
      }
    });
  }
});
module.exports = SignalCollection;
