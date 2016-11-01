'use strict';
var View = window.VFDeps.View;
var SignalDetailsView = require('./details-view');
var SignalControlView = View.extend({
  template: [
    '<section class="rows signal">',
    '<header class="row">',
    '<h3 class="row name"></h3>',
    '</header>',

    '<div class="row gutter-horizontal columns model text-center">',
    '<div class="column input"></div>',
    '<div class="column gutter-horizontal no-grow">&raquo;</div>',
    '<div class="column result"></div>',
    '</div>',

    '<div class="row gutter-horizontal columns test text-center">',
    '<div class="column input" data-placeholder="Input" contenteditable="true"></div>',
    '<div class="column gutter-horizontal no-grow">&raquo;</div>',
    '<div class="column result"></div>',
    '</div>',
    '</section>'
  ].join(''),

  session: {
    input: 'any',
    showMappings: ['boolean', true, false]
  },

  derived: {
    rootView: {
      deps: ['parent'],
      fn: function () {
        for (var inst = this; inst; inst = inst.parent) {
          if (!inst.parent) { return inst; }
        }
      }
    },
    result: {
      deps: ['input', 'model', 'model.transformations'],
      fn: function() {
        return this.model.computeSignal(this.input);
      }
    }
  },

  bindings: {
    'model.name': '.name',
    'model.input': '.model .input',
    'model.result': '.model .result',
    result: '.test .result'
  },

  events: {
    'input .test .input': '_testValue',
    'click header h3': '_showDetails'
  },

  _showDetails: function () {
    this.rootView.showDetails(new SignalDetailsView({
      parent: this,
      model: this.model,
    }));
  },

  _testValue: function(evt) {
    this.input = evt.target.textContent.trim();
  },

  render: function () {
    this.renderWithTemplate();
    var inputEl = this.query('.test .input');
    if (inputEl && !inputEl.textContent) {
      inputEl.textContent = this.input;
    }
    return this;
  }
});
module.exports = SignalControlView;