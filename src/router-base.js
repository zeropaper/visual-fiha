'use strict';

function parseQS(str) {
  return (function(a) {
    if (a === '') return {};
    var b = {};
    for (var i = 0; i < a.length; ++i) {
      var p = a[i].split('=');
      if (p.length != 2) continue;
      b[p[0]] = decodeURIComponent(p[1].replace(/\+/g, ' '));
    }
    return b;
  })(str.split('&'));
}

module.exports = require('ampersand-router').extend({
  parseQueryString: parseQS,
});