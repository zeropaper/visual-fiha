'use strict';
var assign = require('lodash.assign');
var msToTime = require('./../utils/ms-to-time');
var ControlView = require('./control-view');
var ClockView = ControlView.extend({
  template: `<div class="column columns no-grow">
  <span class="column columns no-grow button-group">
    <div class="column no-grow">
      <button name="play" class="vfi-play"></button>
    </div>
    <div class="column no-grow">
      <button name="pause" class="vfi-pause"></button>
    </div>
    <div class="column no-grow">
      <button name="stop" class="vfi-stop"></button>
    </div>
  </span>
  <div class="column gutter frametime"></div>
  <div class="column gutter"><span class="result-dot"></span></div>
  <div class="column no-grow detector">
    <input name="bpm" />
  </div>
</div>`,

  bindings: assign({}, ControlView.prototype.bindings, {
    'model.bpm': {
      type: 'value',
      selector: '[name=bpm]'
    },
    'model.frametime': {
      selector: '.frametime',
      type: function(el, val) {
        el.textContent = msToTime(val);
      }
    },
    'model.beatprct': [
      {
        selector: '.result-dot',
        type: function(el, val) {
          el.style.backgroundColor = 'hsla(190, 81%, 67%,' + (val / 100) + ')';
        }
      }
    ]
  }),

  events: assign({}, ControlView.prototype.events, {
    'click .result-dot': 'tap'
  }),

  commands: {
    'click [name="play"]': 'play',
    'click [name="pause"]': 'pause',
    'click [name="stop"]': 'stop',
    'change [name="bpm"]': 'setBPM _setBPM'
  },

  session: {
    wait: ['number', true, 2],
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

  _setBPM: function(msecs) {
    msecs = msecs && !msecs.target ? msecs : Date.now();
    return {
      bpm: Math.round((60000 * this.count / (msecs - this.first)) * 100) / 100
    };
  },

  tap: function() {
    var msecs = Date.now();
    var wait = 2;

    if ((msecs - this.previous) > 1000 * wait) {
      this.count = 0;
    }

    if (!this.count) {
      this.first = msecs;
      this.count = 1;
    }
    else {
      this.count++;

      this.sendCommand('setBPM', this._setBPM(msecs));
    }


    this.previous = msecs;
  }
});
module.exports = ClockView;