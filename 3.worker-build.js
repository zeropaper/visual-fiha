webpackChunk([3],{

/***/ 2:
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/* global Uint8Array*/

var State = __webpack_require__(4);
var ScreenState = State.extend({
  initialize: function(attributes, options = {}) {
    this._isControllerState = !!options.router;
  },

  mappable: {
    source: ['midi', 'frametime', 'clock', 'signals'],
    target: ['layers', 'signals', 'clock']
  },

  session: {
    audio: ['object', true, function() { return {
      bufferLength: 128,
      frequency: new Uint8Array(128),
      timeDomain: new Uint8Array(128)
    }; }],
    latency: ['number', true, 0]
  },

  children: {
    clock: __webpack_require__(300)
  },

  collections: {
    layers: __webpack_require__(297)
  },

  derived: {
    frametime: {
      deps: ['clock.frametime'],
      fn: function() {
        return this.clock.frametime;
      }
    },
    hasDOM: {
      deps: [],
      fn: function() {
        return typeof DedicatedWorkerGlobalScope === 'undefined';
      }
    },
    isControllerState: {
      deps: [],
      fn: function() {
        return this._isControllerState;
      }
    },
    location: {
      deps: ['hasDOM', 'isControllerState'],
      fn: function() {
        return this.isControllerState ? 'control' : (this.hasDOM ? 'screen' : 'worker');
      }
    }
  },

  _log: function(...args) {
    var color = this.location === 'screen' ? 'lightblue' : (this.location === 'control' ? 'lightgreen' : 'pink');
    var txt = args.shift();
    console.log('%c'+ this.location[0].toUpperCase() + ': ' + txt, 'color:' + color, ...args);
  },

  toJSON: function() {
    var obj = State.prototype.toJSON.apply(this, arguments);
    delete obj.audio;
    return obj;
  }
});

module.exports = ScreenState;


/***/ }),

/***/ 297:
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var assign = __webpack_require__(7);
var Collection = __webpack_require__(6);
var LayerState = __webpack_require__(5);
__webpack_require__(8);
__webpack_require__(14);
__webpack_require__(11);
__webpack_require__(9);
__webpack_require__(13);
__webpack_require__(10);
__webpack_require__(12);

module.exports = Collection.extend({
  comparator: 'zIndex',
  mainIndex: 'name',
  model: function(attrs, opts) {
    var Constructor = LayerState.types[attrs.type] || LayerState;
    var state = new Constructor(attrs, opts);
    // state.on('change', function() {
    //   opts.collection.trigger('change:layer', state);
    // });
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

/***/ }),

/***/ 300:
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var State = __webpack_require__(4);

var Clock = State.extend({
  mappable: {
    source: ['frametime', 'pausetime', 'starttime', 'bpm', 'beatprct', 'beatnum', 'beatlength'],
    target: ['beatdelay', 'bpm']
  },

  play: function() {
    var now = Date.now();
    this.starttime = this.pausetime ? this.starttime + (now - this.pausetime) : now;
    this.pausetime = 0;
    return this.refresh();
  },

  pause: function() {
    this.pausetime = Date.now();
    return this.refresh();
  },

  stop: function() {
    var now = Date.now();
    this.pausetime = now;
    this.starttime = now;
    this.frametime = 0;
    return this;
  },

  refresh: function() {
    if (this.playing) this.frametime = Date.now() - this.starttime;
    return this;
  },

  derived: {
    modelPath: {
      deps: [],
      fn: function() {
        return 'clock';
      }
    },
    playing: {
      deps: ['pausetime'],
      fn: function() {
        return !this.pausetime;
      }
    },
    paused: {
      deps: ['pausetime', 'starttime'],
      fn: function() {
        return this.pausetime > this.starttime;
      }
    },
    stopped: {
      deps: ['pausetime', 'starttime'],
      fn: function() {
        return this.pausetime === this.starttime;
      }
    },
    beatprct: {
      deps: ['beatlength', 'frametime'],
      fn: function() {
        var ft = this.frametime;
        var bl = this.beatlength;
        return !ft ? 0 : (100 - (((ft % bl) / bl) * 100));
      }
    },
    beatnum: {
      deps: ['beatlength', 'beatdelay', 'frametime'],
      fn: function() {
        var ft = this.frametime + this.beatdelay;
        return ft ? Math.floor(ft / this.beatlength) : 0;
      }
    },
    beatlength: {
      deps: ['bpm'],
      fn: function() {
        return (60 * 1000) / Math.max(this.bpm, 1);
      }
    }
  },

  props: {
    pausetime: ['number', true, 0],
    starttime: ['number', true, Date.now],
    frametime: ['number', true, 0],
    beatdelay: ['number', true, 0],
    bpm: ['number', true, 120]
  }
});

module.exports = Clock;

/***/ })

});
//# sourceMappingURL=3.worker-build.js.map