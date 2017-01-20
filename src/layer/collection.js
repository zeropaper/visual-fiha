'use strict';
var Collection = require('ampersand-collection');
var LayerState = require('./state');
require('./canvas/state');
require('./video/state');
require('./svg/state');
require('./img/state');

module.exports = Collection.extend({
  comparator: 'zIndex',
  mainIndex: 'name',
  model: function(attrs, opts) {
    var Constructor = LayerState.types[attrs.type] || LayerState;
    var state = new Constructor(attrs, opts);
    // state.on('change', function() {
    //   opts.collection.trigger('change:layer', state);
    // });
    return state;
  }
});