'use strict';
var assign = require('lodash.assign');
var Collection = require('ampersand-collection');
var SignalState = require('./state');
require('./beat/state');
require('./hsla/state');
require('./rgba/state');

var SignalCollection = Collection.extend({
  mainIndex: 'name',
  model: function(attrs, opts) {
    var Constructor = SignalState.types[attrs.type] || SignalState;
    var state = new Constructor(attrs, opts);
    return state;
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
