'use strict';

var ScreenLayerView = require('./../view');
module.exports = ScreenLayerView.SVG = ScreenLayerView.extend({
  template: '<img />',

  bindings: {
    'model.src': {
      type: 'attribute',
      name: 'src'
    }
  }
});