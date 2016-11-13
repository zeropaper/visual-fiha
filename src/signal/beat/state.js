'use strict';
var SignalState = require('./../state');

var BeatState = SignalState.beatSignal = SignalState.extend({
  initialize: function() {
    SignalState.prototype.initialize.apply(this, arguments);
    var state = this;
    this.collection.parent.on('change:frametime', function(screenState, frametime) {
      state._ft = frametime;
    });
  },

  session: {
    _ft: ['number', true, 0]
  },

  derived: {
    result: {
      deps: ['timeBetweenBeats', '_ft'],
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
    var frametime = this._ft;
    var preTransform = !frametime ? 0 : (100 - (((frametime % this.timeBetweenBeats) / this.timeBetweenBeats) * 100));
    var result = SignalState.prototype.computeSignal.apply(this, [preTransform]);
    // this.collection.parent.signals[this.name] = result;
    return result;
  }
});

module.exports = BeatState;