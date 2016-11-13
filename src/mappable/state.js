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
      deps: ['targetModel', 'targetModel.collection', 'targetModel.collection.parent'],
      fn: function() {
        return this.targetModel.collection.parent;
        // for (var inst = this.targetModel; inst; inst = inst.parent) {
        //   if (inst.frametime) { return inst; }
        // }
        // return false;
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

  derived: {
    propDefaults: {
      fn: function() {
        var returned = {};
        var definition = this.constructor.prototype._definition;
        var propName;
        for (propName in definition) {
          returned[propName] = definition[propName].default;
        }
        return returned;
      }
    }
  },

  serialize: function(options) {
    options = options || {};
    var serialized = State.prototype.serialize.call(this, options);
    var defaults = this.propDefaults;
    var returned = {};

    var propName;
    for (propName in serialized) {
      if (propName !== 'mappings' && (typeof defaults[propName] === 'undefined' || serialized[propName] !== defaults[propName])) {
        returned[propName] = serialized[propName];
      }
    }

    if (options.mappings) {
      returned.mappings = serialized.mappings;
    }

    return serialized;
  },

  collections: {
    mappings: MappingsCollection
  }
});

MappableState.State = MappingState;
MappableState.Collection = MappingsCollection;
module.exports = MappableState;
