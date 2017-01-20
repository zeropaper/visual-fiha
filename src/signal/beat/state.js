'use strict';
var SignalState = require('./../state');

var BeatState = SignalState.types.beat = SignalState.extend({
  session: {
    frametime: ['number', true, 0]
  },

  mappable: {
    source: ['result', 'timeBetweenBeats'],
    target: ['input']
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
    var frametime = this.frametime;
    var preTransform = !frametime ? 0 : (100 - (((frametime % this.timeBetweenBeats) / this.timeBetweenBeats) * 100));
    var result = SignalState.prototype.computeSignal.apply(this, [preTransform]);
    // this.collection.parent.signals[this.name] = result;
    return result;
  }
});

module.exports = BeatState;