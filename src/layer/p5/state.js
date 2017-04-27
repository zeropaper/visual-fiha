'use strict';
var LayerState = require('./../state');

var P5LayerState = LayerState.types.p5 = LayerState.extend({
  props: {
    setupFunction: ['string', false, 'console.info("no p5 setupFunction set");'],
    drawFunction: ['string', false, 'console.info("no p5 drawFunction set");']
  }
});
module.exports = P5LayerState;