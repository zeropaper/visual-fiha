'use strict';
var View = require('ampersand-view');
var LayerView = require('./../layer/view');
require('./../layer/canvas/view');
require('./../layer/svg/view');
require('./../layer/video/view');
require('./../layer/img/view');
require('./../layer/threejs/view');
require('./../layer/txt/view');
require('./../layer/threejs/view');


function signature(fn) {
  var args = fn.toString().match('function[^(]*\\(([^)]*)\\)');
  if (!args || !args[1].trim()) { return []; }
  return args[1].split(',').map(function(a){ return a.trim(); });
}

var signatures = {};
function registerCommand(commandName, command) {
  if (arguments.length === 1) {
    if (typeof arguments[0] === 'function') {
      command = arguments[0];
      commandName = command.name;
    }
    else {
      command = commands[arguments[0]];
    }
  }
  else if (typeof command !== 'function') {
    command = commands[commandName];
  }
  signatures[commandName] = signature(command);
}




var commands = {
  bootstrap: function bootstrap(layers) {
    this.model.layers.reset(layers);
    this.resize();
  },
  updateLayer: function(layer) {
    var state = this.model.layers.get(layer.name);
    if (state) {
      state.set(layer);
    }
    else {
      state = this.model.layers.add(layer);
    }
  },
  heartbeat: function(frametime, audio) {
    this.model.frametime = frametime;
    this.model.audio = audio;
  },
  updateLayers: function(layers) {
    this.model.layers.set(layers);
  }
};

Object.keys(commands).forEach(registerCommand);


var clientMixin = {};
clientMixin.initializeClient = function initializeClient() {
  var channel = new window.BroadcastChannel('spike');
  var follower = this;
  var commandArgs;

  channel.addEventListener('message', function(evt) {
    var commandName = evt.data.command;
    var command = commands[commandName];

    if (typeof command !== 'function') {
      return;
    }

    if (!signatures[commandName]) {
      return;
    }

    commandArgs = signatures[commandName].map(function(argName) {
      if (argName === 'timeStamp') return evt.timeStamp;
      return evt.data.payload[argName];
    });

    command.apply(follower, commandArgs);
    follower.model.trigger('app:broadcast:' + commandName, evt.data.payload);
  });

  this.channel = channel;
};













var ScreenView = View.extend(clientMixin, {
  autoRender: true,

  template: '<div class="screen"></div>',

  session: {
    width: ['number', true, 400],
    height: ['number', true, 300],
    captureMouse: ['boolean', true, false],
    captureDebug: ['boolean', true, false]
  },

  initialize: function () {
    if (!this.model) {
      throw new Error('Missing model option for ScreenView');
    }
    this.initializeClient();
  },

  derived: {
    styleEl: {
      deps: ['el'],
      fn: function() {
        var el = document.getElementById('vf-screen-styles');
        if (!el) {
          el = document.createElement('style');
          el.id = 'vf-screen-styles';
          el.appendChild(document.createTextNode(''));
          document.head.appendChild(el);
        }
        return el;
      }
    },
    sheet: {
      deps: ['styleEl'],
      fn: function() {
        return this.styleEl.sheet;
      }
    },
    cssRule: {
      deps: ['sheet'],
      fn: function() {
        if (this.sheet.cssRules.length === 0) {
          this.addRule('', 'opacity:1');
        }
        return this.sheet.cssRules[0];
      }
    }
  },

  addRule: function(selector, parameters) {
    var sheet = this.sheet;
    this.el.id = this.el.id || 'vf-screen-' + this.cid;
    var prefix = '#'+ this.el.id +' ';
    var index = sheet.cssRules.length;
    selector = (prefix + selector).trim();
    for (var i = index - 1; i >= 0; i--) {
      if (sheet.cssRules[i].selectorText === selector) {
        sheet.deleteRule(i);
      }
    }


    index = sheet.cssRules.length;

    sheet.insertRule(selector + ' { ' + parameters + ' } ', index);
    return this;
  },

  setProperty: function(...args) {
    this.cssRule.style.setProperty(...args);
  },

  remove: function() {
    if (this.channel) {
      this.channel.close();
    }
    return View.prototype.remove.apply(this, arguments);
  },

  resize: function () {
    if (!this.el) { return this; }
    this.setProperty('position', 'fixed');
    this.setProperty('top', 0);
    this.setProperty('left', 0);
    this.setProperty('width', '100%');
    this.setProperty('height', '100%');
    if (!this.el || !this.el.parentNode || !document.body.contains(this.el)) {
      return this;
    }
    this.width = this.el.clientWidth;
    this.height = this.el.clientHeight;
    return this._resizeLayers();
  },

  _resizeLayers: function() {
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
    if (!this.el) {
      this.renderWithTemplate();
    }

    if (!this.layersView) {
      this.layersView = this.renderCollection(this.model.layers, function(opts) {
        var type = opts.model.getType();
        var ScreenLayerConstructor = LayerView.types[type] || LayerView;
        return new ScreenLayerConstructor(opts);
      }, this.el, {parent: this});
      this._updateLayers();
    }

    if (!this._ar) {
      this._animate();
    }

    return this.resize();
  },

  update: function(options) {
    if (!this.layersView) {
      return this.render().update(options);
    }

    this.model.set(options);

    return this;
  },

  _ar: null,
  _animate: function() {
    this._updateLayers();
    this._ar = window.requestAnimationFrame(this._animate.bind(this));
  },

  _updateLayers: function() {
    this.setProperty('--frametime', this.model.frametime);

    var audio = this.model.audio;
    if (audio && audio.frequency && audio.timeDomain) {
      var length = audio.frequency.length;
      var l, li = 0, af = 0, av = 0, ll = length / 16;

      for (l = 0; l < length; l += ll) {
        li++;
        af += audio.frequency[l];
        av += audio.timeDomain[l];
        this.setProperty('--freq' + li, audio.frequency[l]);
        this.setProperty('--vol' + li, audio.timeDomain[l]);
      }
      this.setProperty('--freqAvg', af / length);
      this.setProperty('--volAvg', av / length);
    }

    this.layersView.views.forEach(function(subview) {
      if (subview.model.active) subview.update();
    });
  }
});
module.exports = ScreenView;