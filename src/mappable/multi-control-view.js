'use strict';
var MappableState = require('./state');
var MappingControlView = require('./../mappable/control-view');
var MultiMappingControlView = VFDeps.View.extend({
  template: '<section class="row rows">' +
    '<header class="row">' +
      '<h3>Multi mapping</h3>' +
    '</header>' +

    '<div class="row mappings props"></div>' +
  '</section>',

  initialize: function() {
    console.info('initialize multi mapping control view', this.mappings);
  },

  collections: {
    mappings: MappableState.Collection
  },

  subviews: {
    mappingsView: {
      selector: '.mappings',
      prepareView: function (el) {
        return this.renderCollection(this.mappings, function (opts) {
          var type = opts.model.definition.type;
          var name = opts.model.targetProperty;
          var Constructor = MappingControlView[name] || MappingControlView[type] || MappingControlView;
          console.info('multi mapping property name: %s (%s), type: %s (%s)', name, !!MappingControlView[name], type, !!MappingControlView[type]);
          return new Constructor(opts);
        }, el);
      }
    }
  }
});
module.exports = MultiMappingControlView;