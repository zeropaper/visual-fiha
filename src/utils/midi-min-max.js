'use strict';
module.exports = function minMax(val, min = 0, max = 16) {
  return (Math.abs(min - max) * Number(val) * (1 / 127)) - min;
};