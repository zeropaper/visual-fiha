'use strict';
var Collection = require('ampersand-collection');
var SignalState = require('./state');
require('./beat/state');
require('./hsla/state');
require('./rgba/state');

var SignalCollection = Collection.extend({
  mainIndex: 'name',
  model: function(attrs, opts) {
    var Constructor = SignalState.types[attrs.type] || SignalState;
    return new Constructor(attrs, opts);
  }
});
module.exports = SignalCollection;
