'use strict';

var parameterizedState = require('./../parameter/mixin');
var SignalState = parameterizedState([]).extend({
  idAttribute: 'name',
  typeAttribute: 'type',

  mappable: {
    source: ['result'],
    target: ['parameters']
  },

  props: {
    name: ['string', true, null],
    type: ['string', true, 'default'],
    defaultValue: ['any', true, function () { return 1; }]
  },

  session: {
    workerResult: ['any', false, null]
  },

  derived: {
    modelPath: {
      deps: ['name'],
      fn: function() {
        return 'signals.' + this.name;
      }
    },
    location: {
      deps: [],
      fn: function() {
        return this.collection.location;
      }
    },
    result: {
      deps: ['input', 'workerResult'],
      fn: function() {
        return this.location !== 'worker' ?
          (this.workerResult || this.defaultValue) :
          this.computeSignal();
      }
    }
  },


  initialize: function() {
    var signal = this;
    var id = signal.getId();
    var signals = signal.collection;
    if (!signal.collection) throw new Error('Missing collection for ' + signal.name);

    signal._ensureBaseParameters();

    signal.listenTo(signal.parameters, 'change', function() {
      signal.trigger('change:parameters', signal, signal.parameters, {parameters: true});
    });

    if (signal.location === 'worker') {
      signal.on('change:result', function() {
        if (signals !== signal.collection) return; // may happen when bootstraping a new setup
        signals.emitCommand('updateSignalResult', {
          name: id,
          workerResult: signal.result
        });
      });
    }
    else {
      signal.on('change:workerResult', function() {
        signal.trigger('change:result', signal, signal.result);
      });
    }
  },

  computeSignal: function(val) {
    val = val || this.input;
    return val;
  }
});

SignalState.types = {};

module.exports = SignalState;
