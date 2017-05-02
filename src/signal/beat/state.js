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
    source: ['result', 'beatlength', 'beatnum'],
    target: ['input']
  },

  derived: {
    result: {
      deps: ['beatlength', 'frametime'],
      fn: function() {
        return this.computeSignal();
      }
    },
    beatnum: {
      deps: ['beatlength', 'frametime'],
      fn: function() {
        return this.frametime ? Math.floor(this.frametime / this.beatlength) : 0;
      }
    },
    beatlength: {
      deps: ['input'],
      fn: function() {
        return (60 * 1000) / Math.max(this.input, 1);
      }
    }
  },

  computeSignal: function() {
    var ft = this.frametime;
    var tbb = this.beatlength;
    return !ft ? 0 : (100 - (((ft % tbb) / tbb) * 100));
  }
});

module.exports = BeatState;