'use strict';
var View = require('./control-view');
var ViewSwitcher = require('ampersand-view-switcher');
var MIDIAccessView = require('./../midi/view');
var SignalsView = require('./../signal/signals-view');
var LayersView = require('./../layer/layers-view');
var SuggestionView = require('./suggestion-view');
var AudioSource = require('./audio-source-view');
var AceEditor = require('./ace-view');
var RegionView = require('./region-view');
var GistView = require('./gist-view');
var MappingsControlView = require('./../mapping/control-view');
var ControlScreenControls = require('./control-screen-controls-view');
var LocalforageView = require('./localforage-view');
var objectPath = require('./../object-path');
// var Timeline = require('./timeline-view');





var ControllerView = View.extend({
  initialize: function(options) {
    var controllerView = this;
    this.signals = options.signals;
    this.midi = options.midi;
    this.mappings = options.mappings;
    if (!this.router) {
      throw new Error('Missing router options for ControllerView');
    }

    this.listenTo(this.router, 'all', function(...args) {
      if (args[0].indexOf('app:') === 0) this.trigger(...args);
    });

    [
      'minDecibels',
      'maxDecibels',
      'smoothingTimeConstant',
      'fftSize'
    ].forEach(function(name) {
      controllerView.on('change:' + name, function () {
        if (!controllerView.audioAnalyser) return;
        controllerView.audioAnalyser[name] = controllerView[name];
      });
    }, controllerView);


    controllerView._animate();

    if (options.autoStart) {
      controllerView.play();
    }

    if (controllerView.el) {
      controllerView._attachSuggestionHelper();
    }
    else {
      controllerView.once('change:el', controllerView._attachSuggestionHelper);
    }

    controllerView.listenTo(controllerView.model.layers, 'sendCommand', function(...args) {
      controllerView.sendCommand(...args);
    });

    this._animate();
  },

  midiSources: function() {
    var eventNames = [];
    this.midi.inputs.forEach(function(midiInput) {
      var id = midiInput.getId();
      eventNames = eventNames.concat(midiInput.mappable.source.map(function(property) {
        return 'midi:' + id + '.' + property;
      }));
    });
    return eventNames;
  },

  sendCommand: function(name, payload, callback) {
    if (!this.router || !this.router.worker) return;
    this.router.sendCommand(name, payload, callback);
    return this;
  },

  _animate: function(timestamp) {
    if (this.controllerSparkline) {
      this.controllerSparkline.update(1000 / ((timestamp - this.model.frametime) - this.model.firstframetime));
    }

    if (this.audioSource) {
      this.audioSource.update();
    }

    this.model.frametime = timestamp - this.model.firstframetime;
    this.update();

    this._arId = window.requestAnimationFrame(this._animate.bind(this));
  },

  update: function() {
    var analyser = this.audioAnalyser;

    var freqArray = this.audioFrequencyArray;
    analyser.getByteFrequencyData(freqArray);

    var timeDomainArray = this.audioTimeDomainArray;
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
        try {
          analyser.minDecibels = this.minDecibels;
          analyser.maxDecibels = this.maxDecibels;
          analyser.smoothingTimeConstant = this.smoothingTimeConstant;
          analyser.fftSize = this.fftSize;
        }
        catch (e) {}
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
    },
    computedStyle: {
      deps: ['el'],
      fn: function() {
        return window.getComputedStyle(this.el);
      }
    }
  },

  session: {
    _arId: 'number',
    broadcastId: ['string', true, 'vfBus'],
    currentDetails: 'state',
    fftSize: ['number', true, 256],
    maxDecibels: ['number', true, -10],
    minDecibels: ['number', true, -90],
    playing: ['boolean', true, false],
    router: 'any',
    showControlScreen: ['boolean', true, false],
    controlScreenWidth: ['number', true, 33],
    controlScreenHeight: ['number', true, 33],
    smoothingTimeConstant: ['number', true, 0.85],
    workerPerformance: 'string'
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
    controlScreenControls: {
      waitFor: 'el',
      selector: '.control-screen-controls',
      prepareView: function(el) {
        if (this.router) {
          this.set({
            showControlScreen: this.router.settings.get('showControlScreen', true),
            controlScreenWidth: this.router.settings.get('controlScreenWidth', 45),
            controlScreenHeight: this.router.settings.get('controlScreenHeight', 45)
          });
        }

        var view = new ControlScreenControls({
          el: el,
          active: this.showControlScreen,
          width: this.controlScreenWidth,
          height: this.controlScreenHeight,
          parent: this
        });

        this.listenToAndRun(view, 'change:active', function() {
          this.showControlScreen = view.active;
          if (this.router) {
            this.router.settings.set('showControlScreen', this.showControlScreen);
          }
        });
        this.listenToAndRun(view, 'change:width', function() {
          this.controlScreenWidth = view.width;
          if (this.router) {
            this.router.settings.set('controlScreenWidth', this.controlScreenWidth);
          }
        });
        this.listenToAndRun(view, 'change:height', function() {
          this.controlScreenHeight = view.height;
          if (this.router) {
            this.router.settings.set('controlScreenHeight', this.controlScreenHeight);
          }
        });
        return view;
      }
    },

    regionRight: {
      waitFor: 'el',
      selector: '.region-right',
      prepareView: function(el) {
        var parent = this;
        function buildLayers() {
          if (parent.layersView && parent.layersView.remove) {
            parent.layersView.remove();
            parent.stopListening(parent.layersView);
          }
          parent.layersView = new LayersView({
            collection: parent.model.layers,
            parent: parent,
            model: parent.model
          });
          return parent.layersView;
        }

        parent.mappingsView = new MappingsControlView({
          collection: parent.mappings,
          parent: parent,
          model: parent.model
        });

        function buildSignals() {
          if (parent.signalsView && parent.signalsView.remove) {
            parent.signalsView.remove();
            parent.stopListening(parent.signalsView);
          }
          parent.signalsView = new SignalsView({
            collection: parent.signals,
            parent: parent,
            model: parent.model
          });
          return parent.signalsView;
        }

        function buildCodeEditor() {
          if (parent.codeEditor) {
            parent.stopListening(parent.codeEditor);
          }
          parent.codeEditor = new AceEditor({
            parent: parent
          });
          return parent.codeEditor;
        }

        var view = new RegionView({
          parent: parent,
          el: el,
          tabs: [
            {name: 'Layers', rebuild: buildLayers, pinned: true, active: true},
            {name: 'Signals', rebuild: buildSignals, pinned: true},
            {name: 'Mappings', view: parent.mappingsView, pinned: true},
            {name: 'Editor', rebuild: buildCodeEditor, pinned: true}
          ]
        });

        view.el.classList.add('region-right');
        view.el.classList.add('column');
        view.el.classList.add('rows');

        return view;
      }
    },

    regionLeftBottom: {
      waitFor: 'el',
      selector: '.region-left-bottom',
      prepareView: function(el) {
        var parent = this;
        var styles = window.getComputedStyle(el);

        function buildAudioSource() {
          parent.audioSource = new AudioSource({
            audioAnalyser: parent.audioAnalyser,
            parent: parent,
            color: styles.color
          });
          return parent.audioSource;
        }
        buildAudioSource();

        if (parent.midi) {
          parent.MIDIAccess = new MIDIAccessView({
            parent: parent,
            model: parent.midi
          });
        }

        // parent.timeline = new Timeline({
        //   parent: this,
        //   entries: []
        // });

        var view = new RegionView({
          parent: parent,
          el: el,
          currentView: parent.mappingsView,
          tabs: [
            {name: 'MIDI', view: parent.MIDIAccess, pinned: true, active: true},
            {name: 'Audio', rebuild: buildAudioSource, pinned: true},
            // {name: 'Timeline', view: parent.timeline, pinned: true, active: true}
          ]
        });

        view.el.classList.add('row');
        view.el.classList.add('grow-l');
        view.el.classList.add('region-left-bottom');

        return view;
      }
    },

    localforageView: {
      waitFor: 'el',
      selector: '.controller > .header',
      prepareView: function(el) {
        var view = new LocalforageView({parent: this, model: this.model});
        el.appendChild(view.render().el);
        return view;
      }
    },

    gistView: {
      waitFor: 'el',
      selector: '.controller > .header',
      prepareView: function(el) {
        var view = new GistView({parent: this, model: this.model});
        el.appendChild(view.render().el);
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
    workerPerformance: '.worker-performance',
    showControlScreen: [
      {
        selector: '.control-screen',
        type: 'toggle'
      },
      {
        selector: '.control-screen',
        type: function(el, val) {
          el.src = !val ? '' : './screen.html#' + this.broadcastId;
        }
      }
    ],
    controlScreenWidth: {
      selector: '.region-left',
      type: function(el, val) {
        el.style.width = val +'%';
      }
    },
    controlScreenHeight: {
      selector: '.region-left-top',
      type: function(el, val) {
        var parentNode = el.parentNode;
        var height = ((Math.max(100, parentNode.clientHeight) / 100) * val) +'px';
        el.style.maxHeight = height;
        el.style.minHeight = height;
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
    ]
  },

  commands: {
    'click [name="play"]': 'play',
    'click [name="pause"]': 'pause',
    'click [name="stop"]': 'stop'
  },

  events: {
    'click [name="screen"]': '_openScreen',
    'click [name="setup-editor"]': '_setupEditor'
  },

  _openScreen: function() {
    window.open('./screen.html#' + this.broadcastId, 'screen', 'width=800,height=600,location=no');
  },

  toJSON: function() {
    return {
      signals: this.signals.toJSON(),
      mappings: this.mappings.toJSON(),
      layers: this.model.layers.toJSON()
    };
  },

  fromJSON: function(obj) {
    this.router._sendBootstrap(obj);
    return this;
  },



  getEditor: function() {
    this.regionRight.focusTab('Editor');
    return this.codeEditor;
  },

  _setupEditor: function() {
    var view = this;
    var editor = view.getEditor();

    editor.editCode({
      script: view.gistView.toYaml(),
      language: 'yaml',
      onvalidchange: view.gistView.fromYaml
    });
  },

  showDetails: function (view) {
    if (view === this.currentDetails) return this;
    var tabs = this.regionLeftBottom.tabs;
    var tabName = view.modelPath || objectPath(view.model);
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
  template: `
    <div class="controller rows">
      <div class="row columns gutter-horizontal header">
        <div class="column no-grow gutter-right">Visual Fiha</div>

        <div class="column columns">
          <!-- <span class="column columns no-grow button-group">
            <button class="column gutter-horizontal" name="play"><span class="vfi-play"></span></button>
            <button class="column gutter-horizontal" name="pause"><span class="vfi-pause"></span></button>
            <button class="column gutter-horizontal" name="stop"><span class="vfi-stop"></span></button>
          </span> -->

          <div class="column"></div>

          <div class="column worker-performance"></div>

          <div class="column no-grow control-screen-controls"></div>

          <div class="column no-grow">
            <button name="screen">Open screen</button>
          </div>

          <div class="column"></div>

          <div class="column no-grow">
            <button name="setup-editor">Setup editor</button>
          </div>
        </div>
      </div>

      <div class="row columns body">
        <div class="region-left column no-grow rows">
          <iframe class="region-left-top row control-screen"></iframe>

          <div class="region-left-bottom row grow-l rows"></div>
        </div>

        <div class="region-right column rows settings">
        </div>
      </div>
    </div>
  `
});
module.exports = ControllerView;