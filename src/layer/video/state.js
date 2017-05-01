'use strict';
var ScreenLayerState = require('./../state');
module.exports = ScreenLayerState.types.video = ScreenLayerState.extend({
  baseParameters: [
    {name: 'src', type: 'string', default: ''}
  ].concat(ScreenLayerState.prototype.baseParameters),

  derived: {
    src: {
      deps: ['parameters.src'],
      fn: function() {
        return this.parameters.getValue('src');
      }
    }
  },

  initialize: function() {
    ScreenLayerState.prototype.initialize.apply(this, arguments);
  }
});