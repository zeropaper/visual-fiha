'use strict';
var DetailsView = require('./../details-view');
var propNamesExtractor = require('./../../prop-names');


var SVGDetailsView = DetailsView.extend({
  derived: {
    propNames: {
      deps: ['model'],
      fn: function() {
        return propNamesExtractor(this.model, [
          'content',
          'svgStyles',
          'layerStyles'
        ]);
      }
    }
  }
});

module.exports = SVGDetailsView;