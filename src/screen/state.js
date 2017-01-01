'use strict';
/* global Uint8Array*/

var State = VFDeps.State;
var Collection = VFDeps.Collection;
var LayerState = require('./../layer/state');
require('./../layer/canvas/state');
require('./../layer/video/state');
require('./../layer/svg/state');
require('./../layer/img/state');

var ScreenState = State.extend({
  mappable: {
    source: ['frametime', 'firstframetime', 'screenSignals'],
    target: ['screenLayers']
  },

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
    screenSignals: require('./../signal/collection')
  }
});
module.exports = ScreenState;