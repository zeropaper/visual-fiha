'use strict';
var View = require('./control-view');
var AudioMonitor = require('./audio-monitor-view');
var AudioSource = View.extend({
  autoRender: true,

  // need to investigate min/max value for decibels:
  // https://webaudio.github.io/web-audio-api/#widl-AnalyserNode-maxDecibels
  template: `
    <div class="column rows audio-source">
      <!-- <audio class="row" src="http://localhost:8080/stream" controls autoplay></audio> -->
      <div class="row columns">
        <div class="column audio-monitor"></div>
        <div class="column audio-controls">
          <label>MinDb: <input type="range" name="minDecibels" value="-90" min="-200" max="-11" step="1" /></label>
          <label>MaxDb: <input type="range" name="maxDecibels" value="-10" min="-70" max="120" step="1" /></label>
          <label>Smoothing: <input type="range" name="smoothingTimeConstant" min="0" max="1" value="0.85" step="0.01" /></label>
          <label>FftSize: <select type="number" name="fftSize" value="32" step="2">
            <option value="32">32</option>
            <option value="64">64</option>
            <option value="128">128</option>
            <option value="256">256</option>
            <option value="1024">1024</option>
            <option value="2048">2048</option>
          </select></label>
        </div>
      </div>
    </div>
  `,

  initialize: function() {
    this.listenToAndRun(this, 'change:audioContext change:audioAnalyser', this.connectAudioSource);
  },

  // session: {
  //   minDecibels: ['number', true, -90],
  //   maxDecibels: ['number', true, -10],
  //   smoothingTimeConstant: ['number', true, 0.85],
  //   fftSize: ['number', true, 256],
  //   audioAnalyser: 'any'
  // },

  bindings: {
    'parent.minDecibels': {
      selector: '[name="minDecibels"]',
      type: 'value'
    },
    'parent.maxDecibels': {
      selector: '[name="maxDecibels"]',
      type: 'value'
    },
    'parent.smoothingTimeConstant': {
      selector: '[name="smoothingTimeConstant"]',
      type: 'value'
    },
    'parent.fftSize': {
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
          audioAnalyser: this.parent.audioAnalyser,
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
      var source = view.parent.audioContext.createMediaStreamSource(stream);
      source.connect(view.parent.audioAnalyser);
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
    this.parent.set(evt.target.name, Number(evt.target.value));
  },

  update: function() {
    if (!this.monitor) return;
    this.monitor.update();
  }
});
module.exports = AudioSource;