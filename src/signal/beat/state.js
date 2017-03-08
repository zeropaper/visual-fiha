'use strict';
var SignalState = require('./../state');

var BeatState = SignalState.types.beat = SignalState.extend({
  initialize: function() {
    SignalState.prototype.initialize.apply(this, arguments);
    this.listenTo(this.collection, 'frametime', function(frametime) {
      this.frametime = frametime;
    });
  },

  props: {
    frametime: ['number', true, 0]
  },

  mappable: {
    source: ['result', 'timeBetweenBeats', 'beatNum'],
    target: ['input']
  },

  derived: {
    result: {
      deps: ['timeBetweenBeats', 'frametime'],
      fn: function() {
        return this.computeSignal();
      }
    },
    beatNum: {
      deps: ['timeBetweenBeats', 'frametime'],
      fn: function() {
        return this.frametime ? Math.floor(this.frametime / this.timeBetweenBeats) : 0;
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
    return preTransform;
    // var result = SignalState.prototype.computeSignal.apply(this, [preTransform]);
    // return result;
  }
});

module.exports = BeatState;