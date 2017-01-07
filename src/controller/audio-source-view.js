'use strict';
/* global require, VFDeps*/
var View = VFDeps.View;
var AudioMonitor = require('./audio-monitor-view');
var AudioSource = View.extend({
  autoRender: true,

  template: '<div class="column rows audio-source">'+
    // '<audio class="row" src="http://localhost:8080/stream" controls autoplay></audio>'+
    '<div class="row columns">'+
      '<div class="column audio-monitor"></div>'+
      '<div class="column audio-controls">' +
        // need to investigate min/max value for decibels:
        // https://webaudio.github.io/web-audio-api/#widl-AnalyserNode-maxDecibels
        '<label>MinDb: <input type="range" name="minDecibels" value="-90" min="-200" max="-11" step="1" /></label>' +
        '<label>MaxDb: <input type="range" name="maxDecibels" value="-10" min="-70" max="120" step="1" /></label>' +
        '<label>Smoothing: <input type="range" name="smoothingTimeConstant" min="0" max="1" value="0.85" step="0.01" /></label>' +
        '<label>FftSize: <select type="number" name="fftSize" value="32" step="2">' +
          '<option value="32">32</option>' +
          '<option value="64">64</option>' +
          '<option value="128">128</option>' +
          '<option value="256">256</option>' +
          '<option value="1024">1024</option>' +
          '<option value="2048">2048</option>' +
        '</select></label>' +
      '</div>'+
    '</div>' +
  '</div>',

  initialize: function() {
    [
    'minDecibels',
    'maxDecibels',
    'smoothingTimeConstant',
    'fftSize'
    ].forEach(function(name) {
      this.on('change:' + name, function () {
        if (!this.audioAnalyser) return;
        this.audioAnalyser[name] = this[name];
      });
    }, this);

    this.listenToAndRun(this, 'change:audioContext change:audioAnalyser', this.connectAudioSource);
  },

  session: {
    minDecibels: ['number', true, -90],
    maxDecibels: ['number', true, -10],
    smoothingTimeConstant: ['number', true, 0.85],
    fftSize: ['number', true, 256]
  },

  derived: {
    audioContext: {
      deps: [],
      fn: function() {
        return new window.AudioContext();
      }
    },
    audioAnalyser: {
      deps: ['audioContext'],
      fn: function() {
        var analyser = this.audioContext.createAnalyser();
        analyser.minDecibels = this.minDecibels;
        analyser.maxDecibels = this.maxDecibels;
        analyser.smoothingTimeConstant = this.smoothingTimeConstant;
        analyser.fftSize = this.fftSize;
        return analyser;
      }
    },
    audioFrequencyArray: {
      deps: ['audioAnalyser', 'fftSize'],
      fn: function () {
        return new window.Uint8Array(this.audioAnalyser.frequencyBinCount);
      }
    },
    audioTimeDomainArray: {
      deps: ['audioAnalyser', 'fftSize'],
      fn: function () {
        return new window.Uint8Array(this.audioAnalyser.frequencyBinCount);
      }
    }
  },

  bindings: {
    minDecibels: {
      selector: '[name="minDecibels"]',
      type: 'value'
    },
    maxDecibels: {
      selector: '[name="maxDecibels"]',
      type: 'value'
    },
    smoothingTimeConstant: {
      selector: '[name="smoothingTimeConstant"]',
      type: 'value'
    },
    fftSize: {
      selector: '[name="fftSize"]',
      type: 'value'
    }
  },

  subviews: {
    monitor: {
      waitFor: 'el',
      selector: '.audio-monitor',
      prepareView: function(el) {
        var view = new AudioMonitor({
          audioAnalyser: this.audioAnalyser,
          parent: this
        });
        el.appendChild(view.el);
        return view;
      }
    }
  },


  events: {
    'change .audio-source [name]': '_changeAudioParams'
  },

  connectAudioSource: function() {
    var view = this;
    var capture = {
      audio: true
    };

    function success(stream) {
      var source = view.audioContext.createMediaStreamSource(stream);
      source.connect(view.audioAnalyser);
    }
    function error(err) {
      console.warn(err);
    }

    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia(capture).then(success).catch(error);
    }
    else if (navigator.getUserMedia) {
      navigator.getUserMedia(capture, success, error);
    }

    return this;
  },

  _changeAudioParams: function(evt) {
    this.set(evt.target.name, Number(evt.target.value));
  },

  update: function() {
    if (!this.monitor) return;
    this.monitor.update();
  }
});
module.exports = AudioSource;