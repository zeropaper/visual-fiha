'use strict';
var MappingControlView = require('./../mappable/control-view');
var DetailsView = VFDeps.View.extend({
  template: [
    '<section class="row rows">',
    '<header class="row">',
    '<h3>Details for <span data-hook="name"></span></h3>',
    '</header>',

    '<div class="row mappings props"></div>',
    '</section>'
  ].join('\n'),

  subviews: {
    mappingsView: {
      selector: '.mappings',
      prepareView: function (el) {
        return this.renderCollection(this.model.mappings, function (opts) {
          var type = opts.model.definition.type;
          var name = opts.model.targetProperty;
          var Constructor = MappingControlView[name] || MappingControlView[type] || MappingControlView;
          // console.info('property name: %s (%s), type: %s (%s)', name, !!MappingControlView[name], type, !!MappingControlView[type]);
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