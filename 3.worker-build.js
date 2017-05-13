webpackChunk([3],{

/***/ 3:
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var Collection = __webpack_require__(6);
var SignalState = __webpack_require__(7);
__webpack_require__(304);
__webpack_require__(303);
__webpack_require__(305);

var SignalCollection = Collection.extend({
  mainIndex: 'name',

  clock: null,
  audio: null,
  worker: null,

  model: function(attrs, opts) {
    var Constructor = SignalState.types[attrs.type] || SignalState;
    var state = new Constructor(attrs, opts);
    return state;
  },

  initialize: function(models, options) {
    this.location = typeof DedicatedWorkerGlobalScope !== 'undefined' ? 'worker' : 'controller';
    this.clock = options.clock;
    this.audio = options.audio;
    this.emitCommand = options.emitCommand;
  },

  toJSON: function () {
    return this.map(function (model) {
      if (model.toJSON) {
        return model.toJSON();
      }
      else {
        return model;
      }
    });
  }
});
module.exports = SignalCollection;


/***/ }),

/***/ 303:
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var SignalState = __webpack_require__(7);

function _360(name) {
  return {
    name: name,
    type: 'number',
    default: 180,
    min: 0,
    max: 360
  };
}
function _100(name) {
  return {
    name: name,
    type: 'number',
    default: 100,
    min: 0,
    max: 100
  };
}
function _1(name) {
  return {
    name: name,
    type: 'number',
    default: 1,
    min: 0,
    max: 1
  };
}
function derivedParameter(name) {
  return {
    deps: ['parameters.' + name],
    fn: function() {
      return this.parameters.getValue(name);
    }
  };
}

var HSLASignalState = SignalState.types.hsla = SignalState.extend({
  baseParameters: [
    _360('hue'),
    _100('saturation'),
    _100('lightness'),
    _1('alpha')
  ],

  mappable: {
    source: ['result', 'hue', 'saturation', 'lightness', 'alpha'],
    target: ['parameters']
  },

  derived: {
    hue: derivedParameter('hue'),
    saturation: derivedParameter('saturation'),
    lightness: derivedParameter('lightness'),
    alpha: derivedParameter('alpha'),
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
    return 'hsla(' + Math.round(this.hue) + ',' + Math.round(this.saturation) + '%,' + Math.round(this.lightness) + '%,' + (Math.round(100 * this.alpha) / 100) + ')';
  }
});

module.exports = HSLASignalState;

/***/ }),

/***/ 304:
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var compileFunction = __webpack_require__(306);
var SignalState = __webpack_require__(7);

var updatePrologue = ``;

module.exports = SignalState.types.programmable = SignalState.extend({
  initialize: function() {
    SignalState.prototype.initialize.apply(this, arguments);

    // this forces the refresh of 'result' derived on worker everytime the clock is ticking
    if (this.location !== 'worker') return;
    this.listenTo(this.collection.clock, 'change:frametime', function() {
      delete this._cache.result;
      this.trigger('change:input');
    });
  },

  props: {
    updateFunction: ['string', true, 'console.info("frametime %s, bpm %s, beatnum %s, beatprct %s", frametime, bpm, beatnum, beatprct.toFixed(2));\nreturn 0;']
  },

  derived: {
    result: {
      deps: ['input', 'workerResult'],
      fn: function() {
        if (this.location !== 'worker') return this.workerResult || this.defaultValue;
        return this.computeSignal();
      }
    },
    updateFn: {
      deps: ['updateFunction'],
      fn: function() {
        return compileFunction(
          'update',
          updatePrologue,
          'frametime',
          'bpm',
          'beatnum',
          'beatprct',
          this.updateFunction
        );
      }
    }
  },

  computeSignal: function(clock) {
    clock = clock || (this.collection ? this.collection.clock : {
      frametime: 0,
      bpm: 120,
      beatnum: 0,
      beatprct: 0,
    });

    var fn = this.updateFn;
    var result = 0;
    try {
      result = fn(
        clock.frametime,
        clock.bpm,
        clock.beatnum,
        clock.beatprct
      );
    }
    catch (err) {
      console.warn('Error', err.message);
    }
    return result;
  }
});

/***/ }),

/***/ 305:
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var SignalState = __webpack_require__(7);
function _255(name) {
  return {
    name: name,
    type: 'number',
    default: 180,
    min: 0,
    max: 255
  };
}
function _1(name) {
  return {
    name: name,
    type: 'number',
    default: 1,
    min: 0,
    max: 1
  };
}
function derivedParameter(name) {
  return {
    deps: ['parameters.' + name],
    fn: function() {
      return this.parameters.getValue(name);
    }
  };
}

var RGBASignalState = SignalState.types.rgba = SignalState.extend({
  baseParameters: [
    _255('red'),
    _255('green'),
    _255('blue'),
    _1('alpha')
  ],

  mappable: {
    source: ['result', 'red', 'green', 'blue', 'alpha'],
    target: ['parameters']
  },

  derived: {
    red: derivedParameter('red'),
    green: derivedParameter('green'),
    blue: derivedParameter('blue'),
    alpha: derivedParameter('alpha'),
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
    return 'rgba(' + Math.round(this.red) + ',' + Math.round(this.green) + ',' + Math.round(this.blue) + ',' + (Math.round(100 * this.alpha) / 100) + ')';
  }
});
module.exports = RGBASignalState;

/***/ }),

/***/ 306:
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/**
 * compileFunction(name, prologue, [arg1, arg2, ...] body)
 */
module.exports = function compileFunction(...args) {
  var name = args.shift();
  var prologue = args.shift();
  var body = args.pop();
  var fn;

  console.time('compileFunction ' + name);
  try {
    fn = new Function(...args, prologue + body);// jshint ignore:line
    if (typeof fn !== 'function') throw new Error('Function compilation error, returned not function');
  }
  catch (e) {
    console.log('%c compilation error: %s', 'color:red', e.message);
    fn = e;
  }
  console.timeEnd('compileFunction ' + name);
  return fn;
};

/***/ }),

/***/ 7:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var parameterizedState = __webpack_require__(78);
var SignalState = parameterizedState([]).extend({
  idAttribute: 'name',
  typeAttribute: 'type',

  mappable: {
    source: ['result'],
    target: ['parameters']
  },

  props: {
    name: ['string', true, null],
    type: ['string', true, 'default'],
    defaultValue: ['any', true, function () { return 1; }]
  },

  session: {
    workerResult: ['any', false, null]
  },

  derived: {
    modelPath: {
      deps: ['name'],
      fn: function() {
        return 'signals.' + this.name;
      }
    },
    location: {
      deps: [],
      fn: function() {
        return this.collection.location;
      }
    },
    result: {
      deps: ['input', 'workerResult'],
      fn: function() {
        return this.location !== 'worker' ?
          (this.workerResult || this.defaultValue) :
          this.computeSignal();
      }
    }
  },


  initialize: function() {
    var signal = this;
    var id = signal.getId();
    var signals = signal.collection;
    if (!signal.collection) throw new Error('Missing collection for ' + signal.name);

    signal._ensureBaseParameters();

    signal.listenTo(signal.parameters, 'change', function() {
      signal.trigger('change:parameters', signal, signal.parameters, {parameters: true});
    });

    if (signal.location === 'worker') {
      signal.on('change:result', function() {
        if (signals !== signal.collection) return; // may happen when bootstraping a new setup
        signals.emitCommand('updateSignalResult', {
          name: id,
          workerResult: signal.result
        });
      });
    }
    else {
      signal.on('change:workerResult', function() {
        signal.trigger('change:result', signal, signal.result);
      });
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
//# sourceMappingURL=3.worker-build.js.map