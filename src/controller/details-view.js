'use strict';
var View = window.VFDeps.View;
var MappingControlView = require('./../mappable/control-view');
var DetailsView = View.extend({
  template: [
    '<section>',
    '<header>',
    '<h3>Details for <span data-hook="name"></span></h3>',
    '</header>',

    '<div class="row mappings props"></div>',
    '</section>'
  ].join('\n'),

  subviews: {
    mappingsView: {
      selector: '.mappings',
      prepareView: function (el) {
        console.info('details view mappingsView');
        return this.renderCollection(this.model.mappings, function (opts) {
          var Constructor = MappingControlView[opts.model.targetProperty] || MappingControlView;
          return new Constructor(opts);
        }, el);
      }
    }
  },

  bindings: {
    'model.name': '[data-hook=name]'
  }
});
module.exports = DetailsView;