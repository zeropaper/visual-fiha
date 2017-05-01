// http://stackoverflow.com/a/9763769/662964
'use strict';
module.exports = function pad(n, z) {
  z = z || 2;
  return ('00' + n).slice(-z);
};