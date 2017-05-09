'use strict';
var View = require('./../controller/control-view');
var SignalDetailsView = require('./details-view');
var SignalControlView = View.extend({
  template: `<section class="rows signal signal-default">
    <header class="columns">
      <h3 class="column signal-name gutter-horizontal" data-hook="name"></h3>
      <div class="column no-grow text-right"><button class="vfi-trash-empty remove-signal"></button></div>
    </header>
  </section>`,

  session: {
    input: 'any',
    showMappings: ['boolean', true, false]
  },

  derived: {
    result: {
      deps: ['input', 'model'/*, 'model.transformations'*/],
      fn: function() {
        return this.model.computeSignal(this.input);
      }
    }
  },

  bindings: {
    'model.name': '[data-hook=name]',
    'model.type': '[data-hook=type]'
  },

  events: {
    'change .test .input': '_testValue',
    'click header h3': '_showDetails'
  },

  commands: {
    'click .remove-signal': 'removeSignal _removeSignal'
  },

  _removeSignal: function() {
    return {
      signalName: this.model.name
    };
  },

  _showDetails: function () {
    var DetailsViewConstructor = SignalDetailsView.types ? SignalDetailsView.types[this.model.getType()] : false;
    DetailsViewConstructor = DetailsViewConstructor || SignalDetailsView;
    this.rootView.showDetails(new DetailsViewConstructor({
      parent: this,
      model: this.model
    }));
  },

  _testValue: function(evt) {
    this.input = evt.target.value.trim();
  },

  render: function () {
    this.renderWithTemplate();
    var inputEl = this.query('.test .input');
    if (inputEl && !inputEl.value) {
      inputEl.value = this.input || null;
    }
    return this;
  }
});

SignalControlView.types = {};

module.exports = SignalControlView;