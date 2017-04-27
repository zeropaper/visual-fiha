'use strict';
var LayerControlView = require('./../control-view');
var P5DetailsView = require('./details-view');
var P5LayerControlView = LayerControlView.types.p5 = LayerControlView.extend({
  _showDetails: function () {
    this.rootView.showDetails(new P5DetailsView({
      parent: this,
      model: this.model
    }));
  }
});
module.exports = P5LayerControlView;