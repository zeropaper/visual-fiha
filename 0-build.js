webpackJsonp([0],[
/* 0 */
/***/ function(module, exports, __webpack_require__) {

"use strict";

/* global Uint8Array*/

var State = VFDeps.State;
var Collection = VFDeps.Collection;
var LayerState = __webpack_require__(11);
__webpack_require__(23);
__webpack_require__(29);
__webpack_require__(27);
__webpack_require__(25);

var ScreenState = State.extend({
  props: {
    frametime: ['number', true, 0],
    firstframetime: ['any', true, function () {
      return performance.now();
    }],
    audio: ['object', true, function() { return {
      bufferLength: 128,
      frequency: new Uint8Array(128),
      timeDomain: new Uint8Array(128)
    }; }]
  },

  session: {
    latency: ['number', true, 0]
  },

  collections: {
    screenLayers: Collection.extend({
      comparator: 'zIndex',
      mainIndex: 'name',
      model: function(attrs, opts) {
        var Constructor = LayerState[attrs.type] || LayerState;
        var state = new Constructor(attrs, opts);
        state.on('change', function() {
          opts.collection.trigger('change:layer', state);
        });
        return state;
      }
    }),
    screenSignals: __webpack_require__(33)
  }
});
module.exports = ScreenState;

/***/ },
/* 1 */,
/* 2 */,
/* 3 */,
/* 4 */,
/* 5 */,
/* 6 */,
/* 7 */,
/* 8 */,
/* 9 */,
/* 10 */,
/* 11 */
/***/ function(module, exports, __webpack_require__) {

"use strict";

var State = VFDeps.State;
var LayerState = State.extend({
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

/***/ },
/* 12 */,
/* 13 */
/***/ function(module, exports, __webpack_require__) {

(function(global) {
  'use strict';
  var State = global.VFDeps.State;
  var Collection = global.VFDeps.Collection;
  var transformationFunctions = __webpack_require__(17);

  var SignalTransformationState = State.extend({
    props: {
      name: ['string', true, null],
      arguments: ['array', true, function () { return []; }]
    }
  });


  var SignalState = State.extend({
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
      defaultValue: ['any', true, function () { return 1; }],
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

  SignalState.types = {};

  module.exports = SignalState;
})(typeof window !== 'undefined' ? window : self);


/***/ },
/* 14 */,
/* 15 */,
/* 16 */,
/* 17 */
/***/ function(module, exports, __webpack_require__) {

"use strict";

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

/***/ },
/* 18 */,
/* 19 */,
/* 20 */,
/* 21 */,
/* 22 */,
/* 23 */
/***/ function(module, exports, __webpack_require__) {

"use strict";

var State = VFDeps.State;
var ScreenLayerState = __webpack_require__(11);


var CanvasLayer = State.extend({
  idAttribute: 'name',

  initialize: function() {
    State.prototype.initialize.apply(this, arguments);
    var canvasLayer = this;
    var screenLayer = canvasLayer.collection.parent;

    canvasLayer.on('change', function() {
      // trigger change on the screen layer
      screenLayer._changed = {
        canvasLayers: screenLayer.canvasLayers.serialize()
      };
      screenLayer.trigger('change');
    });
  },

  cache: {},

  props: {
    duration: ['number', true, 1000],
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
    var obj = State.prototype.serialize.apply(this, arguments);
    var returned = {};
    var propName;


    var props = this.serializationProps.props || [];
    /*
    if (props.length) {
      returned.props = {};
      props.forEach(function(propName) {
        returned.props[propName] = obj[propName];
      });
    }

    for (propName in obj) {
      if (props.indexOf(propName) < 0) {
        returned[propName] = obj[propName];
      }
    }
    */

    // better like that??
    if (props.length) {
      returned.props = {};
    }

    // var propName;
    var def = this.constructor.prototype._definition;
    for (propName in obj) {
      // if (props.indexOf(propName) < 0) {
      returned[propName] = obj[propName];
      // }
      // else {
      //   returned.props[propName] = obj[propName];
      // }
      if (props.indexOf(propName) > -1) {
        returned.props[propName] = def[propName];
      }
    }
    // returned.props = def;
    var type = typeof this.drawFunction;
    if (type === 'function') {
      returned.drawFunction = this.drawFunction.toString();
    }
    else if (type === 'string') {
      returned.drawFunction = this.drawFunction;
    }
    returned.name = this.name;
    return returned;
  },

  derived: {
    // frames: {
    //   deps: ['duration', 'fps'],
    //   fn: function() {
    //     return Math.round(this.duration / 1000 * this.fps);
    //   }
    // },
    // frame: {
    //   deps: ['frametime', 'fps'],
    //   fn: function() {
    //     return Math.round(((this.frametime % this.duration) / 1000) * this.fps);
    //   }
    // },
    // direction: {
    //   deps: ['frametime', 'duration'],
    //   fn: function() {
    //     return this.frame < this.frames * 0.5 ? 1 : -1;
    //   }
    // },
    // frametime: {
    //   cache: false,
    //   fn: function() {
    //     return this.screenState.frametime;
    //   }
    // },
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
  // },

  // collections: {
  //   mappings: State.Collection.extend({
  //     model: function (attrs, options) {
  //       var model = new CanvasLayerMapState(attrs, options);
  //       if (options.init === false) model.initialize();
  //       return model;
  //     }
  //   })
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
        props: [].concat([
          'active',
          'blending',
          'opacity',
          'shadowBlur',
          'shadowColor',
          'shadowOffsetX',
          'shadowOffsetY'
        ], Object.keys(attrs.props || {})),
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

/***/ },
/* 24 */,
/* 25 */
/***/ function(module, exports, __webpack_require__) {

"use strict";

var ScreenLayerState = __webpack_require__(11);
module.exports = ScreenLayerState.img = ScreenLayerState.extend({
  props: {
    src: ['string', true, null],
    backgroundSize: ['string', true, 'cover'],
    backgroundPosition: ['string', true, 'center'],
    backgroundRepeat: ['string', true, 'no-repeat']
  },

  initialize: function() {
    ScreenLayerState.prototype.initialize.apply(this, arguments);
    if (!this.src) {
      throw new Error('Missing src attribute for img layer');
    }
  }
});

/***/ },
/* 26 */,
/* 27 */
/***/ function(module, exports, __webpack_require__) {

"use strict";

var ScreenLayerState = __webpack_require__(11);
module.exports = ScreenLayerState.SVG = ScreenLayerState.extend({
  props: {
    src: ['string', true, null],
    styles: ['string', true, '']
  },

  initialize: function() {
    ScreenLayerState.prototype.initialize.apply(this, arguments);
    if (!this.src) {
      throw new Error('Missing src attribute for SVG layer');
    }
  }
});

/***/ },
/* 28 */,
/* 29 */
/***/ function(module, exports, __webpack_require__) {

"use strict";

var ScreenLayerState = __webpack_require__(11);
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

/***/ },
/* 30 */,
/* 31 */,
/* 32 */
/***/ function(module, exports, __webpack_require__) {

"use strict";

var SignalState = __webpack_require__(13);

var BeatState = SignalState.types.beatSignal = SignalState.extend({
  session: {
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
    var frametime = this.frametime;
    var preTransform = !frametime ? 0 : (100 - (((frametime % this.timeBetweenBeats) / this.timeBetweenBeats) * 100));
    var result = SignalState.prototype.computeSignal.apply(this, [preTransform]);
    // this.collection.parent.signals[this.name] = result;
    return result;
  }
});

module.exports = BeatState;

/***/ },
/* 33 */
/***/ function(module, exports, __webpack_require__) {

"use strict";

var Collection = VFDeps.Collection;
var SignalState = __webpack_require__(13);
__webpack_require__(32);
__webpack_require__(35);
__webpack_require__(36);

var SignalCollection = Collection.extend({
  mainIndex: 'name',
  model: function(attrs, opts) {
    var Constructor = SignalState.types[attrs.type] || SignalState;
    return new Constructor(attrs, opts);
  }
});
module.exports = SignalCollection;


/***/ },
/* 34 */,
/* 35 */
/***/ function(module, exports, __webpack_require__) {

"use strict";

var SignalState = __webpack_require__(13);

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

var HSLASignalState = SignalState.types.hslaSignal = SignalState.extend({
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

/***/ },
/* 36 */
/***/ function(module, exports, __webpack_require__) {

"use strict";

var SignalState = __webpack_require__(13);
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
var RGBASignalState = SignalState.types.rgbaSignal = SignalState.extend({
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

/***/ }
]);
//# sourceMappingURL=0-build.js.map