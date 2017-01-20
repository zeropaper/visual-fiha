'use strict';
/*global module */
module.exports = function stylesSetter(ctx, styles) {
  var keys = Object.keys(styles);
  var originals = {};

  keys.forEach(function(name) {
    originals[name] = ctx[name];
    ctx[name] = styles[name];
  });

  return function styleResetter(ctx) {
    keys.forEach(function(name) {
      ctx[name] = originals[name];
    });
  };
};