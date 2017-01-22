'use strict';
var ScreenLayerState = require('./../state');
module.exports = ScreenLayerState.types.video = ScreenLayerState.extend({
  props: {
    src: ['string', false, null]
  },

  initialize: function() {
    ScreenLayerState.prototype.initialize.apply(this, arguments);
  }
});