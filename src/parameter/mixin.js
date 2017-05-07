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
      State.prototype.initialize.apply(state, arguments);

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

    // is only needed for derived updates, the non-baseParameters do not haved derived
    _bindValueChange: function(paramState) {
      if (!paramState) return;
      this.listenTo(paramState, 'change:value', function(...args) {
        this.trigger('change:parameters.' + paramState.name, ...args);
      });
    },

    // in order to "clear" the cached value of the derived
    _ensureBaseParameters: function(definition = []) {
      (this.baseParameters || [])
        .concat(definition)
        .forEach(function(parameterDef) {
          var existing = this.parameters.get(parameterDef.name);
          if (!existing) {
            var created = this.parameters.add(parameterDef);
            this._bindValueChange(created);
            created.value = parameterDef.default;
          }
        }, this);
      return this;
    },
  });
};