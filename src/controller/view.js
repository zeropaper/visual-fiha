'use strict';
var View = VFDeps.View;
var debounce = VFDeps.debounce;
var ResizeSensor = VFDeps.ResizeSensor;

var ScreenView = require('./../screen/view');
var ScreenState = require('./../screen/state');
var MIDIAccessState = require('./../midi/state');
var MIDIAccessView = require('./../midi/view');
var LayerControlView = require('./../layer/control-view');
require('./../layer/canvas/control-view');
// require('./../layer/video/control-view');
// require('./../layer/img/control-view');
// require('./../layer/svg/control-view');
var SignalControlView = require('./../signal/control-view');
require('./../signal/beat/control-view');
require('./../signal/hsla/control-view');
require('./../signal/rgba/control-view');

var SuggestionView = require('./suggestion-view');
var SparklineView = require('./sparkline-view');
var AudioMonitor = require('./audio-monitor-view');
var AceEditor = require('./ace-view');
// var TimelineView = require('./timeline-view');


var MultiMappingControlView = require('./../mappable/multi-control-view');






var ControllerView = View.extend({
  initialize: function(options) {
    var controllerView = this;

    controllerView.model = controllerView.model || new ScreenState({
      screenLayers: options.screenLayers,
      screenSignals: options.screenSignals
    });
    controllerView.model.signals = {};

    if (window.BroadcastChannel) {
      controllerView.channel = new window.BroadcastChannel(this.broadcastId);
    }

    navigator.getUserMedia({
      audio: true
    }, function(stream) {
      var source = controllerView.audioContext.createMediaStreamSource(stream);
      source.connect(controllerView.audioAnalyser);
    }, function(err) {
      console.info('The following gUM error occured: ' + err);
    });

    if (controllerView.el) {
      controllerView._attachSuggestionHelper();
    }
    else {
      controllerView.once('change:el', controllerView._attachSuggestionHelper);
    }

    controllerView.model.signals.midi = {};
    controllerView.listenToAndRun(controllerView.midiAccess, 'midi', function(evtName, value) {
      controllerView.model.signals.midi[evtName] = value;
      controllerView.model.trigger(evtName, value);
    });

    if (options.autoStart !== false) {
      controllerView.play();
    }
  },

  _animate: function(timestamp) {
    if (this.controllerSparkline) {
      this.controllerSparkline.update((timestamp - this.model.frametime) - this.model.firstframetime);
    }
    if (this.screenSparkline) {
      this.screenSparkline.update(this.screenView.model.latency);
    }

    this.model.frametime = timestamp - this.model.firstframetime;
    this.update();
    this._arId = window.requestAnimationFrame(this._animate.bind(this));
  },

  update: function() {
    var analyser = this.audioAnalyser;
    var bufferLength = analyser.frequencyBinCount;
    var dataArray = this.audioAnalyserDataArray;
    analyser.getByteFrequencyData(dataArray);

    this.model.signals.mic = {};
    for(var i = 0; i < bufferLength; i++) {
      this.model.signals.mic['mic:' + i] = dataArray[i];
      this.model.trigger('mic:' + i, dataArray[i]);
    }

    var posted = this.model.serialize();
    this.channel.postMessage(posted);
  },

  derived: {
    playing: {
      deps: ['_arId'],
      fn: function() {
        return !!this._arId;
      }
    },
    computedStyle: {
      deps: ['el'],
      fn: function() {
        return window.getComputedStyle(this.el);
      }
    },
    signalNames: {
      deps: ['screenView'],
      fn: function () {
        var mic = [];
        var analyser = this.audioAnalyser;
        var bufferLength = analyser.frequencyBinCount;
        for(var i = 0; i < bufferLength; i++) {
          mic.push('mic:' + i);
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

  children: {
    midiAccess: MIDIAccessState
  },

  session: {
    broadcastId: ['string', true, 'vfBus'],
    _arId: 'number',
    currentDetails: 'state'
  },

  play: function() {
    console.info('play', this._arId, this.model.firstframetime);
    if (this._arId) {
      throw new Error('Animation already played');
    }
    this.model.firstframetime = this.model.firstframetime || performance.now();
    return this._animate(this.model.firstframetime);
  },
  pause: function() {
    console.info('pause', this._arId, this.model.firstframetime);
    if (this._arId) {
      window.cancelAnimationFrame(this._arId);
    }
    this._arId = null;
    return this;
  },
  stop: function() {
    console.info('stop', this._arId, this.model.firstframetime);
    this.pause();
    this.model.firstframetime = 0;
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

    /*
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
    */

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

        this.listenToAndRun(this.model, 'change:frametime', function() {
          view.update();
        });

        return view;
      }
    },

    controllerSparkline: {
      waitFor: 'el',
      selector: '.fps-controller',
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

    screenSparkline: {
      waitFor: 'el',
      selector: '.fps-screen',
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
          // MIDIAccess: this.midiAccess,
          model: screenModel,
          mode: 'control'
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
    },

    multiMappings: {
      waitFor: 'el',
      selector: '.multi-mapping',
      prepareView: function(el) {
        var view = new MultiMappingControlView({
          parent: this,
          el: el
        });
        view.listenTo(view.mappings, 'all', function(evtName) {
          console.info('mutli mapping collection evt', evtName);
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
    if (this.perfInterval) { clearInterval(this.perfInterval); }
    if (this.screenCellSensor && this.screenCellSensor.detach) { this.screenCellSensor.detach(); }
    View.prototype.remove.apply(this, arguments);
  },

  toJSON: function () {
    return this.screenView.toJSON();
  },

  bindings: {
    _arId: [
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
    'click [name="ratio"]': '_changeRatio',
    'click [name="add-layer"]': '_addLayer',
    'click [name="add-signal"]': '_addSignal'
  },

  _debug: function() {
    this.screenView.captureDebug = true;
  },

  _openScreen: function() {
    window.open('./screen.html#' + this.broadcastId, 'screen', 'width=800,height=600,location=no');
  },

  _changeRatio: function (evt) {
    var val = evt.target.value;
    this.screenView.ratio = val === '0' ? 0 : (val === '4/3' ? 4/3 : 16/9);
    this.screenView.resize();
  },

  addMultiMapping: function(mappingModel) {
    console.info('add multi mapping', mappingModel.targetProperty, mappingModel.targetModel);
    this.multiMappings.mappings.add({
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

    if (this.perfInterval) {
      clearInterval(this.perfInterval);
    }

    // this.perfInterval = setInterval(function () {
    //   controllerView.jsHeapLimit.value = performance.memory.jsHeapSizeLimit * 0.0001;
    //   controllerView.jsHeapTotal.value = performance.memory.totalJSHeapSize * 0.0001;
    //   controllerView.jsHeapUsed.value = performance.memory.usedJSHeapSize * 0.0001;
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
      '<div class="column no-grow rows">'+
        '<div class="row grow-l screen-cell">'+
          '<div class="screen"></div>'+
        '</div>'+
        '<div class="row no-grow details"></div>'+
        '<div class="row debug"></div>'+
      '</div>'+
      '<div class="column rows settings">'+
        '<div class="row columns">'+
          '<div class="column rows">'+
            '<div class="row layers">'+
              '<div class="section-name gutter">Layers</div>'+
              '<div class="columns gutter">'+
                '<div class="column gutter-right">' +
                  '<input data-hook="layer-name" placeholder="Name" type="text"/>'+
                '</div>' +
                '<div class="column gutter-horizontal">' +
                  '<input data-hook="layer-type" placeholder="Type" type="text"/>'+
                '</div>' +
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
                '<div class="column gutter-right">' +
                  '<input data-hook="signal-name" placeholder="Name" type="text"/>'+
                '</div>' +
                '<div class="column gutter-horizontal">' +
                  '<input data-hook="signal-type" placeholder="Type" type="text"/>'+
                '</div>' +
                '<div class="column no-grow gutter-left">'+
                  '<button name="add-signal" class="vfi-plus"></button>'+
                '</div>'+
              '</div>'+
              '<div class="items"></div>'+
            '</div>'+
          '</div>'+
        '</div>'+


        '<div class="row no-grow columns">'+
          '<div class="multi-mapping"></div>' +
        '</div>'+


        '<div class="row no-grow columns">'+
          '<div class="column midi-access"></div>'+
          '<div class="column audio-source">'+
            '<div class="audio-monitor"></div>'+
            '<audio controls muted></audio>'+
          '</div>'+
        '</div>'+
      '</div>'+
    '</div>'+
  '</div>'
});
module.exports = ControllerView;