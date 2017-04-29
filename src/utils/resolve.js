'use strict';

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