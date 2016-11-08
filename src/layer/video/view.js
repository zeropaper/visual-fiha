'use strict';

var ScreenLayerView = require('./../view');
module.exports = ScreenLayerView.video = ScreenLayerView.extend({
  template: '<video autoplay loop muted></video>',

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