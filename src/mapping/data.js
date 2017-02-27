'use strict';

var resolve = require('./../resolve');

var State = require('ampersand-state');
var Collection = require('ampersand-collection');

function compileTransformFunction(fn) {
  fn = fn || function(val) { return val; };
  var compiled;

  // proxy the ramda functions
  var ramdaMethods = '';
  var ramda = require('ramda');
  Object.keys(ramda)
    .filter(function(name) {
      return name.length > 1 && typeof ramda[name] === 'function';
    })
    .forEach(function(name) {
      ramdaMethods += '\nvar ' + name + ' = ramda.' + name + ';';
    });

  var str = `compiled = (function() {
  // override some stuff that should not be used
  var navigator, window, global, document, module, exports;

  ${ ramdaMethods }

  return ${ fn.toString() };
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
    transformFunction: 'any',
    source: ['string', false, ''],
    name: ['string', true, null]
  },

  derived: {
    fn: {
      deps: ['transformFunction'],
      fn: function() {
        return compileTransformFunction(this.transformFunction);
      }
    }
  },

  // processSource: function(newVal, prevVal) {
  //   console.info('processSource as eventListener', newVal, prevVal);
  //   this.targets.forEach(function(target) {
  //     var parts = target.split('.');
  //     var targetProperty = parts.pop();
  //     var targetStatePath = parts.join('.');
  //     var state = this.collection.resolve(targetStatePath);
  //     if (!state) return;

  //     var finalValue = this.fn(newVal, state.get(targetProperty));
  //     // console.info('%s.%s => %s', targetStatePath, targetProperty, finalValue);
  //     state.set(targetProperty, finalValue);
  //   }, this);
  // },

  // bindSource: function(source) {
  //   if (source.indexOf('midi:') === 0) return;
  //   var sourcePath = source.split('.');
  //   var propertyName = sourcePath.pop();
  //   sourcePath = sourcePath.join('.');
  //   var resolved = this.collection.resolve(sourcePath);

  //   console.info('bindSource', 'change:' + propertyName, source, resolved.cid, resolved[propertyName]);

  //   // this.listenTo(resolved, 'all', function(eventName) { console.info('mapping emitter source', eventName); });
  //   this.listenTo(resolved, 'all', function(eventName, state, newValue) {
  //     console.info('%s on behalf of %s', resolved.getId(), eventName, this.getId());
  //     if (eventName === 'change' + propertyName) {
  //       var previousValue = state.previousAttributes()[propertyName];
  //       this.processSource(newValue, previousValue);
  //     }
  //   });
  // },

  // unbindSource: function(source) {
  //   if (source.indexOf('midi:') === 0) return;
  //   var sourcePath = source.split('.');
  //   var propertyName = sourcePath.pop();
  //   sourcePath = sourcePath.join('.');
  //   var resolved = this.collection.resolve(sourcePath);

  //   this.stopListening(resolved, 'change:' + propertyName);
  // },

  // initialize: function() {
  //   if (this.collection.readonly) return;
  //   this.on('all', function(eventName) { console.info('mapping emitter', eventName); });

  //   this.on('change:source', function(state, newValue) {
  //     console.info('mapping emitter source change', newValue, this.previousAttributes().source);
  //     this.bindSource();
  //   });
  //   this.bindSource(this.source);
  // }
});

var Mappings = Collection.extend({
  model: MappingEmitter,

  initialize: function(models, options) {
    if (!options.context) throw new Error('Missing context option for Mappings');

    if (typeof options.readonly === 'undefined') {
      this.readonly = typeof DedicatedWorkerGlobalScope === 'undefined';
    }
    else {
      this.readonly = options.readonly;
    }

    this.context = options.context;
  },

  findMappingsBySource: function(path) {
    return this.models.filter(function(mapping) {
      return mapping.source === path;
    });
  },

  findMappingByTarget: function(path) {
    return this.models.find(function(mapping) {
      return mapping.targets.indexOf(path) > -1;
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

  export: function() {
    return this.serialize().map(function(item) {
      item.transformFunction = item.transformFunction || item.fn.toString();
      delete item.fn;
      return item;
    });
  },

  resolve: function(path) {
    return resolve(path, this.context);
  },

  process: function(eventName, value) {
    var mappings = this.findMappingsBySource(eventName);
    if (!mappings || !mappings.length) return this;
    mappings.forEach(function(info) {
      info.targets.forEach(function(target) {
        var parts = target.split('.');
        var targetProperty = parts.pop();
        var targetStatePath = parts.join('.');
        var state = this.resolve(targetStatePath);
        if (!state) return;

        var finalValue = info.fn(value, state.get(targetProperty));
        // console.info('%s.%s => %s', targetStatePath, targetProperty, finalValue);
        state.set(targetProperty, finalValue);
      }, this);
    }, this);
    return this;
  }
});

module.exports = Mappings;