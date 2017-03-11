'use strict';
/* global Uint8Array*/

var State = require('ampersand-state');
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
    layers: require('./../layer/collection')
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
