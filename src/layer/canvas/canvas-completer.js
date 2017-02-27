'use strict';
// http://plnkr.co/edit/6MVntVmXYUbjR0DI82Cr

var mockedCtx = require('./mocked-canvas-2d-context');
var ramda = require('ramda');

var entries = [].concat(mockedCtx._.properties, mockedCtx._.methods);

Object.keys(ramda)
  .filter(function(name) {
    return name.length > 1 && typeof ramda[name] === 'function';
  })
  .forEach(function(name) {
    entries.push(name);
  });

// https://gist.github.com/andrei-m/982927#gistcomment-1931258
function levenshteinDistance(a, b) {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;
  let tmp, i, j, prev, val, row;
  // swap to save some memory O(min(a,b)) instead of O(a)
  if (a.length > b.length) {
    tmp = a;
    a = b;
    b = tmp;
  }

  row = Array(a.length + 1);
  // init the row
  for (i = 0; i <= a.length; i++) {
    row[i] = i;
  }

  // fill in the rest
  for (i = 1; i <= b.length; i++) {
    prev = i;
    for (j = 1; j <= a.length; j++) {
      if (b[i-1] === a[j-1]) {
        val = row[j-1]; // match
      } else {
        val = Math.min(row[j-1] + 1, // substitution
              Math.min(prev + 1,     // insertion
                       row[j] + 1));  // deletion
      }
      row[j - 1] = prev;
      prev = val;
    }
    row[a.length] = prev;
  }
  return row[a.length];
}

var canvasCompleter = {
  getCompletions: function(editor, session, pos, prefix, callback) {
    // if (!prefix.length) { return callback(null, []); }
    // console.info('canvasCompleter', editor, session, prefix);

    var filtered = entries
      .filter(function(entry) {
        // console.info('distance', prefix, entry, levenshteinDistance(prefix, entry));
        return !prefix || entry.indexOf(prefix) > -1;
      })
      .map(function(entry) {
        return {
          name: entry,
          value: entry + '()',
          score: 1,
          meta: 'livecode'
        };
      });

    callback(null, filtered);
  }
};
module.exports = canvasCompleter;
