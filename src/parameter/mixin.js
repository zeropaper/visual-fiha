'use strict';
var AmpersandState = require('ampersand-state');
var ParameterCollection = require('./collection');
module.exports = function parameterizedState(baseParameters, State = AmpersandState) {
  var derived = {};
  baseParameters.forEach(function(param) {
    derived[param.name] = {
      deps: ['parameters.' + param.name],
      fn: function() {
        return this.parameters.getValue(param.name);
      }
    };
  });

  return State.extend({
    initialize: function() {
      var state = this;

      state._ensureBaseParameters();

      state.listenToAndRun(state.parameters, 'change', function() {
        state.trigger('change:parameters', state, state.parameters, {parameters: true});
      });
    },

    collections: {
      parameters: ParameterCollection
    },

    baseParameters: baseParameters,

    derived: derived,

    // in order to "clear" the cached value of the derived
    _ensureBaseParameters: function(definition = []) {
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
  });
};