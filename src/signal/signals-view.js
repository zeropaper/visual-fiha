'use strict';
var View = require('./../controller/control-view');

var SignalControlView = require('./control-view');
require('./beat/control-view');
require('./hsla/control-view');
require('./rgba/control-view');

var SignalsView = View.extend({
  commands: {
    'click [name="add-signal"]': 'addSignal _addSignal'
  },
  events:{
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
      'beat',
      'hsla',
      'rgba'
    ]);
  },

  _addSignal: function() {
    var typeEl = this.queryByHook('signal-type');
    var nameEl = this.queryByHook('signal-name');
    var type = typeEl.value;
    var name = nameEl.value;
    return {
      signal: {
        type: type,
        name: name
      }
    };
    // if (!type || !name) { return; }
    // this.model.signals.add({
    //   name: name,
    //   type: type
    // });
    // typeEl.value = nameEl.value = '';
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

  template: `
    <section class="row signals">
      <header class="columns">
        <div class="column">
          <input data-hook="signal-name" placeholder="Name" type="text"/>
        </div>
        <div class="column">
          <input data-hook="signal-type" placeholder="Type" type="text"/>
        </div>
        <div class="column no-grow">
          <button name="add-signal" class="vfi-plus"></button>
        </div>
      </header>
      <div class="items"></div>
    </section>
  `
});
module.exports = SignalsView;