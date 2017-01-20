'use strict';
/* global Uint8Array*/

var State = require('ampersand-state');
var ScreenState = State.extend({
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
    midi: 'state',
    frametime: ['number', true, 0],
    firstframetime: ['any', true, function () {
      return performance.now();
    }],
    latency: ['number', true, 0]
  },

  collections: {
    layers: require('./../layer/collection'),
    signals: require('./../signal/collection')
  },

  toJSON: function() {
    var obj = State.prototype.toJSON.apply(this, arguments);
    delete obj.audio;
    return obj;
  }
});

module.exports = ScreenState;
