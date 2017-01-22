'use strict';
var ScreenLayerState = require('./../state');
module.exports = ScreenLayerState.types.img = ScreenLayerState.extend({
  props: {
    src: ['string', false, null],
    backgroundSize: ['string', true, 'cover'],
    backgroundPosition: ['string', true, 'center'],
    backgroundRepeat: ['string', true, 'no-repeat']
  },

  initialize: function() {
    ScreenLayerState.prototype.initialize.apply(this, arguments);
  }
});