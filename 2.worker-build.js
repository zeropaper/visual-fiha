webpackChunk([2],{

/***/ 3:
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var assign = __webpack_require__(7);
var Collection = __webpack_require__(6);
var SignalState = __webpack_require__(86);
__webpack_require__(569);
__webpack_require__(570);
__webpack_require__(571);

var SignalCollection = Collection.extend({
  mainIndex: 'name',
  model: function(attrs, opts) {
    var Constructor = SignalState.types[attrs.type] || SignalState;
    var state = new Constructor(attrs, opts);
    return state;
  },

  toJSON: function () {
    return this.map(function (model) {
      if (model.toJSON) {
        return model.toJSON();
      }
      else {
        var out = {};
        assign(out, model);
        delete out.collection;
        return out;
      }
    });
  }
});
module.exports = SignalCollection;


/***/ }),

/***/ 569:
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var SignalState = __webpack_require__(86);

var BeatState = SignalState.types.beat = SignalState.extend({
  initialize: function() {
    SignalState.prototype.initialize.apply(this, arguments);
    this.listenTo(this.collection, 'frametime', function(frametime) {
      this.frametime = frametime;
    });
  },

  session: {
    frametime: ['number', true, 0]
  },

  mappable: {
    source: ['result', 'timeBetweenBeats', 'beatNum'],
    target: ['input']
  },

  derived: {
    result: {
      deps: ['timeBetweenBeats', 'frametime'],
      fn: function() {
        return this.computeSignal();
      }
    },
    beatNum: {
      deps: ['timeBetweenBeats', 'frametime'],
      fn: function() {
        return this.frametime ? Math.floor(this.frametime / this.timeBetweenBeats) : 0;
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
    var ft = this.frametime;
    var tbb = this.timeBetweenBeats;
    return !ft ? 0 : (100 - (((ft % tbb) / tbb) * 100));
  }
});

module.exports = BeatState;

/***/ }),

/***/ 570:
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var SignalState = __webpack_require__(86);

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

var HSLASignalState = SignalState.types.hsla = SignalState.extend({
  props: {
    hue: _360,
    saturation: _100,
    lightness: _100,
    alpha: _100
  },

  mappable: {
    source: ['result', 'hue', 'saturation', 'lightness', 'alpha'],
    target: ['hue', 'saturation', 'lightness', 'alpha']
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

/***/ }),

/***/ 571:
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var SignalState = __webpack_require__(86);
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
var RGBASignalState = SignalState.types.rgba = SignalState.extend({
  props: {
    red: _255,
    green: _255,
    blue: _255,
    alpha: _100
  },

  mappable: {
    source: ['result', 'red', 'green', 'blue', 'alpha'],
    target: ['red', 'green', 'blue', 'alpha']
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

/***/ }),

/***/ 86:
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var State = __webpack_require__(4);

var SignalState = State.extend({
  idAttribute: 'name',
  typeAttribute: 'type',

  mappable: {
    source: ['result'],
    target: ['input']
  },

  props: {
    name: ['string', true, null],
    type: ['string', true, 'default'],
    defaultValue: ['any', true, function () { return 1; }],
    input: ['any', false, null]
  },

  derived: {
    modelPath: {
      deps: ['name'],
      fn: function() {
        return 'signals.' + this.name;
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
    return val;
  }
});

SignalState.types = {};

module.exports = SignalState;


/***/ })

});
//# sourceMappingURL=2.worker-build.js.map