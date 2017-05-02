'use strict';
module.exports = function prct(val, max = 255) {
  if (!val || !max) return 0;
  return (100 / max) * Number(val);
};