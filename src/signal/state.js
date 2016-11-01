'use strict';
var State = window.VFDeps.State;
var Collection = window.VFDeps.Collection;
var MappableState = require('./../mappable/state');

var transformationFunctions = {};
transformationFunctions['math.multiply'] = function(val, factor) {
  return val * factor;
};
transformationFunctions['math.add'] = function(val, added) {
  return val + added;
};
transformationFunctions['math.subtract'] = function(val, subtracted) {
  return val - subtracted;
};
transformationFunctions['math.modulo'] = function(val, x) {
  return val % x;
};
transformationFunctions['math.above'] = function(val, x) {
  return val > x;
};
transformationFunctions['math.aboveOrEqual'] = function(val, x) {
  return val >= x;
};
transformationFunctions['math.below'] = function(val, x) {
  return val < x;
};
transformationFunctions['math.belowOrEqual'] = function(val, x) {
  return val <= x;
};
transformationFunctions['math.within'] = function(val, min, max) {
  return val <= max && val >= min;
};


Object.getOwnPropertyNames(Math).forEach(function (p) {
  if (p !== 'constructor' && typeof Math[p] === 'function') transformationFunctions['math.' + p] = Math[p];
});

var _str = ''.constructor.prototype;
Object.getOwnPropertyNames(_str).forEach(function (p) {
  if (p !== 'constructor' && typeof _str[p] === 'function') {
    transformationFunctions['string.' + p] = function(val) {
      var args = [].slice.apply(arguments).slice(1);
      _str[p].apply(val, args);
    };
  }
});

transformationFunctions['string.toBool'] = function(val) {
  return !(!val || val === 'false' || val === 'null');
};
transformationFunctions['string.toInteger'] = function(val) {
  return parseInt(val, 10);
};
transformationFunctions['string.toFloat'] = function(val) {
  return parseFloat(val);
};
transformationFunctions['string.toNumber'] = function(val) {
  return Number(val);
};

var SignalTransformationState = State.extend({
  props: {
    name: ['string', true, null],
    arguments: ['array', true, function () { return []; }]
  }
});


var SignalState = MappableState.extend({
  idAttribute: 'name',
  typeAttribute: 'type',

  props: {
    name: ['string', true, null],
    type: ['string', true, 'default'],
    defaultValue: ['any', true, function () { return 1; }]
  },

  session: {
    input: ['any', true, null]
  },

  collections: {
    transformations: Collection.extend({
      model: SignalTransformationState
    })
  },

  derived: {
    observedModel: {
      deps: ['collection', 'parent'],
      fn: function() {
        for (var inst = this; inst; inst = inst.parent) {
          if (inst.mappingEventsEmmiter) {
            return inst.mappingEventsEmmiter === true ? inst : inst.mappingEventsEmmiter;
          }
        }
        return false;
      }
    },
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
  },

  initialize: function() {
    this.on('change:result', function() {
      if (this.observedModel) this.observedModel.trigger(this.name, this.result);
    });
    if (this.input === null || this.input === undefined) {
      this.input = this.defaultValue;
    }
  }
});
module.exports = SignalState;