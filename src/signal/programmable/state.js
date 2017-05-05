'use strict';
var compileFunction = require('./../../utils/compile-function');
var SignalState = require('./../state');

var updatePrologue = ``;

module.exports = SignalState.types.programmable = SignalState.extend({
  initialize: function() {
    SignalState.prototype.initialize.apply(this, arguments);
    if (this.location !== 'worker') return;
    // this.on('change:result', function() {console.info(this.name + ' change:result');});
    this.listenTo(this.collection.clock, 'change:frametime', function(...args) {
      this.trigger('change:input', this, args[1], args[2]);
    });
  },

  props: {
    updateFunction: ['string', true, 'console.info("frametime %s, bpm %s, beatnum %s, beatprct %s", frametime, bpm, beatnum, beatprct.toFixed(2));\nreturn 0;']
  },

  derived: {
    result: {
      deps: ['input', 'workerResult'],
      fn: function() {
        if (this.location !== 'worker') return this.workerResult || this.defaultValue;
        return this.computeSignal();
      }
    },
    update: {
      deps: ['updateFunction'],
      fn: function() {
        return compileFunction(
          'update',
          updatePrologue,
          'frametime',
          'bpm',
          'beatnum',
          'beatprct',
          this.updateFunction,
          this
        );
      }
    }
  },

  computeSignal: function(clock) {
    clock = clock || (this.collection ? this.collection.clock : {
      frametime: 0,
      bpm: 120,
      beatnum: 0,
      beatprct: 0,
    });

    var fn = this.update;
    return typeof fn === 'function' ? fn(
      clock.frametime,
      clock.bpm,
      clock.beatnum,
      clock.beatprct
    ) : 0;
  }
});