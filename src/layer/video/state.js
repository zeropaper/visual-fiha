'use strict';
var ScreenLayerState = require('./../state');
module.exports = ScreenLayerState.video = ScreenLayerState.extend({
  props: {
    src: ['string', true, null]
  },

  initialize: function() {
    if (!this.src) {
      throw new Error('Missing src attribute for video layer');
    }
  }
});