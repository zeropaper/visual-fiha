'use strict';
var LayerState = require('./../state');
var TxtLayerState = LayerState.types.txt = LayerState.extend({
  props: {
    text: ['string', false, null]
  }
});
module.exports = TxtLayerState;