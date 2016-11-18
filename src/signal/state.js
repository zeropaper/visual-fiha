'use strict';
var State = window.VFDeps.State;
var Collection = window.VFDeps.Collection;
var MappableState = require('./../mappable/state');
var transformationFunctions = require('./../transformation/functions');

var SignalTransformationState = State.extend({
  props: {
    name: ['string', true, null],
    arguments: ['array', true, function () { return []; }]
  }
});


var SignalState = MappableState.extend({
  idAttribute: 'name',
  typeAttribute: 'type',

  initialize: function() {
    this.on('change:result', function() {
      // this.collection.parent.signals[this.name] = this.result;
      this.collection.parent.trigger(this.name, this.result);
    });

    if (this.input === null || this.input === undefined) {
      this.input = this.defaultValue;
    }
  },

  props: {
    name: ['string', true, null],
    type: ['string', true, 'default'],
    defaultValue: ['any', true, function () { return 1; }],
    input: ['any', false, null]
  },

  collections: {
    transformations: Collection.extend({
      model: SignalTransformationState
    })
  },

  derived: {
    result: {
      deps: ['input', 'transformations'],
      fn: function() {
        return this.computeSignal();
      }
    }
  },

  computeSignal: function(val) {
    val = val || this.input;

    this.transformations.forEach(function(transformationState) {
      var args = [val].concat(transformationState.arguments);
      val = transformationFunctions[transformationState.name].apply(this, args);
    });

    return val;
  }
});
module.exports = SignalState;