'use strict';
var State = require('ampersand-state');

var objectPath = require('./../utils/object-path');
var ParameterCollection = require('./../parameter/collection');

var LayerState = State.extend({
  idAttribute: 'name',
  typeAttribute: 'type',

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
    {name: 'zIndex', type: 'number', default: 0},
    {name: 'active', type: 'boolean', default: true}
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

  props: {
    name: ['string', true, null],
    type: ['string', true, 'default'],
    layerStyles: ['string', false, '']
  },

  derived: {
    modelPath: {
      deps: ['name'],
      fn: function() {
        return objectPath(this);
      }
    },
    active: {
      deps: ['parameters.active'],
      fn: function() {
        return this.parameters.getValue('active');
      }
    },
    zIndex: {
      deps: ['parameters.zIndex'],
      fn: function() {
        return this.parameters.getValue('zIndex');
      }
    },
    screenState: {
      deps: ['collection', 'collection.parent'],
      fn: function() {
        return this.collection.parent;
      }
    },
    hasDOM: {
      deps: ['screenState'],
      fn: function() {
        return this.screenState && this.screenState.hasDOM;
      }
    },
    isControllerState: {
      deps: ['screenState'],
      fn: function() {
        return this.screenState && this.screenState.isControllerState;
      }
    },
    location: {
      deps: ['isControllerState', 'hasDOM'],
      fn: function() {
        return this.screenState ? this.screenState.location : false;
      }
    },

    mappable: {
      deps: [],
      fn: function() {
        var proto = this.constructor.prototype;
        var keys = Object.keys(proto._definition || {}).concat(
          Object.keys(proto._children || {}),
          Object.keys(proto._collections || {})
        ).filter(function(key) {
          return key !== this.idAttribute && key !== this.typeAttribute;
        }, this);

        return {
          source: [],
          target: keys
        };
      }
    }
  },

  _log: function(...args) {
    this.screenState._log(...args);
  }
});

LayerState.types = {};

module.exports = LayerState;