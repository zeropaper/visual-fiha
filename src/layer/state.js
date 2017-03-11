'use strict';
var State = require('ampersand-state');
var LayerState = State.extend({
  idAttribute: 'name',
  typeAttribute: 'type',

  props: {
    name: ['string', true, null],
    type: ['string', true, 'default'],
    active: ['boolean', true, true],
    opacity: {
      type: 'number',
      default: 100
    },
    zIndex: ['number', true, 0]
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
  }
});

LayerState.types = {};

module.exports = LayerState;