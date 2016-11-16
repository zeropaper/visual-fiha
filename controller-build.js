(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';
var _view;
var ControllerView = require('./controller/view');

// if ('serviceWorker' in navigator) {
//   navigator.serviceWorker.register('/service-worker.js', {scope: '/'})
//   .then(function(reg) {
//     // registration worked
//     console.info('Registration succeeded. Scope is ' + reg.scope);
//   }).catch(function(error) {
//     // registration failed
//     console.warn('Registration failed with ' + error);
//   });
// }

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

},{"./controller/view":7}],2:[function(require,module,exports){
'use strict';
var View = window.VFDeps.View;
var AceEditor = View.extend({
  edit: function(target, propName) {
    if (target && propName) {
      this.set({
        model: target,
        targetProperty: propName
      });
    }
    this.script = this.original;
    this.editor.setValue(this.original);
  },

  template:
    '<div class="row debug rows">' +
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
    '</div>',

  session: {
    editor: 'any',
    script: ['string', true, ''],
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

    var m = this.model;
    var p = this.targetProperty;
    var s = this.script;

    m[p] = s;

    this._cache.changed = false;
    this.trigger('original:changed');
    this.trigger('change:changed');
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
},{}],3:[function(require,module,exports){
'use strict';
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
    audioAnalyserDataArray: {
      deps: ['audioAnalyser'],
      fn: function () {
        return new window.Uint8Array(this.audioAnalyser.frequencyBinCount);
      }
    }
  },

  drawScales: function(bufferLength) {
    var ctx = this.ctx;
    var x = ctx.canvas.width * 0.5;
    var y = ctx.canvas.height * 0.5;
    var r = Math.min(x, y) - 20;
    var rad = (Math.PI * 2);


    // var samples = Math.round(length / 4)
    // var start = Math.round(length / 4);
    // var end = length - start;

    // var i, a, ax, ay, bx, by, lx, ly, ca, sa;
    // ctx.globalAlpha = 0.5;
    // for (i = start; i < end; i++) {
    //   a = ((rad / half) * (i - start)) - Math.PI;

    var i, a, ax, ay, bx, by, lx, ly, ca, sa;
    ctx.globalAlpha = 0.5;
    for (i = 0; i < bufferLength; i++) {
      a = ((rad / bufferLength) * i) - Math.PI;
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

    var dataArray = this.audioAnalyserDataArray;
    analyser.getByteFrequencyData(dataArray);


    var x = ctx.canvas.width * 0.5;
    var y = ctx.canvas.height * 0.5;
    var r = Math.min(x, y) - 20;
    var rad = (Math.PI * 2);

    var i, a, lx, ly;
    ctx.beginPath();
    for (i = 0; i < bufferLength; i++) {
      a = ((rad / bufferLength) * i) - Math.PI;
      lx = Math.round(x + Math.cos(a) * ((r / 100) * (dataArray[i] / 2)));
      ly = Math.round(y + Math.sin(a) * ((r / 100) * (dataArray[i] / 2)));
      ctx.lineTo(lx, ly);
    }
    ctx.stroke();

    return this;
  }
});

},{}],4:[function(require,module,exports){
'use strict';
var MappingControlView = require('./../mappable/control-view');
var DetailsView = VFDeps.View.extend({
  template: [
    '<section class="row rows">',
    '<header class="row">',
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
          var type = opts.model.definition.type;
          var name = opts.model.targetProperty;
          var Constructor = MappingControlView[name] || MappingControlView[type] || MappingControlView;
          console.info('property name: %s (%s), type: %s (%s)', name, !!MappingControlView[name], type, !!MappingControlView[type]);
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
},{"./../mappable/control-view":20}],5:[function(require,module,exports){
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

},{}],6:[function(require,module,exports){
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
      inputEl.addEventListener('keyup', _handleInput);
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
},{}],7:[function(require,module,exports){
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

    controllerView.on('change:audioContext change:audioAnalyser', this.connectAudioSource);
    this.connectAudioSource();

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

  connectAudioSource: function() {
    var controllerView = this;
    navigator.getUserMedia({
      audio: true
    }, function(stream) {
      var source = controllerView.audioContext.createMediaStreamSource(stream);
      source.connect(controllerView.audioAnalyser);
    }, function(err) {
      console.info('The following gUM error occured: ' + err);
    });
    return this;
  },

  _animate: function(timestamp) {
    if (this.controllerSparkline) {
      this.controllerSparkline.update((timestamp - this.model.frametime) - this.model.firstframetime);
    }
    if (this.latencySparkline) {
      this.latencySparkline.update(this.screenView.model.latency);
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
      deps: ['audioContext', 'model', 'model.audioMinDb', 'model.audioMaxDb', 'model.audioSmoothing', 'model.audioFftSize'],
      fn: function() {
        var analyser = this.audioContext.createAnalyser();
        analyser.minDecibels = this.model.audioMinDb;
        analyser.maxDecibels = this.model.audioMaxDb;
        analyser.smoothingTimeConstant = this.model.audioSmoothing;
        analyser.fftSize = this.model.audioFftSize;
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
    ],
    'model.audioMinDb': {
      selector: '[name="audioMinDb"]',
      type: 'value'
    },
    'model.audioMaxDb': {
      selector: '[name="audioMaxDb"]',
      type: 'value'
    },
    'model.audioSmoothing': {
      selector: '[name="audioSmoothing"]',
      type: 'value'
    },
    'model.audioFftSize': {
      selector: '[name="audioFftSize"]',
      type: 'value'
    }
  },

  events: {
    'click [name="play"]': 'play',
    'click [name="pause"]': 'pause',
    'click [name="stop"]': 'stop',
    'click [name="debug"]': '_debug',
    'click [name="screen"]': '_openScreen',
    'click [name="ratio"]': '_changeRatio',
    'click [name="add-layer"]': '_addLayer',
    'click [name="add-signal"]': '_addSignal',
    'focus [data-hook="layer-type"]': '_suggestLayerType',
    'focus [data-hook="signal-type"]': '_suggestSignalType',
    'change .audio-source [name]': '_changeAudioParams'
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
          'SCL <span title="Screen Communication Latency" class="column sparkline-latency"></span>'+
          'Controller <span class="column sparkline-controller"></span>'+
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
          '<div class="column rows audio-source">'+
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
            '<audio class="row" controls muted></audio>'+
          '</div>'+
        '</div>'+
      '</div>'+
    '</div>'+
  '</div>'
});
module.exports = ControllerView;
},{"./../layer/canvas/control-view":8,"./../layer/control-view":11,"./../mappable/multi-control-view":21,"./../midi/state":23,"./../midi/view":24,"./../screen/state":25,"./../screen/view":26,"./../signal/beat/control-view":27,"./../signal/control-view":29,"./../signal/hsla/control-view":31,"./../signal/rgba/control-view":33,"./ace-view":2,"./audio-monitor-view":3,"./sparkline-view":5,"./suggestion-view":6}],8:[function(require,module,exports){
'use strict';
var LayerControlView = require('./../control-view');

var ControlCanvasLayerView = VFDeps.View.extend({
  template: '<section class="canvas-layer">' +
    '<header class="columns">' +
      '<div class="column no-grow gutter-right"><button name="active"></button></div>' +
      '<div class="column no-grow gutter-horizontal"><button class="edit-draw-function vfi-cog-alt"></button></div>' +
      '<h3 class="column canvas-layer-name gutter-horizontal" data-hook="name"></h3>' +
      '<div class="column no-grow text-right gutter-left"><button class="vfi-trash-empty remove-canvas-layer"></button></div>' +
    '</header>' +
    '</section>',

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

module.exports = LayerControlView.canvas = LayerControlView.extend({
  template: '<section class="row canvas-control">' +
      '<header class="rows">' +
        '<div class="row columns">' +
          '<div class="column no-grow"><button class="active prop-toggle"></button></div>' +
          '<h3 class="column layer-name" data-hook="name"></h3>' +
        '</div>' +
        '<div class="row columns">' +
          '<input type="text" class="column gutter-right" placeholder="new-layer-name" data-hook="new-layer-name" />' +
          '<input type="text" class="column gutter-horizontal" placeholder="propA, propB" data-hook="new-layer-props" />' +
          '<div class="column no-grow gutter-left">' +
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
},{"./../control-view":11}],9:[function(require,module,exports){
'use strict';
var ScreenLayerState = require('./../state');
// var CanvasLayer = ScreenLayerState.extend({
var MappableState = require('./../../mappable/state');
var CanvasLayerMapState = MappableState.State.extend({
  derived: {
    targetModel: {
      deps: ['collection', 'collection.parent'],
      fn: function () {
        return this.collection.parent;
      }
    },
    observedModel: {
      deps: ['targetModel', 'targetModel.collection', 'targetModel.collection.parent'],
      fn: function() {
        return this.targetModel.collection.parent.collection.parent;
      }
    }
  }
});


var CanvasLayer = MappableState.extend({
  idAttribute: 'name',

  fillCollection: function() {
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

  session: {
    duration: ['number', true, 1000],
  },

  cache: {},

  props: {
    fps: ['number', true, 16],
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
    var obj = MappableState.prototype.serialize.apply(this, arguments);
    var returned = {};


    var props = this.serializationProps.props || [];
    // if (props.length) {
    //   returned.props = {};
    //   props.forEach(function(propName) {
    //     returned.props[propName] = obj[propName];
    //   });
    // }

    // var propName;
    // for (propName in obj) {
    //   if (props.indexOf(propName) < 0) {
    //     returned[propName] = obj[propName];
    //   }
    // }

    // better like that??
    if (props.length) {
      returned.props = {};
    }

    var propName;
    var def = this.constructor.prototype._definition;
    for (propName in obj) {
      // if (props.indexOf(propName) < 0) {
      returned[propName] = obj[propName];
      // }
      // else {
      //   console.info();
      //   returned.props[propName] = obj[propName];
      // }
      if (props.indexOf(propName) > -1) {
        returned.props[propName] = def[propName];
      }
    }
    returned.props = def;
    var type = typeof this.drawFunction;
    if (type === 'function') {
      returned.drawFunction = this.drawFunction.toString();
    }
    else if (type === 'string') {
      returned.drawFunction = this.drawFunction;
    }
    return returned;
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
    frametime: {
      cache: false,
      fn: function() {
        return this.screenState.frametime;
      }
    },
    screenState: {
      deps: ['collection', 'collection.parent', 'collection.parent.collection', 'collection.parent.collection.parent'],
      fn: function() {
        return this.collection.parent.collection.parent;
      }
    },
    width: {
      deps: ['screenState', 'screenState.width'],
      fn: function() {
        return this.screenState.width || 400;
      }
    },
    height: {
      deps: ['screenState', 'screenState.height'],
      fn: function() {
        return this.screenState.height || 300;
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
  },

  collections: {
    mappings: MappableState.Collection.extend({
      model: function (attrs, options) {
        var model = new CanvasLayerMapState(attrs, options);
        if (options.init === false) model.initialize();
        return model;
      }
    })
  }
});

var _CanvasLayersCache = {};
var CanvasLayers = VFDeps.Collection.extend({
  mainIndex: CanvasLayer.prototype.idAttribute,

  comparator: 'weight',

  model: function (attrs, options) {
    var def = {
      props: attrs.props || {},
      // session: attrs.session || {},
      // derived: attrs.derived || {},
      serializationProps: {
        props: Object.keys(attrs.props || {}),
        // session: Object.keys(attrs.session),
        // derived: Object.keys(attrs.prderived)
      }
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
},{"./../../mappable/state":22,"./../state":14}],10:[function(require,module,exports){
'use strict';

var ScreenLayerView = require('./../view');
module.exports = ScreenLayerView.canvas = ScreenLayerView.extend({
  template: '<canvas></canvas>',

  derived: {
    offCanvas: {
      deps: ['width', 'height', 'el'],
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
    },
    destCtx: {
      deps: ['el', 'width', 'height'],
      fn: function() {
        return this.el.getContext('2d');
      }
    }
  },

  remove: function() {
    return ScreenLayerView.prototype.remove.apply(this, arguments);
  },

  update: function(options) {
    options = options || {};
    this.model.frametime = options.frametime || 0;

    var cw = this.width = this.parent.el.clientWidth;
    var ch = this.height = this.parent.el.clientHeight;
    var ctx = this.ctx;
    ctx.clearRect(0, 0, cw, ch);
    if (!this.model.active) { return this; }

    this.model.canvasLayers.filter(function (layer) {
      return layer.active;
    }).forEach(function(layer) {
      ctx.shadowOffsetX = layer.shadowOffsetX;
      ctx.shadowOffsetY = layer.shadowOffsetY;
      ctx.shadowBlur = layer.shadowBlur;
      ctx.shadowColor = layer.shadowColor;

      ctx.globalAlpha = layer.opacity / 100;
      ctx.globalCompositeOperation = layer.blending;

      layer.draw(ctx);
    });

    this.destCtx.clearRect(0, 0, cw, ch);
    this.destCtx.drawImage(this.offCanvas, 0, 0, cw, ch, 0, 0, cw, ch);

    return this;
  },


  bindings: VFDeps.assign({
    width: {
      name: 'width',
      type: 'attribute'
    },
    height: {
      name: 'height',
      type: 'attribute'
    },
  }, ScreenLayerView.prototype.bindings)
});
},{"./../view":19}],11:[function(require,module,exports){
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

  _showMappings: function (evt) {
    if (evt) {
      evt.stopPropagation();
      evt.preventDefault();
    }
    this._detailsView = this._detailsView || new DetailsView({
      parent: this,
      model: this.model,
    });
    this.rootView.showDetails(this._detailsView);
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
},{"./../controller/details-view":4}],12:[function(require,module,exports){
'use strict';
var ScreenLayerState = require('./../state');
module.exports = ScreenLayerState.img = ScreenLayerState.extend({
  props: {
    src: ['string', true, null]
  },

  initialize: function() {
    ScreenLayerState.prototype.initialize.apply(this, arguments);
    if (!this.src) {
      throw new Error('Missing src attribute for img layer');
    }
  }
});
},{"./../state":14}],13:[function(require,module,exports){
'use strict';

var ScreenLayerView = require('./../view');
module.exports = ScreenLayerView.img = ScreenLayerView.extend({
  template: '<img />',

  bindings: VFDeps.assign({
    width: {
      name: 'width',
      type: 'attribute'
    },
    height: {
      name: 'height',
      type: 'attribute'
    },
    'model.src': {
      type: 'attribute',
      name: 'src'
    }
  }, ScreenLayerView.prototype.bindings)
});
},{"./../view":19}],14:[function(require,module,exports){
'use strict';
var MappableState = require('./../mappable/state');
var LayerState = MappableState.extend({
  idAttribute: 'name',
  typeAttribute: 'type',

  props: {
    active: ['boolean', true, true],
    // backfaceVisibility: ['boolean', true, false],
    mixBlendMode: {
      type: 'string',
      default: 'normal',
      required: true,
      values: [
        'normal',
        'multiply',
        'screen',
        'overlay',
        'darken',
        'lighten',
        'color-dodge',
        'color-burn',
        'hard-light',
        'soft-light',
        'difference',
        'exclusion',
        'hue',
        'saturation',
        'color',
      ]
    },
    name: ['string', true, null],
    opacity: {
      type: 'number',
      default: 100
    },
    // perspective: {
    //   type: 'number',
    //   default: 0
    // },
    rotateX: {
      type: 'number',
      default: 0
    },
    rotateY: {
      type: 'number',
      default: 0
    },
    rotateZ: {
      type: 'number',
      default: 0
    },
    translateX: {
      type: 'number',
      default: 0
    },
    translateY: {
      type: 'number',
      default: 0
    },
    // // translateZ: {
    // //   type: 'number',
    // //   default: 0
    // // },
    scaleX: {
      type: 'number',
      default: 100
    },
    scaleY: {
      type: 'number',
      default: 100
    },
    // // scaleZ: {
    // //   type: 'number',
    // //   default: 1
    // // },
    // originX: {
    //   type: 'number',
    //   required: false,
    //   default: 0
    // },
    // originY: {
    //   type: 'number',
    //   required: false,
    //   default: 0
    // },
    skewX: {
      type: 'number',
      required: false,
      default: 0
    },
    skewY: {
      type: 'number',
      required: false,
      default: 0
    },
    type: ['string', true, 'default'],
    zIndex: ['number', true, 0]
  }
});
module.exports = LayerState;
},{"./../mappable/state":22}],15:[function(require,module,exports){
'use strict';
var ScreenLayerState = require('./../state');
module.exports = ScreenLayerState.SVG = ScreenLayerState.extend({
  props: {
    src: ['string', true, null]
  },

  initialize: function() {
    ScreenLayerState.prototype.initialize.apply(this, arguments);
    if (!this.src) {
      throw new Error('Missing src attribute for SVG layer');
    }
  }
});
},{"./../state":14}],16:[function(require,module,exports){
'use strict';

var ScreenLayerView = require('./../view');
module.exports = ScreenLayerView.SVG = ScreenLayerView.extend({
  template: '<img />',


  bindings: VFDeps.assign({
    width: {
      name: 'width',
      type: 'attribute'
    },
    height: {
      name: 'height',
      type: 'attribute'
    },
    'model.src': {
      type: 'attribute',
      name: 'src'
    }
  }, ScreenLayerView.prototype.bindings)
});
},{"./../view":19}],17:[function(require,module,exports){
'use strict';
var ScreenLayerState = require('./../state');
module.exports = ScreenLayerState.video = ScreenLayerState.extend({
  props: {
    src: ['string', true, null]
  },

  initialize: function() {
    ScreenLayerState.prototype.initialize.apply(this, arguments);
    if (!this.src) {
      throw new Error('Missing src attribute for video layer');
    }
  }
});
},{"./../state":14}],18:[function(require,module,exports){
'use strict';

var ScreenLayerView = require('./../view');
module.exports = ScreenLayerView.video = ScreenLayerView.extend({
  template: '<video autoplay loop muted></video>',

  bindings: VFDeps.assign({
    width: {
      name: 'width',
      type: 'attribute'
    },
    height: {
      name: 'height',
      type: 'attribute'
    },
    'model.src': {
      type: 'attribute',
      name: 'src'
    }
  }, ScreenLayerView.prototype.bindings)
});
},{"./../view":19}],19:[function(require,module,exports){
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
        'width',
        'height',
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
        'model.backfaceVisibility',
        'model.mixBlendMode',
        'model.zIndex'
      ],
      fn: function() {
        return {
          opacity: this.model.opacity * 0.01,
          mixBlendMode: this.model.mixBlendMode,
          width: this.width + 'px',
          height: this.height + 'px',
          zIndex: this.zIndex || 0,
          perspective: this.model.perspective + 'px',
          transform:
                    'rotateX(' + this.model.rotateX + 'deg) ' +
                    'rotateY(' + this.model.rotateY + 'deg) ' +
                    'rotateZ(' + this.model.rotateZ + 'deg) ' +
                    'translateX(' + this.model.translateX + '%) ' +
                    'translateY(' + this.model.translateY + '%) ' +
                    // 'translateZ(' + this.model.translateZ + '%) ' +
                    'scaleX(' + (this.model.scaleX * 0.01) + ') ' +
                    'scaleY(' + (this.model.scaleY * 0.01) + ') ' +
                    // 'scaleZ(' + this.model.scaleZ + '%) ' +
                    'skewX(' + this.model.skewX + 'deg) ' +
                    'skewY(' + this.model.skewY + 'deg) ' +
                    // 'perspective(' + this.model.perspective + ')' +
                    ''
        };
      }
    }
  },

  session: {
    width: ['number', true, 400],
    height: ['number', true, 300]
  },

  bindings: {
    'model.active': {
      type: 'toggle'
    },
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

  update: function() {}
});

module.exports = LayerView;
},{}],20:[function(require,module,exports){
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
      deps: ['rootView', 'rootView.signalNames'],
      fn: function () {
        return this.rootView ? this.rootView.signalNames || [] : [];
      }
    }
  },

  events: {
    'click [name=to-multi-mapping]': '_addToMulti',
    'click [name=default-value]': '_defaultValue',


    'click [name=clear-mapping]': '_clearMapping',

    'focus [data-hook=value]': '_valueFocus',

    'wheel [data-hook=value]': '_valueWheel',

    'paste [data-hook=value]': '_valueChange',
    'change [data-hook=value]': '_valueChange',


    'focus [data-hook=mapping]': '_mappingFocus',
    'blur [data-hook=mapping]': '_mappingBlur',

    'paste [data-hook=mapping]': '_mappingChange',
    'change [data-hook=mapping]': '_mappingChange'
  },

  _addToMulti: function() {
    this.rootView.addMultiMapping(this.model);
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
    if (!evt.shiftKey) {
      this._defaultValue(evt);
    }
  },



  _mappingFocus: function() {
    var helper = this.rootView.suggestionHelper;
    if (!helper) { return; }
    var mappingEl = this.queryByHook('mapping');
    var model = this.model;
    var layer = model.targetModel;
    helper.attach(mappingEl, function (selected) {
      model.eventNames = selected;
      layer.trigger('change:mappings', layer.mappings);
      helper.detach();
    }).fill(this.signalNames);
  },

  _mappingBlur: function() {
    this._mappingChange();
    // this.rootView.suggestionHelper.detach();
  },

  _mappingChange: function () {
    var model = this.model;
    var layer = model.targetModel;
    var mappingEl = this.queryByHook('mapping');
    var newEventNames = mappingEl.value.trim();
    if ((model.eventNames || '') === newEventNames) { return; }
    model.eventNames = newEventNames;
    layer.trigger('change:mappings', layer.mappings);
  },










  _valueFocus: function() {
    var model = this.model;
    var layer = model.targetModel;
    var def = this.model.definition;
    if (!def) {
      console.warn('no model definition', this.model);
      return;
    }

    var valueEl = this.queryByHook('value');
    if (valueEl.select) valueEl.select();

    if (def.values && def.values.length > 1) {
      var helper = this.rootView.suggestionHelper;
      if (!helper) { return; }

      helper.attach(valueEl, function(selected) {
        valueEl.value = selected;
        layer[model.targetProperty] = selected;
        helper.detach();
      }).fill(def.values);
    }
  },





  _valueWheel: function (evt) {
    if (evt.target !== document.activeElement) { return; }

    var def = this.model.definition;
    var valueEl = this.queryByHook('value');
    var value = valueEl.value.trim();

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
    valueEl.value = value;
    this._valueChange();
  },





  _valueChange: function () {
    var model = this.model;
    var layer = model.targetModel;
    var def = model.definition;
    if (!def) { return; }

    var value = this.queryByHook('value').value.trim();
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
          el.disabled = !!val;
        }
      },
      {
        selector: '[data-hook=mapping]',
        type: 'value'
      }
    ],
    propValue: {
      hook: 'value',
      type: 'value'
    }
  },

  template: '<div class="prop columns">' +
    '<span class="column no-grow gutter-right"><button name="to-multi-mapping" class="vfi-attach"></button></span>' +
    '<strong class="prop-name column gutter-horizontal"></strong>' +
    '<span class="column columns">' +
      '<span class="column no-grow gutter-horizontal"><button name="default-value" class="vfi-trash-empty"></button></span>' +
      '<input type="text" class="column gutter-left" placeholder="Value" data-hook="value" />' +
    '</span>' +
    '<span class="column columns mapping">' +
      '<input type="text" class="column gutter-right" placeholder="Events" data-hook="mapping" />' +
      '<span class="column gutter-left no-grow"><button name="clear-mapping" class="vfi-trash-empty"></button></span>' +
    '</span>' +
  '</div>'
});


MappingControlView.boolean = MappingControlView.extend({
  template: '<div class="prop columns">' +
    '<span class="column no-grow gutter-right"><button name="to-multi-mapping" class="vfi-attach"></button></span>' +
    '<strong class="prop-name column gutter-horizontal"></strong>' +
    '<span class="column columns">' +
      '<span class="column no-grow gutter-horizontal"><button name="default-value" class="vfi-trash-empty"></button></span>' +
      '<span class="column gutter-left"><button data-hook="value"></button></span>' +
    '</span>' +
    '<span class="column columns mapping">' +
      '<input class="column gutter-right" placeholder="Events" data-hook="mapping" />' +
      '<span class="column gutter-left no-grow"><button name="clear-mapping" class="vfi-trash-empty"></button></span>' +
    '</span>' +
  '</div>',

  bindings: {
    propValue: {
      hook: 'value',
      type: 'booleanClass',
      yes: 'vfi-toggle-on',
      no: 'vfi-toggle-off'
    },
    'model.targetProperty': [
      { selector: '.prop-name' },
      { type: 'class' }
    ],
    'model.eventNames': [
      {
        selector: '[data-hook=value]',
        type: function(el, eventNames) {
          el.disabled = !!eventNames;
        }
      },
      {
        selector: '[data-hook=mapping]',
        type: 'value'
      }
    ]
  },

  events: assign({}, MappingControlView.prototype.events, {
    'click [data-hook=value]': '_toggle'
  }),

  _toggle: function() {
    this.model.targetModel.toggle(this.model.targetProperty);
  }
});


MappingControlView.number = MappingControlView.extend({
  _valueChange: function () {
    var model = this.model;
    var layer = model.targetModel;

    var value = parseInt(this.queryByHook('value').value.trim() || 0, 10);

    if (layer[model.targetProperty] !== value) {
      layer[model.targetProperty] = value;
    }
  },

  template: '<div class="prop columns">' +
    '<span class="column no-grow gutter-right"><button name="to-multi-mapping" class="vfi-attach"></button></span>' +
    '<strong class="prop-name column gutter-horizontal"></strong>' +
    '<span class="column columns">' +
      '<span class="column no-grow gutter-horizontal"><button name="default-value" class="vfi-trash-empty"></button></span>' +
      '<input type="number" class="column gutter-left" placeholder="Value" data-hook="value" />' +
    '</span>' +
    '<span class="column columns mapping">' +
      '<input type="text" class="column gutter-right" placeholder="Events" data-hook="mapping" />' +
      '<span class="column gutter-left no-grow"><button name="clear-mapping" class="vfi-trash-empty"></button></span>' +
    '</span>' +
  '</div>'
});

MappingControlView.range = MappingControlView.number.extend({
  min: 0,
  max: 100,

  _valueChange: function () {
    var model = this.model;
    var min = this.min;
    var max = this.max;

    var layer = model.targetModel;

    var value = parseInt(this.queryByHook('value').value.trim() || 0, 10);
    value = value < min ? min : (value > max ? max : value);

    if (layer[model.targetProperty] !== value) {
      layer[model.targetProperty] = value;
    }
  },

  template: function() {
    return '<div class="prop columns">' +
      '<span class="column no-grow gutter-right"><button name="to-multi-mapping" class="vfi-attach"></button></span>' +
      '<strong class="prop-name column gutter-horizontal"></strong>' +
      '<span class="column columns">' +
        '<span class="column no-grow gutter-horizontal"><button name="default-value" class="vfi-trash-empty"></button></span>' +
        '<input type="range" min="' + this.min + '" max="' + this.max + '" class="column gutter-left" placeholder="Value" data-hook="value" />' +
      '</span>' +
      '<span class="column columns mapping">' +
        '<input type="text" class="column gutter-right" placeholder="Events" data-hook="mapping" />' +
        '<span class="column gutter-left no-grow"><button name="clear-mapping" class="vfi-trash-empty"></button></span>' +
      '</span>' +
    '</div>';
  }
});

MappingControlView.red =
MappingControlView.green =
MappingControlView.blue = MappingControlView.range.extend({
  min: 0,
  max: 255
});

MappingControlView.hue =
MappingControlView.rotateX =
MappingControlView.rotateY =
MappingControlView.rotateZ = MappingControlView.range.extend({
  min: 0,
  max: 360
});


MappingControlView.shadowBlur = MappingControlView.range.extend({
  min: 0,
  max: 50
});

MappingControlView.scaleX =
MappingControlView.scaleY = MappingControlView.range.extend({
  min: -200,
  max: 200
});

MappingControlView.translateX =
MappingControlView.translateY =
MappingControlView.shadowOffsetX =
MappingControlView.shadowOffsetY = MappingControlView.range.extend({
  min: -100,
  max: 100
});


MappingControlView.alpha =
MappingControlView.opacity =
MappingControlView.lightness =
MappingControlView.saturation = MappingControlView.range.extend({});

// MappingControlView.blending = MappingControlView.extend({
//   template: '<div class="prop columns">' +
//       '<span class="column no-grow gutter-right"><button name="to-multi-mapping" class="vfi-attach"></button></span>' +
//       '<strong class="prop-name column gutter-horizontal"></strong>' +
//       '<span class="column columns">' +
//         '<span class="column no-grow gutter-horizontal"><button name="default-value" class="vfi-trash-empty"></button></span>' +
//         '<span class="column gutter-left" data-hook="value"></span>' +
//       '</span>' +
//       '<span class="column columns mapping">' +
//         '<input class="column gutter-right" placeholder="Events" data-hook="mapping" />' +
//         '<span class="column gutter-left no-grow"><button name="clear-mapping" class="vfi-trash-empty"></button></span>' +
//       '</span>' +
//     '</div>'
// });
module.exports = MappingControlView;
},{}],21:[function(require,module,exports){
'use strict';
var MappableState = require('./state');
var MappingControlView = require('./../mappable/control-view');
var MultiMappingControlView = VFDeps.View.extend({
  template: '<section class="row rows">' +
    '<header class="row">' +
      '<h3>Multi mapping</h3>' +
    '</header>' +

    '<div class="row mappings props"></div>' +
  '</section>',

  initialize: function() {
    console.info('initialize multi mapping control view', this.mappings);
  },

  collections: {
    mappings: MappableState.Collection
  },

  subviews: {
    mappingsView: {
      selector: '.mappings',
      prepareView: function (el) {
        return this.renderCollection(this.mappings, function (opts) {
          var type = opts.model.definition.type;
          var name = opts.model.targetProperty;
          var Constructor = MappingControlView[name] || MappingControlView[type] || MappingControlView;
          console.info('multi mapping property name: %s (%s), type: %s (%s)', name, !!MappingControlView[name], type, !!MappingControlView[type]);
          return new Constructor(opts);
        }, el);
      }
    }
  }
});
module.exports = MultiMappingControlView;
},{"./../mappable/control-view":20,"./state":22}],22:[function(require,module,exports){
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
      deps: ['targetModel', 'targetModel.collection', 'targetModel.collection.parent'],
      fn: function() {
        return this.targetModel.collection.parent;
        // for (var inst = this.targetModel; inst; inst = inst.parent) {
        //   if (inst.frametime) { return inst; }
        // }
        // return false;
      }
    },
    definition: {
      deps: ['targetProperty', 'targetModel'],
      fn: function () {
        return this.targetModel.constructor.prototype._definition[this.targetProperty];
      }
    }
  },

  applyValue: function(originalVal) {
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
  initialize: function() {
    this.fillCollection();
  },

  fillCollection: function() {
    var mappings = this.mappings;
    var propNames = Object.keys(this.constructor.prototype._definition).filter(function (propName) {
      return ['type', 'name'].indexOf(propName) < 0;
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

  derived: {
    propDefaults: {
      fn: function() {
        var returned = {};
        var definition = this.constructor.prototype._definition;
        var propName;
        for (propName in definition) {
          returned[propName] = definition[propName].default;
        }
        return returned;
      }
    }
  },

  serialize: function(options) {
    options = options || {};
    var serialized = State.prototype.serialize.call(this, options);
    var defaults = this.propDefaults;
    var returned = {};

    var propName;
    for (propName in serialized) {
      if (propName !== 'mappings' && (typeof defaults[propName] === 'undefined' || serialized[propName] !== defaults[propName])) {
        returned[propName] = serialized[propName];
      }
    }

    if (options.mappings) {
      returned.mappings = serialized.mappings;
    }

    return serialized;
  },

  collections: {
    mappings: MappingsCollection
  }
});

MappableState.State = MappingState;
MappableState.Collection = MappingsCollection;
module.exports = MappableState;

},{}],23:[function(require,module,exports){
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
  prefix: 'kp3',

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
    'buttonA:noteOn',
    'buttonA:noteOff',
    'buttonB:noteOn',
    'buttonB:noteOff',
    'buttonC:noteOn',
    'buttonC:noteOff',
    'buttonD:noteOn',
    'buttonD:noteOff',

    'num1:noteOn',
    'num1:noteOff',
    'num2:noteOn',
    'num2:noteOff',
    'num3:noteOn',
    'num3:noteOff',
    'num4:noteOn',
    'num4:noteOff',
    'num5:noteOn',
    'num5:noteOff',
    'num6:noteOn',
    'num6:noteOff',
    'num7:noteOn',
    'num7:noteOff',
    'num8:noteOn',
    'num8:noteOff',

    'effectKnob:change',
    'effectSlider:change'
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
        var prefix = this.midiMapping.prefix;
        return this.midiMapping.signalNames.map(function(str) {
          return prefix + ':' + str;
        });
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
    var eventName = model.midiMapping.prefix + ':' + obj.signalNote + ':' + obj.signalType;
    accessState.trigger('midi', eventName, obj.signalVelocity/*, model, eventName*/);

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
      var model;

      accessState.MIDIAccess.inputs.forEach(function(info) {
        model = new MIDIState({
          connection: info.connection,
          state: info.state,
          type: info.type,
          id: info.id,
          manufacturer: info.manufacturer,
          name: info.name,
          version: info.version
        });
        if (model.midiMapping) {
          if (typeof info.onmidimessage !== 'undefined') {
            info.onmidimessage = handleMIDIMessage(accessState, model);
          }

          inputs.push(model);
        }
      });

      accessState.MIDIAccess.outputs.forEach(function(info) {
        model = new MIDIState({
          connection: info.connection,
          state: info.state,
          type: info.type,
          id: info.id,
          manufacturer: info.manufacturer,
          name: info.name,
          version: info.version
        });

        if (model.midiMapping) {
          outputs.push(model);
        }
      });

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

},{}],24:[function(require,module,exports){
'use strict';
var VFDeps = window.VFDeps;
var View = VFDeps.View;
var MIDIView = View.extend({
  template: [
    '<li class="gutter">',
    '<span class="name"></span> ',
    '</li>'
  ].join(''),
  bindings: {
    'model.active': {
      type: 'booleanClass'
    },
    'model.state': '.state',
    'model.name': '.name'
  },

  events: {
    click: '_handleClick'
  },

  _handleClick: function() {
    this.model.toggle('active');
  }
});

var MIDIAccessView = View.extend({
  template:
    '<div class="midi-access">' +
      '<div class="midi-inputs">' +
        '<div class="gutter">Inputs</div>' +
        '<ul></ul>' +
      '</div>' +
    //   '<div class="midi-outputs">' +
    //     '<div class="gutter">Outputs</div>' +
    //     '<ul></ul>' +
    //   '</div>' +
    '</div>',

  render: function() {
    var originalClass;
    if (this.el) {
      originalClass = this.el.className;
    }
    this.renderWithTemplate();
    if (originalClass) {
      this.el.className = originalClass;
    }
    this.inputsView = this.renderCollection(this.model.inputs, MIDIView, '.midi-inputs ul');
    // this.outputsView = this.renderCollection(this.model.outputs, MIDIView, '.midi-outputs ul');
    return this;
  }
});

module.exports = MIDIAccessView;
},{}],25:[function(require,module,exports){
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
  initialize: function() {
    this.on('change:frametime', function() {
      this.trigger('frametime', this.frametime);
    });
  },

  props: {
    audioMinDb: ['number', true, -90],
    audioMaxDb: ['number', true, -10],
    audioSmoothing: ['number', true, 0.85],
    audioFftSize: ['number', true, 32],
    frametime: ['number', true, 0],
    firstframetime: ['any', true, function () {
      return performance.now();
    }],
    signals: ['object', true, function() { return {}; }]
  },

  collections: {
    screenLayers: Collection.extend({
      comparator: 'zIndex',
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
    latency: ['number', true, 0]
  }
});
module.exports = ScreenState;
},{"./../layer/canvas/state":9,"./../layer/img/state":12,"./../layer/state":14,"./../layer/svg/state":15,"./../layer/video/state":17,"./../signal/beat/state":28,"./../signal/hsla/state":32,"./../signal/rgba/state":34,"./../signal/state":35}],26:[function(require,module,exports){
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

  session: {
    width: ['number', true, 400],
    height: ['number', true, 300],
    broadcastId: ['string', true, 'vfBus'],
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

  execCommand: function(name, evt) {
    evt.data.latency = performance.now() - evt.timeStamp;
    this.update(evt.data);
  },

  initialize: function () {
    var screenView = this;
    if (!screenView.model) {
      throw new Error('Missing model option for ScreenView');
    }

    if (window.BroadcastChannel) {
      var channel = screenView.channel = new window.BroadcastChannel(this.broadcastId);
      channel.onmessage = function(evt) {
        screenView.execCommand('update', evt);
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
      this.width = this.el.clientWidth;
      this.height = this.el.clientHeight;
      return this.resizeLayers();
    }

    p = p || this.el.parentNode;
    if (p && p.clientWidth) {
      this.width = p.clientWidth;
      var r = this.ratio || 4/3;
      this.height = Math.floor(this.width / r);
      this.el.style.width = this.width + 'px';
      this.el.style.height = this.height + 'px';
    }
    return this.resizeLayers();
  },

  resizeLayers: function() {
    if (!this.layersView || !this.layersView.views) { return this; }
    var w = this.width;
    var h = this.height;

    this.layersView.views.forEach(function(view) {
      view.width = w;
      view.height = h;
    });
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
},{"./../layer/canvas/view":10,"./../layer/img/view":13,"./../layer/svg/view":16,"./../layer/video/view":18,"./../layer/view":19}],27:[function(require,module,exports){
'use strict';
var assign = window.VFDeps.assign;
var SignalControlView = require('./../control-view');
var BeatSignalControlView = SignalControlView.beatSignal = SignalControlView.extend({
  template: '<section class="rows signal signal-beat">' +
    '<header class="row">' +
      '<h3 class="name"></h3>' +
    '</header>' +

    '<div class="row columns gutter-horizontal gutter-bottom">' +
      '<div class="column result-dot no-grow gutter-right"></div>' +
      '<div class="column result gutter-left">' +
        '<input class="column input" placeholder="BPM" data-hook="input" />' +
      '</div>' +
    '</div>' +

    '<div class="row mappings props"></div>' +
  '</section>',

  bindings: assign({}, SignalControlView.prototype.bindings, {
    'model.result': [
      {
        selector: '.result-dot',
        type: function(el, val) {
          el.style.backgroundColor = 'hsla(190, 81%, 67%,' + (val / 100) + ')';
        }
      }
    ]
  }),

  events: assign({}, SignalControlView.prototype.events, {
    'change [data-hook=input]': '_updateBPM'
  }),

  _updateBPM: function() {
    this.model.input = parseInt(this.queryByHook('input').value.trim(), 10);
    console.info('Changing BPM', this.model.input);
  },

  render: function () {
    this.renderWithTemplate();
    var inputEl = this.queryByHook('input');
    if (inputEl && !inputEl.value) {
      inputEl.value = this.model.input;
    }
    return this;
  }
});
module.exports = BeatSignalControlView;
},{"./../control-view":29}],28:[function(require,module,exports){
'use strict';
var SignalState = require('./../state');

var BeatState = SignalState.beatSignal = SignalState.extend({
  initialize: function() {
    SignalState.prototype.initialize.apply(this, arguments);
    var state = this;
    this.collection.parent.on('change:frametime', function(screenState, frametime) {
      state._ft = frametime;
    });
  },

  session: {
    _ft: ['number', true, 0]
  },

  derived: {
    result: {
      deps: ['timeBetweenBeats', '_ft'],
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
    var frametime = this._ft;
    var preTransform = !frametime ? 0 : (100 - (((frametime % this.timeBetweenBeats) / this.timeBetweenBeats) * 100));
    var result = SignalState.prototype.computeSignal.apply(this, [preTransform]);
    // this.collection.parent.signals[this.name] = result;
    return result;
  }
});

module.exports = BeatState;
},{"./../state":35}],29:[function(require,module,exports){
'use strict';
var View = window.VFDeps.View;
var SignalDetailsView = require('./details-view');
var SignalControlView = View.extend({
  template: '<section class="rows signal">' +
    '<header class="row">' +
      '<h3 class="row name"></h3>' +
    '</header>' +

    // '<div class="row gutter-horizontal columns model text-center">' +
    //   '<div class="column input"></div>' +
    //   '<div class="column gutter-horizontal no-grow">&raquo;</div>' +
    //   '<div class="column result"></div>' +
    // '</div>' +

    '<div class="row gutter-horizontal columns test text-center">' +
      '<input class="column input" placeholder="Input" type="text"/>' +
      '<div class="column gutter-horizontal no-grow">&raquo;</div>' +
      '<div class="column result"></div>' +
    '</div>' +
  '</section>',

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
    // 'model.input': '.model .input',
    // 'model.result': '.model .result',
    result: '.test .result'
  },

  events: {
    'change .test .input': '_testValue',
    'click header h3': '_showDetails'
  },

  _showDetails: function () {
    this.rootView.showDetails(new SignalDetailsView({
      parent: this,
      model: this.model,
    }));
  },

  _testValue: function(evt) {
    this.input = evt.target.value.trim();
  },

  render: function () {
    this.renderWithTemplate();
    var inputEl = this.query('.test .input');
    if (inputEl && !inputEl.value) {
      inputEl.value = this.input || null;
    }
    return this;
  }
});
module.exports = SignalControlView;
},{"./details-view":30}],30:[function(require,module,exports){
'use strict';
var assign = window.VFDeps.assign;
var DetailsView = require('./../controller/details-view');
var TransformationControlView = require('./../transformation/control-view');
var transformationFunctions = require('./../transformation/functions');
var SignalDetailsView = DetailsView.extend({
  template: '<section>' +
    '<header>' +
      '<h3>Details for <span data-hook="name"></span></h3>' +
    '</header>' +

    '<div class="row mappings props"></div>' +

    '<div class="row gutter transformations-control columns">' +
      '<input class="column gutter-right" placeholder="New transformation" data-hook="new-transformation-name" type="text"/>' +
      '<div class="column gutter-left no-grow"><button name="add-transformation" class="vfi-plus"></button></div>' +
    '</div>' +
    '<div class="row transformations props"></div>' +
  '</section>',

  subviews: assign({}, DetailsView.prototype.subviews, {
    transformationsView: {
      selector: '.transformations',
      prepareView: function (el) {
        return this.renderCollection(this.model.transformations, TransformationControlView, el);
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
    var nameEl = this.queryByHook('new-transformation-name');
    var helper = this.rootView.suggestionHelper;

    nameEl.select();
    helper.attach(nameEl, function(selected){
      nameEl.value = selected;
      helper.detach();
    }).fill(Object.keys(transformationFunctions));
  },

  _addTransformation: function () {
    this.model.transformations.add({
      name: this.queryByHook('new-transformation-name').value.trim()
    });
  },

  bindings: assign({
    'model.name': '[data-hook=name]'
  }, DetailsView.prototype.bindings)
});
module.exports = SignalDetailsView;
},{"./../controller/details-view":4,"./../transformation/control-view":36,"./../transformation/functions":37}],31:[function(require,module,exports){
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
},{"./../control-view":29}],32:[function(require,module,exports){
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
},{"./../state":35}],33:[function(require,module,exports){
'use strict';
var SignalControlView = require('./../control-view');
var HSLASignalControlView = require('./../hsla/control-view');

var RGBASignalControlView = SignalControlView.rgbaSignal = HSLASignalControlView.extend({});

module.exports = RGBASignalControlView;
},{"./../control-view":29,"./../hsla/control-view":31}],34:[function(require,module,exports){
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
},{"./../state":35}],35:[function(require,module,exports){
'use strict';
var State = window.VFDeps.State;
var Collection = window.VFDeps.Collection;
var MappableState = require('./../mappable/state');
var transformationFunctions = require('./../transformation/functions');

var SignalTransformationState = State.extend({
  props: {
    name: ['string', true, null],
    arguments: ['array', true, function () { return []; }]
  }
});


var SignalState = MappableState.extend({
  idAttribute: 'name',
  typeAttribute: 'type',

  initialize: function() {
    this.on('change:result', function() {
      // this.collection.parent.signals[this.name] = this.result;
      this.collection.parent.trigger(this.name, this.result);
    });

    if (this.input === null || this.input === undefined) {
      this.input = this.defaultValue;
    }
  },

  props: {
    name: ['string', true, null],
    type: ['string', true, 'default'],
    defaultValue: ['any', true, function () { return 1; }]
  },

  session: {
    input: ['any', false, null]
  },

  collections: {
    transformations: Collection.extend({
      model: SignalTransformationState
    })
  },

  derived: {
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
  }
});
module.exports = SignalState;
},{"./../mappable/state":22,"./../transformation/functions":37}],36:[function(require,module,exports){
'use strict';
var View = window.VFDeps.View;
var TransformationControlView = View.extend({
  template: '<div class="transformation gutter columns">' +
      '<div class="column gutter-right text-right" data-hook="name"></div>' +
      '<div class="column gutter-horizontal no-grow"><button name="remove" class="vfi-trash-empty"></button></div>' +
      '<input class="column gutter-left" data-hook="arguments" type="text"/>' +
    '</div>',

  derived: {
    rootView: {
      deps: ['parent'],
      fn: function () {
        for (var inst = this; inst; inst = inst.parent) {
          if (!inst.parent) { return inst; }
        }
      }
    },
    arguments: {
      deps: ['model', 'model.arguments'],
      fn: function() {
        return (this.model.arguments || []).join(',');
      }
    }
  },

  parseArguments: function(value) {
    var state = this.model;
    value = (value || this.queryByHook('arguments').value).trim();
    var math = state.name.indexOf('math.') === 0;
    var values = value.split(',').map(function(arg) {
      arg = math ? Number(arg) : arg;
      arg = math && isNaN(arg) ? 0 : arg;
      return arg;
    });
    this.model.arguments = values;
  },

  bindings: {
    'model.name': '[data-hook=name]',
    'model.arguments': {
      hook: 'arguments',
      type: function(el) {
        if (el === document.activeElement) { return; }
        el.value = this.model.arguments.join(',');
      }
    }
  },

  events: {
    'click [name=remove]': '_remove',

    'keyup [data-hook=arguments]': '_changeArguments'
  },

  _remove: function() {
    this.model.collection.remove(this.model);
  },

  _changeArguments: function() {
    this.parseArguments();
  }
});

module.exports = TransformationControlView;
},{}],37:[function(require,module,exports){
'use strict';
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

module.exports = transformationFunctions;
},{}]},{},[1]);
