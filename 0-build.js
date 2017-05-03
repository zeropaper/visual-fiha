webpackJsonp([0],{

/***/ 361:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


function resolve(path, context) {
  if (!context) throw new Error('Missing context to solve mapping path');

  function solver(str) {
    var parts = str.split('.');

    var f = function(instance) {
      if (!parts.length) return instance;

      var part = parts.shift();
      if (instance[part] && instance[part].isCollection) {
        return f(instance[part].get(parts.shift()));
      }
      else if (typeof instance[part] !== 'undefined') {
        return f(instance[part]);
      }
    };
    return f;
  }

  return solver(path)(context);
}

module.exports = resolve;

/***/ }),

/***/ 85:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var resolve = __webpack_require__(361);
var assign = __webpack_require__(15);
var State = __webpack_require__(11);
var Collection = __webpack_require__(16);

function cleanFnFromExport(item) {
  item.transformFunction = item.transformFunction || (item.fn || '').toString();
  delete item.fn;
  return item;
}

function compileTransformFunction(fn) {
  fn = fn || function(val) { return val; };
  var compiled;

  var str = `compiled = (function() {
  // override some stuff that should not be used
  var navigator, window, global, document, module, exports;

  return function(val, oldVal) {
    var result;
    try {
      result = (${ fn.toString() })(val, oldVal);
    }
    catch(e) {
      result = e;
    }
    return result;
  };
})();`;
  try {
    eval(str);// jshint ignore:line
  }
  catch (e) {
    compiled = function(val) { return val; };
  }
  return compiled;
}

var MappingEmitter = State.extend({
  idAttribute: 'name',

  props: {
    targets: ['array', true, function() { return []; }],
    transformFunction: ['string', true, 'function(val){return val;}'],
    source: ['string', false, ''],
    name: ['string', true, null]
  },

  derived: {
    fn: {
      deps: ['transformFunction'],
      fn: function() {
        return compileTransformFunction(this.transformFunction);
      }
    },
    sourceState: {
      deps: ['source'],
      fn: function() {
        if (this.source.indexOf('midi:') === 0) return;
        var sourcePath = this.source.split('.');
        sourcePath.pop();
        sourcePath = sourcePath.join('.');
        return this.collection.resolve(sourcePath);
      }
    },
    sourceParameter: {
      deps: ['source'],
      fn: function() {
        if (this.source.indexOf('midi:') === 0) return;
        var sourcePath = this.source.split('.');
        return sourcePath.pop();
      }
    }
  },

  hasTarget: function(targetPath) {
    return this.targets.indexOf(targetPath) > -1;
  }
});

var Mappings = Collection.extend({
  model: MappingEmitter,

  initialize: function(models, options) {
    if (!options.context) throw new Error('Missing context option for Mappings');
    var readonly;
    if (typeof options.readonly === 'undefined') {
      readonly = this.readonly = typeof DedicatedWorkerGlobalScope === 'undefined';
    }
    else {
      readonly = this.readonly = options.readonly;
    }

    this.on('reset', function(collection, info) {
      this.unbindMappings(info.previousModels).bindMappings(collection.models);
    });
    this.on('remove', function(model) {
      this.unbindMappings([model]);
    });
    this.on('add', function(model) {
      this.bindMappings([model]);
    });

    this.context = options.context;
  },


  bindMappings: function(mappings) {
    if (this.readonly) return this;

    (mappings || []).forEach(function(mapping) {
      if (!mapping.sourceState) return;
      this.listenTo(mapping.sourceState, 'all', function(evtName, source, value) {
        if (evtName !== 'change:' + mapping.sourceParameter) return;
        this.process([mapping], value);
      });
    }, this);

    return this;
  },

  unbindMappings: function(mappings) {
    if (this.readonly) return this;

    (mappings || []).forEach(function(mapping) {
      if (!mapping.sourceState) return;
      this.stopListening(mapping.sourceState, 'all');
    }, this);

    return this;
  },


  findMappingsBySource: function(path) {
    return this.models.filter(function(mapping) {
      return mapping.source === path;
    });
  },

  findMappingByTarget: function(path) {
    return this.models.find(function(mapping) {
      return mapping.hasTarget(path);
    });
  },

  import: function(data, reset) {
    if (reset) {
      this.reset(data);
    }
    else {
      this.set(data);
    }
    return this;
  },

  serialize: function() {
    return Collection.prototype
            .serialize.apply(this, arguments)
            .map(cleanFnFromExport);
  },

  toJSON: function () {
    return this.map(function (model) {
      if (model.toJSON) {
        return model.toJSON();
      }
      else {
        var out = {};
        assign(out, model);
        delete out.collection;
        return out;
      }
    })
    .map(cleanFnFromExport);
  },

  export: function() {
    return this.serialize();
  },

  resolve: function(path) {
    return resolve(path, this.context);
  },

  process: function(sources, value) {
    sources.forEach(function(info) {
      info.targets.forEach(function(target) {
        var parts = target.split('.');
        var targetParameter = parts.pop();
        var targetStatePath = parts.join('.');
        var state;
        try {
          state = this.resolve(targetStatePath);
        } catch(e) {}
        if (!state) return;

        var finalValue = info.fn(value, state.get(targetParameter));
        if (finalValue instanceof Error) return;

        if (state.type === 'boolean') finalValue = finalValue === 'false' ? false : !!finalValue;
        if (state.type === 'string') finalValue = (finalValue || '').toString();
        if (state.type === 'number') finalValue = Number(finalValue || 0);
        try {
          state.set(targetParameter, finalValue);
        }
        catch (e) {
          console.info(e.message);
        }
      }, this);
    }, this);

    return this;
  },

  processMIDI: function(deviceName, property, value) {
    var sources = this.findMappingsBySource('midi:' + deviceName + '.' + property);
    if (!sources || !sources.length) return this;
    return this.process(sources, value);
  }
});

module.exports = Mappings;

/***/ })

});
//# sourceMappingURL=0-build.js.map