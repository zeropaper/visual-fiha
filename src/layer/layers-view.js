'use strict';
var View = require('./control-view');

var LayerControlView = require('./control-view');
require('./canvas/control-view');
require('./svg/control-view');
require('./img/control-view');
require('./video/control-view');
require('./txt/control-view');

var LayersView = View.extend({
  commands: {
    'click [name="add-layer"]': 'addLayer _addLayer'
  },

  events:{
    'focus [data-hook="layer-type"]': '_suggestLayerType'
  },

  _suggestLayerType: function() {
    var helper = this.parent.suggestionHelper;
    var el = this.queryByHook('layer-type');
    helper.attach(el, function(selected) {
      el.value = selected;
      helper.detach();
    }).fill([
      'default',
      'img',
      'SVG',
      'canvas'
    ]);
  },

  _addLayer: function() {
    var typeEl = this.queryByHook('layer-type');
    var nameEl = this.queryByHook('layer-name');
    var type = typeEl.value;
    var name = nameEl.value;
    if (!type || !name) { return; }
    return {
      layer: {
        name: name,
        type: type
      }
    };
  },

  subviews: {
    items: {
      selector: '.items',
      waitFor: 'el',
      prepareView: function(el) {
        return this.renderCollection(this.collection, function (opts) {
          var type = opts.model.getType();
          var Constructor = LayerControlView.types[type] || LayerControlView;
          return new Constructor(opts);
        }, el);
      }
    }
  },

  template: `
    <section class="row layers">
      <header class="columns">
        <div class="column">
          <input data-hook="layer-name" placeholder="Name" type="text"/>
        </div>
        <div class="column">
          <input data-hook="layer-type" placeholder="Type" type="text"/>
        </div>
        <div class="column no-grow">
          <button name="add-layer" class="vfi-plus"></button>
        </div>
      </header>
      <div class="items"></div>
    </section>
  `
});
module.exports = LayersView;