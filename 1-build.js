webpackJsonp([1],{

/***/ 1:
/***/ function(module, exports, __webpack_require__) {

"use strict";

var View = window.VFDeps.View;
var LayerView = __webpack_require__(12);
__webpack_require__(24);
__webpack_require__(28);
__webpack_require__(30);
__webpack_require__(26);



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

/***/ },

/***/ 12:
/***/ function(module, exports, __webpack_require__) {

"use strict";

var View = window.VFDeps.View;

var LayerView = View.extend({
  template: function() {
    return '<div layer-id="' + this.model.cid + '" view-id="' + this.cid + '" class="missing-layer-view" style="will-change:transform, opacity, backfaceVisibility;width:100%;height:100%;display:table">'+
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
        // 'width',
        // 'height',
        'model.active',
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
        var width = this.el.parentNode ? (this.el.parentNode.clientWidth + 'px') : '100%';
        var height = this.el.parentNode ? (this.el.parentNode.clientHeight + 'px') : '100%';
        return {
          display: this.model.active ? 'block' : 'none',
          opacity: this.model.opacity * 0.01,
          mixBlendMode: this.model.mixBlendMode,
          width: width,
          height: height,
          zIndex: this.zIndex || 0,
          perspective: this.model.perspective + 'px',
          // transform:
          //           'rotateX(' + this.model.rotateX + 'deg) ' +
          //           'rotateY(' + this.model.rotateY + 'deg) ' +
          //           'rotateZ(' + this.model.rotateZ + 'deg) ' +
          //           'translateX(' + this.model.translateX + '%) ' +
          //           'translateY(' + this.model.translateY + '%) ' +
          //           // 'translateZ(' + this.model.translateZ + '%) ' +
          //           'scaleX(' + (this.model.scaleX * 0.01) + ') ' +
          //           'scaleY(' + (this.model.scaleY * 0.01) + ') ' +
          //           // 'scaleZ(' + this.model.scaleZ + '%) ' +
          //           'skewX(' + this.model.skewX + 'deg) ' +
          //           'skewY(' + this.model.skewY + 'deg) ' +
          //           // 'perspective(' + this.model.perspective + ')' +
          //           ''
        };
      }
    },
    styleEl: {
      deps: ['el'],
      fn: function() {
        var el = document.getElementById('style-' + this.cid);
        if (!el) {
          el = document.createElement('style');
          el.id = 'style-' + this.cid;
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
          this.addRule('', 'display: none');
        }
        return this.sheet.cssRules[0];
      }
    }
  },

  session: {
    width: ['number', true, 400],
    height: ['number', true, 300]
  },

  bindings: {
    'model.type': '[data-hook=type]',
    'model.name': '[data-hook=name]',
    style: {
      type: function() {
        var style = this.cssRule.style;
        var computed = this.style;
        Object.keys(computed).forEach(function(key) {
          style[key] = computed[key];
        });
      }
    }
  },

  addRule: function(selector, rules, index) {
    var sheet = this.sheet;
    var prefix = '[view-id="'+ this.cid +'"] ';
    index = index || 0;
    if('insertRule' in sheet) {
      sheet.insertRule(prefix + selector + ' { ' + rules + ' } ', index);
    }
    else if('addRule' in sheet) {
      sheet.addRule(prefix + selector, rules, index);
    }
  },

  remove: function() {
    var styleEl = this.styleEl;
    if (styleEl && styleEl.parentNode) {
      styleEl.parentNode.removeChild(styleEl);
    }
    View.prototype.remove.apply(this, arguments);
  },

  update: function() {}
});

module.exports = LayerView;

/***/ },

/***/ 24:
/***/ function(module, exports, __webpack_require__) {

"use strict";


var ScreenLayerView = __webpack_require__(12);
module.exports = ScreenLayerView.canvas = ScreenLayerView.extend({
  template: function() {
    return '<canvas layer-id="' + this.model.cid + '" view-id="' + this.cid + '"></canvas>';
  },

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

  update: function() {
    this.model.frametime = this.parent.model.frametime;

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
    }
  }, ScreenLayerView.prototype.bindings)
});

/***/ },

/***/ 26:
/***/ function(module, exports, __webpack_require__) {

"use strict";


var ScreenLayerView = __webpack_require__(12);
module.exports = ScreenLayerView.img = ScreenLayerView.extend({
  template: function() {
    return '<div class="layer-image" layer-id="' + this.model.cid + '" view-id="' + this.cid + '"></div>';
  },

  bindings: VFDeps.assign({
    'model.src': {
      type: function() {
        this.el.style.backgroundImage = 'url(' + this.model.src + ')';
      }
    },
    'model.backgroundSize': {
      type: function() {
        this.el.style.backgroundSize = this.model.backgroundSize;
      }
    },
    'model.backgroundPosition': {
      type: function() {
        this.el.style.backgroundPosition = this.model.backgroundPosition;
      }
    },
    'model.backgroundRepeat': {
      type: function() {
        this.el.style.backgroundRepeat = this.model.backgroundRepeat;
      }
    }
  }, ScreenLayerView.prototype.bindings)
});

/***/ },

/***/ 28:
/***/ function(module, exports, __webpack_require__) {

"use strict";

var _ids = 0;
var ScreenLayerView = __webpack_require__(12);
module.exports = ScreenLayerView.SVG = ScreenLayerView.extend({
  autoRender: true,

  template: function() {
    return '<div class="layer-svg" layer-id="' + this.model.cid + '" view-id="' + this.cid + '"></div>';
  },

  // bindings: VFDeps.assign({
  // }, ScreenLayerView.prototype.bindings),


  // derived: {
  //   styleEl: {
  //     deps: ['model.src'],
  //     fn: function() {
  //       var el = document.createElement('style');
  //       el.id = this.cid;
  //       document.head.appendChild(el);
  //       return el;
  //     }
  //   }
  // },

  extractStyles: function() {
    var self = this;
    this.queryAll('[style]').forEach(function(el) {
      if (!el.id) {
        _ids++;
        el.id = 'auto-svg-id-' + _ids;
      }

      self.addRule('#' + el.id, el.getAttribute('style'));
      el.removeAttribute('style');
    });
    return this;
  },

  editStyles: function() {

  },

  loadSVG: function() {
    var view = this;
    var src = view.model.src;
    var el = view.el;
    if (!src || !el) {
      return;
    }

    fetch(src)
    .then(function(response) {
      return response.text();
    })
    .then(function(txt) {
      el.innerHTML = txt;
      view.extractStyles();
    });
  },

  initialize: function() {
    ScreenLayerView.prototype.initialize.apply(this, arguments);
    this.on('change:rendered', this.loadSVG);
    this.listenToAndRun(this.model, 'change:src', this.loadSVG);
  },

  remove: function() {
    var style = this.styleEl;
    style.parentNode.removeChild(style);
    ScreenLayerView.prototype.remove.apply(this, arguments);
  },

  render: function() {
    if (this.el) {
      return this;
    }

    this.renderWithTemplate();
    return this;
  }
});

/***/ },

/***/ 30:
/***/ function(module, exports, __webpack_require__) {

"use strict";


var ScreenLayerView = __webpack_require__(12);
module.exports = ScreenLayerView.video = ScreenLayerView.extend({
  template: function() {
    return '<video layer-id="' + this.model.cid + '" view-id="' + this.cid + '" autoplay loop muted></video>';
  },

  bindings: VFDeps.assign({
    'model.src': {
      type: 'attribute',
      name: 'src'
    }
  }, ScreenLayerView.prototype.bindings)
});

/***/ }

});
//# sourceMappingURL=1-build.js.map