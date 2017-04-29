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
    }
  }
});

module.exports = ParamState;