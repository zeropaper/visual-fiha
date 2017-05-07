'use strict';
var State = require('ampersand-state');

var ParamState = State.extend({
  idAttribute: 'name',

  mappable: {
    target: ['value']
  },

  props: {
    name: ['string', true, ''],
    type: ['string', false, 'any'],
    value: ['any', false, ''],
    default: ['any', false, '']
  },

  derived: {
    modelPath: {
      deps: ['name'],
      fn: function() {
        return this.collection.parent.modelPath + '.parameters.' + this.name;
      }
    }
  }
});

module.exports = ParamState;