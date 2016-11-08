(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';
var ScreenLayerState = require('./../state');
// var CanvasLayer = ScreenLayerState.extend({
var MappableState = require('./../../mappable/state');
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
},{"./../../mappable/state":11,"./../state":5}],2:[function(require,module,exports){
'use strict';

var ScreenLayerView = require('./../view');
module.exports = ScreenLayerView.canvas = ScreenLayerView.extend({
  template: '<canvas></canvas>',

  session: {
    duration: ['number', true, 1000],
    fps: ['number', true, 16],
    frametime: ['number', true, 0]
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
        canvas.width = this.el.width;
        canvas.height = this.el.height;
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
    return ScreenLayerView.prototype.remove.apply(this, arguments);
  },

  update: function(options) {
    options = options || {};
    this.frametime = options.frametime || 0;

    var ctx = this.ctx;
    var cw = ctx.canvas.width;
    var ch = ctx.canvas.height;
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
      ctx.globalCompositionOperation = layer.blending;

      layer.draw(ctx);
    });

    var destCtx = this.el.getContext('2d');
    destCtx.clearRect(0, 0, cw, ch);
    destCtx.drawImage(this.offCanvas, 0, 0, cw, ch, 0, 0, cw, ch);

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
},{"./../view":10}],3:[function(require,module,exports){
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
},{"./../state":5}],4:[function(require,module,exports){
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
},{"./../view":10}],5:[function(require,module,exports){
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
      default: 1,
      min: -10,
      max: 10
    },
    scaleY: {
      type: 'number',
      default: 1,
      min: -10,
      max: 10
    },
    // scaleZ: {
    //   type: 'number',
    //   default: 1,
    //   min: -10,
    //   max: 10
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

  collections: MappableState.prototype.collections
});
module.exports = LayerState;
},{"./../mappable/state":11}],6:[function(require,module,exports){
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
},{"./../state":5}],7:[function(require,module,exports){
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
},{"./../view":10}],8:[function(require,module,exports){
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
},{"./../state":5}],9:[function(require,module,exports){
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
},{"./../view":10}],10:[function(require,module,exports){
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
        'model.backfaceVisibility'
      ],
      fn: function() {
        return {
          opacity: this.model.opacity,
          width: this.width + 'px',
          height: this.height + 'px',
          transform:
                    'rotateX(' + this.model.rotateX + 'deg) ' +
                    'rotateY(' + this.model.rotateY + 'deg) ' +
                    'rotateZ(' + this.model.rotateZ + 'deg) ' +
                    'translateX(' + this.model.translateX + '%) ' +
                    'translateY(' + this.model.translateY + '%) ' +
                    // 'translateZ(' + this.model.translateZ + '%) ' +
                    'scaleX(' + this.model.scaleX + ') ' +
                    'scaleY(' + this.model.scaleY + ') ' +
                    // 'scaleZ(' + this.model.scaleZ + '%) ' +
                    'skewX(' + this.model.skewX + 'deg) ' +
                    'skewY(' + this.model.skewY + 'deg) ' +
                    'perspective(' + this.model.perspective + ')' +
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
},{}],11:[function(require,module,exports){
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

  collections: {
    mappings: MappingsCollection
  }
});
module.exports = MappableState;

},{}],12:[function(require,module,exports){
'use strict';
var ScreenState = require('./screen/state');
var ScreenView = require('./screen/view');

var screenView = new ScreenView({
  broadcastId: window.location.hash.slice(1),
  el: document.querySelector('.screen'),
  model: new ScreenState({})
});

var bdy = document.body;
function resize() {
  screenView.set({
    width: bdy.clientWidth,
    height: bdy.clientHeight
  });
  screenView.render();
}
window.addEventListener('resize', VFDeps.throttle(resize, 100));
setTimeout(resize, 1500);
},{"./screen/state":13,"./screen/view":14}],13:[function(require,module,exports){
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
    latency: ['number', true, 0]
  },

  toJSON: function() {
    var obj = State.prototype.toJSON.apply(this, arguments);
    obj.screenLayers = this.screenLayers.toJSON.apply(this.screenLayers, arguments);
    obj.screenSignals = this.screenSignals.toJSON.apply(this.screenSignals, arguments);
    return obj;
  }
});
module.exports = ScreenState;
},{"./../layer/canvas/state":1,"./../layer/img/state":3,"./../layer/state":5,"./../layer/svg/state":6,"./../layer/video/state":8,"./../signal/beat/state":15,"./../signal/hsla/state":16,"./../signal/rgba/state":17,"./../signal/state":18}],14:[function(require,module,exports){
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

  initialize: function () {
    var screenView = this;
    if (!screenView.model) {
      throw new Error('Missing model option for ScreenView');
    }

    if (window.BroadcastChannel) {
      var channel = screenView.channel = new window.BroadcastChannel(this.broadcastId);
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
    this.layersView.views.forEach(function(view) {
      view.width = this.width;
      view.height = this.height;
    }, this);
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
},{"./../layer/canvas/view":2,"./../layer/img/view":4,"./../layer/svg/view":7,"./../layer/video/view":9,"./../layer/view":10}],15:[function(require,module,exports){
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
},{"./../state":18}],16:[function(require,module,exports){
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
},{"./../state":18}],17:[function(require,module,exports){
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
},{"./../state":18}],18:[function(require,module,exports){
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
},{"./../mappable/state":11}]},{},[12]);
