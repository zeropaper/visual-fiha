'use strict';
var assign = require('lodash.assign');
var Collection = require('ampersand-collection');
var LayerState = require('./state');
require('./canvas/state');
require('./video/state');
require('./svg/state');
require('./img/state');
require('./txt/state');
require('./p5/state');
require('./threejs/state');

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
  },

  toJSON: function () {
    return this.map(function (model) {
      if (model.toJSON) {
        return model.toJSON();
      }
      else {
        var out = {};
        assign(out, model);
        delete out.collection;
        return out;
      }
    });
  }
});