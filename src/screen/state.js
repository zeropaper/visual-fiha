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
  initialize: function() {
    this.on('change:frametime', function() {
      this.trigger('frametime', this.frametime);
    });
  },

  props: {
    audioMinDb: ['number', true, -90],
    audioMaxDb: ['number', true, -10],
    audioSmoothing: ['number', true, 0.85],
    audioFftSize: ['number', true, 256],
    frametime: ['number', true, 0],
    firstframetime: ['any', true, function () {
      return performance.now();
    }],
    signals: ['object', true, function() { return {}; }]
  },

  collections: {
    screenLayers: Collection.extend({
      comparator: 'zIndex',
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
  }
});
module.exports = ScreenState;