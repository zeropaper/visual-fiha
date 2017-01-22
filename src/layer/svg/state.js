'use strict';
var ScreenLayerState = require('./../state');
module.exports = ScreenLayerState.types.SVG = ScreenLayerState.extend({
  props: {
    src: ['string', false, null],
    styles: ['string', true, '']
  },

  initialize: function() {
    ScreenLayerState.prototype.initialize.apply(this, arguments);
  }
});