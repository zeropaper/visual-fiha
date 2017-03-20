'use strict';
var ScreenLayerState = require('./../state');
module.exports = ScreenLayerState.types.threejs = ScreenLayerState.extend({
  props: {
    src: ['string', false, null]
  }
});