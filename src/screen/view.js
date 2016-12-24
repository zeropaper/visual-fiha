'use strict';
var View = window.VFDeps.View;
var LayerView = require('./../layer/view');
require('./../layer/canvas/view');
require('./../layer/svg/view');
require('./../layer/video/view');
require('./../layer/img/view');



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




var commands = {};
commands.setup = function setup(state) {
  this.update(state);
};
commands.resetLayers = function resetLayers(layers) {
  var triggerChange;
  var collection = this.model.screenLayers;

  function findLayer(name) {
    return layers.find(function () {
      return function(lo) {
        return lo.name === name;
      };
    });
  }

  layers.forEach(function(layer) {
    triggerChange = true;
    var state = collection.get(layer.name);
    if (state) {
      state.set(layer);
    }
    else {
      collection.add(layer);
    }
  });

  collection.forEach(function(layer) {
    var found = findLayer(layer.name);
    if (!found) {
      triggerChange = true;
      collection.remove(layer);
    }
  });

  if (triggerChange) {
    this.trigger('change:screenLayers', collection);
  }

  this.resize();
};
commands.addLayer = function addLayer(layer) {
  var collection = this.model.screenLayers;
  collection.add(layer);
};
commands.removeLayer = function removeLayer(layerName) {
  var collection = this.model.screenLayers;
  collection.remove(collection.get(layerName));
};
commands.updateLayer = function updateLayer(layer, layerName) {
  this.model.screenLayers.get(layerName).set(layer);
};

commands.heartbeat = function heartbeat(frametime, audio) {
  this.model.frametime = frametime;
  this.model.audio = audio;
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

    // console.info('%cscreen command "%s"', 'color:blue', commandName);

    commandArgs = signatures[commandName].map(function(argName) {
      if (argName === 'timeStamp') return evt.timeStamp;
      return evt.data.payload[argName];
    });

    command.apply(follower, commandArgs);
  }, false);

  channel.postMessage({
    command: 'register',
    payload: {
      id: 'screen' + performance.now()
    }
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

  remove: function() {
    if (this.channel) {
      this.channel.close();
    }
    return View.prototype.remove.apply(this, arguments);
  },

  resize: function () {
    if (!this.el) { return this; }
    this.el.style.position = 'fixed';
    this.el.top = 0;
    this.el.left = 0;
    this.el.style.width = '100%';
    this.el.style.height = '100%';
    this.width = this.el.parentNode.clientWidth;
    this.height = this.el.parentNode.clientHeight;
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
      this.layersView = this.renderCollection(this.model.screenLayers, function(opts) {
        var type = opts.model.getType();
        var ScreenLayerConstructor = LayerView[type] || LayerView;
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

    return this;
  },

  _ar: null,
  _animate: function(timestamp) {
    this.model.frametime = timestamp || 0;
    this._updateLayers();
    this._ar = window.requestAnimationFrame(this._animate.bind(this));
  },

  _updateLayers: function() {
    this.layersView.views.forEach(function(subview) {
      subview.update();
    });
  }
});
module.exports = ScreenView;