'use strict';
var State = require('ampersand-state');

var Clock = State.extend({
  mappable: {
    source: ['frametime', 'pausetime', 'starttime', 'bpm', 'beatprct', 'beatnum', 'beatlength'],
    target: ['beatdelay', 'bpm']
  },

  play: function() {
    var now = Date.now();
    this.starttime = this.pausetime ? this.starttime + (now - this.pausetime) : now;
    this.pausetime = 0;
    return this.refresh();
  },

  pause: function() {
    this.pausetime = Date.now();
    return this.refresh();
  },

  stop: function() {
    var now = Date.now();
    this.pausetime = now;
    this.starttime = now;
    this.frametime = 0;
    return this;
  },

  refresh: function() {
    if (this.playing) this.frametime = Date.now() - this.starttime;
    return this;
  },

  derived: {
    modelPath: {
      deps: [],
      fn: function() {
        return 'clock';
      }
    },
    playing: {
      deps: ['pausetime'],
      fn: function() {
        return !this.pausetime;
      }
    },
    paused: {
      deps: ['pausetime', 'starttime'],
      fn: function() {
        return this.pausetime > this.starttime;
      }
    },
    stopped: {
      deps: ['pausetime', 'starttime'],
      fn: function() {
        return this.pausetime === this.starttime;
      }
    },
    beatprct: {
      deps: ['beatlength', 'frametime'],
      fn: function() {
        var ft = this.frametime;
        var bl = this.beatlength;
        return !ft ? 0 : (100 - (((ft % bl) / bl) * 100));
      }
    },
    beatnum: {
      deps: ['beatlength', 'beatdelay', 'frametime'],
      fn: function() {
        var ft = this.frametime + this.beatdelay;
        return ft ? Math.floor(ft / this.beatlength) : 0;
      }
    },
    beatlength: {
      deps: ['bpm'],
      fn: function() {
        return (60 * 1000) / Math.max(this.bpm, 1);
      }
    }
  },

  props: {
    pausetime: ['number', true, 0],
    starttime: ['number', true, Date.now],
    frametime: ['number', true, 0],
    beatdelay: ['number', true, 0],
    bpm: ['number', true, 120]
  }
});

module.exports = Clock;