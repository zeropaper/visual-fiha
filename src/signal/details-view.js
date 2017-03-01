'use strict';
var assign = require('lodash.assign');
var DetailsView = require('./../controller/details-view');
var SignalDetailsView = DetailsView.extend({
  derived: {
    modelPath: {
      deps: [],
      fn: function() {
        return 'signals.' + this.model.getId();
      }
    }
  },

  bindings: assign({
    'model.name': '[data-hook=name]'
  }, DetailsView.prototype.bindings)
});
module.exports = SignalDetailsView;