'use strict';
var assign = require('lodash.assign');
var SignalControlView = require('./../control-view');
var BeatSignalControlView = SignalControlView.types.beat = SignalControlView.extend({
  template: '<section class="rows signal signal-beat">' +
    '<header class="row">' +
      '<h3 class="name"></h3>' +
    '</header>' +

    '<div class="detector">' +
      '<button class="avg">Tap</button>' +
    '</div>' +

    '<div class="row columns gutter-horizontal gutter-bottom">' +
      '<div class="column result-dot no-grow gutter-right"></div>' +
      '<div class="column result gutter-left">' +
        '<input class="column input" placeholder="BPM" data-hook="input" />' +
      '</div>' +
    '</div>' +

    '<div class="row mappings props"></div>' +
  '</section>',

  bindings: assign({}, SignalControlView.prototype.bindings, {
    avg: {
      type: 'text',
      selector: '.avg'
    },
    'model.input': {
      type: 'value',
      hook: 'input'
    },
    'model.result': [
      {
        selector: '.result-dot',
        type: function(el, val) {
          el.style.backgroundColor = 'hsla(190, 81%, 67%,' + (val / 100) + ')';
        }
      }
    ]
  }),

  events: assign({}, SignalControlView.prototype.events, {
    'click .detector > button': 'tap'
  }),

  commands: {
    'change [data-hook=input]': 'propChange _updateBPM'
  },

  _updateBPM: function() {
    return {
      path: 'signals.' + this.model.getId(),
      property: 'input',
      value: parseInt(this.queryByHook('input').value.trim(), 10)
    };
  },

  session: {
    wait: ['number', true, 2],
    avg: ['number', true, 0],
    count: ['number', true, 0],
    first: ['number', true, 0],
    previous: ['number', true, 0]
  },

  _resetDetector: function() {
    this.set({
      count: 0,
      first: 0,
      previous: 0
    });
  },

  tap: function() {
    var timeSeconds = new Date();
    var msecs = timeSeconds.getTime();
    var wait = 2;

    if ((msecs - this.previous) > 1000 * wait) {
      this.count = 0;
    }

    if (!this.count) {
      this.first = msecs;
      this.count = 1;
    }
    else {
      this.avg = Math.round((60000 * this.count / (msecs - this.first)) * 100) / 100;
      this.count++;
    }

    this.model.input = this.avg;

    this.previous = msecs;
  }
});
module.exports = BeatSignalControlView;