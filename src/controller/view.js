'use strict';
var View = VFDeps.View;
var ScreenState = require('./../screen/state');
var MIDIAccessState = require('./../midi/state');
var MIDIAccessView = require('./../midi/view');
var LayerControlView = require('./../layer/control-view');
require('./../layer/canvas/control-view');
var SignalControlView = require('./../signal/control-view');
require('./../signal/beat/control-view');
require('./../signal/hsla/control-view');
require('./../signal/rgba/control-view');

var SuggestionView = require('./suggestion-view');
var SparklineView = require('./sparkline-view');
var AudioMonitor = require('./audio-monitor-view');
var AceEditor = require('./ace-view');

var mappings = require('./../mapping/state');
var MappingsControlView = require('./../mapping/control-view');

var controllerMixin = {};
controllerMixin.initializeController = function initializeController() {
  this.worker = new Worker('web-worker-build.js');
};

// almost unique id
function auid() {
  return parseInt((Math.random() + '.' + performance.now()).replace(/\./g, ''), 10);
}
controllerMixin.sendCommand = function sendCommand(name, payload, callback) {
  // console.info('%ccontroller send command "%s"', 'color:green', name);
  var worker = this.worker;
  var message = {
    command: name,
    payload: payload
  };

  function makeListener(id, done) {
    function eventListener(evt) {
      if (evt.data.eventId !== id) return;
      done(null, evt.data.payload);
      worker.removeEventListener('message', eventListener);
    }
    return eventListener;
  }

  if (callback) {
    message.eventId = auid();
    worker.addEventListener('message', makeListener(message.eventId, callback), false);
  }
  worker.postMessage(message);
};


var ControllerView = View.extend(controllerMixin, {
  _workerInit: false,
  initialize: function(options) {
    var controllerView = this;
    controllerView.initializeController();

    controllerView.model = controllerView.model || new ScreenState({}, {
      parent: controllerView
    });
    if (controllerView.model.parent !== controllerView) {
      controllerView.model.parent = controllerView;
    }

    controllerView.worker.addEventListener('message', function() {
      if (controllerView._workerInit) return;
      controllerView._workerInit = true;

      controllerView.sendCommand('resetLayers', {
        layers: controllerView.model.screenLayers.serialize()
      });

      controllerView.sendCommand('resetSignals', {
        signals: controllerView.model.screenSignals.serialize()
      });
    }, false);




    controllerView._bindLayerEvents();
    controllerView.model.set({
      screenSignals: options.screenSignals,
      screenLayers: options.screenLayers
    });




    controllerView.listenToAndRun(controllerView, 'change:audioContext change:audioAnalyser', controllerView.connectAudioSource);

    controllerView.listenToAndRun(controllerView.midiAccess, 'midi', function(evtName, value) {
      if (!evtName) return;

      controllerView.sendCommand({
        type: 'midi',
        name: evtName,
        value: value
      });
    });

    controllerView._animate();

    if (options.autoStart) {
      controllerView.play();
    }

    var mappingContext = controllerView.model;
    mappings.import(options.mappings, mappingContext);

    if (controllerView.el) {
      controllerView._attachSuggestionHelper();
    }
    else {
      controllerView.once('change:el', controllerView._attachSuggestionHelper);
    }
  },

  _bindLayerEvents: function() {
    var controllerView = this;

    controllerView.listenTo(controllerView.model.screenLayers, 'add', function(state) {
      controllerView.sendCommand('addLayer', {
        layer: state.serialize()
      });
    });

    controllerView.listenTo(controllerView.model.screenLayers, 'remove', function(state) {
      controllerView.sendCommand('addLayer', {
        layerName: state.name
      });
    });

    controllerView.listenTo(controllerView.model.screenLayers, 'change:layer', function(state) {
      if (!state) return;

      var changed = state.changedAttributes();
      if (!Object.keys(changed).length) {
        changed = state.serialize();
      }


      controllerView.sendCommand('updateLayer', {
        layer: state.changedAttributes(),
        layerName: state.name
      });
    });

    return this;
  },

  connectAudioSource: function() {
    var controllerView = this;
    var capture = {
      audio: true
    };

    function success(stream) {
      var source = controllerView.audioContext.createMediaStreamSource(stream);
      source.connect(controllerView.audioAnalyser);
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

  _animate: function(timestamp) {
    if (this.controllerSparkline) {
      this.controllerSparkline.update(1000 / ((timestamp - this.model.frametime) - this.model.firstframetime));
    }

    if (this.latencySparkline) {
      // this.latencySparkline.update(this.screenView.model.latency);
    }

    if (this.audioMonitor) {
      this.audioMonitor.update();
    }

    if (this.playing) {
      this.model.frametime = timestamp - this.model.firstframetime;

      this.update();
    }

    this._arId = window.requestAnimationFrame(this._animate.bind(this));
  },

  update: function() {
    var analyser = this.audioAnalyser;

    var freqArray = this.audioFrequencyDataArray;
    analyser.getByteFrequencyData(freqArray);

    var timeDomainArray = this.audioTimeDomainDataArray;
    analyser.getByteTimeDomainData(timeDomainArray);

    var command = {
      frametime: this.model.frametime,
      audio: {
        bufferLength: analyser.frequencyBinCount,
        frequency: freqArray,
        timeDomain: timeDomainArray
      }
    };

    this.sendCommand('heartbeat', command);
  },

  derived: {
    computedStyle: {
      deps: ['el'],
      fn: function() {
        return window.getComputedStyle(this.el);
      }
    },
    signalNames: {
      fn: function () {
        var mic = [];
        var analyser = this.audioAnalyser;
        var bufferLength = analyser.frequencyBinCount;
        for(var i = 0; i < bufferLength; i++) {
          mic.push('freq:' + i);
          mic.push('atd:' + i);
        }
        return mic.concat(this.screenView ? this.screenView.signalNames : [], this.midiAccess.signalNames);
      }
    },

    audioContext: {
      deps: [],
      fn: function() {
        return new window.AudioContext();
      }
    },
    audioAnalyser: {
      deps: ['audioContext', 'model', 'audioMinDb', 'audioMaxDb', 'audioSmoothing', 'audioFftSize'],
      fn: function() {
        var analyser = this.audioContext.createAnalyser();
        analyser.minDecibels = this.audioMinDb;
        analyser.maxDecibels = this.audioMaxDb;
        analyser.smoothingTimeConstant = this.audioSmoothing;
        analyser.fftSize = this.audioFftSize;
        return analyser;
      }
    },
    audioFrequencyDataArray: {
      deps: ['audioAnalyser'],
      fn: function () {
        return new window.Uint8Array(this.audioAnalyser.frequencyBinCount);
      }
    },
    audioTimeDomainDataArray: {
      deps: ['audioAnalyser'],
      fn: function () {
        return new window.Uint8Array(this.audioAnalyser.frequencyBinCount);
      }
    }
  },

  children: {
    midiAccess: MIDIAccessState
  },

  session: {
    audioMinDb: ['number', true, -90],
    audioMaxDb: ['number', true, -10],
    audioSmoothing: ['number', true, 0.85],
    audioFftSize: ['number', true, 256],
    playing: ['boolean', true, false],
    broadcastId: ['string', true, 'vfBus'],
    _arId: 'number',
    currentDetails: 'state'
  },

  play: function() {
    this.playing = true;
    if (!this.model.firstframetime) {
      this.model.firstframetime = performance.now();
    }
    return this;
  },
  pause: function() {
    this.playing = false;
    return this;
  },
  stop: function() {
    this.playing = false;
    this.model.firstframetime = this.model.frametime = 0;
    return this;
  },

  subviews: {
    MIDIAccess: {
      waitFor: 'el',
      selector: '.midi-access',
      prepareView: function(el) {
        var subview = new MIDIAccessView({
          parent: this,
          el: el,
          model: this.midiAccess
        });
        return subview;
      }
    },

    codeEditor: {
      waitFor: 'el',
      selector: '.debug',
      prepareView: function(el) {
        return new AceEditor({
          el: el,
          parent: this
        });
      }
    },

    audioMonitor: {
      waitFor: 'el',
      selector: '.audio-monitor',
      prepareView: function(el) {
        var styles = window.getComputedStyle(el);
        var view = new AudioMonitor({
          audioAnalyser: this.audioAnalyser,
          parent: this,
          color: styles.color
        });
        el.appendChild(view.el);
        return view;
      }
    },

    controllerSparkline: {
      waitFor: 'el',
      selector: '.sparkline-controller',
      prepareView: function(el) {
        var styles = window.getComputedStyle(el);
        var view = new SparklineView({
          parent: this,
          color: styles.color,
          font: styles.fontSize + ' ' + styles.fontFamily.split(' ').pop()
        });
        el.appendChild(view.el);
        return view;
      }
    },

    latencySparkline: {
      waitFor: 'el',
      selector: '.sparkline-latency',
      prepareView: function(el) {
        var styles = window.getComputedStyle(el);
        var view = new SparklineView({
          parent: this,
          color: styles.color,
          font: styles.fontSize + ' ' + styles.fontFamily.split(' ').pop()
        });
        el.appendChild(view.el);
        return view;
      }
    },

    screenLayersView: {
      waitFor: 'el',
      selector: '.layers .items',
      prepareView: function(el) {
        return this.renderCollection(this.model.screenLayers, function (opts) {
          var type = opts.model.getType();
          var Constructor = LayerControlView.types[type] || LayerControlView;
          return new Constructor(opts);
        }, el);
      }
    },

    screenSignalsView: {
      waitFor: 'el',
      selector: '.signals .items',
      prepareView: function(el) {
        return this.renderCollection(this.model.screenSignals, function (opts) {
          var type = opts.model.getType();
          var Constructor = SignalControlView.types[type]|| SignalControlView;
          return new Constructor(opts);
        }, el);
      }
    },

    mappingsView: {
      waitFor: 'el',
      selector: '.mappings-view',
      prepareView: function(el) {
        var view = new MappingsControlView({
          collection: mappings,
          parent: this,
          model: this.model,
          el: el
        });
        return view;
      }
    }
  },

  _attachSuggestionHelper: function() {
    if (this.suggestionHelper) { return; }
    this.suggestionHelper = this.registerSubview(new SuggestionView({
      parent: this
    }));
  },

  remove: function() {
    View.prototype.remove.apply(this, arguments);
  },

  toJSON: function () {
    return this.screenView.toJSON();
  },

  bindings: {
    broadcastId: {
      selector: '.control-screen',
      type: function(el, val) {
        if (!val) return;
        el.src = './screen.html#' + val;
      }
    },
    playing: [
      {
        type: 'toggle',
        selector: '[name="play"]',
        invert: true
      },
      {
        type: 'toggle',
        selector: '[name="pause"]'
      }
    ],
    audioMinDb: {
      selector: '[name="audioMinDb"]',
      type: 'value'
    },
    audioMaxDb: {
      selector: '[name="audioMaxDb"]',
      type: 'value'
    },
    audioSmoothing: {
      selector: '[name="audioSmoothing"]',
      type: 'value'
    },
    audioFftSize: {
      selector: '[name="audioFftSize"]',
      type: 'value'
    }
  },

  events: {
    'click [name="play"]': 'play',
    'click [name="pause"]': 'pause',
    'click [name="stop"]': 'stop',
    'click [name="resize"]': 'resizeScreen',
    'click [name="screen"]': '_openScreen',
    'click [name="add-layer"]': '_addLayer',
    'click [name="add-signal"]': '_addSignal',
    'focus [data-hook="layer-type"]': '_suggestLayerType',
    'focus [data-hook="signal-type"]': '_suggestSignalType',
    'change .audio-source [name]': '_changeAudioParams'
  },

  _openScreen: function() {
    window.open('./screen.html#' + this.broadcastId, 'screen', 'width=800,height=600,location=no');
  },

  _suggestLayerType: function() {
    var helper = this.suggestionHelper;
    var el = this.queryByHook('layer-type');
    helper.attach(el, function(selected) {
      el.value = selected;
      helper.detach();
    }).fill([
      'default',
      'img',
      'SVG',
      'canvas'
    ]);
  },

  _suggestSignalType: function() {
    var helper = this.suggestionHelper;
    var el = this.queryByHook('signal-type');
    helper.attach(this.queryByHook('signal-type'), function(selected) {
      el.value = selected;
      helper.detach();
    }).fill([
      'default',
      'beatSignal',
      'hslaSignal',
      'rgbaSignal'
    ]);
  },

  _changeAudioParams: function(evt) {
    this.model.set(evt.target.name, Number(evt.target.value));
    this.audioMonitor.set('audioAnalyser', this.audioAnalyser);
  },

  addMultiMapping: function(mappingModel) {
    this.mappingsView.mappings.add({
      targetModel: mappingModel.targetModel,
      targetProperty: mappingModel.targetProperty
    });
  },

  showDetails: function (view) {
    if (view === this.currentDetails) { return this; }
    this.detailsSwitcher.set(view);
    return this;
  },

  _addSignal: function() {
    var typeEl = this.queryByHook('signal-type');
    var nameEl = this.queryByHook('signal-name');
    var type = typeEl.value;
    var name = nameEl.value;
    if (!type || !name) { return; }
    this.model.screenSignals.add({
      name: name,
      type: type
    });
    typeEl.value = nameEl.value = '';
  },

  _addLayer: function() {
    var typeEl = this.queryByHook('signal-type');
    var nameEl = this.queryByHook('signal-name');
    var type = typeEl.value;
    var name = nameEl.value;
    if (!type || !name) { return; }
    this.model.screenLayers.add({
      name: name,
      type: type
    });
    typeEl.value = nameEl.value = '';
  },



  render: function () {
    var controllerView = this;
    this.renderWithTemplate();

    this.cacheElements({
      jsHeapLimit: '.heap-limit span',
      jsHeapTotal: '.heap-total span',
      jsHeapUsed: '.heap-used span',
      detailsEl: '.details'
    });

    this.detailsSwitcher = new VFDeps.ViewSwitcher(this.detailsEl, {
      show: function (view) {
        controllerView.currentDetails = view;
      }
    });

    return this;
  },

  autoRender: true,

  /*
  :sout=#http{dst=:8080/stream} :sout-keep
  */
  template: '<div class="controller rows">'+
    '<div class="row columns gutter-horizontal header">'+
      '<div class="column no-grow gutter-right">Visual Fiha</div>'+

      '<div class="column columns">'+
        '<span class="column columns no-grow button-group">'+
          '<button class="column gutter-horizontal" name="play"><span class="vfi-play"></span></button>'+
          '<button class="column gutter-horizontal" name="pause"><span class="vfi-pause"></span></button>'+
          '<button class="column gutter-horizontal" name="stop"><span class="vfi-stop"></span></button>'+
        '</span>'+

        '<div class="column columns gutter-horizontal no-grow">'+
          '<button name="screen">Open screen</button>'+
        '</div>'+

        '<div class="column gutter-horizontal no-grow columns performance">'+
          // 'SCL <span title="Screen Communication Latency" class="column sparkline-latency"></span>'+
          'Controller <span class="column sparkline-controller"></span>'+
        '</div>'+
      '</div>'+
    '</div>'+

    '<div class="row columns body">'+
      '<div class="region-left column no-grow rows">'+
        '<iframe class="region-left-top row grow-l control-screen"></iframe>'+

        '<div class="region-left-bottom row rows">' +
          '<div class="row debug"></div>'+
          '<div class="row details"></div>'+
        '</div>'+
      '</div>'+

      '<div class="region-right column rows settings">'+
        '<div class="region-right-top row columns">'+
          '<div class="column rows">'+
            '<div class="row layers">'+
              '<div class="section-name gutter-vertical">Layers</div>'+
              '<div class="columns">'+
                '<div class="column">' +
                  '<input data-hook="layer-name" placeholder="Name" type="text"/>'+
                '</div>' +
                '<div class="column">' +
                  '<input data-hook="layer-type" placeholder="Type" type="text"/>'+
                '</div>' +
                '<div class="column no-grow">'+
                  '<button name="add-layer" class="vfi-plus"></button>'+
                '</div>'+
              '</div>'+
              '<div class="items"></div>'+
            '</div>'+
          '</div>'+

          '<div class="column rows">'+
            '<div class="row signals">'+
              '<div class="section-name gutter-vertical">Signals</div>'+
              '<div class="columns">'+
                '<div class="column">' +
                  '<input data-hook="signal-name" placeholder="Name" type="text"/>'+
                '</div>' +
                '<div class="column">' +
                  '<input data-hook="signal-type" placeholder="Type" type="text"/>'+
                '</div>' +
                '<div class="column no-grow">'+
                  '<button name="add-signal" class="vfi-plus"></button>'+
                '</div>'+
              '</div>'+
              '<div class="items"></div>'+
            '</div>'+

            '<div class="column rows">'+
              '<div class="row mappings-view"></div>' +
            '</div>'+
          '</div>'+
        '</div>'+


        // '<div class="row no-grow columns">'+
        //   '<div class="mappings-view"></div>' +
        // '</div>'+


        '<div class="region-right-bottom row no-grow columns">'+
          '<div class="column midi-access"></div>'+


          '<div class="column rows audio-source">'+
            // '<audio class="row" src="http://localhost:8080/stream" controls autoplay></audio>'+
            '<div class="row columns">'+
              '<div class="column audio-monitor"></div>'+
              '<div class="column audio-controls">' +
                '<label>MinDb: <input type="number" name="audioMinDb" value="-90" step="1" /></label>' +
                '<label>MaxDb: <input type="number" name="audioMaxDb" value="-10" min="-70" step="1" /></label>' +
                '<label>Smoothing: <input type="number" name="audioSmoothing" value="0.85" step="0.01" /></label>' +
                '<label>FftSize: <select type="number" name="audioFftSize" value="32" step="2">' +
                  '<option value="32">32</option>' +
                  '<option value="64">64</option>' +
                  '<option value="128">128</option>' +
                  '<option value="256">256</option>' +
                  '<option value="1024">1024</option>' +
                  '<option value="2048">2048</option>' +
                '</select></label>' +
              '</div>'+
            '</div>' +
          '</div>'+
        '</div>'+
      '</div>'+
    '</div>'+
  '</div>'
});
module.exports = ControllerView;
