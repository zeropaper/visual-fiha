'use strict';
module.exports = function toObj(arr) {
  var obj = {};
  arr.forEach(function(o) {
    obj[o.name] = o;
    delete obj[o.name].name;
  });
  return obj;
};