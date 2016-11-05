'use strict';

var ScreenLayerView = require('./../view');
module.exports = ScreenLayerView.SVG = ScreenLayerView.extend({
  template: '<img />',

  bindings: VFDeps.assign({
    'model.src': {
      type: 'attribute',
      name: 'src'
    }
  }, ScreenLayerView.prototype.bindings)
});