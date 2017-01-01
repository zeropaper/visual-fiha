'use strict';
var View = VFDeps.View;

var SignalControlView = require('./../signal/control-view');
require('./../signal/beat/control-view');
require('./../signal/hsla/control-view');
require('./../signal/rgba/control-view');

var SignalsView = View.extend({
  autoRender: true,

  events: {
    'focus [data-hook="signal-type"]': '_suggestSignalType'
  },

  _suggestSignalType: function() {
    var helper = this.parent.suggestionHelper;
    var el = this.queryByHook('signal-type');
    helper.attach(this.queryByHook('signal-type'), function(selected) {
      el.value = selected;
      helper.detach();
    }).fill([
      'default',
      'beatSignal',
      'hslaSignal',
      'rgbaSignal'
    ]);
  },

  subviews: {
    items: {
      selector: '.items',
      waitFor: 'el',
      prepareView: function(el) {
        return this.renderCollection(this.collection, function (opts) {
          var type = opts.model.getType();
          var Constructor = SignalControlView.types[type] || SignalControlView;
          return new Constructor(opts);
        }, el);
      }
    }
  },

  template: '<div class="row signals">'+
              '<div class="section-name gutter-vertical">Signals</div>'+
              '<div class="columns">'+
                '<div class="column">' +
                  '<input data-hook="signal-name" placeholder="Name" type="text"/>'+
                '</div>' +
                '<div class="column">' +
                  '<input data-hook="signal-type" placeholder="Type" type="text"/>'+
                '</div>' +
                '<div class="column no-grow">'+
                  '<button name="add-signal" class="vfi-plus"></button>'+
                '</div>'+
              '</div>'+
              '<div class="items"></div>'+
            '</div>',

  render: function() {
    if (!this.rendered) {
      this.renderWithTemplate();
    }
    return this;
  }
});
module.exports = SignalsView;