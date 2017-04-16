'use strict';
module.exports = function midi2rad(val) {
  return Math.PI * 2 * (Number(val) * (1 / 127));
};