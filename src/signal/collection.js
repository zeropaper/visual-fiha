'use strict';
var Collection = require('ampersand-collection');
var SignalState = require('./state');
require('./programmable/state');
require('./hsla/state');
require('./rgba/state');

var SignalCollection = Collection.extend({
  mainIndex: 'name',

  clock: null,
  audio: null,
  worker: null,

  model: function(attrs, opts) {
    var Constructor = SignalState.types[attrs.type] || SignalState;
    var state = new Constructor(attrs, opts);
    return state;
  },

  initialize: function(models, options) {
    this.location = typeof DedicatedWorkerGlobalScope !== 'undefined' ? 'worker' : 'controller';
    this.clock = options.clock;
    this.audio = options.audio;
    this.emitCommand = options.emitCommand;
  },

  toJSON: function () {
    return this.map(function (model) {
      if (model.toJSON) {
        return model.toJSON();
      }
      else {
        return model;
      }
    });
  }
});
module.exports = SignalCollection;
