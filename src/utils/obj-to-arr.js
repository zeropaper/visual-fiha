'use strict';
module.exports = function toArr(obj) {
  var keys = Object.keys(obj);
  return keys.map(function(key) {
    obj[key].name = key;
    return obj[key];
  });
};