'use strict';
var ThreeJSDetailsView = require('./details-view');

var ScreenLayerControlView = require('./../control-view');
module.exports = ScreenLayerControlView.types.threejs = ScreenLayerControlView.extend({
  _showDetails: function () {
    this.rootView.showDetails(new ThreeJSDetailsView({
      parent: this,
      model: this.model
    }));
  }
});