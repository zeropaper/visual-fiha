'use strict';
var ScreenLayerState = require('./../state');
module.exports = ScreenLayerState.SVG = ScreenLayerState.extend({
  props: {
    src: ['string', true, null]
  },

  initialize: function() {
    ScreenLayerState.prototype.initialize.apply(this, arguments);
    if (!this.src) {
      throw new Error('Missing src attribute for SVG layer');
    }
  }
});