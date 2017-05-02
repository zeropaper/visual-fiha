'use strict';
var State = require('ampersand-state');
var ParameterCollection = require('./../parameter/collection');

var SignalState = State.extend({
  idAttribute: 'name',
  typeAttribute: 'type',

  mappable: {
    source: ['result'],
    target: ['input']
  },

  props: {
    name: ['string', true, null],
    type: ['string', true, 'default'],
    defaultValue: ['any', true, function () { return 1; }]
  },

  initialize: function() {
    var state = this;

    state.ensureParameters();

    state.listenToAndRun(state.parameters, 'change', function() {
      state.trigger('change:parameters', state, state.parameters, {parameters: true});
    });

    state.listenToAndRun(state.parameters, 'sort', state.ensureParameters);
  },

  collections: {
    parameters: ParameterCollection
  },

  baseParameters: [
    {name: 'input', type: 'any', default: null}
  ],

  ensureParameters: function(definition = []) {
    (this.baseParameters || [])
      .concat(definition)
      .forEach(function(parameterDef) {
        var existing = this.parameters.get(parameterDef.name);
        if (!existing) {
          var created = this.parameters.add(parameterDef);
          this.listenTo(created, 'change:value', function(...args) {
            this.trigger('change:parameters.' + created.name, ...args);
          });
          created.value = parameterDef.default;
        }
      }, this);
    return this;
  },

  derived: {
    input: {
      deps: ['parameters.input'],
      fn: function() {
        return this.parameters.get('input').value;
      }
    },
    modelPath: {
      deps: ['name'],
      fn: function() {
        return 'signals.' + this.name;
      }
    },
    result: {
      deps: ['input', 'transformations'],
      fn: function() {
        return this.computeSignal();
      }
    }
  },

  computeSignal: function(val) {
    val = val || this.input;
    return val;
  }
});

SignalState.types = {};

module.exports = SignalState;
