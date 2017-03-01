'use strict';
var View = require('./../controller/control-view');
var SignalDetailsView = require('./details-view');
var SignalControlView = View.extend({
  template: '<section class="rows signal">' +
    '<header class="row">' +
      '<h3 class="row name"></h3>' +
    '</header>' +

    // '<div class="row gutter-horizontal columns model text-center">' +
    //   '<div class="column input"></div>' +
    //   '<div class="column gutter-horizontal no-grow">&raquo;</div>' +
    //   '<div class="column result"></div>' +
    // '</div>' +

    '<div class="row gutter-horizontal columns test text-center">' +
      '<input class="column input" placeholder="Input" type="text"/>' +
      '<div class="column gutter-horizontal no-grow">&raquo;</div>' +
      '<div class="column result"></div>' +
    '</div>' +
  '</section>',

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
    'model.name': '.name',
    // 'model.input': '.model .input',
    // 'model.result': '.model .result',
    result: '.test .result'
  },

  events: {
    'change .test .input': '_testValue',
    'click header h3': '_showDetails'
  },

  _showDetails: function () {
    this.rootView.showDetails(new SignalDetailsView({
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