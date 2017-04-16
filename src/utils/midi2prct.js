'use strict';
module.exports = function midi2prct(val) {
  return (Number(val) * (1 / 127));
};