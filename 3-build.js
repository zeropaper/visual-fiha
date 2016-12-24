webpackJsonp([3],{

/***/ 15:
/***/ function(module, exports, __webpack_require__) {

"use strict";

var View = VFDeps.View;
var DetailsView = __webpack_require__(14);

var LayerControlView = View.extend({
  template: '<section class="default-layer-control">' +
    '<header class="columns">' +
      '<div class="column no-grow"><button class="active prop-toggle"></button></div>' +
      '<h3 class="column layer-name gutter-left" data-hook="name"></h3>' +
    '</header>' +

    '<div class="preview gutter-horizontal"></div>' +

    '<div class="mappings props"></div>' +
  '</section>',

  events: {
    'click .remove-layer': '_removeLayer',
    'click .active.prop-toggle': '_toggleActive',
    'click .layer-name': '_showMappings'
  },

  _removeLayer: function() {
    this.model.collection.remove(this.model);
  },

  _toggleActive: function () {
    this.model.toggle('active');
  },

  _showMappings: function () {
    this.rootView.showDetails(new DetailsView({
      parent: this,
      model: this.model
    }));
  },

  bindings: {
    'model.active': [
      {
        type: 'booleanClass',
        name: 'disabled',
        invert: true
      },

      {
        type: 'booleanClass',
        selector: '.active.prop-toggle',
        yes: 'vfi-toggle-on',
        no: 'vfi-toggle-off'
      }
    ],
    'model.name': {
      hook: 'name',
      type: 'text'
    },
    'model.type': [
      {
        hook: 'type',
        type: 'text'
      },
      {
        type: 'class'
      }
    ]
  }
});

LayerControlView.types = {};

module.exports = LayerControlView;

/***/ },

/***/ 18:
/***/ function(module, exports, __webpack_require__) {

"use strict";

var View = window.VFDeps.View;
var AceEditor = View.extend({
  edit: function(target, propName, defaultValue, targetName) {
    this.set({
      model: target,
      targetProperty: propName,
      targetName: targetName || ((target.name || '') + propName)
    });
    this.script = this.original;
    this.editor.setValue(this.original || defaultValue);
  },

  template:
    '<section class="row code-editor rows">' +
      '<header>' +
        '<h3></h3>' +
      '</header>' +
      '<div class="ace-editor row grow-xl"></div>' +
      '<div class="ace-controls row no-grow gutter columns">' +
        '<div class="column"></div>' +
        '<div class="column no-grow gutter-right">' +
          '<button class="no" name="cancel">Cancel</button>' +
        '</div>' +
        '<div class="column gutter-left text-right">' +
          '<button class="yes" name="apply">Apply</button>' +
        '</div>' +
      '</div>' +
    '</section>',

  session: {
    editor: 'any',
    script: ['string', true, ''],
    targetName: 'string',
    targetProperty: 'string'
  },

  derived: {
    original: {
      deps: ['model', 'targetProperty'],
      fn: function() {
        return (this.model ? this.model[this.targetProperty] || '' : '').toString();
      }
    },
    changed: {
      deps: ['original', 'script'],
      fn: function() {
        return this.original != this.script;
      }
    }
  },

  bindings: {
    targetName: 'header>h3',
    changed: {
      type: 'toggle',
      selector: 'button'
    }
  },

  events: {
    'click [name=cancel]': '_handleCancel',
    'click [name=apply]': '_handleApply'
  },

  _handleCancel: function(evt) {
    evt.preventDefault();
    if (!this.model || !this.targetProperty || !this.editor) return;

    this.editor.setValue(this.original);
  },

  _handleApply: function(evt) {
    evt.preventDefault();
    if (!this.model || !this.targetProperty || !this.editor) return;


    try {
      eval('var fn = ' + this.script +';');// jshint ignore:line
    }
    catch (err) {
      console.info('script error!', err.stack, err.message, err.line);
      return;
    }

    this.model.set(this.targetProperty, this.script);

    this._cache.changed = false;
    this.trigger('original:changed');
    this.trigger('change:changed');
    this.model.trigger('change:' + this.targetProperty);
  },

  render: function() {
    if (this.editor) { return this; }
    var view = this;
    view.renderWithTemplate();

    var editor = view.editor = window.ace.edit(view.query('.ace-editor'));
    editor.$blockScrolling = Infinity;
    editor.on('change', function() {
      view.set('script', editor.getValue());//, {silent: true});
    });
    editor.setTheme('ace/theme/monokai');
    editor.getSession().setMode('ace/mode/javascript');
    editor.setShowInvisibles();
    editor.getSession().setUseSoftTabs(true);
    editor.getSession().setTabSize(2);
    editor.getSession().setUseWrapMode(true);

    if (view.original) {
      editor.setValue(view.original);
    }

    return this;
  }
});
module.exports = AceEditor;

/***/ },

/***/ 19:
/***/ function(module, exports, __webpack_require__) {

"use strict";

module.exports = VFDeps.View.extend({
  autoRender: true,
  template: '<canvas width="200" height="200"></canvas>',
  session: {
    audioAnalyser: ['any', true, null],
    lineWidth: ['number', true, 1],
    width: ['number', true, 200],
    height: ['number', true, 200],
    padding: ['number', true, 2],
    color: ['string', true, '#000']
  },
  bindings: {
    width: {
      type: 'attribute',
      name: 'width'
    },
    height: {
      type: 'attribute',
      name: 'height'
    }
  },
  derived: {
    ctx: {
      deps: ['el', 'width', 'height'],
      fn: function() {
        return this.el.getContext('2d');
      }
    },
    audioFrequencyArray: {
      deps: ['audioAnalyser'],
      fn: function () {
        return new window.Uint8Array(this.audioAnalyser.frequencyBinCount);
      }
    },
    audioTimeDomainArray: {
      deps: ['audioAnalyser'],
      fn: function () {
        return new window.Uint8Array(this.audioAnalyser.frequencyBinCount);
      }
    }
  },

  drawScales: function(/*bufferLength*/) {
    var ctx = this.ctx;
    var x = ctx.canvas.width * 0.5;
    var y = ctx.canvas.height * 0.5;
    var r = Math.min(x, y) - 20;
    var rad = (Math.PI * 2);

    var i, a, ax, ay, bx, by, lx, ly, ca, sa;
    ctx.globalAlpha = 0.5;
    for (i = 0; i < 360; i += 15) {
      a = ((rad / 360) * i) - Math.PI;
      ca = Math.cos(a);
      sa = Math.sin(a);
      ax = Math.round(x + (ca * (r / 10)));
      ay = Math.round(y + (sa * (r / 10)));
      bx = Math.round(x + (ca * (r - 5)));
      by = Math.round(y + (sa * (r - 5)));
      lx = Math.round(x + (ca * r));
      ly = Math.round(y + (sa * r));

      ctx.beginPath();
      ctx.moveTo(ax, ay);
      ctx.lineTo(bx, by);

      ctx.textAlign = 'center';
      if (lx < x) {
        ctx.textAlign = 'right';
      }
      else if (lx > x) {
        ctx.textAlign = 'left';
      }

      ctx.textBaseline = 'middle';
      if (ly < y) {
        ctx.textBaseline = 'bottom';
      }
      else if (ly > y) {
        ctx.textBaseline = 'top';
      }
      ctx.globalAlpha = 1;
      ctx.fillText(i, lx, ly);
      ctx.globalAlpha = 0.5;

      ctx.stroke();
      ctx.closePath();
    }
    ctx.globalAlpha = 1;

    return this;
  },

  update: function() {
    if (!this.el) {
      return this;
    }

    var ctx = this.ctx;
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.fillStyle = ctx.strokeStyle = this.color;

    var analyser = this.audioAnalyser;
    var bufferLength = analyser.frequencyBinCount;
    this.drawScales(bufferLength);

    ctx.fillStyle = ctx.strokeStyle = this.color;

    var freqArray = this.audioFrequencyArray;
    analyser.getByteFrequencyData(freqArray);

    var timeDomainArray = this.audioTimeDomainArray;
    analyser.getByteTimeDomainData(timeDomainArray);


    var x = ctx.canvas.width * 0.5;
    var y = ctx.canvas.height * 0.5;
    var r = Math.min(x, y) - 20;
    var rad = Math.PI * 2;

    var i, a, f, td, lx, ly;
    ctx.strokeStyle = 'red';
    ctx.beginPath();
    for (i = 0; i < bufferLength; i++) {
      a = ((rad / bufferLength) * i) - Math.PI;
      f = (r / 100) * (freqArray[i] / 2);
      lx = Math.round(x + Math.cos(a) * f);
      ly = Math.round(y + Math.sin(a) * f);
      ctx.lineTo(lx, ly);
    }
    ctx.stroke();

    ctx.strokeStyle = 'azure';
    ctx.beginPath();
    for (i = 0; i < bufferLength; i++) {
      a = ((rad / bufferLength) * i) - Math.PI;
      td = (r / 100) * (timeDomainArray[i] / 2);
      lx = Math.round(x + Math.cos(a) * td);
      ly = Math.round(y + Math.sin(a) * td);
      ctx.lineTo(lx, ly);
    }
    ctx.stroke();

    return this;
  }
});


/***/ },

/***/ 2:
/***/ function(module, exports, __webpack_require__) {

"use strict";

var View = VFDeps.View;
var ScreenState = __webpack_require__(0);
var MIDIAccessState = __webpack_require__(5);
var MIDIAccessView = __webpack_require__(6);
var LayerControlView = __webpack_require__(15);
__webpack_require__(22);
var SignalControlView = __webpack_require__(3);
__webpack_require__(7);
__webpack_require__(4);
__webpack_require__(8);

var SuggestionView = __webpack_require__(21);
var SparklineView = __webpack_require__(20);
var AudioMonitor = __webpack_require__(19);
var AceEditor = __webpack_require__(18);

var mappings = __webpack_require__(16);
var MappingsControlView = __webpack_require__(31);

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


/***/ },

/***/ 20:
/***/ function(module, exports, __webpack_require__) {

"use strict";

module.exports = VFDeps.View.extend({
  autoRender: true,
  template: '<canvas width="120" height="29"></canvas>',
  session: {
    data: ['array', true, function() {
      return [];
    }],
    lineWidth: ['number', true, 1],
    width: ['number', true, 120],
    height: ['number', true, 29],
    padding: ['number', true, 2],
    color: ['string', true, '#000'],
    font: ['string', true, '11px sans']
  },
  bindings: {
    width: {
      type: 'attribute',
      name: 'width'
    },
    height: {
      type: 'attribute',
      name: 'height'
    // },
    // data: {
    //   type: function() {
    //     this.update();
    //   }
    }
  },
  derived: {
    ctx: {
      deps: ['el', 'width', 'height'],
      fn: function() {
        return this.el.getContext('2d');
      }
    },
    innerW: {
      deps: ['el', 'width'],
      fn: function() {
        return this.el.width - (2 * this.lineWidth);
      }
    },
    innerH: {
      deps: ['el', 'height'],
      fn: function() {
        return this.el.height - (2 * this.lineWidth);
      }
    }
  },
  max: function() {
    var val = 0;
    if (!this.data.length) { return val; }
    this.data.forEach(function(d) {
      val = Math.max(d, val);
    });
    return val;
  },
  min: function() {
    var val = this.max();
    if (!this.data.length) { return val; }
    this.data.forEach(function(d) {
      val = Math.min(d, val);
    });
    return val;
  },
  avg: function() {
    var tt = 0;
    if (!this.data.length) { return tt; }
    this.data.forEach(function(v) {
      tt += v;
    });
    return tt / (this.data.length);
  },

  update: function(newVal) {
    if (!this.el) {
      return this;
    }
    var lineWidth = this.lineWidth;
    var ctx = this.ctx;
    var avg = this.avg();
    var max = this.max();

    var padding = 2 * lineWidth;
    var innerW = this.innerW;
    var innerH = this.innerH;
    var maxLength = Math.round(innerW / 2);

    if (typeof newVal !== 'undefined') {
      this.data.unshift(newVal);
      if (this.data.length > maxLength) {
        this.data = this.data.slice(0, -1);
      }
    }
    var step = innerW / (this.data.length - 1);

    function toPx(val) {
      return ((innerH / max) * val) + padding;
    }

    ctx.clearRect(0, 0, this.width, this.height);

    ctx.font = this.font;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = this.color;
    ctx.moveTo(innerW + padding, toPx(this.data[0]));
    ctx.beginPath();

    this.data.forEach(function(d, i) {
      var right = (innerW - (step * i)) + padding;
      var top = toPx(d);
      ctx.lineTo(right, top);
    });

    var current = this.data[0] || 0;
    ctx.stroke();
    ctx.beginPath();
    ctx.fillStyle = this.color;
    ctx.arc(innerW + padding, toPx(current), lineWidth * 2, 0, 2 * Math.PI);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(padding, toPx(avg));
    ctx.lineTo(padding + innerW, toPx(avg));
    ctx.stroke();

    current = Math.round(avg * 100) / 100;
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'left';
    ctx.clearRect(0, padding, ctx.measureText(current).width + (padding * 2), ctx.canvas.height - padding);
    ctx.fillText(current, padding, ctx.canvas.height * 0.5);
    return this;
  }
});


/***/ },

/***/ 21:
/***/ function(module, exports, __webpack_require__) {

"use strict";

var SuggestionItem = VFDeps.View.extend({
  template: '<li></li>',
  bindings: {
    'model.text': {type: 'text'}
  },
  events: {
    click: '_handleClick'
  },
  _handleClick: function (evt) {
    evt.preventDefault();
    this.parent.trigger('selected', this.model.value || this.model.text);
  }
});

var SuggestionView = VFDeps.View.extend({
  autoRender: true,

  attach: function (el, selectCb, newCollection) {
    this.inputEl = typeof el === 'string' ? this.parent.query(el) : el;
    selectCb = selectCb || function(selected) { this.inputEl.value = selected; this.detach(); }.bind(this);
    this.off('selected');
    this.once('selected', selectCb);

    if (newCollection) {
      if (newCollection.isCollection) {
        this.collection = newCollection;
      }
      else {
        this.collection.reset(newCollection);
      }
    }

    return this;
  },

  fill: function (arr) {
    this.collection.reset(arr.map(function (v) { return {text:v}; }));
    return this.filterCollection();
  },

  detach: function () {
    this.off('selected');
    this.unset('inputEl');
    this.collection.reset([]);
    return this;
  },

  filterCollection: function () {
    var update = [];
    if (!this.inputEl) {
      update = this.collection.serialize();
    }
    else {
      var inputElVal = this.inputEl.value || this.inputEl.value;

      if (!inputElVal) {
        update = this.collection.serialize();
      }
      else {
        update = this.collection.filter(function (suggestion) {
          return suggestion.text.indexOf(inputElVal) === 0;
        });
      }
    }

    this.suggestions.reset(update);

    return this;
  },

  session: {
    inputEl: 'element'
  },

  _handleInput: function() {
    this.filterCollection();
  },

  resetPosition: function() {
    var view = this;
    if (!view.el || !view.el.parentNode || !view.inputEl) { return view; }
    view.el.style.visibility = 'hidden';

    setTimeout(function () {
      if (!view.el || !view.el.parentNode || !view.inputEl) { return; }
      var ipos = view.inputEl.getBoundingClientRect();
      var bpos = view.el.getBoundingClientRect();

      if (ipos.top > view.el.parentNode.clientHeight * 0.5) {
        view.el.style.maxHeight = Math.min(ipos.top, view.el.parentNode.clientHeight * 0.33) + 'px';
        view.el.style.top = ((ipos.top - view.el.clientHeight) - 3) + 'px';
      }
      else {
        view.el.style.maxHeight = Math.min(ipos.bottom, view.el.parentNode.clientHeight * 0.33) + 'px';
        view.el.style.top = (ipos.bottom + 3) + 'px';
      }

      var s = window.getComputedStyle(view.inputEl);
      view.el.style.textAlign = s.textAlign;
      if (s.textAlign === 'right') {
        view.el.style.left = (ipos.left - (bpos.width - ipos.width)) + 'px';
      }
      else {
        view.el.style.left = (ipos.left) + 'px';
      }

      view.el.style.visibility = 'visible';
    });

    return view;
  },

  initialize: function () {
    if (!this.parent) { throw new Error('Suggestion view need a parent view'); }

    this.collection = this.collection || new VFDeps.Collection([], {parent: this});

    this.on('change:collection', function () {
      this.listenToAndRun(this.collection, 'add remove reset', this.filterCollection);
    });

    this.listenTo(this.suggestions, 'add remove reset', this.resetPosition);

    var _handleInput = this._handleInput.bind(this);

    this.on('change:inputEl', function() {
      var previous = this.previousAttributes();
      if (previous.inputEl) {
        previous.inputEl.removeEventListener('keyup', _handleInput);
      }

      var list = this.el;
      var holderEl = this.parent.el;
      var inputEl = this.inputEl;

      if (!inputEl) {
        if (this.el && this.el.parentNode === holderEl) {
          holderEl.removeChild(this.el);
        }
        return;
      }

      if (!list || !holderEl) { return; }
      if (list.parentNode !== holderEl) {

        var holderElStyle = window.getComputedStyle(holderEl);
        if (holderElStyle.position === 'static') {
          holderEl.style.position = 'relative';
        }

        holderEl.appendChild(list);
      }

      this.resetPosition();
      inputEl.addEventListener('keyup', _handleInput, false);
    });

    var _handleHolderClick = function (evt) {
      evt.preventDefault();
      if (evt.target !== this.inputEl && !this.el.contains(evt.target)) {
        this.detach();
      }
    }.bind(this);

    this.listenToAndRun(this.parent, 'change:el', function() {
      var previous = this.parent.previousAttributes();
      if (previous.el) {
        previous.el.removeEventListener('click', _handleHolderClick);
      }
      if (this.parent.el) {
        this.parent.el.addEventListener('click', _handleHolderClick, false);
      }
    });
  },

  collections: {
    suggestions: VFDeps.Collection.extend({
      model: VFDeps.State.extend({
        props: {
          text: ['string', true, ''],
          value: ['any', false, null]
        }
      })
    })
  },

  template: '<ul class="suggestion-view"></ul>',

  render: function () {
    this.renderWithTemplate();

    this.items = this.renderCollection(this.suggestions, SuggestionItem, this.el);

    return this;
  }
});
module.exports = SuggestionView;

/***/ },

/***/ 22:
/***/ function(module, exports, __webpack_require__) {

"use strict";

var LayerControlView = __webpack_require__(15);

var ControlCanvasLayerView = VFDeps.View.extend({
  template: '<section class="canvas-layer">' +
    '<header class="columns">' +
      '<div class="column no-grow"><button name="active"></button></div>' +
      '<div class="column no-grow"><button class="edit-draw-function vfi-cog-alt"></button></div>' +
      '<h3 class="column canvas-layer-name gutter-horizontal" data-hook="name"></h3>' +
      '<div class="column no-grow text-right"><button class="vfi-trash-empty remove-canvas-layer"></button></div>' +
    '</header>' +
    '</section>',

  derived: {
    codeEditor: {
      deps: ['rootView'],
      fn: function () {
        return this.rootView.codeEditor;
      }
    }
  },

  events: {
    'click .remove-canvas-layer': '_removeLayer',
    'click .edit-draw-function': '_editDrawFunction',
    'click [name="active"]': '_toggleActive',
    'click .canvas-layer-name': '_showMappings'
  },

  _showMappings: LayerControlView.prototype._showMappings,
  _toggleActive: LayerControlView.prototype._toggleActive,

  _editDrawFunction: function () {
    var editor = this.codeEditor;
    if (!editor.changed) {
      editor.edit(this.model, 'drawFunction');
    }
    else {
      console.warn('A function is already being edited');
    }
  },

  bindings: {
    'model.active': [
      {
        type: 'booleanClass',
        name: 'disabled',
        invert: true
      },

      {
        type: 'booleanClass',
        selector: '[name="active"]',
        yes: 'vfi-toggle-on',
        no: 'vfi-toggle-off'
      }
    ],

    drawFunction: '[data-hook=drawFunction]',
    'model.name': '[data-hook=name]',
    'model.duration': '[data-hook=duration]',
    'model.fps': '[data-hook=fps]',
    'model.frametime': '[data-hook=frametime]'
  }
});

module.exports = LayerControlView.types.canvas = LayerControlView.extend({
  template: '<section class="row canvas-control">' +
      '<header class="rows">' +
        '<div class="row columns">' +
          '<div class="column no-grow"><button class="active prop-toggle"></button></div>' +
          '<h3 class="column layer-name" data-hook="name"></h3>' +
        '</div>' +

        '<div class="row columns gutter-left">' +
          '<div class="column"><input type="text" placeholder="new-layer-name" data-hook="new-layer-name" /></div>' +
          '<div class="column"><input type="text" placeholder="propA, propB" data-hook="new-layer-props" /></div>' +
          '<div class="column no-grow">' +
            '<button name="add-layer" class="vfi-plus"></button>' +
          '</div>' +
        '</div>' +
      '</header>' +

      '<div class="layers">' +
        '<div class="items"></div>' +
      '</div>' +
    '</section>',

  events: VFDeps.assign({
    'change [data-hook=new-layer-name]': '_inputLayerName',
    'click [name=add-layer]': '_addLayer'
  }, LayerControlView.prototype.events),

  _inputLayerName: function() {
    this.query('[name=add-layer]').disabled = !this.queryByHook('new-layer-name').value.trim();
  },

  _addLayer: function(evt) {
    evt.preventDefault();
    var nameEl = this.queryByHook('new-layer-name');
    var name = nameEl.value.trim();
    var propsEl = this.queryByHook('new-layer-props');
    var propsVal = propsEl ? propsEl.value.split(',').map(function(s) { return s.trim(); }).filter(function(s) { return s; }) : [];

    var props = {};
    propsVal.forEach(function(prop) {
      props[prop] = 'any';
    });
    var res = this.model.canvasLayers.add({
      name: name,
      drawFunction: 'function(ctx) {\n  // ' + name + ' drawFunction\n}',
      props: props
    });

    if (!res) {
      console.warn('new layer?', res);
      return;
    }
    nameEl.value = '';
    var layerControlView = this.model.canvasLayersView.views.find(function(v) {
      return v.model === res;
    });
    if (!layerControlView.codeEditor.changed) {
      layerControlView.codeEditor.edit(res, 'drawFunction');
    }
  },

  initialize: function () {
    this.once('change:rendered', this._inputLayerName);
  },


  subviews: {
    canvasLayersView: {
      waitFor: 'el',
      selector: '.layers .items',
      prepareView: function (el) {
        return this.renderCollection(this.model.canvasLayers, ControlCanvasLayerView, el);
      }
    }
  }
});

/***/ },

/***/ 31:
/***/ function(module, exports, __webpack_require__) {

"use strict";

var View = VFDeps.View;

var ItemView = View.extend({
  template: '<div class="columns">' +
      '<div class="column no-grow"><button class="remove vfi-trash-empty"></button></div>'+
      '<div class="column no-grow gutter source-path"></div>' +

      '<div class="column gutter-vertical no-grow">&raquo;</div>'+
      '<div class="column no-grow"><button class="edit-transform-function vfi-cog-alt"></button></div>'+
      '<div class="column gutter-vertical no-grow">&raquo;</div>'+

      '<div class="column target-path">' +
        '<input type="text" name="target-path" />' +
      '</div>' +
    '</div>',


  derived: {
    codeEditor: {
      deps: ['rootView'],
      fn: function () {
        return this.rootView.codeEditor;
      }
    }
  },

  bindings: {
    'model.sourcePath': {
      type: 'text',
      selector: '.source-path'
    },
    'model.targetPath': {
      type: 'value',
      selector: '[name=target-path]'
    }
  },

  events: {
    'click .remove': '_handleRemove',
    'click .edit-transform-function': '_handleEditTransformFunction',
    'change [name=target-path]': '_handleTargetPathChange'
  },

  _handleRemove: function() {
    this.model.collection.remove(this.model);
  },

  _handleEditTransformFunction: function() {
    var editor = this.codeEditor;
    if (!editor.changed) {
      editor.edit(this.model, 'transformation', 'function transform(val) {\n  return val;\n}', this.model.targetPath);
    }
    else {
      console.warn('A function is already being edited');
    }
  },

  _handleTargetPathChange: function(evt) {
    console.info(evt);
  }
});







var ControlView = View.extend({
  template: '<section class="mappings-view">' +
      '<header>' +
        '<h3 class="section-name">Mappings</h3>' +

        '<div class="add-form gutter-horizontal gutter-top columns">' +
          '<div class="column add-form--source-path">' +
            '<input placeholder="Source" name="new-source-path" />' +
          '</div>' +

          '<div class="column gutter-horizontal no-grow">&raquo;</div>' +

          '<div class="column add-form--target-path">' +
            '<input placeholder="Target" name="new-target-path" />' +
          '</div>' +

          '<div class="column no-grow">' +
            '<button name="add-mapping">Add</button>' +
          '</div>' +
        '</div>' +
      '</header>' +

      '<div class="items"></div>' +
    '</section>',


  validatePath: function(pathValue) {
    return !!this.collection.resolve(pathValue, this.context);
  },


  session: {
    context: ['any', true, function() { return {}; }]
  },


  subviews: {
    mappingsList: {
      waitFor: 'collection',
      selector: '.items',
      prepareView: function(el) {
        return this.renderCollection(this.collection, ItemView, el);
      }
    }
  },


  events: {
    'keyup [name="-path"]': '_handlePathUpdate',
    'click [name="add-mapping"]': '_handleAddMapping'
  },


  _handlePathUpdate: function() {
    //
  },


  _handleAddMapping: function(evt) {
    evt.preventDefault();

    var source = this.query('[name="new-source-path"]');
    var target = this.query('[name="new-target-path"]');

    if (!this.validatePath(source.value)) {
      console.warn('"%s" cannot be used as source path', source.value);
      return;
    }

    if(target.value && !this.validatePath(target.value)) {
      console.warn('"%s" cannot be used as target path', target.value);
      return;
    }

    this.collection.import([{
      source: source.value,
      target: target.value
    }], this.context);

    source.value = '';
    target.value = '';
  }
});


module.exports = ControlView;

/***/ }

});
//# sourceMappingURL=3-build.js.map