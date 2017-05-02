'use strict';
module.exports = function midi2prct(val) {
  return require('./prct')(val, 127);
};