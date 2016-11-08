'use strict';

var ScreenLayerView = require('./../view');
module.exports = ScreenLayerView.img = ScreenLayerView.extend({
  template: '<img />',

  bindings: VFDeps.assign({
    width: {
      name: 'width',
      type: 'attribute'
    },
    height: {
      name: 'height',
      type: 'attribute'
    },
    'model.src': {
      type: 'attribute',
      name: 'src'
    }
  }, ScreenLayerView.prototype.bindings)
});