'use strict';
var View = require('./control-view');
var ViewSwitcher = require('ampersand-view-switcher');
var MIDIAccessView = require('./../midi/view');
var SignalsView = require('./../signal/signals-view');
var LayersView = require('./../layer/layers-view');
var SuggestionView = require('./suggestion-view');
var SparklineView = require('./sparkline-view');
var AudioSource = require('./audio-source-view');
var AceEditor = require('./ace-view');
var RegionView = require('./region-view');
var GistView = require('./gist-view');
var mappings = require('./../mapping/service');
var MappingsControlView = require('./../mapping/control-view');
var jsYAML = require('js-yaml');

var ControllerView = View.extend({
  initialize: function(options) {
    var controllerView = this;

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


    controllerView._bindLayerEvents();

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
  },

  sendCommand: function(name, payload, callback) {
    if (!this.router || !this.router.worker) return;
    this.router.sendCommand(name, payload, callback);
    return this;
  },

  _bindLayerEvents: function() {
    // var controllerView = this;

    // controllerView.listenTo(controllerView.model.layers, 'add', function(state) {
    //   var data = state.serialize();
    //   if (!data) {
    //     console.warn('addLayer no layer data');
    //   }
    //   controllerView.sendCommand('addLayer', {
    //     layer: data
    //   });
    // });

    // controllerView.listenTo(controllerView.model.layers, 'remove', function(state) {
    //   var layerName = state.name;
    //   if (!layerName) {
    //     console.warn('removeLayer no layer data');
    //   }
    //   controllerView.sendCommand('removeLayer', {
    //     layerName: layerName
    //   });
    // });

    // controllerView.listenTo(controllerView.model.layers, 'change:layer', function(state) {
    //   if (!state) return;

    //   var changed = state.changedAttributes();
    //   if (!Object.keys(changed).length) {
    //     changed = state.serialize();
    //   }
    //   if (!Object.keys(changed).length) return;

    //   controllerView.sendCommand('updateLayer', {
    //     layer: changed,
    //     layerName: state.name
    //   });
    // });

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
    },
    computedStyle: {
      deps: ['el'],
      fn: function() {
        return window.getComputedStyle(this.el);
      }
    }
  },

  session: {
    router: 'any',
    minDecibels: ['number', true, -90],
    maxDecibels: ['number', true, -10],
    smoothingTimeConstant: ['number', true, 0.85],
    fftSize: ['number', true, 256],
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

        function buildSignals() {
          if (parent.signalsView && parent.signalsView.remove) {
            parent.signalsView.remove();
            parent.stopListening(parent.signalsView);
          }
          parent.signalsView = new SignalsView({
            collection: parent.model.signals,
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
            {name: 'Layers', rebuild: buildLayers, pinned: true},
            {name: 'Signals', rebuild: buildSignals, pinned: true, active: true},
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
        var styles = window.getComputedStyle(el);
        var parent = this;

        function buildAudioSource() {
          parent.audioSource = new AudioSource({
            audioAnalyser: parent.audioAnalyser,
            parent: parent,
            color: styles.color
          });
          return parent.audioSource;
        }
        buildAudioSource();

        parent.MIDIAccess = new MIDIAccessView({
          parent: parent,
          model: parent.model.midi
        });

        parent.mappingsView = new MappingsControlView({
          collection: mappings,
          parent: parent,
          model: parent.model
        });

        var view = new RegionView({
          parent: parent,
          el: el,
          currentView: parent.mappingsView,
          tabs: [
            {name: 'Mappings', view: parent.mappingsView, pinned: true},
            {name: 'MIDI', view: parent.MIDIAccess, pinned: true},
            {name: 'Audio', rebuild: buildAudioSource, pinned: true, active: true}
          ]
        });

        view.el.classList.add('row');
        view.el.classList.add('region-left-bottom');

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

  commands: {
    'click [name="play"]': 'play',
    'click [name="pause"]': 'pause',
    'click [name="stop"]': 'stop'
  },

  events: {
    'click [name="resize"]': 'resizeScreen',
    'click [name="screen"]': '_openScreen',
    'click [name="control-screen"]': '_toggleControlScreen',
    'click [name="setup-editor"]': '_setupEditor'
  },

  _openScreen: function() {
    window.open('./screen.html#' + this.broadcastId, 'screen', 'width=800,height=600,location=no');
  },

  _toggleControlScreen: function() {
    this.toggle('showControlScreen');
  },

  toJSON: function() {
    var obj = this.model.toJSON();
    obj.mappings = mappings.export();
    return obj;
  },

  fromJSON: function(obj) {
    this.sendCommand('bootstrap', {
      layers: obj.layers,
      signals: obj.signals,
      mappings: obj.mappings
    });


  },

  getEditor: function() {
    this.regionRight.focusTab('Editor');
    return this.codeEditor;
  },

  _setupEditor: function() {
    var view = this;
    var json = view.toJSON();
    var editor = view.getEditor();
    var str = JSON.parse(JSON.stringify(json));
    str = jsYAML.safeDump(str);

    editor.editCode(str, function updateSetup(newStr) {
      var obj;
      try {
        obj = jsYAML.safeLoad(newStr);
        view.fromJSON(obj);
      }
      catch(e) {
        console.warn(e);
      }
    }, 'yaml');
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
  template: `
    <div class="controller rows">
      <div class="row columns gutter-horizontal header">
        <div class="column no-grow gutter-right">Visual Fiha</div>

        <div class="column columns">
          <span class="column columns no-grow button-group">
            <button class="column gutter-horizontal" name="play"><span class="vfi-play"></span></button>
            <button class="column gutter-horizontal" name="pause"><span class="vfi-pause"></span></button>
            <button class="column gutter-horizontal" name="stop"><span class="vfi-stop"></span></button>
          </span>

          <div class="column no-grow">
            <button name="screen">Open screen</button>
          </div>

          <div class="column no-grow">
            <button name="control-screen">Control screen</button>
          </div>

          <div class="column gutter-horizontal no-grow columns performance">
            Controller <span class="column sparkline-controller"></span>
          </div>

          <div class="column"></div>

          <div class="column no-grow">
            <button name="setup-editor">Setup editor</button>
          </div>
        </div>
      </div>

      <div class="row columns body">
        <div class="region-left column no-grow rows">
          <iframe class="region-left-top row grow-l control-screen"></iframe>

          <div class="region-left-bottom row rows"></div>
        </div>

        <div class="region-right column rows settings">
        </div>
      </div>
    </div>
  `
});
module.exports = ControllerView;
