(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';
var _view;
var ControllerView = require('./controller/view');

function setupController(options) {
  options = options || {};
  if (!options.reboot && options.record) {
    var stored = window.localStorage.getItem('zwv');
    stored = stored ? JSON.parse(stored) : false;
    options.screenLayers = stored ? stored.screenLayers : options.screenLayers;
    options.screenSignals = stored ? stored.screenSignals : options.screenSignals;
    console.info('import stored settings?', stored);
  }

  options.audioSource = 'https://archive.org/download/compilation_017/yttaaq_-_break_it.mp3';
  if (!_view) {
    _view = new ControllerView(options);
  }

  if (options.record) {
    var prev;
    var record = VFDeps.throttle(function(){
      if (arguments[0] === 'frametime') return;
      console.time('write json');
      var json = JSON.stringify(_view.toJSON());
      if (json !== prev) {
        window.localStorage.setItem('zwv', json);
      }
      prev = json;
      console.timeEnd('write json');
    }, 1000 / 16);
    _view.screenView.off('all', record);
    _view.screenView.on('all', record);
  }

  return _view;
}

var VF = window.VF || {};
var controllerSetup = VF._defaultSetup;
controllerSetup.el = document.querySelector('.controller');
// controllerSetup.record = window.location.hash === '#record';
window.visualFiha = setupController(controllerSetup);

},{"./controller/view":4}],2:[function(require,module,exports){
'use strict';
var View = window.VFDeps.View;
var MappingControlView = require('./../mappable/control-view');
var DetailsView = View.extend({
  template: [
    '<section>',
    '<header>',
    '<h3>Details for <span data-hook="name"></span></h3>',
    '</header>',

    '<div class="row mappings props"></div>',
    '</section>'
  ].join('\n'),

  subviews: {
    mappingsView: {
      selector: '.mappings',
      prepareView: function (el) {
        return this.renderCollection(this.model.mappings, function (opts) {
          var Constructor = MappingControlView[opts.model.targetProperty] || MappingControlView;
          return new Constructor(opts);
        }, el);
      }
    }
  },

  bindings: {
    'model.name': '[data-hook=name]'
  }
});
module.exports = DetailsView;
},{"./../mappable/control-view":17}],3:[function(require,module,exports){
'use strict';
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
    var min = this.min();
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
    ctx.font = (innerH * 0.5) + 'px monospace';
    ctx.clearRect(0, padding, ctx.measureText(current).width + (padding * 2), innerH);
    ctx.fillText(current, padding, (innerH * 0.5) + padding);

    this.el.setAttribute('title', 'Min: ' + min + ', Max: ' + max + ', Avg: ' + avg);

    return this;
  }
});

},{}],4:[function(require,module,exports){
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
},{"./../layer/canvas/control-view":5,"./../layer/control-view":8,"./../midi/state":19,"./../screen/state":20,"./../screen/view":21,"./../signal/beat/control-view":22,"./../signal/control-view":24,"./../signal/hsla/control-view":26,"./../signal/rgba/control-view":28,"./../suggestion-view":31,"./sparkline-view":3}],5:[function(require,module,exports){
'use strict';
var LayerControlView = require('./../control-view');
var DetailsView = require('./../../controller/details-view');

var ControlCanvasLayerView = VFDeps.View.extend({
  template: [
    '<section class="canvas-layer">',
    '<header class="columns">',
    '<div class="column no-grow gutter-right"><button class="active prop-toggle"></button></div>',
    '<div class="column no-grow gutter-horizontal"><button class="edit-draw-function vfi-cog-alt"></button></div>',
    '<h3 class="column layer-name gutter-horizontal" data-hook="name"></h3>',
    '<div class="column no-grow text-right gutter-left"><button class="vfi-trash-empty remove-layer"></button></div>',
    '</header>',
    '</section>'
  ].join(''),

  session: {
    showMappings: ['boolean', true, false]
  },

  derived: {
    rootView: {
      deps: ['parent'],
      fn: function () {
        for (var inst = this; inst; inst = inst.parent) {
          if (!inst.parent) { return inst; }
        }
      }
    },
    codeEditor: {
      deps: ['rootView'],
      fn: function () {
        return this.rootView.codeEditor;
      }
    }
  },

  events: {
    'click .remove-layer': '_removeLayer',
    'click .edit-draw-function': '_editDrawFunction',
    'click .active.prop-toggle': '_toggleActive',
    'click header [data-hook=name]': '_showMappings'
  },

  _removeLayer: function() {
    this.model.collection.remove(this.model);
  },
  _editDrawFunction: function () {
    var editor = this.codeEditor;
    if (!editor.changed) {
      editor.edit(this.model, 'drawFunction');
    }
    else {
      console.warn('A function is already being edited');
    }
  },
  _toggleActive: function () {
    this.model.toggle('active');
  },

  _showMappings: function () {
    this.rootView.showDetails(new DetailsView({
      parent: this,
      model: this.model,
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

    drawFunction: '[data-hook=drawFunction]',
    'model.name': '[data-hook=name]',
    'model.duration': '[data-hook=duration]',
    'model.fps': '[data-hook=fps]',
    'model.frametime': '[data-hook=frametime]'
  }
});

module.exports = LayerControlView.canvas = LayerControlView.extend({
  template: [
    '<section class="row canvas-control">',
    '<header>',
    '<h3>Canvas</h3>',
    '<div class="columns">',
    '<div class="column gutter-right" contenteditable="true" data-placeholder="new-layer-name" data-hook="new-layer-name"></div>',
    '<div class="column gutter-horizontal" contenteditable="true" data-placeholder="propA, propB" data-hook="new-layer-props"></div>',
    '<div class="column no-grow gutter-left">',
    '<button name="add-layer" class="vfi-plus"></button>',
    '</div>',
    '</div>',
    '</header>',

    '<div class="layers">',
    '<div class="items"></div>',
    '</div>',
    '</section>'
  ].join(''),

  events: {
    'input [data-hook=new-layer-name]': '_inputLayerName',
    'click [name=add-layer]': '_addLayer'
  },

  _inputLayerName: function() {
    this.query('[name=add-layer]').disabled = !this.queryByHook('new-layer-name').textContent.trim();
  },

  _addLayer: function(evt) {
    evt.preventDefault();
    var nameEl = this.queryByHook('new-layer-name');
    var name = nameEl.textContent.trim();
    var propsEl = this.queryByHook('new-layer-props');
    var propsVal = propsEl ? propsEl.textContent.split(',').map(function(s) { return s.trim(); }).filter(function(s) { return s; }) : [];

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
    nameEl.textContent = '';
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
},{"./../../controller/details-view":2,"./../control-view":8}],6:[function(require,module,exports){
'use strict';
var ScreenLayerState = require('./../state');
// var CanvasLayer = ScreenLayerState.extend({
var MappableState = require('./../../mappable/state');
var CanvasLayer = MappableState.extend({
  idAttribute: 'name',

  initialize: function() {
    var mappings = this.mappings;
    var propNames = Object.keys(this.constructor.prototype._definition).filter(function (propName) {
      return ['drawFunction', 'name'].indexOf(propName) < 0;
    });

    propNames.forEach(function (propName) {
      if (!mappings.get(propName)) {
        mappings.add({
          targetProperty: propName
        });
      }
    });
    return this;
  },

  props: {
    weight: ['number', true, 0],
    name: ['string', true, null],
    active: ['boolean', true, true],
    opacity: ['number', true, 100],
    shadowOffsetX: ['number', true, 0],
    shadowOffsetY: ['number', true, 0],
    shadowBlur: ['number', true, 0],
    shadowColor: ['string', true, 'rgba(0,0,0,0.5)'],
    blending: {
      type: 'string',
      required: true,
      default: 'source-over',
      values: [
        'source-over',
        'source-in',
        'source-out',
        'source-atop',
        'destination-over',
        'destination-in',
        'destination-out',
        'destination-atop',
        'lighter',
        'copy',
        'xor'
      ]
    },
    drawFunction: 'any'
  },


  serialize: function() {
    var obj = ScreenLayerState.prototype.serialize.apply(this, arguments);

    var type = typeof this.drawFunction;
    if (type === 'function') {
      obj.drawFunction = this.drawFunction.toString();
    }
    else if (type === 'string') {
      obj.drawFunction = this.drawFunction;
    }

    return obj;
  },

  derived: {
    width: {
      deps: ['collection', 'collection.parent', 'collection.parent.width'],
      fn: function() {
        return this.collection.parent.width || 400;
      }
    },
    height: {
      deps: ['collection', 'collection.parent', 'collection.parent.height'],
      fn: function() {
        return this.collection.parent.height || 300;
      }
    },
    draw: {
      deps: ['drawFunction'],
      fn: function() {
        var fn = this.drawFunction;
        if (typeof fn === 'string') {
          try {
            eval('fn = (function() { return ' + this.drawFunction + '; })()');// jshint ignore:line
          }
          catch(err) {
            console.warn('draw function error', err);
          }
        }
        return (typeof fn === 'function' ? fn : function() {}).bind(this);
      }
    }
  }
});

var _CanvasLayersCache = {};
var CanvasLayers = VFDeps.Collection.extend({
  mainIndex: CanvasLayer.prototype.idAttribute,

  comparator: 'weight',

  model: function (attrs, options) {
    var def = {
      props: attrs.props || {},
      session: attrs.session || {},
      derived: attrs.derived || {}
    };
    var Constructor = _CanvasLayersCache[attrs.name] || CanvasLayer.extend(def);
    _CanvasLayersCache[attrs.name] = Constructor;
    var inst =  new Constructor(attrs, options);
    inst.on('change:weight', function() {
      inst.collection.sort();
    });
    if (options.init === false) inst.initialize();
    return inst;
  }
});


module.exports = ScreenLayerState.canvas = ScreenLayerState.extend({
  collections: {
    canvasLayers: CanvasLayers
  }
});
},{"./../../mappable/state":18,"./../state":11}],7:[function(require,module,exports){
'use strict';

var ScreenLayerView = require('./../view');
module.exports = ScreenLayerView.canvas = ScreenLayerView.extend({
  template: [
    '<canvas></canvas>'
  ].join(''),

  session: {
    duration: ['number', true, 1000],
    fps: ['number', true, 16],
    frametime: ['number', true, 0],
    width: ['number', true, 400],
    height: ['number', true, 300]
  },

  bindings: {
    width: {
      name: 'width',
      type: 'attribute'
    },
    height: {
      name: 'height',
      type: 'attribute'
    }
  },

  derived: {
    frames: {
      deps: ['duration', 'fps'],
      fn: function() {
        return Math.round(this.duration / 1000 * this.fps);
      }
    },
    frame: {
      deps: ['frametime', 'fps'],
      fn: function() {
        return Math.round(((this.frametime % this.duration) / 1000) * this.fps);
      }
    },


    direction: {
      deps: ['frametime', 'duration'],
      fn: function() {
        return this.frame < this.frames * 0.5 ? 1 : -1;
      }
    },


    offCanvas: {
      deps: ['width', 'height'],
      fn: function() {
        var canvas = document.createElement('canvas');
        canvas.width = this.width;
        canvas.height = this.height;
        return canvas;
      }
    },
    ctx: {
      deps: ['offCanvas'],
      fn: function() {
        return this.offCanvas.getContext('2d');
      }
    }
  },

  remove: function() {
    return VFDeps.View.prototype.remove.apply(this, arguments);
  },

  update: function(options) {
    options = options || {};
    this.frametime = options.frametime || 0;

    var ctx = this.ctx;
    var cw = this.width;
    var ch = this.height;
    ctx.clearRect(0, 0, cw, ch);
    // ctx.fillStyle = '#a66';
    // ctx.fillRect(0, 0, cw, ch);

    this.model.canvasLayers.filter(function (layer) {
      return layer.active;
    }).forEach(function(layer) {
      ctx.shadowOffsetX = layer.shadowOffsetX;
      ctx.shadowOffsetY = layer.shadowOffsetY;
      ctx.shadowBlur = layer.shadowBlur;
      ctx.shadowColor = layer.shadowColor;

      ctx.globalAlpha = layer.opacity / 100;
      ctx.globalCompositionOperation = layer.blending;

      layer.draw(ctx);
    });

    var destCtx = this.el.getContext('2d');
    destCtx.clearRect(0, 0, cw, ch);
    destCtx.drawImage(this.offCanvas, 0, 0, cw, ch, 0, 0, cw, ch);

    return this;
  },

  render: function() {
    if (!this.el) {
      this.renderWithTemplate();
    }

    return this.update();
  }
});
},{"./../view":16}],8:[function(require,module,exports){
'use strict';
var View = window.VFDeps.View;
var DetailsView = require('./../controller/details-view');
var LayerControlView = View.extend({
  template: [
    '<section class="default-layer-control">',
    '<header class="columns">',
    '<div class="column no-grow gutter-right"><button class="active prop-toggle"></button></div>',
    '<h3 class="column layer-name gutter-left" data-hook="name"></h3>',
    '</header>',

      // '<div class="gutter" data-hook="type"></div>',

    '<div class="preview gutter-horizontal"></div>',

    '<div class="mappings props">',
    '</div>',
    '</section>'
  ].join(''),

  derived: {
    rootView: {
      deps: ['parent'],
      fn: function () {
        for (var inst = this; inst; inst = inst.parent) {
          if (!inst.parent) { return inst; }
        }
      }
    }
  },

  events: {
    'click .active.prop-toggle': '_toggleActive',
    'click header [data-hook=name]': '_showMappings'
  },

  _toggleActive: function () {
    this.model.toggle('active');
  },

  _showMappings: function () {
    this.rootView.showDetails(new DetailsView({
      parent: this,
      model: this.model,
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
module.exports = LayerControlView;
},{"./../controller/details-view":2}],9:[function(require,module,exports){
'use strict';
var ScreenLayerState = require('./../state');
module.exports = ScreenLayerState.img = ScreenLayerState.extend({
  props: {
    src: ['string', true, null]
  },

  initialize: function() {
    if (!this.src) {
      throw new Error('Missing src attribute for img layer');
    }
  }
});
},{"./../state":11}],10:[function(require,module,exports){
'use strict';

var ScreenLayerView = require('./../view');
module.exports = ScreenLayerView.img = ScreenLayerView.extend({
  template: '<img />'
});
},{"./../view":16}],11:[function(require,module,exports){
'use strict';
var MappableState = require('./../mappable/state');
var LayerState = MappableState.extend({
  idAttribute: 'name',
  typeAttribute: 'type',

  props: {
    active: ['boolean', true, true],
    backfaceVisibility: ['boolean', true, false],
    name: ['string', true, null],
    opacity: {
      type: 'number',
      default: 1,
      min: 0,
      max: 1
    },
    perspective: {
      type: 'number',
      default: 0,
      min: -100,
      max: 100
    },
    rotateX: {
      type: 'number',
      default: 0,
      min: -360,
      max: 360
    },
    rotateY: {
      type: 'number',
      default: 0,
      min: -360,
      max: 360
    },
    rotateZ: {
      type: 'number',
      default: 0,
      min: -360,
      max: 360
    },
    translateX: {
      type: 'number',
      default: 0,
      min: -100,
      max: 100
    },
    translateY: {
      type: 'number',
      default: 0,
      min: -100,
      max: 100
    },
    // translateZ: {
    //   type: 'number',
    //   default: 0,
    //   min: -100,
    //   max: 100
    // },
    scaleX: {
      type: 'number',
      default: 100,
      min: -1000,
      max: 1000
    },
    scaleY: {
      type: 'number',
      default: 100,
      min: -1000,
      max: 1000
    },
    // scaleZ: {
    //   type: 'number',
    //   default: 100,
    //   min: -1000,
    //   max: 1000
    // },
    originX: {
      type: 'number',
      required: false,
      default: 0
    },
    originY: {
      type: 'number',
      required: false,
      default: 0
    },
    skewX: {
      type: 'number',
      required: false,
      default: 0,
      min: -360,
      max: 360
    },
    skewY: {
      type: 'number',
      required: false,
      default: 0,
      min: -360,
      max: 360
    },
    type: ['string', true, 'default']
  },

  derived: {
    width: {
      deps: ['collection', 'collection.parent', 'collection.parent.width'],
      fn: function() {
        if (!this.screenView) { return 400; }
        return this.screenView.width || this.screenView.el.clientWidth;
      }
    },
    height: {
      deps: ['collection', 'collection.parent', 'collection.parent.height'],
      fn: function() {
        if (!this.screenView) { return 300; }
        return this.screenView.height || this.screenView.el.clientHeight;
      }
    }
  },

  collections: MappableState.prototype.collections
});
module.exports = LayerState;
},{"./../mappable/state":18}],12:[function(require,module,exports){
'use strict';
var ScreenLayerState = require('./../state');
module.exports = ScreenLayerState.SVG = ScreenLayerState.extend({
  props: {
    src: ['string', true, null]
  },

  initialize: function() {
    if (!this.src) {
      throw new Error('Missing src attribute for SVG layer');
    }
  }
});
},{"./../state":11}],13:[function(require,module,exports){
'use strict';

var ScreenLayerView = require('./../view');
module.exports = ScreenLayerView.SVG = ScreenLayerView.extend({
  template: '<img />',

  bindings: {
    'model.src': {
      type: 'attribute',
      name: 'src'
    }
  }
});
},{"./../view":16}],14:[function(require,module,exports){
'use strict';
var ScreenLayerState = require('./../state');
module.exports = ScreenLayerState.video = ScreenLayerState.extend({
  props: {
    src: ['string', true, null]
  },

  initialize: function() {
    if (!this.src) {
      throw new Error('Missing src attribute for video layer');
    }
  }
});
},{"./../state":11}],15:[function(require,module,exports){
'use strict';

var ScreenLayerView = require('./../view');
module.exports = ScreenLayerView.video = ScreenLayerView.extend({
  template: '<video autoplay loop muted></video>',

  bindings: {
    'model.width': {
      name: 'width',
      type: 'attribute'
    },
    'model.height': {
      name: 'height',
      type: 'attribute'
    },
    'model.src': {
      type: 'attribute',
      name: 'src'
    }
  }
});
},{"./../view":16}],16:[function(require,module,exports){
'use strict';
var View = window.VFDeps.View;

var LayerView = View.extend({
  template: function() {
    return '<div class="missing-layer-view" style="will-change:transform, opacity, backfaceVisibility;width:100%;height:100%;display:table">'+
              '<div style="display:table-cell;color:#a66;vertical-align:middle;text-align:center;font-weight:700;font-size:30px;text-shadow:0 0 4px #000">' +
                'Missing ' +
                '<span data-hook="type"></span> for ' +
                '<span data-hook="name"></span> ' +
                'layer view' +
                '<br/>' +
                '<span data-hook="frametime"></span> ' +
              '</div>'+
            '</div>';
  },

  derived: {
    style: {
      deps: [
        'model.opacity',
        'model.skewX',
        'model.skewY',
        'model.rotateX',
        'model.rotateY',
        'model.rotateZ',
        'model.translateX',
        'model.translateY',
        // 'model.translateZ',
        'model.scaleX',
        'model.scaleY',
        // 'model.scaleZ',
        'model.originX',
        'model.originY',
        'model.backfaceVisibility'
      ],
      fn: function() {
        // console.info('compute %s %s layer styles', this.model.name, this.model.type);
        return {
          opacity: this.model.opacity,
          transform:
                    'rotateX(' + this.model.rotateX + 'deg) ' +
                    'rotateY(' + this.model.rotateY + 'deg) ' +
                    'rotateZ(' + this.model.rotateZ + 'deg) ' +
                    'translateX(' + this.model.translateX + '%) ' +
                    'translateY(' + this.model.translateY + '%) ' +
                    // 'translateZ(' + this.model.translateZ + '%) ' +
                    'scaleX(' + this.model.scaleX + '%) ' +
                    'scaleY(' + this.model.scaleY + '%) ' +
                    // 'scaleZ(' + this.model.scaleZ + '%) ' +
                    'skewX(' + this.model.skewX + 'deg) ' +
                    'skewY(' + this.model.skewY + 'deg) ' +
                    'perspective(' + this.model.perspective + ')' +
                    ''
        };
      }
    }
  },

  bindings: {
    'model.type': '[data-hook=type]',
    'model.name': '[data-hook=name]',
    style: {
      type: function() {
        var computed = this.style;
        var style = this.el.style;
        Object.keys(computed).forEach(function(key) {
          style[key] = computed[key];
        });
      }
    }
  },

  update: function() {

  }
});

module.exports = LayerView;
},{}],17:[function(require,module,exports){
'use strict';
var View = window.VFDeps.View;
var assign = window.VFDeps.assign;
var MappingControlView = View.extend({
  initialize: function () {
    var mappingView = this;
    var target = this.model.targetProperty;
    var layer = this.model.targetModel;

    this.listenToAndRun(layer, 'change:' + target, function () {
      mappingView.propValue = layer[target];
    });
  },

  derived: {
    rootView: {
      deps: ['parent'],
      fn: function () {
        for (var inst = this; inst; inst = inst.parent) {
          if (!inst.parent) { return inst; }
        }
      }
    },
    signalNames: {
      deps: ['rootView'],
      fn: function () {
        return this.rootView ? this.rootView.signalNames || [] : [];
      }
    }
  },

  events: {
    'click [name=default-value]': '_defaultValue',


    'click [name=clear-mapping]': '_clearMapping',


    'focus [data-hook=value][contenteditable=true]': '_valueFocus',
    'blur [data-hook=value][contenteditable=true]': '_valueBlur',

    'wheel [data-hook=value][contenteditable=true]': '_valueWheel',

    'paste [data-hook=value][contenteditable=true]': '_valueChange',
    'input [data-hook=value][contenteditable=true]': '_valueChange',


    'focus [data-hook=mapping][contenteditable=true]': '_mappingFocus',
    'blur [data-hook=mapping][contenteditable=true]': '_mappingBlur',

    'paste [data-hook=mapping][contenteditable=true]': '_mappingChange',
    'input [data-hook=mapping][contenteditable=true]': '_mappingChange'
  },


  _defaultValue: function(evt) {
    evt.preventDefault();
    var def = this.model.definition.default;
    var result = typeof def === 'function' ? def() : def;
    this.model.targetModel.set(this.model.targetProperty, result);
  },



  _clearMapping: function(evt) {
    evt.preventDefault();
    this.model.unset('eventNames');
    this.model.targetModel.trigger('change:mappings', this.model.targetModel.mappings);
  },



  _mappingFocus: function() {
    var helper = this.rootView.suggestionHelper;
    if (!helper) { return; }
    var inputEl = this.queryByHook('mapping');
    var model = this.model;
    var layer = model.targetModel;
    helper.attach(inputEl, function (selected) {
      console.info('selected', selected);
      model.eventNames = selected;
      layer.trigger('change:mappings', layer.mappings);
      helper.detach();
    }).fill(this.signalNames);
  },

  _mappingBlur: function(evt) {
    this.rootView.suggestionHelper.detach();
    this._mappingChange(evt);
  },

  _mappingChange: function () {
    var model = this.model;
    var layer = model.targetModel;
    var newEventNames = this.queryByHook('mapping').textContent.trim();
    if ((model.eventNames || '') === newEventNames) { return; }
    model.eventNames = newEventNames;
    layer.trigger('change:mappings', layer.mappings);
  },










  _valueFocus: function() {
    var def = this.model.definition;
    if (!def) {
      console.warn('no model definition', this.model);
      return;
    }
    if (def.values && def.values.length > 1) {
      var helper = this.rootView.suggestionHelper;
      if (!helper) { return; }
      var inputEl = this.queryByHook('value');
      helper.attach(inputEl, function() {}).fill(def.values);
    }
  },

  _valueBlur: function(evt) {
    this.rootView.suggestionHelper.detach();
    this._valueChange(evt);
  },






  _valueWheel: function (evt) {
    if (evt.target !== document.activeElement) { return; }

    var def = this.model.definition;
    var valueEl = this.queryByHook('value');
    var value = valueEl.textContent.trim();

    var added = Math.round(evt.wheelDeltaY * (1 / 120));

    if (def.values && def.values.length > 1) {
      evt.preventDefault();
      var currentIndex = def.values.indexOf(value);
      if (currentIndex < 0) { currentIndex = 0; }
      if (added > 0 && currentIndex === def.values.length - 1) { currentIndex = 0; }
      else if (added < 0 && currentIndex === 0) { currentIndex = def.values.length - 1; }
      else { currentIndex += added; }
      value = def.values[currentIndex];
    }
    else if (def.type === 'number') {
      evt.preventDefault();
      value = (Number(value) + added);
      if (def.min) { value = Math.min(def.min, value); }
      if (def.max) { value = Math.max(def.max, value); }
    }
    valueEl.textContent = value;
    this._valueChange();
  },





  _valueChange: function () {
    var model = this.model;
    var layer = model.targetModel;
    var def = model.definition;
    if (!def) { return; }

    var value = this.queryByHook('value').textContent.trim();
    switch (def.type) {
    case 'number':
      value = value === '' ? def.default : Number(value);
      break;
    case 'boolean':
      value = value === 'false' || !value ? false : true;
      break;
    default:
      value = value === '' ? def.default : value;
    }

    if (def.values && def.values.indexOf(value) < 0) {
      return;
    }

    if (layer[model.targetProperty] !== value) {
      layer[model.targetProperty] = value;
    }
  },

  session: {
    popupEl: 'element',
    popupHolderEl: ['element', false, function () { return document.body; }],
    propValue: 'any',
    propEvent: ['string', true, '']
  },

  bindings: {
    'model.targetProperty': [
      { selector: '.prop-name' },
      { type: 'class' }
    ],
    'model.eventNames': [
      {
        selector: '[data-hook=value]',
        type: function(el, val) {
          el.setAttribute('contenteditable', !val);
        }
      },
      {
        selector: '[data-hook=mapping]'
      }
    ],
    propValue: '[data-hook=value]'
  },

  template: [
    '<div class="prop columns">',
    '<strong class="prop-name column gutter-right"></strong>',
    '<span class="column columns">',
    '<span class="column no-grow gutter-horizontal"><button name="default-value" class="vfi-trash-empty"></button></span>',
    '<span class="column gutter-left" data-placeholder="Value" data-hook="value"></span>',
    '</span>',
    '<span class="column columns mapping">',
    '<span class="column gutter-right" data-placeholder="Events" contenteditable="true" data-hook="mapping"></span>',
    '<span class="column gutter-left no-grow"><button name="clear-mapping" class="vfi-trash-empty"></button></span>',
    '</span>',
    '</div>'
  ].join('')
});


MappingControlView.opacity = MappingControlView.extend({
  template: [
    '<div class="prop columns">',
    '<strong class="prop-name column gutter-right"></strong>',
    '<span class="column columns">',
    '<span class="column no-grow gutter-horizontal"><button name="default-value" class="vfi-trash-empty"></button></span>',
    '<span class="column gutter-left percents" data-hook="value"></span>',
    '</span>',
    '<span class="column columns mapping">',
    '<span class="column gutter-right" contenteditable="true" data-hook="mapping"></span>',
    '<span class="column gutter-left no-grow"><button name="clear-mapping" class="vfi-trash-empty"></button></span>',
    '</span>',
    '</div>'
  ].join(''),

  bindings: assign({}, MappingControlView.prototype.bindings, {
    propValue: {
      hook: 'value',
      type: function (el, val) {
        el.textContent = Math.round(val || 0);
      }
    }
  })
});

MappingControlView.blending = MappingControlView.extend({
  template: [
    '<div class="prop columns">',
    '<strong class="prop-name column gutter-right"></strong>',
    '<span class="column columns">',
    '<span class="column no-grow gutter-horizontal"><button name="default-value" class="vfi-trash-empty"></button></span>',
    '<span class="column gutter-left" data-hook="value"></span>',
    '</span>',
    '<span class="column columns mapping">',
    '<span class="column gutter-right" contenteditable="true" data-hook="mapping"></span>',
    '<span class="column gutter-left no-grow"><button name="clear-mapping" class="vfi-trash-empty"></button></span>',
    '</span>',
    '</div>'
  ].join('')
});
module.exports = MappingControlView;
},{}],18:[function(require,module,exports){
'use strict';
var State = VFDeps.State;
var Collection = VFDeps.Collection;


var midiTransformation = {};
midiTransformation.toggleProp = function(val, mapping, targetModel) {
  return !targetModel[mapping.targetProperty];
};


var MappingState = State.extend({
  id: 'targetProperty',

  props: {
    type: ['string', false, null],
    value: ['any', false, null],
    eventNames: ['string', true, ''],
    targetProperty: ['string', true, '']
  },

  derived: {
    targetModel: {
      deps: ['collection', 'collection.parent'],
      fn: function () {
        return this.collection.parent;
      }
    },
    observedModel: {
      deps: ['targetModel', 'targetModel.parent'],
      fn: function() {
        for (var inst = this.targetModel; inst; inst = inst.parent) {
          if (inst.mappingEventsEmmiter) { return inst.mappingEventsEmmiter === true ? inst : inst.mappingEventsEmmiter; }
        }
        return false;
      }
    },
    definition: {
      deps: ['targetProperty', 'targetModel'],
      fn: function () {
        return this.targetModel.constructor.prototype._definition[this.targetProperty];
      }
    }
  },

  applyValue: function(originalVal/*, midiInputState, triggeredEvtName*/) {
    var val = originalVal;
    if (typeof this.value !== 'undefined' && this.value !== null) {
      val = this.value;
    }

    var fn = this.type;
    if (typeof fn === 'string') {
      fn = midiTransformation[fn];
    }

    if (typeof fn === 'function') {
      val = fn(originalVal, this, this.targetModel);
    }

    this.targetModel.set(this.targetProperty, val);
  },

  delegateMappingEvents: function() {
    var prev = this.previousAttributes().eventNames;
    if (prev) {
      this.stopListening(this.observedModel, prev);
    }

    if (this.eventNames && this.observedModel) {
      this.listenTo(this.observedModel, this.eventNames, this.applyValue);
    }
  },

  initialize: function() {
    this.delegateMappingEvents();
    this.on('change:eventNames', this.delegateMappingEvents);
  }
});

var MappingsCollection = Collection.extend({
  mainIndex: 'targetProperty',

  comparator: 'targetProperty',


  model: function (attrs, options) {
    var model = new MappingState(attrs, options);
    if (options.init === false) model.initialize();
    return model;
  },

  serialize: function () {
    return this
      .map(function (mapping) {
        return mapping.serialize();
      });
  }
});

var MappableState = State.extend({
  collections: {
    mappings: MappingsCollection
  // },

  // toJSON: function() {
  //   var obj = State.prototype.toJSON.apply(this, arguments);
  //   obj.mappings = obj.mappings || this.mappings.toJSON.apply(this.mappings, arguments);
  //   return obj;
  }
});
module.exports = MappableState;

},{}],19:[function(require,module,exports){
'use strict';
var VFDeps = window.VFDeps;

var State = VFDeps.State;
var Collection = VFDeps.Collection;

function toPrct(val) {
  return (100 / 127) * (val || 0);
}

var KP3ToggleButoons = [
  49,
  50,
  51,
  52,
  53,
  54,
  55,
  56,

  92,
  95
];

var KP3LetterButoons = [
  36,
  37,
  38,
  39
];

var KP3Mappings = {
  type: {
    128: 'noteOn',
    144: 'noteOff',
    176: 'change',
    192: 'search',
    248: 'idle'
  },

  note: {
    36: 'buttonA',
    37: 'buttonB',
    38: 'buttonC',
    39: 'buttonD',

    49: 'num1',
    50: 'num2',
    51: 'num3',
    52: 'num4',
    53: 'num5',
    54: 'num6',
    55: 'num7',
    56: 'num8',

    70: 'padX',
    71: 'padY',
    72: 'pad72',
    73: 'pad73',
    74: 'pad74',
    75: 'pad75',
    76: 'pad76',

    92: 'pad',
    93: 'effectSlider',
    94: 'effectKnob',
    95: 'hold'
  },

  velocity: {
    0: function(type, note, velocity) {
      if (KP3ToggleButoons.indexOf(note) > -1) {
        return false;
      }
      return velocity;
    },

    64: function(type, note, velocity) {
      if (KP3LetterButoons.indexOf(note) > -1) {
        return false;
      }
      return toPrct(velocity);
    },

    100: function(type, note, velocity) {
      if (KP3LetterButoons.indexOf(note) > -1) {
        return true;
      }
      return toPrct(velocity);
    },

    127: function(type, note, velocity) {
      if (KP3ToggleButoons.indexOf(note) > -1) {
        return true;
      }
      return toPrct(velocity);
    }
  },

  signalNames: [
    'kp3:buttonA:noteOn',
    'kp3:buttonA:noteOff',
    'kp3:buttonB:noteOn',
    'kp3:buttonB:noteOff',
    'kp3:buttonC:noteOn',
    'kp3:buttonC:noteOff',
    'kp3:buttonD:noteOn',
    'kp3:buttonD:noteOff',

    'kp3:num1:noteOn',
    'kp3:num1:noteOff',
    'kp3:num2:noteOn',
    'kp3:num2:noteOff',
    'kp3:num3:noteOn',
    'kp3:num3:noteOff',
    'kp3:num4:noteOn',
    'kp3:num4:noteOff',
    'kp3:num5:noteOn',
    'kp3:num5:noteOff',
    'kp3:num6:noteOn',
    'kp3:num6:noteOff',
    'kp3:num7:noteOn',
    'kp3:num7:noteOff',
    'kp3:num8:noteOn',
    'kp3:num8:noteOff',

    'kp3:effectKnob:change',
    'kp3:effectSlider:change'
  ]
};

var midiMappings = {
  'KP3 MIDI 1': {
    'ALSA library version 1.0.25' : KP3Mappings
  }
};


var MIDIState = State.extend({
  props: {
    connection: 'string',
    state: 'string',
    type: 'string',
    id: 'string',
    manufacturer: 'string',
    name: 'string',
    version: 'string'
  },

  session: {
    active: ['boolean', true, true]
  },

  derived: {
    midiMapping: {
      deps: ['name', 'type', 'version'],
      fn: function() {
        var m = midiMappings || {};
        if (!m[this.name] || !m[this.name][this.version]) {
          return;
        }
        return m[this.name][this.version];
      }
    },
    signalNames: {
      deps: ['midiMappings'],
      fn: function() {
        return this.midiMapping.signalNames;
      }
    }
  }
});

function _result(mapping, scope, value, data) {
  if (!mapping[scope]) { return value; }
  if (data[0] === 192) {
    if (scope === 'velocity') {
      return toPrct(data[1]);
    }
    else if (scope === 'note') {
      return 'bpmKnob';
    }
  }

  var val = mapping[scope][''+value];

  if (!val) { return scope === 'velocity' ? toPrct(value) : value; }


  if (typeof val === 'function') {
    return val(data[0], data[1], data[2]);
  }

  return scope === 'velocity' ? toPrct(value) : val;
}

function handleMIDIMessage(accessState, model) {
  function clear() {
    model.set({
      signalType: '',
      signalNote: '',
      signalVelocity: ''
    });
  }

  return function(MIDIMessageEvent) {
    if (!model.active) { return clear(); }

    var data = MIDIMessageEvent.data;
    var type = data[0] || 0;
    if (type === 248) { return clear(); }

    var note = data[1] || 0;
    var velocity = data[2] || 0;


    var obj = {
      signalType:     _result(model.midiMapping, 'type', type, data),
      signalNote:     _result(model.midiMapping, 'note', note, data),
      signalVelocity: _result(model.midiMapping, 'velocity', velocity, data)
    };
    var eventName = 'kp3:' + obj.signalNote + ':' + obj.signalType;
    accessState.trigger(eventName, obj.signalVelocity/*, model, eventName*/);

    model.set(obj);
  };
}


function collectionSignalNames() {
  var sn = [];
  this.forEach(function (m) { //jshint ignore: line
    sn = sn.concat(m.signalNames);
  });
  return sn;
}
var MIDIAccessState = State.extend({
  initialize: function(options) {
    options = options || {};
    var accessState = this;

    // window.midiAccessView = this;

    function MIDIAccessChanged() {
      if (!accessState.MIDIAccess) {
        accessState.inputs.reset([]);
        accessState.outputs.reset([]);
        return;
      }

      var inputs = [];
      var outputs = [];
      var entry;
      var model;

      for (entry in accessState.MIDIAccess.inputs) {
        model = new MIDIState({
          connection: entry[1].connection,
          state: entry[1].state,
          type: entry[1].type,
          id: entry[1].id,
          manufacturer: entry[1].manufacturer,
          name: entry[1].name,
          version: entry[1].version
        });

        if (model.midiMapping) {
          if (typeof entry[1].onmidimessage !== 'undefined') {
            entry[1].onmidimessage = handleMIDIMessage(accessState, model);
          }

          inputs.push(model);
        }
      }

      for (entry in accessState.MIDIAccess.outputs) {
        model = new MIDIState({
          connection: entry[1].connection,
          state: entry[1].state,
          type: entry[1].type,
          id: entry[1].id,
          manufacturer: entry[1].manufacturer,
          name: entry[1].name,
          version: entry[1].version
        });

        if (model.midiMapping) {
          outputs.push(model);
        }
      }

      accessState.inputs.reset(inputs);
      accessState.outputs.reset(outputs);
    }

    accessState.on('change:MIDIAccess', MIDIAccessChanged);

    if (typeof options.MIDIAccess === 'undefined') {
      navigator.requestMIDIAccess()
        .then(function(MIDIAccess) {
          accessState.MIDIAccess = MIDIAccess;
          accessState.MIDIAccess.onstatechange = function(evt) {
            accessState.MIDIAccess = evt.currentTarget;
            MIDIAccessChanged();
          };
        }, function() {
          accessState.MIDIAccess = false;
        });
    }
  },

  session: {
    MIDIAccess: {
      type: 'any',
      default: false
    }
  },

  collections: {
    inputs: Collection.extend({
      signalNames: collectionSignalNames,
      model: MIDIState
    }),
    outputs: Collection.extend({
      //signalNames: collectionSignalNames,
      model: MIDIState
    })
  },

  toJSON: function() {
    var obj = {};
    obj.inputs = this.inputs.toJSON();
    obj.outputs = this.outputs.toJSON();
    return obj;
  },

  derived: {
    signalNames: {
      deps: ['inputs'/*, 'outputs'*/],
      fn: function () {
        return this.inputs.signalNames();//.concat(this.outputs.signalNames());
      }
    }
  }
});

module.exports = MIDIAccessState;

},{}],20:[function(require,module,exports){
'use strict';
var State = VFDeps.State;
var Collection = VFDeps.Collection;
var LayerState = require('./../layer/state');
require('./../layer/canvas/state');
require('./../layer/video/state');
require('./../layer/svg/state');
require('./../layer/img/state');
var SignalState = require('./../signal/state');
require('./../signal/beat/state');
require('./../signal/hsla/state');
require('./../signal/rgba/state');

var ScreenState = State.extend({
  collections: {
    screenLayers: Collection.extend({
      mainIndex: 'name',
      model: function(attrs, opts) {
        var Constructor = LayerState[attrs.type] || LayerState;
        return new Constructor(attrs, opts);
      }
    }),

    screenSignals: Collection.extend({
      mainIndex: 'name',
      model: function(attrs, opts) {
        var Constructor = SignalState[attrs.type] || SignalState;
        return new Constructor(attrs, opts);
      }
    })
  },

  session: {
    latency: ['number', true, 0],
    width: ['number', true, 400],
    height: ['number', true, 300],
  },

  toJSON: function() {
    var obj = State.prototype.toJSON.apply(this, arguments);
    obj.screenLayers = this.screenLayers.toJSON.apply(this.screenLayers, arguments);
    obj.screenSignals = this.screenSignals.toJSON.apply(this.screenSignals, arguments);
    return obj;
  }
});
module.exports = ScreenState;
},{"./../layer/canvas/state":6,"./../layer/img/state":9,"./../layer/state":11,"./../layer/svg/state":12,"./../layer/video/state":14,"./../signal/beat/state":23,"./../signal/hsla/state":27,"./../signal/rgba/state":29,"./../signal/state":30}],21:[function(require,module,exports){
'use strict';
var View = window.VFDeps.View;
var LayerView = require('./../layer/view');
require('./../layer/canvas/view');
require('./../layer/svg/view');
require('./../layer/video/view');
require('./../layer/img/view');



var ScreenView = View.extend({
  autoRender: true,

  template: '<div class="screen"></div>',

  derived: {
    signalNames: {
      deps: ['screenSignals', 'MIDIAccess'],
      fn: function() {
        var mic = [];
        if (this.audioAnalyser) {
          for (var i = 0; i < this.audioAnalyser.frequencyBinCount; i++) {
            mic.push('mic:' + i);
          }
        }
        var signals = this.model.screenSignals
          .map(function(m) {
            return m.name;
          })
          .concat(this.MIDIAccess ? this.MIDIAccess.signalNames : [], mic);
        return signals;
      }
    }
  },

  props: {
  },

  session: {
    frametime: ['number', true, 0],
    firstframetime: ['any', true, function () {
      return performance.now();
    }],
    ratio: {
      type: 'number',
      required: true,
      default: 4/3,
      values: [0, 4/3, 16/9]
    },
    MIDIAccess: 'state',
    captureMouse: ['boolean', true, false],
    captureDebug: ['boolean', true, false],
    mode: {
      type: 'string',
      required: true,
      default: 'screen',
      values: ['screen', 'control']
    }
  },

  bindings: {
    'model.width': {
      type: function () {
        this.el.style.width = this.model.width + 'px';
      }
    },
    'model.height': {
      type: function () {
        this.el.style.height = this.model.height + 'px';
      }
    }
  },

  initialize: function () {
    var screenView = this;
    if (!screenView.model) {
      throw new Error('Missing model option for ScreenView');
    }

    if (window.BroadcastChannel) {
      var channel = screenView.channel = new window.BroadcastChannel('vf_bus');
      channel.onmessage = function(e) {
        e.data.latency = performance.now() - e.timeStamp;
        // console.info('update for %s, %s', screenView.cid, e.data.latency);
        screenView.update(e.data);
      };
    }
  },

  remove: function() {
    if (this.channel) {
      this.channel.close();
    }
    return View.prototype.remove.apply(this, arguments);
  },

  resize: function (p) {
    if (!this.el) { return this; }

    if (this.mode === 'screen') {
      this.el.style.position = 'fixed';
      this.el.top = 0;
      this.el.left = 0;
      this.el.style.width = '100%';
      this.el.style.height = '100%';
      this.model.width = this.el.clientWidth;
      this.model.height = this.el.clientHeight;
      return this;
    }

    p = p || this.el.parentNode;
    if (p && p.clientWidth) {
      this.model.width = p.clientWidth;
      var r = this.ratio || 4/3;
      this.model.height = Math.floor(this.model.width / r);
      this.el.style.width = this.model.width + 'px';
      this.el.style.height = this.model.height + 'px';
    }
    return this;
  },

  render: function() {
    this.renderWithTemplate();
    this.layersView = this.renderCollection(this.model.screenLayers, function(opts) {
      var type = opts.model.getType();
      var ScreenLayerConstructor = LayerView[type] || LayerView;
      return new ScreenLayerConstructor(opts);
    }, this.el, {parent: this});
    return this.resize();
  },

  update: function(options) {
    if (!this.layersView) {
      return this.render().update(options);
    }

    this.model.set(options);

    function findLayer(name) {
      return function(lo) {
        return lo.name === name;
      };
    }

    var triggerChange;
    var collection = this.model.screenLayers;
    if (options.screenLayers) {
      options.screenLayers.forEach(function(layer) {
        triggerChange = true;
        var state = collection.get(layer.name);
        if (state) {
          state.set(layer, {
            silent: true
          });
        }
        else {
          collection.add(layer, {
            silent: true
          });
        }
      });

      collection.forEach(function(layer) {
        var found = options.screenLayers.find(findLayer(layer.name));
        if (!found) {
          triggerChange = true;
          collection.remove(layer, {
            silent: true
          });
        }
      });

      if (triggerChange) {
        this.trigger('change:screenLayers', collection);
      }
    }

    this.layersView.views.forEach(function(subview) {
      subview.update();
    });

    return this;
  }
});
module.exports = ScreenView;
},{"./../layer/canvas/view":7,"./../layer/img/view":10,"./../layer/svg/view":13,"./../layer/video/view":15,"./../layer/view":16}],22:[function(require,module,exports){
'use strict';
var assign = window.VFDeps.assign;
var SignalControlView = require('./../control-view');
var BeatSignalControlView = SignalControlView.beatSignal = SignalControlView.extend({
  template: [
    '<section class="rows signal signal-beat">',
    '<header class="row">',
    '<h3 class="name"></h3>',
    '</header>',

    '<div class="row columns gutter-horizontal gutter-bottom">',
    '<div class="column result-dot no-grow gutter-right"></div>',
    '<div class="column result gutter-left">',
    '<div class="column input" data-placeholder="BPM" data-hook="input" contenteditable="true"></div>',
    '</div>',
    '</div>',

    '<div class="row mappings props"></div>',
    '</section>'
  ].join(''),

  bindings: assign({}, SignalControlView.prototype.bindings, {
    'model.result': [
      // {
      //   selector: '.result',
      //   type: 'text'
      // },
      {
        selector: '.result-dot',
        type: function(el, val) {
          el.style.backgroundColor = 'hsla(190, 81%, 67%,' + (val / 100) + ')';
        }
      }
    ]
  }),

  events: assign({}, SignalControlView.prototype.events, {
    'input [data-hook=input]': '_updateBPM'
  }),

  _updateBPM: function() {
    this.model.input = parseInt(this.queryByHook('input').textContent.trim(), 10);
    console.info('Changing BPM', this.model.input);
  },

  render: function () {
    this.renderWithTemplate();
    var inputEl = this.queryByHook('input');
    if (inputEl && !inputEl.textContent) {
      inputEl.textContent = this.model.input;
    }
    return this;
  }
});
module.exports = BeatSignalControlView;
},{"./../control-view":24}],23:[function(require,module,exports){
'use strict';
var SignalState = require('./../state');

var BeatState = SignalState.extend({
  initialize: function() {
    SignalState.prototype.initialize.apply(this, arguments);
    if (this.observedModel) this.listenTo(this.observedModel, 'frametime', function (value) {
      if (isNaN(value)) { return; }
      this.frametime = value;
    });
  },

  props: {
    frametime: ['number', true, 0]
  },

  derived: {
    result: {
      deps: ['timeBetweenBeats', 'frametime'],
      fn: function() {
        return this.computeSignal();
      }
    },
    timeBetweenBeats: {
      deps: ['input'],
      fn: function() {
        return (60 * 1000) / Math.max(this.input, 1);
      }
    }
  },

  computeSignal: function() {
    var preTransform = !this.frametime ? 0 : (100 - (((this.frametime % this.timeBetweenBeats) / this.timeBetweenBeats) * 100));
    return SignalState.prototype.computeSignal.apply(this, [preTransform]);
  }
});

module.exports = BeatState;
},{"./../state":30}],24:[function(require,module,exports){
'use strict';
var View = window.VFDeps.View;
var SignalDetailsView = require('./details-view');
var SignalControlView = View.extend({
  template: [
    '<section class="rows signal">',
    '<header class="row">',
    '<h3 class="row name"></h3>',
    '</header>',

    '<div class="row gutter-horizontal columns model text-center">',
    '<div class="column input"></div>',
    '<div class="column gutter-horizontal no-grow">&raquo;</div>',
    '<div class="column result"></div>',
    '</div>',

    '<div class="row gutter-horizontal columns test text-center">',
    '<div class="column input" data-placeholder="Input" contenteditable="true"></div>',
    '<div class="column gutter-horizontal no-grow">&raquo;</div>',
    '<div class="column result"></div>',
    '</div>',
    '</section>'
  ].join(''),

  session: {
    input: 'any',
    showMappings: ['boolean', true, false]
  },

  derived: {
    rootView: {
      deps: ['parent'],
      fn: function () {
        for (var inst = this; inst; inst = inst.parent) {
          if (!inst.parent) { return inst; }
        }
      }
    },
    result: {
      deps: ['input', 'model', 'model.transformations'],
      fn: function() {
        return this.model.computeSignal(this.input);
      }
    }
  },

  bindings: {
    'model.name': '.name',
    'model.input': '.model .input',
    'model.result': '.model .result',
    result: '.test .result'
  },

  events: {
    'input .test .input': '_testValue',
    'click header h3': '_showDetails'
  },

  _showDetails: function () {
    this.rootView.showDetails(new SignalDetailsView({
      parent: this,
      model: this.model,
    }));
  },

  _testValue: function(evt) {
    this.input = evt.target.textContent.trim();
  },

  render: function () {
    this.renderWithTemplate();
    var inputEl = this.query('.test .input');
    if (inputEl && !inputEl.textContent) {
      inputEl.textContent = this.input;
    }
    return this;
  }
});
module.exports = SignalControlView;
},{"./details-view":25}],25:[function(require,module,exports){
'use strict';
var assign = window.VFDeps.assign;
var DetailsView = require('./../controller/details-view');
var TransformationControlView = require('./../transformation/control-view');
var transformationFunctions = require('./../transformation/functions');
var SignalDetailsView = DetailsView.extend({
  template: [
    '<section>',
    '<header>',
    '<h3>Details for <span data-hook="name"></span></h3>',
    '</header>',

    '<div class="row mappings props"></div>',

    '<div class="row gutter transformations-control columns">',
    '<div class="column gutter-right" data-placeholder="New transformation" data-hook="new-transformation-name" contenteditable="true"></div>',
    '<div class="column gutter-left no-grow"><button name="add-transformation" class="vfi-plus"></button></div>',
    '</div>',
    '<div class="row transformations props"></div>',
    '</section>'
  ].join('\n'),

  subviews: assign({}, DetailsView.prototype.subviews, {
    transformationsView: {
      selector: '.transformations',
      prepareView: function (el) {
        return this.renderCollection(this.model.transformations, /*function (opts) {
          var TransformationControlView = VF.TransformationControlView;
          var Constructor = TransformationControlView[opts.model.targetProperty] || TransformationControlView['type' + opts.model.targetProperty] || TransformationControlView;
          return new Constructor(opts);
        }*/TransformationControlView, el);
      }
    }
  }),

  events: {
    'click [name=add-transformation]': '_addTransformation',

    'focus [data-hook=new-transformation-name]': '_focusName'
  },

  derived: {
    rootView: {
      deps: ['parent'],
      fn: function () {
        for (var inst = this; inst; inst = inst.parent) {
          if (!inst.parent) { return inst; }
        }
      }
    }
  },

  _focusName: function() {
    this.rootView.suggestionHelper.attach(this.queryByHook('new-transformation-name')).fill(Object.keys(transformationFunctions));
  },

  _addTransformation: function () {
    this.model.transformations.add({
      name: this.queryByHook('new-transformation-name').textContent.trim()
    });
  },

  bindings: {
    'model.name': '[data-hook=name]'
  }
});
module.exports = SignalDetailsView;
},{"./../controller/details-view":2,"./../transformation/control-view":32,"./../transformation/functions":33}],26:[function(require,module,exports){
'use strict';
var assign = window.VFDeps.assign;
var SignalControlView = require('./../control-view');
var HSLASignalControlView = SignalControlView.hslaSignal = SignalControlView.extend({
  template: [
    '<section class="rows signal signal-color">',
    '<header class="row">',
    '<h3 class="name"></h3>',
    '</header>',

    '<div class="row columns gutter-horizontal gutter-bottom">',
    '<div class="column result-color no-grow"></div>',
    '<div class="column result gutter-left"></div>',
    '</div>',

    '<div class="row mappings props"></div>',
    '</section>'
  ].join(''),

  bindings: assign({}, SignalControlView.prototype.bindings, {
    'model.result': [
      {
        selector: '.result-color',
        type: function(el, val) {
          el.style.backgroundColor = val;
        }
      },
      {
        selector: '.result',
        type: 'text'
      }
    ]
  })
});
module.exports = HSLASignalControlView;
},{"./../control-view":24}],27:[function(require,module,exports){
'use strict';
var SignalState = require('./../state');

var _360 = {
  type: 'number',
  required: true,
  default: 180,
  min: 0,
  max: 360
};
var _100 = {
  type: 'number',
  required: true,
  default: 100,
  min: 0,
  max: 100
};

var HSLASignalState = SignalState.hslaSignal = SignalState.extend({
  session: {
    hue: _360,
    saturation: _100,
    lightness: _100,
    alpha: _100
  },
  derived: {
    result: {
      deps: ['hue', 'saturation', 'lightness', 'alpha'],
      fn: function() {
        return this.computeSignal();
      }
    }
  },
  // parseInput: function() {
  //   var values = _colorValues(this.input);
  //   return {
  //     hue: values[0],
  //     saturation: values[1],
  //     lightness: values[2],
  //     alpha: values[3]
  //   };
  // },
  computeSignal: function() {
    return 'hsla(' + Math.round(this.hue) + ',' + Math.round(this.saturation) + '%,' + Math.round(this.lightness) + '%,' + (Math.round(this.alpha) / 100) + ')';
  }
});

module.exports = HSLASignalState;
},{"./../state":30}],28:[function(require,module,exports){
'use strict';
var SignalControlView = require('./../control-view');
var HSLASignalControlView = require('./../hsla/control-view');

var RGBASignalControlView = SignalControlView.rgbaSignal = HSLASignalControlView.extend({});

module.exports = RGBASignalControlView;
},{"./../control-view":24,"./../hsla/control-view":26}],29:[function(require,module,exports){
'use strict';
var SignalState = require('./../state');
var _255 = {
  type: 'number',
  required: true,
  default: 180,
  min: 0,
  max: 255
};
var _100 = {
  type: 'number',
  required: true,
  default: 100,
  min: 0,
  max: 100
};
var RGBASignalState = SignalState.rgbaSignal = SignalState.extend({
  session: {
    red: _255,
    green: _255,
    blue: _255,
    alpha: _100
  },
  derived: {
    result: {
      deps: ['red', 'green', 'blue', 'alpha'],
      fn: function() {
        return this.computeSignal();
      }
    }
  },
  // parseInput: function() {
  //   var values = _colorValues(this.input);
  //   return {
  //     red: values[0],
  //     green: values[1],
  //     blue: values[2],
  //     alpha: values[3]
  //   };
  // },
  computeSignal: function() {
    return 'rgba(' + Math.round(this.red) + ',' + Math.round(this.green) + ',' + Math.round(this.blue) + ',' + (Math.round(this.alpha) / 100) + ')';
  }
});
module.exports = RGBASignalState;
},{"./../state":30}],30:[function(require,module,exports){
'use strict';
var State = window.VFDeps.State;
var Collection = window.VFDeps.Collection;
var MappableState = require('./../mappable/state');

var transformationFunctions = {};
transformationFunctions['math.multiply'] = function(val, factor) {
  return val * factor;
};
transformationFunctions['math.add'] = function(val, added) {
  return val + added;
};
transformationFunctions['math.subtract'] = function(val, subtracted) {
  return val - subtracted;
};
transformationFunctions['math.modulo'] = function(val, x) {
  return val % x;
};
transformationFunctions['math.above'] = function(val, x) {
  return val > x;
};
transformationFunctions['math.aboveOrEqual'] = function(val, x) {
  return val >= x;
};
transformationFunctions['math.below'] = function(val, x) {
  return val < x;
};
transformationFunctions['math.belowOrEqual'] = function(val, x) {
  return val <= x;
};
transformationFunctions['math.within'] = function(val, min, max) {
  return val <= max && val >= min;
};


Object.getOwnPropertyNames(Math).forEach(function (p) {
  if (p !== 'constructor' && typeof Math[p] === 'function') transformationFunctions['math.' + p] = Math[p];
});

var _str = ''.constructor.prototype;
Object.getOwnPropertyNames(_str).forEach(function (p) {
  if (p !== 'constructor' && typeof _str[p] === 'function') {
    transformationFunctions['string.' + p] = function(val) {
      var args = [].slice.apply(arguments).slice(1);
      _str[p].apply(val, args);
    };
  }
});

transformationFunctions['string.toBool'] = function(val) {
  return !(!val || val === 'false' || val === 'null');
};
transformationFunctions['string.toInteger'] = function(val) {
  return parseInt(val, 10);
};
transformationFunctions['string.toFloat'] = function(val) {
  return parseFloat(val);
};
transformationFunctions['string.toNumber'] = function(val) {
  return Number(val);
};

var SignalTransformationState = State.extend({
  props: {
    name: ['string', true, null],
    arguments: ['array', true, function () { return []; }]
  }
});


var SignalState = MappableState.extend({
  idAttribute: 'name',
  typeAttribute: 'type',

  props: {
    name: ['string', true, null],
    type: ['string', true, 'default'],
    defaultValue: ['any', true, function () { return 1; }]
  },

  session: {
    input: ['any', true, null]
  },

  collections: {
    transformations: Collection.extend({
      model: SignalTransformationState
    })
  },

  derived: {
    observedModel: {
      deps: ['collection', 'parent'],
      fn: function() {
        for (var inst = this; inst; inst = inst.parent) {
          if (inst.mappingEventsEmmiter) {
            return inst.mappingEventsEmmiter === true ? inst : inst.mappingEventsEmmiter;
          }
        }
        return false;
      }
    },
    result: {
      deps: ['input', 'transformations'],
      fn: function() {
        return this.computeSignal();
      }
    }
  },

  computeSignal: function(val) {
    val = val || this.input;

    this.transformations.forEach(function(transformationState) {
      var args = [val].concat(transformationState.arguments);
      val = transformationFunctions[transformationState.name].apply(this, args);
    });

    return val;
  },

  initialize: function() {
    this.on('change:result', function() {
      if (this.observedModel) this.observedModel.trigger(this.name, this.result);
    });
    if (this.input === null || this.input === undefined) {
      this.input = this.defaultValue;
    }
  }
});
module.exports = SignalState;
},{"./../mappable/state":18}],31:[function(require,module,exports){
'use strict';
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
    selectCb = selectCb || function(selected) { this.inputEl.textContent = selected; this.detach(); }.bind(this);
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
      var inputElVal = this.inputEl.textContent || this.inputEl.value;

      if (!inputElVal) {
        update = this.collection.serialize();
      }
      else {
        update = this.collection.filter(function (suggestion) {
          return suggestion.text.indexOf(inputElVal) === 0;
        })/*.map(function(suggestion) {
          return suggestion;
        })*/;
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
    var _handleBlur = function(evt) {
      evt.preventDefault();
    }.bind(this);

    this.on('change:inputEl', function() {
      var previous = this.previousAttributes();
      if (previous.inputEl) {
        previous.inputEl.removeEventListener('blur', _handleBlur);
        previous.inputEl.removeEventListener('input', _handleInput);
        previous.inputEl.removeEventListener('change', _handleInput);
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
      inputEl.addEventListener('blur', _handleBlur);
      inputEl.addEventListener('input', _handleInput);
      inputEl.addEventListener('change', _handleInput);
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
        this.parent.el.addEventListener('click', _handleHolderClick);
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
},{}],32:[function(require,module,exports){
'use strict';
var View = window.VFDeps.View;
var TransformationControlView = View.extend({
  template: [
    '<div class="transformation gutter columns">',
    '<div class="column gutter-right text-right" data-hook="name"></div>',
    '<div class="column gutter-horizontal no-grow"><button name="remove" class="vfi-trash-empty"></button></div>',
    '<div class="column gutter-left" data-hook="arguments" contenteditable="true"></div>',
    '</div>'
  ].join('\n'),

  derived: {
    rootView: {
      deps: ['parent'],
      fn: function () {
        for (var inst = this; inst; inst = inst.parent) {
          if (!inst.parent) { return inst; }
        }
      }
    }
  },

  bindings: {
    'model.name': '[data-hook=name]',
    'model.arguments': '[data-hook=arguments]'
  },

  events: {
    'click [name=remove]': '_remove',

    'focus [data-hook=arguments]': '_focusArguments',
    'input [data-hook=arguments]': '_changeArguments',
    'blur [data-hook=arguments]': '_blurArguments'
  },

  _remove: function() {
    this.model.collection.remove(this.model);
  },

  _focusArguments: function() {},
  _changeArguments: function() {},
  _blurArguments: function() {},
});

module.exports = TransformationControlView;
},{}],33:[function(require,module,exports){
var functions = {};

module.exports = functions;
},{}]},{},[1]);
