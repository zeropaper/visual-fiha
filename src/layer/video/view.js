'use strict';

var ScreenLayerView = require('./../view');
module.exports = ScreenLayerView.video = ScreenLayerView.extend({
  template: '<video autoplay loop muted></video>',

  bindings: VFDeps.assign({
    'model.src': {
      type: 'attribute',
      name: 'src'
    }
  }, ScreenLayerView.prototype.bindings)
});