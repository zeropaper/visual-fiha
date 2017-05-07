'use strict';

// compileFunction(name, prologue, [arg1, arg2, ...] body, context)
var compileFunction = require('./../utils/compile-function');

function zipArgs(args = [], vars = {}) {
  return args.map(arg => vars[arg]);
}

module.exports = function programmableView(config, prototype = {}) {
  var update = config.update;
  var setup = config.setup;
  prototype.props = prototype.props || {};
  prototype.derived = prototype.derived || {};
  prototype.session = prototype.session || {};

  prototype.derived.updateFn = {
    deps: ['model.updateFunction'],
    fn: function() {
      var args = [this.model.getId() + 'Update', update.prologue || '']
        .concat(update.argNames || [], [this.model.updateFunction]);
      return compileFunction(...args);
    }
  };

  prototype.callUpdate = function(options = {}, tested = null) {
    var view = this;
    if (typeof view.callSetup === 'function' && !view.ready) return;

    var fn = tested || view.updateFn;
    if (typeof fn !== 'function') return;

    var args = zipArgs(update.argNames, options);
    var result;
    try {
      result = fn.apply(view, args);
    }
    catch (e) {
      result = e;
      console.log('%c callUpdate error: %s', 'color:red', e.message);
    }
    return result;
  };




  if (!setup) return prototype;




  prototype.session._ready = 'boolean';

  prototype.derived.ready = {
    deps: ['_ready'],
    fn: function() {
      return this._ready;
    }
  };
  prototype.derived.setupFn = {
    deps: ['model.setupFunction'],
    fn: function() {
      var args = [this.model.getId() + 'Setup', setup.prologue || '']
        .concat(setup.argNames || [], ['ready', this.model.setupFunction]);
      return compileFunction(...args);
    }
  };

  prototype.callSetup = function(ready, options = {}){
    var view = this;
    view._ready = false;
    ready = typeof ready === 'function' ? ready : function() {};
    var args = zipArgs(setup.argNames, options).concat([function(error) {
      if (error) console.warn('setup error: %s', error.message);
      view._ready = !error;
      ready(error);
    }]);
    try {
      var fn = view.setupFn;
      fn.apply(view, args);
    }
    catch (e) {
      console.log('%c callSetup error: %s', 'color:red', e.message);
    }
  };

  return prototype;
};