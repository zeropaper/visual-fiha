'use strict';
var State = require('ampersand-state');
var Collection = require('ampersand-collection');

var PropertyState = State.extend({
  idAttribute: 'name',

  mappable: {
    target: ['value']
  },

  props: {
    name: ['string', true, ''],
    value: ['string', false, ''],
    default: ['string', true, '']
  }
});

var PropertyCollection = Collection.extend({
  mainIndex: 'name',
  model: PropertyState
});

var LayerState = State.extend({
  idAttribute: 'name',
  typeAttribute: 'type',

  initialize: function() {
    State.prototype.initialize.apply(this, arguments);
    var state = this;
    state.listenToAndRun(state.styleProperties, 'change', function() {
      state.trigger('change:styleProperties', state, state.styleProperties, {styleProperties: true});
    });
  },

  collections: {
    styleProperties: PropertyCollection
  },

  props: {
    name: ['string', true, null],
    type: ['string', true, 'default'],
    active: ['boolean', true, true],
    opacity: {
      type: 'number',
      default: 100
    },
    zIndex: ['number', true, 0],
    layerStyles: ['string', false, '']
  },

  derived: {
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
  },

  toJSON: function() {
    return State.prototype.toJSON.apply(this, arguments);
  }
});

LayerState.PropertyState = PropertyState;
LayerState.PropertyCollection = PropertyCollection;
LayerState.types = {};

module.exports = LayerState;