'use strict';
var State = VFDeps.State;
var Collection = VFDeps.Collection;


var midiTransformation = {};
midiTransformation.toggleProp = function(val, mapping, targetModel) {
  return !targetModel[mapping.targetProperty];
};


var MappingState = State.extend({
  id: 'targetProperty',

  props: {
    type: ['string', false, null],
    value: ['any', false, null],
    eventNames: ['string', true, ''],
    targetProperty: ['string', true, '']
  },

  derived: {
    targetModel: {
      deps: ['collection', 'collection.parent'],
      fn: function () {
        return this.collection.parent;
      }
    },
    observedModel: {
      deps: ['targetModel', 'targetModel.parent'],
      fn: function() {
        for (var inst = this.targetModel; inst; inst = inst.parent) {
          if (inst.mappingEventsEmmiter) { return inst.mappingEventsEmmiter === true ? inst : inst.mappingEventsEmmiter; }
        }
        return false;
      }
    },
    definition: {
      deps: ['targetProperty', 'targetModel'],
      fn: function () {
        return this.targetModel.constructor.prototype._definition[this.targetProperty];
      }
    }
  },

  applyValue: function(originalVal) {
    var val = originalVal;
    if (typeof this.value !== 'undefined' && this.value !== null) {
      val = this.value;
    }

    var fn = this.type;
    if (typeof fn === 'string') {
      fn = midiTransformation[fn];
    }

    if (typeof fn === 'function') {
      val = fn(originalVal, this, this.targetModel);
    }

    this.targetModel.set(this.targetProperty, val);
  },

  delegateMappingEvents: function() {
    var prev = this.previousAttributes().eventNames;
    if (prev) {
      this.stopListening(this.observedModel, prev);
    }

    if (this.eventNames && this.observedModel) {
      this.listenTo(this.observedModel, this.eventNames, this.applyValue);
    }
  },

  initialize: function() {
    this.delegateMappingEvents();
    this.on('change:eventNames', this.delegateMappingEvents);
  }
});

var MappingsCollection = Collection.extend({
  mainIndex: 'targetProperty',

  comparator: 'targetProperty',


  model: function (attrs, options) {
    var model = new MappingState(attrs, options);
    if (options.init === false) model.initialize();
    return model;
  },

  serialize: function () {
    return this
      .map(function (mapping) {
        return mapping.serialize();
      });
  }
});

var MappableState = State.extend({
  initialize: function() {
    this.fillCollection();
  },

  fillCollection: function() {
    var mappings = this.mappings;
    var propNames = Object.keys(this.constructor.prototype._definition).filter(function (propName) {
      return ['type', 'name'].indexOf(propName) < 0;
    });

    propNames.forEach(function (propName) {
      if (!mappings.get(propName)) {
        mappings.add({
          targetProperty: propName
        });
      }
    });
    return this;
  },

  collections: {
    mappings: MappingsCollection
  }
});
module.exports = MappableState;
