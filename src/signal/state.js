(function(global) {
  'use strict';
  var State = global.VFDeps.State;
  var Collection = global.VFDeps.Collection;
  var transformationFunctions = require('./../transformation/functions');

  var SignalTransformationState = State.extend({
    props: {
      name: ['string', true, null],
      arguments: ['array', true, function () { return []; }]
    }
  });


  var SignalState = State.extend({
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

    mappable: {
      source: ['result'],
      target: ['input']
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

  SignalState.types = {};

  module.exports = SignalState;
})(typeof window !== 'undefined' ? window : self);
