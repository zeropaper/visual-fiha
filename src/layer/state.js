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
  }
});

LayerState.types = {};

module.exports = LayerState;