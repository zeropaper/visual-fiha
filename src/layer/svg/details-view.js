'use strict';
var DetailsView = require('./../details-view');



var SVGDetailsView = DetailsView.extend({
  derived: {
    propNames: {
      deps: ['model'],
      fn: function() {
        var def = this.model.constructor.prototype._definition;
        return Object.keys(def)
          .filter(function(key) {
            return [
              'content',
              'svgStyles',

              'name',
              'type',
              'zIndex'
            ].indexOf(key) < 0;
          });
      }
    }
  }
});

module.exports = SVGDetailsView;