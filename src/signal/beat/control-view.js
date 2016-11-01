'use strict';
var assign = window.VFDeps.assign;
var SignalControlView = require('./../control-view');
var BeatSignalControlView = SignalControlView.beatSignal = SignalControlView.extend({
  template: [
    '<section class="rows signal signal-beat">',
    '<header class="row">',
    '<h3 class="name"></h3>',
    '</header>',

    '<div class="row columns gutter-horizontal gutter-bottom">',
    '<div class="column result-dot no-grow gutter-right"></div>',
    '<div class="column result gutter-left">',
    '<div class="column input" data-placeholder="BPM" data-hook="input" contenteditable="true"></div>',
    '</div>',
    '</div>',

    '<div class="row mappings props"></div>',
    '</section>'
  ].join(''),

  bindings: assign({}, SignalControlView.prototype.bindings, {
    'model.result': [
      // {
      //   selector: '.result',
      //   type: 'text'
      // },
      {
        selector: '.result-dot',
        type: function(el, val) {
          el.style.backgroundColor = 'hsla(190, 81%, 67%,' + (val / 100) + ')';
        }
      }
    ]
  }),

  events: assign({}, SignalControlView.prototype.events, {
    'input [data-hook=input]': '_updateBPM'
  }),

  _updateBPM: function() {
    this.model.input = parseInt(this.queryByHook('input').textContent.trim(), 10);
    console.info('Changing BPM', this.model.input);
  },

  render: function () {
    this.renderWithTemplate();
    var inputEl = this.queryByHook('input');
    if (inputEl && !inputEl.textContent) {
      inputEl.textContent = this.model.input;
    }
    return this;
  }
});
module.exports = BeatSignalControlView;