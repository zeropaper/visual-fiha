'use strict';
var View = VFDeps.View;
var debounce = VFDeps.debounce;
var ResizeSensor = VFDeps.ResizeSensor;

var ScreenView = require('./../screen/view');
var ScreenState = require('./../screen/state');
var MIDIAccessState = require('./../midi/state');
var LayerControlView = require('./../layer/control-view');
require('./../layer/canvas/control-view');
// require('./../layer/video/control-view');
// require('./../layer/img/control-view');
// require('./../layer/svg/control-view');
var SignalControlView = require('./../signal/control-view');
require('./../signal/beat/control-view');
require('./../signal/hsla/control-view');
require('./../signal/rgba/control-view');

var SuggestionView = require('./../suggestion-view');
var SparklineView = require('./sparkline-view');
// var AceEditor = require('./ace-view');
// var TimelineView = require('./timeline-view');









var ControllerView = View.extend({
  initialize: function(options) {
    var controllerView = this;

    controllerView.model = controllerView.model || new ScreenState({
      screenLayers: options.screenLayers,
      screenSignals: options.screenSignals
    });

    if (controllerView.MIDIAccess) {
      controllerView.listenTo(controllerView.MIDIAccess, 'all', function() {
        controllerView.trigger.apply(controllerView, arguments);
      });
    }

    if (window.BroadcastChannel) {
      controllerView.channel = new window.BroadcastChannel('vf_bus');
    }

    // navigator.getUserMedia({
    //   audio: true
    // }, function(stream) {
    //   var source = controllerView.audioContext.createMediaStreamSource(stream);
    //   source.connect(controllerView.audioAnalyser);
    // }, function(err) {
    //   console.log('The following gUM error occured: ' + err);
    // });

    if (controllerView.el) {
      controllerView._attachSuggestionHelper();
    }
    else {
      controllerView.once('change:el', controllerView._attachSuggestionHelper);
    }

    if (options.autoStart !== false) {
      this.play();
    }
  },

  _animate: function(timestamp) {
    if (this.controllerSparkline) {
      this.controllerSparkline.update((timestamp - this.frametime) - this.firstframetime);
    }
    this.frametime = timestamp - this.firstframetime;
    this.update({
      frametime: this.frametime
    });
    this._animationRequest = window.requestAnimationFrame(this._animate.bind(this));
  },

  update: function(options) {
    var newState = this.model.toJSON();

    var analyser = this.audioAnalyser;
    var bufferLength = analyser.frequencyBinCount;
    var dataArray = this.audioAnalyserDataArray;
    analyser.getByteFrequencyData(dataArray);

    newState.mic = {};
    for(var i = 0; i < bufferLength; i++) {
      newState.mic['mic:' + i] = dataArray[i];
    }

    newState.frametime = options.frametime || 0;
    this.channel.postMessage(newState);
  },

  derived: {
    computedStyle: {
      fn: function() {
        return window.getComputedStyle(this.el);
      }
    },
    midiAccess: {
      fn: function() {
        return new MIDIAccessState({
          parent: this
        });
      }
    },
    signalNames: {
      deps: ['screenView'],
      fn: function () {
        return this.screenView ? this.screenView.signalNames : [];
      }
    },

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
        analyser.minDecibels = -90;
        analyser.maxDecibels = -10;
        analyser.smoothingTimeConstant = 0.85;
        analyser.fftSize = 64;
        return analyser;
      }
    },
    audioAnalyserDataArray: {
      deps: ['audioAnalyser'],
      fn: function () {
        return new window.Uint8Array(this.audioAnalyser.frequencyBinCount);
      }
    }
  },

  session: {
    _animationRequest: 'number',
    currentDetails: 'state'
  },

  play: function() {
    console.info('play', this._animationRequest, this.firstframetime);
    if (this._animationRequest) {
      throw new Error('Animation already played');
    }
    this.firstframetime = this.firstframetime || performance.now();
    return this._animate(this.firstframetime);
  },
  pause: function() {
    console.info('pause', this._animationRequest, this.firstframetime);
    if (this._animationRequest) {
      window.cancelAnimationFrame(this._animationRequest);
    }
    this._animationRequest = null;
    return this;
  },
  stop: function() {
    console.info('stop', this._animationRequest, this.firstframetime);
    this.pause();
    this.firstframetime = 0;
    return this;
  },

  subviews: {
    /*
    MIDIAccess: {
      waitFor: 'el',
      selector: '.midi-access',
      prepareView: function(el) {
        var subview = new window.MIDIAccessView({
          parent: this,
          el: el,
          model: this.midiAccess
        });
        return subview;
      }
    },

    timeline: {
      waitFor: 'el',
      selector: '.timeline',
      prepareView: function(el) {
        return new TimelineView({
          el: el,
          parent: this
        });
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
    */

    controllerSparkline: {
      waitFor: 'el',
      selector: '.fps-controller',
      prepareView: function(el) {
        var styles = window.getComputedStyle(el);
        var view = new SparklineView({
          parent: this,
          color: styles.color
        });
        el.appendChild(view.el);
        return view;
      }
    },

    screenSparkline: {
      waitFor: 'el',
      selector: '.fps-screen',
      prepareView: function(el) {
        var styles = window.getComputedStyle(el);
        var view = new SparklineView({
          parent: this,
          color: styles.color
        });
        el.appendChild(view.el);
        return view;
      }
    },

    screenView: {
      waitFor: 'el',
      selector: '.screen',
      prepareView: function(el) {
        if (this.screenView) {
          this.screenView.remove();
        }

        var screenModel = new ScreenState(this.model.toJSON());
        var screenView = new ScreenView({
          parent: this,
          el: el,
          MIDIAccess: this.midiAccess,
          model: screenModel,
          mode: 'control'
        });
        this.listenTo(screenModel, 'change:latency', function() {
          this.screenSparkline.update(screenModel.latency);
        });

        var p = this.query('.screen-cell').parentNode;
        this.screenCellSensor = new ResizeSensor(p, debounce(function resize() {
          screenView.resize(p);
        }, 50));

        return screenView;
      }
    },

    screenLayersView: {
      waitFor: 'el',
      selector: '.layers .items',
      prepareView: function(el) {
        return this.renderCollection(this.model.screenLayers, function (opts) {
          var type = opts.model.getType();
          var Constructor = LayerControlView[type] || LayerControlView;
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
          var Constructor = SignalControlView[type]|| SignalControlView;
          return new Constructor(opts);
        }, el);
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
    if (this.perfInterval) { clearInterval(this.perfInterval); }
    if (this.screenCellSensor && this.screenCellSensor.detach) { this.screenCellSensor.detach(); }
    View.prototype.remove.apply(this, arguments);
  },

  toJSON: function () {
    return this.screenView.toJSON();
  },

  bindings: {
    _animationRequest: [
      {
        type: 'toggle',
        selector: '[name="play"]',
        invert: true
      },
      // {
      //   type: 'toggle',
      //   selector: '[name="stop"]'
      // },
      {
        type: 'toggle',
        selector: '[name="pause"]'
      }
    ]
  },

  events: {
    'click [name="play"]': 'play',
    'click [name="pause"]': 'pause',
    'click [name="stop"]': 'stop',
    'click [name="debug"]': '_debug',
    'click [name="screen"]': '_openScreen',
    'click [name="ratio"]': '_changeRatio'
  },

  _debug: function() {
    this.screenView.captureDebug = true;
  },

  _openScreen: function() {
    window.open('./screen.html', 'screen');
  },

  _changeRatio: function (evt) {
    var val = evt.target.value;
    this.screenView.ratio = val === '0' ? 0 : (val === '4/3' ? 4/3 : 16/9);
    this.screenView.resize();
  },

  showDetails: function (view) {
    if (view === this.currentDetails) { return this; }
    this.detailsSwitcher.set(view);
    return this;
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

    if (this.perfInterval) {
      clearInterval(this.perfInterval);
    }

    // this.perfInterval = setInterval(function () {
    //   controllerView.jsHeapLimit.textContent = performance.memory.jsHeapSizeLimit * 0.0001;
    //   controllerView.jsHeapTotal.textContent = performance.memory.totalJSHeapSize * 0.0001;
    //   controllerView.jsHeapUsed.textContent = performance.memory.usedJSHeapSize * 0.0001;
    // }, 500);

    return this;
  },

  autoRender: true,

  template: '<div class="controller rows">'+
    '<div class="row columns gutter-horizontal header">'+
      '<div class="column no-grow gutter-right">Visual Fiha</div>'+
      '<div class="column columns">'+
        '<div class="column columns gutter-horizontal no-grow">'+
          '<span class="column columns gutter-horizontal button-group">'+
            '<button class="column gutter-horizontal" name="play"><span class="vfi-play"></span></button>'+
            '<button class="column gutter-horizontal" name="pause"><span class="vfi-pause"></span></button>'+
            '<button class="column gutter-horizontal" name="stop"><span class="vfi-stop"></span></button>'+
          '</span>'+
        '</div>'+
        '<div class="column columns gutter-horizontal no-grow">'+
          '<span class="column">Screen ratio</span>'+
          '<span class="column columns gutter-horizontal button-group">'+
            '<button class="column gutter-horizontal" name="ratio" value="16/9">16/9</button>'+
            '<button class="column gutter-horizontal" name="ratio" value="4/3">4/3</button>'+
            '<button class="column gutter-horizontal" name="ratio" value="0">free</button>'+
          '</span>'+
          '<div class="column gutter-left">'+
            '<button name="screen">Open screen</button>'+
          '</div>'+
        '</div>'+
        '<div class="column gutter-horizontal no-grow columns performance">'+
          'Screen <span class="column fps-screen"></span>'+
          'Controller <span class="column fps-controller"></span>'+
        '</div>'+
      '</div>'+
      '<div class="column gutter-horizontal">'+
        '<button name="debug">Debug</button>'+
      '</div>'+
    '</div>'+
    '<div class="row columns body">'+
      '<div class="column grow-l rows">'+
        '<div class="row no-grow screen-cell">'+
          '<div class="screen"></div>'+
        '</div>'+
        '<div class="row details"></div>'+
        '<div class="row debug no-grow"></div>'+
      '</div>'+
      '<div class="column rows settings">'+
        '<div class="row columns">'+
          '<div class="column rows">'+
            '<div class="row layers">'+
              '<div class="section-name gutter">Layers</div>'+
              '<div class="columns gutter">'+
                '<div data-hook="type" data-placeholder="Type" contenteditable="true" class="column gutter-right">'+
                '</div>'+
                '<div class="column no-grow gutter-left">'+
                  '<button name="add-layer" class="vfi-plus"></button>'+
                '</div>'+
              '</div>'+
              '<div class="items"></div>'+
            '</div>'+
          '</div>'+
          '<div class="column rows">'+
            '<div class="row signals">'+
              '<div class="section-name gutter">Signals</div>'+
              '<div class="columns gutter">'+
                '<div data-hook="type" data-placeholder="Type" contenteditable="true" class="column gutter-right">'+
                '</div>'+
                '<div class="column no-grow gutter-left">'+
                  '<button name="add-signal" class="vfi-plus"></button>'+
                '</div>'+
              '</div>'+
              '<div class="items"></div>'+
            '</div>'+
          '</div>'+
        '</div>'+
        '<div class="row no-grow audio-source">'+
          '<audio controls colume="0.5"></audio>'+
        '</div>'+
      '</div>'+
    '</div>'+
  '</div>'
});
module.exports = ControllerView;