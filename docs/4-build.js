webpackJsonp([4],{

/***/ 145:
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var View = __webpack_require__(35);
var LayerView = __webpack_require__(652);
__webpack_require__(680);
__webpack_require__(688);
__webpack_require__(692);
__webpack_require__(683);
__webpack_require__(690);


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
  bootstrap: function bootstrap(state) {
    this.update(state || {});
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
  updateLayers: function(layers, audio) {
    if (audio) this.model.audio = audio;
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

  addRule: function(selector, properties) {
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

    sheet.insertRule(selector + ' { ' + properties + ' } ', index);
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
    if (!this.el || !this.el.parentNode) {
      return this;
    }
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
  _animate: function(timestamp) {
    this.model.frametime = timestamp || 0;
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

/***/ }),

/***/ 652:
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var View = __webpack_require__(35);

var LayerView = View.extend({
  template: function() {
    return `
      <div id="${this.model.getId()}" view-id="${this.cid}" class="missing-layer-view" style="will-change:transform, opacity, backfaceVisibility;width:100%;height:100%;display:table">
        <div style="display:table-cell;color:#a66;vertical-align:middle;text-align:center;font-weight:700;font-size:30px;text-shadow:0 0 4px #000">
          Missing
          <span data-hook="type"></span> for
          <span data-hook="name"></span>
          layer view
          <br/>
          <span data-hook="frametime"></span>
        </div>
      </div>
    `;
  },

  initialize: function() {
    var view = this;
    view.model.styleProperties.on('change', function(prop) {
      view.setProperty(prop.name, prop.value);
    });
  },

  derived: {
    styleEl: {
      deps: ['el'],
      fn: function() {
        var el = document.getElementById('style-' + this.model.getId());
        if (!el) {
          el = document.createElement('style');
          el.id = 'style-' + this.model.getId();
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
      deps: ['sheet', 'model.layerStyles'],
      fn: function() {
        if (this.sheet.cssRules.length === 0) {
          this.addRule('', this.model.layerStyles);
        }
        return this.sheet.cssRules[0];
      }
    },
    layerStyleObj: {
      deps: ['model', 'model.layerStyles'],
      fn: function() {
        var exp = /[\s]*([^:]+)[\s]*:[\s]*([^;]+)[\s]*;[\s]*/gim;
        return ((this.model.layerStyles || '').match(exp) || [])
          .map(s => s
            .trim()
            .split(':')
              .map(ss => ss
                .replace(';', '')
                .trim()));
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
    'model.active': {type: 'toggle'},
    'model.layerStyles': {
      type: function() {
        var style = this.cssRule.style;
        this.layerStyleObj.forEach(function(arr) {
          style[arr[0]] = arr[1];
        });
      }
    },
    'model.opacity': {
      type: function(el, val) {
        this.cssRule.style.opacity = val * 0.01;
      }
    },
    'model.zIndex': {
      type: function(el, val) {
        this.cssRule.style.zIndex = val;
      }
    }
  },

  setProperty: function(...args) {
    this.cssRule.style.setProperty(...args);
  },

  addRule: function(selector, properties) {
    var sheet = this.sheet;
    var prefix = '#'+ this.model.getId() +' ';
    var index = sheet.cssRules.length;
    selector = (selector.indexOf('@') === 0 ? selector : prefix + selector).trim();
    for (var i = index - 1; i >= 0; i--) {
      if (sheet.cssRules[i].selectorText === selector) {
        sheet.deleteRule(i);
      }
    }


    index = sheet.cssRules.length;

    sheet.insertRule(selector + ' { ' + properties + ' } ', index);
    return this;
  },

  remove: function() {
    var styleEl = this.styleEl;
    if (styleEl && styleEl.parentNode) {
      styleEl.parentNode.removeChild(styleEl);
    }
    return View.prototype.remove.apply(this, arguments);
  },

  update: function() {}
});
LayerView.types = {};
module.exports = LayerView;

/***/ }),

/***/ 680:
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var assign = __webpack_require__(33);

var ScreenLayerView = __webpack_require__(652);
module.exports = ScreenLayerView.types.canvas = ScreenLayerView.extend({
  template: function() {
    return '<canvas id="' + this.model.getId() + '" view-id="' + this.cid + '"></canvas>';
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

  session: {
    frames: ['number', true, 0]
  },

  update: function() {
    ScreenLayerView.prototype.update.apply(this, arguments);
    this.model.frametime = this.parent.model.frametime;
    if (!this.parent || !this.parent.el) return;

    var cw = this.width = this.parent.el.clientWidth;
    var ch = this.height = this.parent.el.clientHeight;
    var ctx = this.ctx;
    ctx.clearRect(0, 0, cw, ch);
    if (!this.model.active) { return this; }

    this.model.canvasLayers.filter(function (layer) {
      return layer.active;
    }).forEach(function(layer) {
      layer.draw(ctx);
    });

    this.frames++;
    if (this.model.clear && this.frames >= this.model.clear) {
      this.destCtx.clearRect(0, 0, cw, ch);
      this.frames = 0;
    }

    this.destCtx.drawImage(this.offCanvas, 0, 0, cw, ch, 0, 0, cw, ch);

    return this;
  },


  bindings: assign({
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

/***/ }),

/***/ 683:
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var ScreenLayerView = __webpack_require__(652);
var _cacheImgs = {};
function loadImg(url, done) {
  if (_cacheImgs[url]) {
    return done(null, _cacheImgs[url]);
  }

  var img = new Image();
  _cacheImgs[url] = img;
  img.onload = function() {
    console.info('loaded', url);
    done(null, img);
  };
  img.onerror = function() {
  };
  img.src = url;
  return done(null, _cacheImgs[url]);
}

module.exports = ScreenLayerView.types.img = ScreenLayerView.extend({
  template: function() {
    return '<div class="layer-image" id="' + this.model.getId() + '" view-id="' + this.cid + '"><canvas></canvas></div>';
  },

  initialize: function() {
    var view = this;
    ScreenLayerView.prototype.initialize.apply(view, arguments);


    function load() {
      var src = view.model.src;
      if (!src) return view.clearImage();
      loadImg(src, function(err, img) {
        view.drawImage(img);
      });
    }

    view.on('change:width change:height', load);
    view.model.on('change:src', load);
    load();
  },

  derived: {
    ctx: {
      deps: ['el'],
      fn: function() {
        if (!this.el) return;
        return this.query('canvas').getContext('2d');
      }
    }
  },

  _resizeCanvas: function() {
    if (!this.el || !this.el.parentNode) return this;
    var cnv = this.query('canvas');
    var dw = this.el.parentNode.clientWidth;
    var dh = this.el.parentNode.clientHeight;
    if (cnv.width != dw) cnv.width = dw;
    if (cnv.height != dh) cnv.height = dh;
    return this;
  },

  clearImage: function() {
    var ctx = this.ctx;
    if (!ctx) return this;
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    return this;
  },

  drawImage: function(img) {
    var ctx = this._resizeCanvas().clearImage().ctx;
    if (!ctx) return this;
    ctx.drawImage(img, 0, 0, ctx.canvas.width, ctx.canvas.height);
    return this;
  }
});

/***/ }),

/***/ 688:
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var ScreenLayerView = __webpack_require__(652);

module.exports = ScreenLayerView.types.SVG = ScreenLayerView.extend({
  autoRender: true,

  template: function() {
    return '<div class="layer-svg" id="' + this.model.getId() + '" view-id="' + this.cid + '"></div>';
  },

  derived: {
    svg: {
      deps: ['el', 'model.content'],
      fn: function() {
        return this.el && this.model.content ? this.query('svg') || false : false;
      }
    }
  },

  updateStyles: function() {
    if (!this.model.active || !this.el) return this;
    var selectors = Object.keys(this.model.svgStyles);
    selectors.forEach(function(selector) {
      this.addRule(selector, this.model.svgStyles[selector]);
    }, this);
    return this;
  },

  updateProperties: function() {
    if (!this.model.active || !this.el) return this;
    this.model.styleProperties.forEach(function(styleProp) {
      this.setProperty(styleProp.name, styleProp.value);
    }, this);
    return this;
  },

  updateContent: function() {
    if (!this.el || this.el.innerHTML === this.model.content) return this;

    this.el.innerHTML = this.model.content;
    this.updateStyles().updateProperties();
  },

  initialize: function() {
    ScreenLayerView.prototype.initialize.apply(this, arguments);
    this.updateContent().updateStyles().updateProperties();

    this.listenTo(this.model, 'change:content', this.updateContent);
    this.on('change:el', this.updateContent);

    this.listenToAndRun(this.model, 'change:svgStyles', this.updateStyles);
    this.listenToAndRun(this.model.styleProperties, 'add remove change', this.updateProperties);
  },

  addRule: function(selector, properties) {
    selector = 'svg ' + selector;
    ScreenLayerView.prototype.addRule.call(this, selector, properties);
    return this;
  },

  remove: function() {
    var style = this.styleEl;
    if (style && style.parentNode) style.parentNode.removeChild(style);
    ScreenLayerView.prototype.remove.apply(this, arguments);
  }
});


/***/ }),

/***/ 690:
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var assign = __webpack_require__(33);
var LayerView = __webpack_require__(652);
var TxtLayerView = LayerView.types.txt = LayerView.extend({
  autoRender: true,

  template: function() {
    return '<div class="layer-txt" id="' + this.model.getId() + '" view-id="' + this.cid + '"><div class="text"></div></div>';
  },

  bindings: assign(LayerView.prototype.bindings, {
    'model.text': '.text'
  })
});
module.exports = TxtLayerView;

/***/ }),

/***/ 692:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var ScreenLayerView = __webpack_require__(652);
module.exports = ScreenLayerView.types.video = ScreenLayerView.extend({
  template: function() {
    return '<video id="' + this.model.cid + '" view-id="' + this.cid + '" autoplay loop muted></video>';
  },

  bindings: __webpack_require__(33)({
    'model.src': {
      type: 'attribute',
      name: 'src'
    }
  }, ScreenLayerView.prototype.bindings)
});

/***/ })

});
//# sourceMappingURL=4-build.js.map