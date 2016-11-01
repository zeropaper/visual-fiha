'use strict';
var SignalState = require('./../state');

var BeatState = SignalState.extend({
  initialize: function() {
    SignalState.prototype.initialize.apply(this, arguments);
    if (this.observedModel) this.listenTo(this.observedModel, 'frametime', function (value) {
      if (isNaN(value)) { return; }
      this.frametime = value;
    });
  },

  props: {
    frametime: ['number', true, 0]
  },

  derived: {
    result: {
      deps: ['timeBetweenBeats', 'frametime'],
      fn: function() {
        return this.computeSignal();
      }
    },
    timeBetweenBeats: {
      deps: ['input'],
      fn: function() {
        return (60 * 1000) / Math.max(this.input, 1);
      }
    }
  },

  computeSignal: function() {
    var preTransform = !this.frametime ? 0 : (100 - (((this.frametime % this.timeBetweenBeats) / this.timeBetweenBeats) * 100));
    return SignalState.prototype.computeSignal.apply(this, [preTransform]);
  }
});

module.exports = BeatState;