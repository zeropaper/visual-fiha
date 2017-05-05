'use strict';

var parameterizedState = require('./../parameter/mixin');
var SignalState = parameterizedState([
  {name: 'input', type: 'any', default: null}
]).extend({
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
        return typeof document !== 'undefined' ? 'worker' : 'controller';
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
    var state = this;
    if (!state.collection) throw new Error('Signal instance ' + state.name + ' has no collection');
    var signals = state.collection;
    var id = state.getId();

    state._ensureBaseParameters();

    state.listenToAndRun(state.parameters, 'change', function() {
      state.trigger('change:parameters', state, state.parameters, {parameters: true});
    });

    if (state.location !== 'worker') return;
    state.on('change:result', function() {
      state.workerResult = state.result;
      signals.trigger('emitCommand', 'updateSignalResult', {
        name: id,
        workerResult: state.result
      });
    });
  },

  computeSignal: function(val) {
    val = val || this.input;
    return val;
  }
});

SignalState.types = {};

module.exports = SignalState;
