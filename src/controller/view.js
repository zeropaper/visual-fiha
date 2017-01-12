'use strict';
var View = VFDeps.View;
var ViewSwitcher = VFDeps.ViewSwitcher;
var ScreenState = require('./../screen/state');
var MIDIAccessState = require('./../midi/state');
var MIDIAccessView = require('./../midi/view');
var SignalsView = require('./signals-view');
var LayersView = require('./layers-view');
var SuggestionView = require('./suggestion-view');
var SparklineView = require('./sparkline-view');
var AudioSource = require('./audio-source-view');
var AceEditor = require('./ace-view');
var RegionView = require('./region-view');

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
        layers: controllerView.model.layers.serialize()
      });

      controllerView.sendCommand('resetSignals', {
        signals: controllerView.model.signals.serialize()
      });
    }, false);




    controllerView._bindLayerEvents();
    controllerView.model.set({
      signals: options.signals,
      layers: options.layers,
      midi: controllerView.midiAccess
    });



    controllerView.listenTo(controllerView.midiAccess, 'midi', function(evtName, value) {
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

    controllerView.listenTo(controllerView.model.layers, 'add', function(state) {
      controllerView.sendCommand('addLayer', {
        layer: state.serialize()
      });
    });

    controllerView.listenTo(controllerView.model.layers, 'remove', function(state) {
      controllerView.sendCommand('addLayer', {
        layerName: state.name
      });
    });

    controllerView.listenTo(controllerView.model.layers, 'change:layer', function(state) {
      if (!state) return;

      var changed = state.changedAttributes();
      if (!Object.keys(changed).length) {
        changed = state.serialize();
      }
      delete changed.uiState;
      if (!Object.keys(changed).length) return;

      controllerView.sendCommand('updateLayer', {
        layer: changed,
        layerName: state.name
      });
    });

    return this;
  },

  _animate: function(timestamp) {
    if (this.controllerSparkline) {
      this.controllerSparkline.update(1000 / ((timestamp - this.model.frametime) - this.model.firstframetime));
    }

    if (this.audioSource) {
      this.audioSource.update();
    }

    if (this.playing) {
      this.model.frametime = timestamp - this.model.firstframetime;

      this.update();
    }

    this._arId = window.requestAnimationFrame(this._animate.bind(this));
  },

  update: function() {
    var analyser = this.audioSource.audioAnalyser;

    var freqArray = this.audioSource.audioFrequencyArray;
    analyser.getByteFrequencyData(freqArray);

    var timeDomainArray = this.audioSource.audioTimeDomainArray;
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
    }
  },

  children: {
    midiAccess: MIDIAccessState
  },

  session: {
    playing: ['boolean', true, false],
    broadcastId: ['string', true, 'vfBus'],
    showControlScreen: ['boolean', true, false],
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
    regionRight: {
      waitFor: 'el',
      selector: '.region-right',
      prepareView: function(el) {
        this.layersView = new LayersView({
          collection: this.model.layers,
          parent: this
        });

        this.signalsView = new SignalsView({
          collection: this.model.signals,
          parent: this
        });

        this.codeEditor = new AceEditor({
          parent: this
        });

        var view = new RegionView({
          parent: this,
          el: el,
          currentView: this.layersView,
          tabs: [
            {name: 'Layers', view: this.layersView, pinned: true, active: true},
            {name: 'Signals', view: this.signalsView, pinned: true},
            {name: 'Editor', view: this.codeEditor, pinned: true}
          ]
        });

        view.el.classList.add('region-right');
        view.el.classList.add('column');
        view.el.classList.add('rows');

        this.listenTo(this.codeEditor, 'change:original', function() {
          view.focusTabIndex(1);
        });

        return view;
      }
    },

    regionLeftBottom: {
      waitFor: 'el',
      selector: '.region-left-bottom',
      prepareView: function(el) {
        var styles = window.getComputedStyle(el);

        this.audioSource = new AudioSource({
          audioAnalyser: this.audioAnalyser,
          parent: this,
          color: styles.color
        });

        this.MIDIAccess = new MIDIAccessView({
          parent: this,
          model: this.midiAccess
        });

        this.mappingsView = new MappingsControlView({
          collection: mappings,
          parent: this,
          model: this.model
        });

        var view = new RegionView({
          parent: this,
          el: el,
          currentView: this.mappingsView,
          tabs: [
            {name: 'Mappings', view: this.mappingsView, pinned: true, active: true},
            {name: 'MIDI', view: this.MIDIAccess, pinned: true},
            {name: 'Audio', view: this.audioSource, pinned: true}
          ]
        });

        view.el.classList.add('row');

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

  bindings: {
    showControlScreen: [
      {
        selector: '.control-screen',
        type: function(el, val) {
          el.src = !val ? '' : './screen.html#' + this.broadcastId;
        }
      },
      {
        selector: 'button[name=control-screen]',
        type: 'booleanClass',
        yes: 'yes',
        no: 'no'
      }
    ],
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
    ]
  },

  events: {
    'click [name="play"]': 'play',
    'click [name="pause"]': 'pause',
    'click [name="stop"]': 'stop',
    'click [name="resize"]': 'resizeScreen',
    'click [name="screen"]': '_openScreen',
    'click [name="control-screen"]': '_toggleControlScreen',
  },

  _openScreen: function() {
    window.open('./screen.html#' + this.broadcastId, 'screen', 'width=800,height=600,location=no');
  },

  _toggleControlScreen: function() {
    this.toggle('showControlScreen');
  },
  addMultiMapping: function(mappingModel) {
    this.mappingsView.mappings.add({
      targetModel: mappingModel.targetModel,
      targetProperty: mappingModel.targetProperty
    });
  },

  showDetails: function (view) {
    if (view === this.currentDetails) return this;
    var tabs = this.regionLeftBottom.tabs;
    var tabName = this.mappingsView.collection.objectPath(view.model);
    var found = tabs.get(tabName);
    if (!found) {
      found = tabs.add({name: tabName, view: view});
    }
    else {
      found.view = view;
    }

    this.regionLeftBottom.focusTab(tabName);

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

    this.detailsSwitcher = new ViewSwitcher(this.detailsEl, {
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

        '<div class="column no-grow">'+
          '<button name="screen">Open screen</button>'+
        '</div>'+

        '<div class="column no-grow">'+
          '<button name="control-screen">Control screen</button>'+
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

        '<div class="region-left-bottom row rows"></div>'+
      '</div>'+

      '<div class="region-right column rows settings">'+


      '</div>'+
    '</div>'+
  '</div>'
});
module.exports = ControllerView;
