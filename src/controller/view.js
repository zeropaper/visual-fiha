'use strict';
var View = require('./control-view');
var MIDIAccessView = require('./../midi/view');
var SignalsView = require('./../signal/signals-view');
var LayersView = require('./../layer/layers-view');
var SuggestionView = require('./suggestion-view');
var AudioSource = require('./audio-source-view');
var AceEditor = require('./ace-view');
var RegionView = require('./region-view');
var MappingsControlView = require('./../mapping/control-view');
var MenuView = require('./menu/view');
var objectPath = require('./../utils/object-path');
var fromYaml = require('./../utils/yaml-to-setup');
var toYaml = require('./../utils/setup-to-yaml');
var ControlScreenControls = require('./control-screen-controls-view');
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

  _animate: function() {
    if (this.audioSource) {
      this.audioSource.update();
    }

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
    currentEditor: 'state',
    currentDetails: 'state',
    fftSize: ['number', true, 256],
    maxDecibels: ['number', true, -10],
    minDecibels: ['number', true, -90],
    playing: ['boolean', true, false],
    router: 'any',
    showControlScreen: ['boolean', true, false],
    controlScreenWidth: ['number', true, 400],
    controlScreenHeight: ['number', true, 300],
    smoothingTimeConstant: ['number', true, 0.85],
    workerPerformance: 'string'
  },

  play: function() {
    this.playing = true;
    return this;
  },
  pause: function() {
    this.playing = false;
    return this;
  },
  stop: function() {
    this.playing = false;
    return this;
  },

  subviews: {
    controlScreenControls: {
      waitFor: 'el',
      selector: '.control-screen-controls',
      prepareView: function() {
        var controllerView = this;
        var router = controllerView.router;
        var settings = router.settings;

        if (router) {
          controllerView.set({
            showControlScreen: settings.get('showControlScreen', true),
            controlScreenWidth: settings.get('controlScreenWidth', 400),
            controlScreenHeight: settings.get('controlScreenHeight', 300)
          });
        }

        var view = new ControlScreenControls({
          active: controllerView.showControlScreen,
          width: controllerView.controlScreenWidth,
          height: controllerView.controlScreenHeight,
          parent: controllerView
        });

        this.listenToAndRun(view, 'change:active', function() {
          controllerView.showControlScreen = view.active;
          if (router) {
            settings.set('showControlScreen', controllerView.showControlScreen);
          }
        });
        this.listenToAndRun(view, 'change:width', function() {
          controllerView.controlScreenWidth = view.width;
          if (router) {
            settings.set('controlScreenWidth', controllerView.controlScreenWidth);
          }
        });
        this.listenToAndRun(view, 'change:height', function() {
          controllerView.controlScreenHeight = view.height;
          if (router) {
            settings.set('controlScreenHeight', controllerView.controlScreenHeight);
          }
        });
        return view;
      }
    },

    menuView: {
      waitFor: 'el',
      selector: '.vf-app-menu',
      prepareView: function(el) {
        var view = new MenuView({
          parent: this,
          el: el
        });
        return view;
      }
    },

    regionRight: {
      waitFor: 'el',
      selector: '.region-right',
      prepareView: function(el) {
        var parent = this;

        parent.mappingsView = new MappingsControlView({
          collection: parent.mappings,
          parent: parent,
          model: parent.model
        });

        function buildCodeEditor() {
          parent.codeEditor = parent.codeEditor || new AceEditor({
            parent: parent
          });
          var editor = parent.codeEditor;

          editor.editCode({
            autoApply: false,
            title: 'Setup',
            script: parent.toYaml(),
            language: 'yaml',
            onapply: function(str) {
              parent.listenToOnce(parent.router, 'app:worker:yamlLoad', function(payload) {
                parent.fromJSON(payload.setup);
                editor.script = parent.toYaml();
                editor.setPristine();
              });
              parent.sendCommand('yamlLoad', {yamlStr: str});
            }
          });
          return editor;
        }

        var view = new RegionView({
          parent: parent,
          el: el,
          tabs: [
            {name: 'Setup', rebuild: buildCodeEditor, pinned: true, active: true},
            {name: 'Mappings', view: parent.mappingsView, pinned: true}
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
        var styles = this.computedStyle;
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

        var view = new RegionView({
          parent: parent,
          el: el,
          currentView: parent.mappingsView,
          tabs: [
            {name: 'Layers', rebuild: buildLayers, pinned: true, active: true},
            {name: 'Signals', rebuild: buildSignals, pinned: true},
            {name: 'MIDI', view: parent.MIDIAccess, pinned: true},
            {name: 'Audio', rebuild: buildAudioSource, pinned: true}
          ]
        });

        view.el.classList.add('row');
        view.el.classList.add('grow-l');
        view.el.classList.add('region-left-bottom');

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
        el.style.width = val +'px';
      }
    },
    controlScreenHeight: {
      selector: '.region-left-top',
      type: function(el, val) {
        var height = val +'px';
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
    'click .vf-app-name': '_openMenu',
    'click [name="screen"]': '_openScreen',
    'click [name="start-tour"]': '_startTour'
  },

  _openMenu: function(evt) {
    evt.preventDefault();
    this.menuView.open();
  },

  _openScreen: function() {
    window.open('./screen.html#' + this.broadcastId, 'screen', 'width=800,height=600,location=no');
  },

  _startTour: function() {
    this.router.navigate('tour');
  },


  fromYaml: fromYaml,

  toYaml: function(setup) {
    return toYaml(setup || this.toJSON());
  },

  toJSON: function() {
    return {
      signals: this.signals.toJSON(),
      mappings: this.mappings.toJSON(),
      layers: this.model.layers.toJSON()
    };
  },

  fromJSON: function(json) {
    this.model.layers.reset(json.layers);
    this.signals.reset(json.signals);
    this.mappings.reset(json.mappings);
  },

  getSetupEditor: function(setup) {
    var editor = this.regionRight.focusTab('Setup');
    editor.script = this.toYaml(setup);
    editor.setPristine();
    return editor;
  },

  getEditor: function(options) {
    var tabs = this.regionRight.tabs;
    var tabName = options.tabName;
    if (!tabName) throw Error('Missing tabName for getEditor');

    var found = tabs.get(tabName);
    if (!found) {
      var editor = new AceEditor({
        parent: this
      });
      this.registerSubview(editor);
      found = tabs.add({name: tabName, view: editor});
    }

    this.regionRight.focusTab(tabName);
    found.view.editCode(options);
    return found.view;
  },

  showDetails: function (view) {
    if (view === this.currentDetails) return this;
    var region = this.regionRight;
    var tabs = region.tabs;
    var tabName = view.modelPath || objectPath(view.model);
    var found = tabs.get(tabName);
    if (!found) {
      found = tabs.add({name: tabName, view: view});
    }
    else {
      found.view = view;
    }

    region.focusTab(tabName);
    found.view.blink();
    return this;
  },

  render: function () {
    this.renderWithTemplate();

    this.cacheElements({
      jsHeapLimit: '.heap-limit span',
      jsHeapTotal: '.heap-total span',
      jsHeapUsed: '.heap-used span',
      detailsEl: '.details'
    });


    return this;
  },

  autoRender: true,

  /*
  :sout=#http{dst=:8080/stream} :sout-keep
  */
  template: `
    <div class="controller rows">
      <div class="vf-app-menu"></div>
      <div class="row columns header no-grow">
        <a href class="column gutter no-grow vf-app-name">Visual Fiha <span class="hamburger-menu"><span></span></span></a>

        <div class="column columns">
          <!-- <span class="column columns no-grow button-group">
            <button class="column gutter-horizontal" name="play"><span class="vfi-play"></span></button>
            <button class="column gutter-horizontal" name="pause"><span class="vfi-pause"></span></button>
            <button class="column gutter-horizontal" name="stop"><span class="vfi-stop"></span></button>
          </span> -->

          <div class="column gutter worker-performance"></div>

          <div class="column no-grow control-screen-controls"></div>

          <div class="column no-grow">
            <button name="screen">Open screen</button>
          </div>

          <div class="column"></div>

          <div class="column no-grow">
            <button name="start-tour" class="vfi-info-circled"></button>
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