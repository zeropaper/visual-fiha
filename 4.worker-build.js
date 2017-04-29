webpackChunk([4],{

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
    source: ['frametime', 'midi', 'firstframetime', 'signals'],
    target: ['layers', 'signals']
  },

  session: {
    audio: ['object', true, function() { return {
      bufferLength: 128,
      frequency: new Uint8Array(128),
      timeDomain: new Uint8Array(128)
    }; }],
    frametime: ['number', true, 0],
    firstframetime: ['any', true, function () {
      return performance.now();
    }],
    latency: ['number', true, 0]
  },

  collections: {
    layers: __webpack_require__(561)
  },

  derived: {
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

/***/ 561:
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var assign = __webpack_require__(7);
var Collection = __webpack_require__(6);
var LayerState = __webpack_require__(5);
__webpack_require__(9);
__webpack_require__(14);
__webpack_require__(11);
__webpack_require__(10);
__webpack_require__(13);
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

/***/ })

});
//# sourceMappingURL=4.worker-build.js.map