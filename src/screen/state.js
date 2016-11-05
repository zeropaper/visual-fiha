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