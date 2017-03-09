'use strict';
var SignalState = require('./../state');

var BeatState = SignalState.types.beat = SignalState.extend({
  initialize: function() {
    SignalState.prototype.initialize.apply(this, arguments);
    this.listenTo(this.collection, 'frametime', function(frametime) {
      this.frametime = frametime;
    });
  },

  session: {
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
    var ft = this.frametime;
    var tbb = this.timeBetweenBeats;
    return !ft ? 0 : (100 - (((ft % tbb) / tbb) * 100));
  }
});

module.exports = BeatState;