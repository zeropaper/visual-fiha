'use strict';
var State = require('ampersand-state');
var objectPath = require('./../utils/object-path');

var ParamState = State.extend({
  idAttribute: 'name',

  mappable: {
    target: ['value']
  },

  props: {
    name: ['string', true, ''],
    type: ['string', false, ''],
    value: ['any', false, ''],
    default: ['any', false, '']
  },

  derived: {
    modelPath: {
      deps: ['name'],
      fn: function() {
        return objectPath(this);
      }
    },
    typeSafe: {
      deps: ['value', 'type'],
      fn: function() {
        if (this.type === 'boolean') return !!this.value;
        if (this.type === 'string') return (this.value || '').toString();
        if (this.type === 'number') return Number(this.value || 0);
        return this.value;
      }
    }
  }
});

module.exports = ParamState;