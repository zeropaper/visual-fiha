'use strict';
var assign = require('lodash.assign');
var LayerView = require('./../view');
var TxtLayerView = LayerView.types.txt = LayerView.extend({
  autoRender: true,

  template: function() {
    return '<div class="layer-txt" id="' + this.model.getId() + '" view-id="' + this.cid + '"><div class="text"></div></div>';
  },

  bindings: assign(LayerView.prototype.bindings, {
    'model.text': '.text'
  })
});
module.exports = TxtLayerView;